/**
 * API: /api/projects/[id]/tasks
 * Create tasks under a project
 *
 * Authorization:
 * - GET: Uses requireUser + brand access + confidentiality
 * - POST: Uses requireUser + requireAction(write:projects)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  canAccessBrand,
} from "@/lib/authorize";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction for permission check
  const actionResult = await requireAction(user, "write:projects");
  if (!actionResult.success) return actionResult.response;

  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { name, category, priority, expectedDurationMinutes, dueDate } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Task name is required" }, { status: 400 });
    }

    // Get project with stages to find/create a stage
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        stages: {
          orderBy: { order: "asc" },
          take: 1,
        },
        order: {
          include: { brand: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access
    const brandId = project.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get or create a default stage
    let stage = project.stages[0];

    if (!stage) {
      // Create a default stage for the project
      stage = await prisma.stage.create({
        data: {
          name: "Tasks",
          order: 0,
          projectId: projectId,
        },
      });
    }

    // Get max order in stage
    const maxOrder = await prisma.task.aggregate({
      where: { stageId: stage.id },
      _max: { order: true },
    });

    // Create the task
    const task = await prisma.task.create({
      data: {
        name: name.trim(),
        category: category || "PRE_PRODUCTION",
        priority: priority || "MEDIUM",
        status: "OPEN",
        expectedDurationMinutes: expectedDurationMinutes || 60,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (maxOrder._max.order ?? -1) + 1,
        stageId: stage.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        children: true,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// GET /api/projects/[id]/tasks - List all tasks in a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  try {
    const { id: projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        order: {
          select: { brandId: true },
        },
        stages: {
          include: {
            tasks: {
              where: { parentTaskId: null }, // Only root tasks
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
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access
    const brandId = project.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasks = project.stages.flatMap((stage: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stage.tasks.map((task: any) => {
        const result: Record<string, unknown> = {
          ...task,
          stageName: stage.name,
        };
        // Apply confidentiality: strip payout info for EDITORs
        if (user.role === "EDITOR") {
          result.payout = undefined;
          result.children = ((task.children as unknown as Array<Record<string, unknown>>) || []).map((child) => ({
            ...child,
            payout: undefined,
          }));
        }
        return result;
      })
    );

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
