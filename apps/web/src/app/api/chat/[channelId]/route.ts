/**
 * API: /api/chat/[channelId]
 * Get channel details
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ channelId: string }>;
}

// GET /api/chat/[channelId] - Get channel details
export async function GET(request: Request, { params }: RouteParams) {
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

    // Get channel with participants
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                role: true,
                lastActiveAt: true,
              },
            },
          },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({
      channel: {
        ...channel,
        currentUserRole: participation.role,
        currentUserUnreadCount: participation.unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching channel:", error);
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 });
  }
}
