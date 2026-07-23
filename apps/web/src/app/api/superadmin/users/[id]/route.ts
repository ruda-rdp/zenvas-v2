/**
 * API: /api/superadmin/users/[id]
 * Super Admin user management
 *
 * GET: Get user detail
 * PATCH: Update user (role, organization, status)
 * DELETE: Delete user
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/superadmin";
import { Role } from "@/generated/prisma";

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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employmentType: true,
        createdAt: true,
        isActive: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            leads: true,
            brandAccess: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ user, recentActivity });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
    const { role, organizationId, isActive, employmentType, name } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Validate role
    if (role !== undefined) {
      const validRoles: Role[] = ["OWNER", "MANAGER", "PRODUCER", "EDITOR"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    // Transfer to different organization
    if (organizationId !== undefined) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) {
        return NextResponse.json(
          { error: "Target organization not found" },
          { status: 404 }
        );
      }
      updateData.organizationId = organizationId;
    }

    // Update active status
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update employment type
    if (employmentType !== undefined) {
      updateData.employmentType = employmentType;
    }

    // Update name
    if (name !== undefined) {
      updateData.name = name;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        organizationId: true,
        organization: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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
    const currentUserId = session?.user?.id;

    // Don't allow deleting self
    if (currentUserId && id === currentUserId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user is the only owner of any organization
    const userOrgs = await prisma.organization.findMany({
      where: {
        users: { some: { id, role: "OWNER" } },
      },
    });

    if (userOrgs.length > 0) {
      // Check if they're the only owner - fetch user name for error message
      const userToDelete = await prisma.user.findUnique({
        where: { id },
        select: { name: true },
      });

      for (const org of userOrgs) {
        const ownerCount = await prisma.user.count({
          where: {
            organizationId: org.id,
            role: "OWNER",
          },
        });
        if (ownerCount === 1) {
          return NextResponse.json(
            {
              error: `Cannot delete: ${userToDelete?.name || id} is the only owner of "${org.name}". Transfer ownership first.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
