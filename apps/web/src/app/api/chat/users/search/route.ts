/**
 * API: /api/chat/users/search
 * Search users for chat mentions and DM creation
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/chat/users/search - Search users
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));

    const userId = session.user.id!;

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Search users in same organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        id: { not: userId }, // Exclude self
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" as const } },
                { email: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        lastActiveAt: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
