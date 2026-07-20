/**
 * API: /api/team
 * List team members and manage organization
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/team - List all team members in organization
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users in the organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        brandAccess: {
          select: { brandId: true },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
