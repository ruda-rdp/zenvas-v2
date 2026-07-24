/**
 * API: /api/projects/[id]
 * Get, Update single project
 *
 * Authorization:
 * - GET: Uses requireUser + brand access check + confidentiality
 * - PATCH: Uses requireUser + requireAction(write:projects)
 * - DELETE: Uses requireUser + requireAction(write:projects) + OWNER only
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  canAccessBrand,
  stripTaskPayout,
} from "@/lib/authorize";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            client: true,
            service: true,
            brand: true,
          },
        },
        stages: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: { id: true, name: true },
                },
                payout: true,
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
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access - resolve brandId with fallback to order.brandId
    const brandId = project.brandId ?? project.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    // Apply confidentiality filtering for EDITOR/PRODUCER:
    // hide the whole order object + strip payout from every task (centralized helper).
    let safeProject = project;
    if (user.role !== "OWNER" && user.role !== "MANAGER") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripped = project as any;
      stripped.order = undefined;
      for (const stage of stripped.stages) {
        stage.tasks = stage.tasks.map((task: Record<string, unknown>) =>
          stripTaskPayout(task, user.role)
        );
      }
      safeProject = stripped;
    }

    return NextResponse.json({ project: safeProject });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

// PATCH /api/projects/[id] - Update project (poster, name, etc)
export async function PATCH(
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
    const { id } = await params;
    const body = await request.json();
    const { name, description, posterUrl, posterAspect } = body;

    // Check project exists with order include for brandId resolution
    const existing = await prisma.project.findUnique({
      where: { id },
      include: { order: { select: { brandId: true } } }
    });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access - resolve brandId with fallback to order.brandId
    const brandId = existing.brandId ?? existing.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    // Update only provided fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl;
    if (posterAspect !== undefined) updateData.posterAspect = posterAspect;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            client: true,
            service: true,
            brand: true,
          },
        },
        stages: {
          include: {
            tasks: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Only OWNER can delete - use requireAction with write:projects first
  // then additional OWNER check
  const actionResult = await requireAction(user, "write:projects");
  if (!actionResult.success) return actionResult.response;

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Check project exists with order include for brandId resolution
    const existing = await prisma.project.findUnique({
      where: { id },
      include: { order: { select: { brandId: true } } }
    });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access - resolve brandId with fallback to order.brandId
    const brandId = existing.brandId ?? existing.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
