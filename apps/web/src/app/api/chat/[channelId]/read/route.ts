/**
 * API: /api/chat/[channelId]/read
 * Mark channel as read
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ channelId: string }>;
}

// POST /api/chat/[channelId]/read - Mark channel as read
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await params;
    const userId = session.user.id!;

    // Verify user is a participant
    const participation = await prisma.chatChannelParticipant.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update last read timestamp and reset unread count
    await prisma.chatChannelParticipant.update({
      where: { channelId_userId: { channelId, userId } },
      data: {
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking channel as read:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
