/**
 * API: /api/superadmin/brands/[id]
 * Super Admin brand management
 *
 * GET: Get brand detail
 * PATCH: Update brand
 * DELETE: Delete brand
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/superadmin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            projects: true,
            clients: true,
            orders: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, domain, freeSubdomain, logoUrl, primaryColor, hasClientPortal } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (slug !== undefined) {
      updateData.slug = slug;
    }

    if (domain !== undefined) {
      updateData.domain = domain || null;
    }

    if (freeSubdomain !== undefined) {
      updateData.freeSubdomain = freeSubdomain || null;
    }

    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl || null;
    }

    if (primaryColor !== undefined) {
      updateData.primaryColor = primaryColor;
    }

    if (hasClientPortal !== undefined) {
      updateData.hasClientPortal = hasClientPortal;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        freeSubdomain: true,
        logoUrl: true,
        primaryColor: true,
        hasClientPortal: true,
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Get brand name for response
    const brandToDelete = await prisma.brand.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.$transaction(async (tx) => {
      // Delete related activity logs
      await tx.activityLog.deleteMany({
        where: { entityType: "Brand", entityId: id },
      });

      // Delete brand
      await tx.brand.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: `Brand "${brandToDelete?.name || id}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
