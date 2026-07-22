/**
 * API: /api/tasks/[id]/subtasks
 * Subtask management for Tasks
 * 
 * Per API-CONTRACTS.md:
 * - POST: Add subtask to a Task
 * - GET: List subtasks of a Task
 * - Max depth: 4 levels (enforced in application logic)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";
import { validateTaskDepth } from "@/lib/authorize";
import { TaskStatus } from "@/generated/prisma";

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

    // Get the parent task with full hierarchy
    const parentTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        children: {
          include: {
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
          },
          orderBy: { order: "asc" },
        },
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
      },
    });

    if (!parentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // For OWNER/MANAGER, check brand access - resolve brandId with fallback
    if (session.user.role === "OWNER" || session.user.role === "MANAGER") {
      const brandId = parentTask.stage.project.brandId ?? parentTask.stage.project.order?.brandId;
      if (brandId) {
        const hasAccess = await canAccessBrand(brandId);
        if (!hasAccess) {
          return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
        }
      }
    }

    // For Editors, check if they can view this task
    if (session.user.role === "EDITOR") {
      // Editor can only see their own tasks or if they're assigned to the parent
      if (parentTask.assigneeUserId !== session.user.id && !parentTask.assigneeUserId) {
        // If parent is unassigned, check if this editor has access to the project
        // For now, we allow viewing
      } else if (parentTask.assigneeUserId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({
      parentTask: {
        id: parentTask.id,
        name: parentTask.name,
        status: parentTask.status,
        assignee: parentTask.assignee,
        children: parentTask.children,
      },
    });
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const { name, expectedDurationMinutes, assigneeUserId, payoutAmount, category } = body;

    if (!name) {
      return NextResponse.json({ error: "Subtask name is required" }, { status: 400 });
    }

    // Get the parent task with full hierarchy
    const parentTask = await prisma.task.findUnique({
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
      },
    });

    if (!parentTask) {
      return NextResponse.json({ error: "Parent task not found" }, { status: 404 });
    }

    // For OWNER/MANAGER, check brand access - resolve brandId with fallback
    if (session.user.role === "OWNER" || session.user.role === "MANAGER") {
      const brandId = parentTask.stage.project.brandId ?? parentTask.stage.project.order?.brandId;
      if (brandId) {
        const hasAccess = await canAccessBrand(brandId);
        if (!hasAccess) {
          return NextResponse.json({ error: "You don't have access to this task" }, { status: 403 });
        }
      }
    }

    // Check permissions
    if (session.user.role === "EDITOR") {
      // Editor can only add subtasks to their own tasks
      if (parentTask.assigneeUserId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only add subtasks to your own tasks" },
          { status: 403 }
        );
      }
    }

    // Calculate depth - count parent chain
    let depth = 0;
    let parentId: string | null = parentTask.parentTaskId;
    while (parentId && depth < 10) {
      depth++;
      const parent = await prisma.task.findUnique({
        where: { id: parentId },
        select: { parentTaskId: true },
      });
      if (!parent) break;
      parentId = parent.parentTaskId;
    }

    // Validate depth (max 4 levels = depth 3 for children)
    if (!validateTaskDepth(id, depth)) {
      return NextResponse.json(
        { error: "Maximum nesting depth reached. Cannot add subtask to a 4-level deep task." },
        { status: 400 }
      );
    }

    // Get the highest order number among siblings
    const siblings = await prisma.task.findMany({
      where: { parentTaskId: id },
      select: { order: true },
      orderBy: { order: "desc" },
      take: 1,
    });
    const nextOrder = siblings.length > 0 ? siblings[0].order + 1 : 0;

    // Create the subtask
    const subtask = await prisma.task.create({
      data: {
        stageId: parentTask.stageId, // Same stage as parent
        parentTaskId: id,
        name,
        order: nextOrder,
        status: TaskStatus.OPEN,
        category: category || parentTask.category, // Inherit from parent
        expectedDurationMinutes: expectedDurationMinutes || 60,
        assigneeUserId: assigneeUserId || parentTask.assigneeUserId, // Inherit from parent
        payoutAmount: payoutAmount !== undefined ? payoutAmount : null,
        isFromTemplate: false, // Manually added
        clientVisible: parentTask.clientVisible, // Inherit visibility
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "TASK_ASSIGNED",
        entityType: "Task",
        entityId: subtask.id,
        userId: session.user.id,
        metadata: {
          action: "SUBTASK_CREATED",
          parentTaskId: id,
          parentTaskName: parentTask.name,
        },
      },
    });

    return NextResponse.json({
      message: "Subtask created successfully",
      subtask: {
        id: subtask.id,
        name: subtask.name,
        status: subtask.status,
        order: subtask.order,
        category: subtask.category,
        expectedDurationMinutes: subtask.expectedDurationMinutes,
        clientVisible: subtask.clientVisible,
        isFromTemplate: subtask.isFromTemplate,
        createdAt: subtask.createdAt,
        assignee: subtask.assignee,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
