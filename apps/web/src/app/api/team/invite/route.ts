/**
 * API: /api/team/invite
 * Generate invite codes for team members
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can generate invite codes
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can generate invite codes" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { role, count = 1 } = body;

    if (!role || !["EDITOR", "MANAGER", "PRODUCER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be EDITOR, MANAGER, or PRODUCER" },
        { status: 400 }
      );
    }

    const inviteCodes = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const code = `${role}_${generateRandomString(12)}`;
      
      const inviteCode = await prisma.inviteCode.create({
        data: {
          organizationId: session.user.organizationId,
          code,
          role: role as Role,
        },
      });

      inviteCodes.push({
        code: inviteCode.code,
        role: inviteCode.role,
        createdAt: inviteCode.createdAt,
      });
    }

    return NextResponse.json({
      success: true,
      inviteCodes,
    });
  } catch (error) {
    console.error("Error generating invite codes:", error);
    return NextResponse.json({ error: "Failed to generate invite codes" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can view invite codes" }, { status: 403 });
  }

  try {
    const inviteCodes = await prisma.inviteCode.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inviteCodes });
  } catch (error) {
    console.error("Error fetching invite codes:", error);
    return NextResponse.json({ error: "Failed to fetch invite codes" }, { status: 500 });
  }
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
