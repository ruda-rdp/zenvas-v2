/**
 * API: /api/team/heartbeat
 * Update user's last active timestamp for presence tracking
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true, timestamp: new Date() });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// GET: Get online status of all team members
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, lastActiveAt: true },
    });

    const now = new Date();
    const presenceStatus = users.map(user => {
      const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
      const diffMinutes = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / 60000) : null;
      
      let status: "online" | "away" | "offline" = "offline";
      if (diffMinutes !== null) {
        if (diffMinutes <= 5) status = "online";
        else if (diffMinutes <= 30) status = "away";
      }

      return {
        userId: user.id,
        status,
        lastActiveAt: user.lastActiveAt,
        diffMinutes,
      };
    });

    return NextResponse.json({ presence: presenceStatus });
  } catch (error) {
    console.error("Error fetching presence:", error);
    return NextResponse.json({ error: "Failed to fetch presence" }, { status: 500 });
  }
}
