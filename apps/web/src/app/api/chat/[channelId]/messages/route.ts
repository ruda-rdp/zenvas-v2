/**
 * API: /api/chat/[channelId]/messages
 * Get and send messages in a channel
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ channelId: string }>;
}

// GET /api/chat/[channelId]/messages - Get messages in channel
export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "50"));
    const before = searchParams.get("before"); // For pagination
    const parentId = searchParams.get("parentId"); // For threaded replies

    const userId = session.user.id!;

    // Verify user is a participant in this channel
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

    // Update last read timestamp
    await prisma.chatChannelParticipant.update({
      where: { channelId_userId: { channelId, userId } },
      data: { lastReadAt: new Date(), unreadCount: 0 },
    });

    // Build query for messages
    const whereClause: Record<string, unknown> = {
      channelId,
      deletedAt: null,
    };

    if (parentId === "null" || !parentId) {
      whereClause.parentId = null; // Only top-level messages
    } else {
      whereClause.parentId = parentId;
    }

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    // Get messages with user info
    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get channel info
    const channel = await prisma.chatChannel.findUnique({
      where: { id: channelId },
      select: {
        id: true,
        name: true,
        type: true,
        avatarUrl: true,
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, lastActiveAt: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ messages: messages.reverse(), channel });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/chat/[channelId]/messages - Send a message
export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channelId } = await params;
    const body = await request.json();
    const { content, mentions, parentId } = body;
    const userId = session.user.id!;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

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

    // If replying, verify parent exists
    if (parentId) {
      const parent = await prisma.chatMessage.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.channelId !== channelId) {
        return NextResponse.json({ error: "Parent message not found" }, { status: 404 });
      }
    }

    // Parse mentions - extract @userId patterns
    const parsedMentions = mentions || [];
    
    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        channelId,
        userId,
        content: content.trim(),
        mentions: parsedMentions,
        parentId: parentId || null,
        replyCount: 0,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Update parent's reply count if this is a reply
    if (parentId) {
      await prisma.chatMessage.update({
        where: { id: parentId },
        data: { replyCount: { increment: 1 } },
      });
    }

    // Update channel's updatedAt
    await prisma.chatChannel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() },
    });

    // Create notifications for mentioned users
    if (parsedMentions.length > 0) {
      const mentionNotifications = parsedMentions.map((mention: { id: string }) => ({
        userId: mention.id,
        type: "SYSTEM" as const,
        title: "You were mentioned",
        message: `${session.user.name} mentioned you in chat`,
        link: `/chat?channel=${channelId}`,
      }));

      await prisma.notification.createMany({
        data: mentionNotifications,
        skipDuplicates: true,
      });
    }

    // Increment unread count for other participants
    await prisma.chatChannelParticipant.updateMany({
      where: {
        channelId,
        userId: { not: userId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
