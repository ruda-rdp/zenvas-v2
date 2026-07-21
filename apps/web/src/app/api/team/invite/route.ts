/**
 * API: /api/team/invite
 * Generate, list, and cancel invite codes for team members
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma";

// POST /api/team/invite - Generate invite codes
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
    const { role, count = 1, invitedName, invitedEmail, expiresInDays } = body;

    if (!role || !["EDITOR", "MANAGER", "PRODUCER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be EDITOR, MANAGER, or PRODUCER" },
        { status: 400 }
      );
    }

    const inviteCodes = [];

    for (let i = 0; i < Math.min(count, 10); i++) {
      const code = `${role}_${generateRandomString(12)}`;
      
      // Calculate expiration date
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;
      
      const inviteCode = await prisma.inviteCode.create({
        data: {
          organizationId: session.user.organizationId,
          code,
          role: role as Role,
          invitedName: invitedName || null,
          invitedEmail: invitedEmail || null,
          expiresAt,
        },
      });

      inviteCodes.push({
        id: inviteCode.id,
        code: inviteCode.code,
        role: inviteCode.role,
        invitedName: inviteCode.invitedName,
        invitedEmail: inviteCode.invitedEmail,
        expiresAt: inviteCode.expiresAt,
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

// GET /api/team/invite - List all invite codes (including pending)
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
      where: { 
        organizationId: session.user.organizationId,
        used: false, // Only show unused invites
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out expired codes and mark status
    const now = new Date();
    const invitesWithStatus = inviteCodes.map(invite => ({
      ...invite,
      isExpired: invite.expiresAt ? new Date(invite.expiresAt) < now : false,
      fullLink: `/register?code=${invite.code}`,
    }));

    return NextResponse.json({ inviteCodes: invitesWithStatus });
  } catch (error) {
    console.error("Error fetching invite codes:", error);
    return NextResponse.json({ error: "Failed to fetch invite codes" }, { status: 500 });
  }
}

// DELETE /api/team/invite - Cancel an invite code
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can cancel invite codes" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("id");

    if (!codeId) {
      return NextResponse.json({ error: "Invite code ID required" }, { status: 400 });
    }

    // Verify invite belongs to this organization
    const invite = await prisma.inviteCode.findFirst({
      where: { 
        id: codeId, 
        organizationId: session.user.organizationId 
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite code not found" }, { status: 404 });
    }

    if (invite.used) {
      return NextResponse.json({ error: "Cannot cancel already used invite" }, { status: 400 });
    }

    await prisma.inviteCode.delete({
      where: { id: codeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling invite:", error);
    return NextResponse.json({ error: "Failed to cancel invite" }, { status: 500 });
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
