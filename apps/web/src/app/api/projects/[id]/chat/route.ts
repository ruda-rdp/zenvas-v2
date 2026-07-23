/**
 * API: /api/projects/[id]/chat
 * Project Chat - Live chat messages for Jacob's collaboration
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";

// GET /api/projects/[id]/chat - Get chat messages
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
    const before = searchParams.get("before"); // For pagination

    // Get project and verify access
    const project = await prisma.project.findUnique({
      where: { id },
      select: { 
        id: true, 
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

    // Get messages
    const whereClause: Record<string, unknown> = {
      projectId: id,
      deletedAt: null,
      parentId: null, // Only top-level messages
    };

    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.projectChat.findMany({
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

    return NextResponse.json({ messages });
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

    // If replying to a message, verify parent exists
    if (parentId) {
      const parent = await prisma.projectChat.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.projectId !== id) {
        return NextResponse.json({ error: "Parent message not found" }, { status: 404 });
      }
    }

    // Parse mentions from content (@userId)
    const extractedMentions = mentions || [];
    
    // Create the message
    const message = await prisma.projectChat.create({
      data: {
        projectId: id,
        userId: session.user.id,
        content: content.trim(),
        mentions: extractedMentions,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Create notifications for mentioned users
    if (extractedMentions.length > 0) {
      await prisma.notification.createMany({
        data: extractedMentions.map((userId: string) => ({
          userId,
          type: "SYSTEM" as const,
          title: "You were mentioned",
          message: `${session.user.name} mentioned you in a chat`,
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
