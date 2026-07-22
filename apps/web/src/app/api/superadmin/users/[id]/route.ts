/**
 * API: /api/superadmin/users/[id]
 * Super Admin user management
 * 
 * GET: Get user detail
 * PATCH: Update user role
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
        createdAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
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
    const { role } = body;
    
    // Validate role
    if (role && !["OWNER", "MANAGER", "PRODUCER", "EDITOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role: role as Role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }
    
    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
