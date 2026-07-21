/**
 * API: /api/team/[id]
 * Update user status (active/inactive) and remove team member
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/team/[id] - Update user status (active/inactive)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can update user status
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can update team members" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot modify owner
    if (targetUser.role === "OWNER") {
      return NextResponse.json({ error: "Cannot modify owner status" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/team/[id] - Remove team member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can remove team members
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can remove team members" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot remove owner
    if (targetUser.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });
    }

    // Cannot remove self
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    // Use transaction to clean up all related data
    await prisma.$transaction([
      // Remove brand access
      prisma.brandAccess.deleteMany({
        where: { userId: id },
      }),
      // Reassign leads (unassign)
      prisma.lead.updateMany({
        where: { assignedTo: id },
        data: { assignedTo: null },
      }),
      // Reassign tasks (unassign)
      prisma.task.updateMany({
        where: { assigneeUserId: id },
        data: { assigneeUserId: null },
      }),
      // Delete notifications
      prisma.notification.deleteMany({
        where: { userId: id },
      }),
      // Delete user
      prisma.user.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("Error removing user:", error);
    return NextResponse.json({ error: "Failed to remove user" }, { status: 500 });
  }
}
