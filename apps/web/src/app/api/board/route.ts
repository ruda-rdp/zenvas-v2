/**
 * API: /api/board
 * Editor's Task Board - Cross-Brand aggregated open/assigned Task list
 * 
 * Per API-CONTRACTS.md:
 * - GET: Editor sees only their assigned tasks + open unassigned tasks from accessible brands
 * - Role: Editor only
 * - Scoped to Brands in caller's BrandAccess
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds } from "@/lib/authorize";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Board is for Editors only
  if (session.user.role !== "EDITOR") {
    return NextResponse.json({ error: "Board is only available for Editors" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // filter by status
    const category = searchParams.get("category"); // filter by category
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Get user's accessible brands
    const accessibleBrandIds = await getAccessibleBrandIds();

    if (accessibleBrandIds.length === 0) {
      return NextResponse.json({ 
        assignedTasks: [],
        availableTasks: [],
        tasksByBrand: [],
        stats: { assignedOpen: 0, assignedInProgress: 0, assignedComplete: 0, availableForApply: 0 },
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: "No brand access. Please contact your manager."
      });
    }

    // Build assigned tasks query (tasks assigned to this editor)
    const assignedWhere: Record<string, unknown> = {
      assigneeUserId: session.user.id,
      status: status ? status : undefined,
    };

    if (category) {
      assignedWhere.category = category;
    }

    // Build available tasks query (unassigned tasks from accessible brands)
    const availableWhere: Record<string, unknown> = {
      assigneeUserId: null, // Unassigned
      stage: {
        project: {
          brandId: {
            in: accessibleBrandIds,
          },
        },
      },
      status: "OPEN", // Only show OPEN tasks for applying
    };

    if (category) {
      availableWhere.category = category;
    }

    // Count totals for pagination
    const totalAssigned = await prisma.task.count({ where: assignedWhere });
    const totalAvailable = await prisma.task.count({ where: availableWhere });

    // Fetch assigned tasks with pagination
    const assignedTasks = await prisma.task.findMany({
      where: assignedWhere,
      include: {
        stage: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                posterUrl: true,
                brandId: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                    primaryColor: true,
                  },
                },
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // OPEN first, then IN_PROGRESS, then COMPLETE
        { createdAt: "desc" },
      ],
      take: limit,
      skip,
    });

    // Fetch available (unassigned) tasks with pagination
    const availableTasks = await prisma.task.findMany({
      where: availableWhere,
      include: {
        stage: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                posterUrl: true,
                brandId: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                    primaryColor: true,
                  },
                },
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    });

    // Group tasks by brand for easier UI rendering
    const tasksByBrand = new Map<string, { brandId: string; brand: string; tasks: typeof availableTasks }>();
    
    for (const task of availableTasks) {
      const brandId = task.stage.project.brandId || "solo";
      if (!tasksByBrand.has(brandId)) {
        tasksByBrand.set(brandId, {
          brandId,
          brand: task.stage.project.brand?.name || "Solo Project",
          tasks: [],
        });
      }
      tasksByBrand.get(brandId)!.tasks.push(task);
    }

    // Calculate stats
    const stats = {
      assignedOpen: assignedTasks.filter(t => t.status === "OPEN").length,
      assignedInProgress: assignedTasks.filter(t => t.status === "IN_PROGRESS").length,
      assignedComplete: assignedTasks.filter(t => t.status === "COMPLETE").length,
      availableForApply: availableTasks.length,
    };

    return NextResponse.json({
      stats,
      assignedTasks,
      availableTasks,
      tasksByBrand: Array.from(tasksByBrand.entries()).map(([bid, data]) => ({
        brandId: bid,
        brand: data.brand,
        tasks: data.tasks,
      })),
    });
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json({ error: "Failed to fetch board" }, { status: 500 });
  }
}
