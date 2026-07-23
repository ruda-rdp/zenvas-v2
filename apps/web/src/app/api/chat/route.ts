/**
 * API: /api/chat
 * Global Chat Channels - List channels, create channels
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/chat - Get all channels for current user
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id!;

    // Get all channels where user is a participant
    const participations = await prisma.chatChannelParticipant.findMany({
      where: { userId },
      include: {
        channel: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true, lastActiveAt: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        channel: { updatedAt: "desc" },
      },
    });

    // Transform to flatten structure
    const channels = participations.map((p) => ({
      id: p.channel.id,
      name: p.channel.name,
      type: p.channel.type,
      avatarUrl: p.channel.avatarUrl,
      unreadCount: p.unreadCount,
      lastReadAt: p.lastReadAt,
      lastMessage: p.channel.messages[0] || null,
      participants: p.channel.participants.map((participant) => ({
        id: participant.user.id,
        name: participant.user.name,
        avatarUrl: participant.user.avatarUrl,
        lastActiveAt: participant.user.lastActiveAt,
      })),
      createdAt: p.channel.createdAt,
      updatedAt: p.channel.updatedAt,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Error fetching chat channels:", error);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}

// POST /api/chat - Create a new channel
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id!;
    const body = await request.json();
    const { name, type, participantIds, projectId, brandId } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
    }

    // Determine channel type
    const channelType = type || "DIRECT";
    
    // Build participant list - always include creator
    const allParticipantIds = [userId, ...(participantIds || [])];
    
    // For DIRECT type, ensure exactly 2 participants and create unique name
    let channelName = name.trim();
    if (channelType === "DIRECT" && participantIds?.length === 1) {
      // Get the other user's name for display
      const otherUser = await prisma.user.findUnique({
        where: { id: participantIds[0] },
        select: { name: true },
      });
      channelName = otherUser?.name || "Direct Message";
    }

    // Check if DM channel already exists between these users
    if (channelType === "DIRECT") {
      const existingChannel = await prisma.chatChannel.findFirst({
        where: {
          type: "DIRECT",
          participantIds: { hasEvery: [userId, participantIds?.[0] || ""] },
        },
      });

      if (existingChannel) {
        return NextResponse.json({ channel: existingChannel, existing: true });
      }
    }

    // Create the channel
    const channel = await prisma.chatChannel.create({
      data: {
        name: channelName,
        type: channelType as "GENERAL" | "TEAM" | "PROJECT" | "DIRECT",
        projectId: projectId || null,
        brandId: brandId || null,
        participantIds: allParticipantIds,
        createdById: userId,
        participants: {
          create: allParticipantIds.map((pid, index) => ({
            userId: pid,
            role: index === 0 ? "owner" : "member",
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ channel, existing: false }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat channel:", error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
