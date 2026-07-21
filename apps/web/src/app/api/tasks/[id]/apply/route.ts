/**
 * API: /api/tasks/[id]/apply
 * Editor applies to an open Task
 * 
 * Per API-CONTRACTS.md:
 * - POST: Editor applies to an open Task
 * - Role: Editor only
 * - Sets assigneeUserId if still unassigned
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

  // Only Editors can apply
  if (session.user.role !== "EDITOR") {
    return NextResponse.json({ error: "Only Editors can apply to tasks" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Get the task with project/brand info
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        stage: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task is still open
    if (task.status !== "OPEN") {
      return NextResponse.json(
        { error: "Task is no longer available. Only OPEN tasks can be applied to." },
        { status: 400 }
      );
    }

    // Check if already assigned
    if (task.assigneeUserId) {
      return NextResponse.json(
        { error: "Task is already assigned to another editor" },
        { status: 400 }
      );
    }

    // Check if editor has access to this brand
    if (task.stage.project.brandId) {
      const hasAccess = await canAccessBrand(task.stage.project.brandId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: "You don't have access to this brand's tasks" },
          { status: 403 }
        );
      }
    }

    // Also check if parent task exists and is accessible
    if (task.parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: task.parentTaskId },
        include: {
          stage: {
            include: {
              project: true,
            },
          },
        },
      });

      if (parentTask && parentTask.stage.project.brandId) {
        const hasParentAccess = await canAccessBrand(parentTask.stage.project.brandId);
        if (!hasParentAccess) {
          return NextResponse.json(
            { error: "You don't have access to this task's parent project" },
            { status: 403 }
          );
        }
      }
    }

    // Apply to the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        assigneeUserId: session.user.id,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
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
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "TASK_ASSIGNED",
        entityType: "Task",
        entityId: id,
        userId: session.user.id,
        metadata: {
          action: "APPLY",
          editorApplied: session.user.id,
        },
      },
    });

    // Create notification for Owner/Manager (future: could notify specific managers)
    // For now, activity log is sufficient

    return NextResponse.json({
      message: "Successfully applied to task",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error applying to task:", error);
    return NextResponse.json({ error: "Failed to apply to task" }, { status: 500 });
  }
}
