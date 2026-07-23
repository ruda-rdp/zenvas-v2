/**
 * API: /api/chat/presence
 * Update and get user presence/online status
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/chat/presence - Update user's presence (heartbeat)
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id!;

    // Update user's last active timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating presence:", error);
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
  }
}

// GET /api/chat/presence - Get all online users in organization
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id!;

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate online threshold (5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get all users in org with their online status
    const users = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        lastActiveAt: true,
      },
      orderBy: [
        { lastActiveAt: "desc" },
        { name: "asc" },
      ],
    });

    // Categorize users by online status
    const onlineUsers = users.filter(
      (u) => u.lastActiveAt && u.lastActiveAt > fiveMinutesAgo
    );
    const idleUsers = users.filter(
      (u) => u.lastActiveAt && u.lastActiveAt <= fiveMinutesAgo
    );
    const offlineUsers = users.filter((u) => !u.lastActiveAt);

    return NextResponse.json({
      online: onlineUsers,
      idle: idleUsers,
      offline: offlineUsers,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching presence:", error);
    return NextResponse.json({ error: "Failed to fetch presence" }, { status: 500 });
  }
}
