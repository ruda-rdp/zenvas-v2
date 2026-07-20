/**
 * API: /api/team/[id]/role
 * Change user role
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can change roles
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["EDITOR", "MANAGER", "PRODUCER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot change owner's role
    if (targetUser.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner's role" }, { status: 400 });
    }

    // Cannot change own role
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Error changing user role:", error);
    return NextResponse.json({ error: "Failed to change role" }, { status: 500 });
  }
}
