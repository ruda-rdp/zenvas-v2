/**
 * API: /api/projects/[id]
 * Get, Update single project
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";

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
        return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 });
      }
    }

    return NextResponse.json({ project });
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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
        return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 });
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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can delete
  if (session.user.role !== "OWNER") {
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
        return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 });
      }
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
