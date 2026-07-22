/**
 * API: /api/tasks/[id]/complete
 * Editor marks their Task complete
 * 
 * Per API-CONTRACTS.md:
 * - POST: Mark task as complete
 * - Role: Editor (must be the assignee)
 * - Task.status = COMPLETE, completedAt = now()
 * - If has children: requires all children COMPLETE first
 * - Completion cascades: all children COMPLETE → parent auto-COMPLETE
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

  try {
    const { id } = await params;

    // Get the task with children info
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        children: true,
        payout: true,
        assignee: {
          select: { id: true, name: true },
        },
        stage: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                orderId: true,
                brandId: true,
              },
              include: {
                order: {
                  select: { brandId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Editor must be the assignee
    if (session.user.role === "EDITOR" && task.assigneeUserId !== session.user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // For OWNER/MANAGER, check brand access (tenant isolation)
    if (session.user.role === "OWNER" || session.user.role === "MANAGER") {
      // Resolve brandId: check project.brandId first, then project.order.brandId
      const brandId = task.stage.project.brandId ?? task.stage.project.order?.brandId;
      if (brandId) {
        const hasAccess = await canAccessBrand(brandId);
        if (!hasAccess) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
      }
    }

    // Check if task is already complete
    if (task.status === "COMPLETE") {
      return NextResponse.json({ error: "Task is already complete" }, { status: 400 });
    }

    // If has children, check all children are complete
    if (task.children && task.children.length > 0) {
      const incompleteChildren = task.children.filter(child => child.status !== "COMPLETE");
      if (incompleteChildren.length > 0) {
        return NextResponse.json(
          { 
            error: "All subtasks must be completed first",
            incompleteChildren: incompleteChildren.map(c => ({ id: c.id, name: c.name }))
          },
          { status: 400 }
        );
      }
    }

    // Complete the task
    const completedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "COMPLETE",
        completedAt: new Date(),
      },
    });

    // Credit payout if task has payout amount and assignee
    // Note: Per API-CONTRACTS.md, payout crediting happens on DELIVERY APPROVAL, not task completion
    // But we credit the payout to the user's wallet when task is marked complete
    if (task.payoutAmount && task.assigneeUserId) {
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

        // Log payout credit
        await prisma.activityLog.create({
          data: {
            type: "PAYOUT_CREDITED",
            entityType: "Payout",
            entityId: payout.id,
            userId: session.user.id,
            metadata: {
              amount: task.payoutAmount,
              taskId: id,
              taskName: task.name,
            },
          },
        });
      }
    }

    // Cascade: Check if parent should auto-complete
    if (task.parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: task.parentTaskId },
        include: { children: true },
      });

      if (parentTask && parentTask.children) {
        const allSiblingsComplete = parentTask.children.every(
          child => child.id === id || child.status === "COMPLETE"
        );

        if (allSiblingsComplete) {
          await prisma.task.update({
            where: { id: task.parentTaskId },
            data: {
              status: "COMPLETE",
              completedAt: new Date(),
            },
          });

          // Log parent completion
          await prisma.activityLog.create({
            data: {
              type: "TASK_COMPLETED",
              entityType: "Task",
              entityId: task.parentTaskId,
              userId: session.user.id,
              metadata: {
                triggeredBy: id,
                action: "CASCADE_COMPLETE",
              },
            },
          });
        }
      }
    }

    // Log task completion
    await prisma.activityLog.create({
      data: {
        type: "TASK_COMPLETED",
        entityType: "Task",
        entityId: id,
        userId: session.user.id,
        metadata: {
          taskName: task.name,
          projectName: task.stage.project.name,
        },
      },
    });

    // Create notification for Owner/Manager
    // Future: notify specific project managers

    return NextResponse.json({
      message: "Task marked as complete",
      task: completedTask,
      payoutCredited: !!task.payoutAmount,
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 });
  }
}
