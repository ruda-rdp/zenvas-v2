/**
 * API: /api/profile
 * User profile management
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// GET /api/profile - Get current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employmentType: user.employmentType,
        createdAt: user.createdAt,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH /api/profile - Update profile (name, email)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    const updateData: { name?: string; email?: string } = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: session.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      updateData.email = email;
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
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
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
