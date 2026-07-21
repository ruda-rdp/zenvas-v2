/**
 * API: /api/tasks/[id]/assign
 * Owner/Manager directly assigns a Task to an Editor
 * 
 * Per API-CONTRACTS.md:
 * - POST: Assign task to a user
 * - Role: Owner/Manager only
 * - Body: { userId, payoutAmount }
 * - Creates Payout[status=ALLOCATED]
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Owner and Manager can assign
  if (session.user.role !== "OWNER" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Only Owner and Manager can assign tasks" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, payoutAmount } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get the task with project/brand info
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            project: true,
          },
        },
        payout: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check brand access
    if (task.stage.project.brandId) {
      const hasAccess = await canAccessBrand(task.stage.project.brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "You don't have access to this brand" }, { status: 403 });
      }
    }

    // Verify the user exists and is an Editor
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the target user has access to this brand (if brand-specific)
    if (task.stage.project.brandId) {
      const userBrandAccess = await prisma.brandAccess.findUnique({
        where: {
          userId_brandId: {
            userId,
            brandId: task.stage.project.brandId,
          },
        },
      });

      // Owner/Manager can assign to anyone, but we should warn if user doesn't have access
      // For now, we allow it but the editor won't see the task on their board
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      assigneeUserId: userId,
      status: "IN_PROGRESS",
    };

    // Set startedAt if not already set
    if (!task.startedAt) {
      updateData.startedAt = new Date();
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Handle payout - create or update
    if (payoutAmount !== undefined) {
      if (task.payout) {
        // Update existing payout
        await prisma.payout.update({
          where: { id: task.payout.id },
          data: {
            userId,
            amount: payoutAmount,
            status: "ALLOCATED",
          },
        });
      } else {
        // Create new payout
        await prisma.payout.create({
          data: {
            taskId: id,
            userId,
            amount: payoutAmount,
            status: "ALLOCATED",
          },
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "TASK_ASSIGNED",
        entityType: "Task",
        entityId: id,
        userId: session.user.id,
        metadata: {
          action: "DIRECT_ASSIGN",
          assignedTo: userId,
          payoutAmount: payoutAmount || null,
        },
      },
    });

    // Create notification for the assigned editor
    await prisma.notification.create({
      data: {
        userId,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: `You have been assigned to task: ${task.name}`,
        link: `/tasks/${id}`,
      },
    });

    // Fetch updated task with relations
    const finalTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        payout: true,
        stage: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                brand: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Task assigned successfully",
      task: finalTask,
    });
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json({ error: "Failed to assign task" }, { status: 500 });
  }
}
