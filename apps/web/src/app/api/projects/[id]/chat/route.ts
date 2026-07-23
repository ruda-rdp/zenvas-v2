/**
 * API: /api/projects/[id]/chat
 * Project Chat - Uses the new global chat system
 * Creates/retrieves a PROJECT channel for the project
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";

// GET /api/projects/[id]/chat - Get chat messages for this project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "50"));
    const before = searchParams.get("before");

    // Get project and verify access
    const project = await prisma.project.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true,
        brandId: true,
        order: { select: { brandId: true } }
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access
    const brandId = project.brandId ?? project.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Find or create a PROJECT channel for this project
    let channel = await prisma.chatChannel.findFirst({
      where: {
        type: "PROJECT",
        projectId: id,
        participants: {
          some: { userId: session.user.id! },
        },
      },
    });

    if (!channel) {
      // Create a new project channel
      channel = await prisma.chatChannel.create({
        data: {
          name: project.name || `Project ${id.slice(0, 8)}`,
          type: "PROJECT",
          projectId: id,
          participants: {
            create: {
              userId: session.user.id!,
              role: "ADMIN",
            },
          },
        },
      });
    }

    // Get messages
    const whereClause: Record<string, unknown> = {
      channelId: channel.id,
      deletedAt: null,
      parentId: null,
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

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

    return NextResponse.json({ 
      messages,
      channel: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
      }
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/projects/[id]/chat - Send a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { content, mentions, parentId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Get project and verify access
    const project = await prisma.project.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true,
        brandId: true,
        order: { select: { brandId: true } }
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check brand access
    const brandId = project.brandId ?? project.order?.brandId;
    if (brandId) {
      const hasAccess = await canAccessBrand(brandId);
      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Find or create a PROJECT channel for this project
    let channel = await prisma.chatChannel.findFirst({
      where: {
        type: "PROJECT",
        projectId: id,
        participants: {
          some: { userId: session.user.id! },
        },
      },
    });

    if (!channel) {
      channel = await prisma.chatChannel.create({
        data: {
          name: project.name || `Project ${id.slice(0, 8)}`,
          type: "PROJECT",
          projectId: id,
          participants: {
            create: {
              userId: session.user.id!,
              role: "ADMIN",
            },
          },
        },
      });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        channelId: channel.id,
        userId: session.user.id,
        content: content.trim(),
        mentions: mentions || [],
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Update channel timestamp
    await prisma.chatChannel.update({
      where: { id: channel.id },
      data: { updatedAt: new Date() },
    });

    // Create notifications for mentioned users
    if (mentions && mentions.length > 0) {
      await prisma.notification.createMany({
        data: mentions.map((userId: string) => ({
          userId,
          type: "SYSTEM" as const,
          title: "You were mentioned",
          message: `${session.user.name} mentioned you in ${project.name || "a project"}`,
          link: `/projects/${id}`,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
