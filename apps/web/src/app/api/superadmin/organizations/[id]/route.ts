/**
 * API: /api/superadmin/organizations/[id]
 * Super Admin organization management
 *
 * GET: Get organization detail
 * PATCH: Update organization
 * DELETE: Delete organization (cascade)
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

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        brands: {
          include: {
            _count: { select: { projects: true } },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            brands: true,
            users: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
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
    const { name, slug, plan, apps } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (slug !== undefined) {
      // Check if slug already exists
      const existingOrg = await prisma.organization.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      if (existingOrg) {
        return NextResponse.json(
          { error: "Organization slug already exists" },
          { status: 400 }
        );
      }
      updateData.slug = slug;
    }

    if (plan !== undefined) {
      const validPlans = ["starter", "professional", "enterprise"];
      if (!validPlans.includes(plan)) {
        return NextResponse.json(
          { error: "Invalid plan. Must be starter, professional, or enterprise" },
          { status: 400 }
        );
      }
      updateData.plan = plan;
    }

    if (apps !== undefined) {
      updateData.apps = apps;
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        apps: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
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

    // Get org name for response
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { name: true },
    });

    // Delete organization (cascade should handle related records based on schema)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Organization "${org?.name || id}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
