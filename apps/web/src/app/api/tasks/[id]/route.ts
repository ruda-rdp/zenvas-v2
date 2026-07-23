/**
 * API: /api/tasks/[id]
 * Task operations (Project OS)
 * 
 * Per PROJECT_OS.md:
 * - Task status: OPEN → IN_PROGRESS → COMPLETE
 * - Stale task detection based on expectedDurationMinutes
 * - Subtask hierarchy (max 3 levels)
 * - Payout calculated per Task
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TaskStatus } from "@/generated/prisma";
import { canAccessBrand } from "@/lib/authorize";

// GET /api/tasks/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            project: {
              include: {
                order: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
        assignee: {
          select: { id: true, name: true },
        },
        children: {
          include: {
            assignee: {
              select: { id: true, name: true },
            },
          },
          orderBy: { order: "asc" },
        },
        payout: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // For Editors, check if task is assigned to them
    if (session.user.role === "EDITOR" && task.assigneeUserId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // For OWNER/MANAGER, check brand access (tenant isolation)
    if (session.user.role === "OWNER" || session.user.role === "MANAGER") {
      const brandId = task.stage.project.brandId ?? task.stage.project.order?.brandId;
      if (brandId) {
        const hasAccess = await canAccessBrand(brandId);
        if (!hasAccess) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
      }
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assigneeUserId, name, payoutAmount } = body;

    // Get current task
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            project: {
              include: {
                order: {
                  select: { brandId: true },
                },
              },
            },
          },
        },
        children: true,
      },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Editors can only update their own tasks' status
    if (session.user.role === "EDITOR") {
      if (currentTask.assigneeUserId !== session.user.id) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      // Editors can only change status
      if (name || assigneeUserId || payoutAmount !== undefined) {
        return NextResponse.json({ error: "Editors can only update task status" }, { status: 403 });
      }
    }

    // For OWNER/MANAGER, check brand access (tenant isolation)
    if (session.user.role === "OWNER" || session.user.role === "MANAGER") {
      // Resolve brandId: check project.brandId first, then project.order.brandId
      const project = currentTask.stage.project as { brandId: string | null; order?: { brandId: string } | null };
      const brandId = project.brandId ?? project.order?.brandId;
      if (brandId) {
        const hasAccess = await canAccessBrand(brandId);
        if (!hasAccess) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    // Get body for new fields
    const { dueDate, startDate, priority, description, tags } = body;
    
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === "IN_PROGRESS" && !currentTask.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === "COMPLETE") {
        updateData.completedAt = new Date();
        
        // Check if parent task should auto-complete
        if (currentTask.parentTaskId) {
          const siblings = await prisma.task.findMany({
            where: {
              parentTaskId: currentTask.parentTaskId,
              id: { not: id },
            },
          });
          
          const allSiblingsComplete = siblings.every(s => s.status === "COMPLETE");
          if (allSiblingsComplete) {
            await prisma.task.update({
              where: { id: currentTask.parentTaskId },
              data: {
                status: TaskStatus.COMPLETE,
                completedAt: new Date(),
              },
            });
          }
        }
        
        // Credit payout if task has one
        if (currentTask.payoutAmount && currentTask.assigneeUserId) {
          const payout = await prisma.payout.findUnique({
            where: { taskId: id },
          });
          
          if (payout && payout.status === "ALLOCATED") {
            await prisma.payout.update({
              where: { id: payout.id },
              data: {
                status: "CREDITED",
                creditedAt: new Date(),
              },
            });
          }
        }
      }
    }
    
    if (name && session.user.role !== "EDITOR") {
      updateData.name = name;
    }
    
    if (assigneeUserId !== undefined && session.user.role !== "EDITOR") {
      updateData.assigneeUserId = assigneeUserId || null;
    }
    
    if (payoutAmount !== undefined && session.user.role !== "EDITOR") {
      updateData.payoutAmount = payoutAmount;
      
      // Create/update payout record
      if (assigneeUserId) {
        await prisma.payout.upsert({
          where: { taskId: id },
          create: {
            taskId: id,
            userId: assigneeUserId,
            amount: payoutAmount,
            status: "ALLOCATED",
          },
          update: {
            userId: assigneeUserId,
            amount: payoutAmount,
          },
        });
      }
    }
    
    // New fields for Jacob - accessible by Owner/Manager
    if (session.user.role !== "EDITOR") {
      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      }
      
      if (startDate !== undefined) {
        updateData.startDate = startDate ? new Date(startDate) : null;
      }
      
      if (priority !== undefined) {
        updateData.priority = priority;
      }
      
      if (description !== undefined) {
        updateData.description = description;
      }
      
      if (tags !== undefined) {
        updateData.tags = tags || [];
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    if (status === "COMPLETE") {
      await prisma.activityLog.create({
        data: {
          type: "TASK_COMPLETED",
          entityType: "Task",
          entityId: id,
          userId: session.user.id,
        },
      });
    } else if (status === "IN_PROGRESS") {
      await prisma.activityLog.create({
        data: {
          type: "TASK_ASSIGNED",
          entityType: "Task",
          entityId: id,
          userId: session.user.id,
          metadata: { assigneeId: assigneeUserId },
        },
      });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
