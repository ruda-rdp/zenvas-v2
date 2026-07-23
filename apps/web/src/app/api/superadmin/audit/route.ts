/**
 * API: /api/superadmin/audit
 * Audit log for admin actions
 *
 * GET: List audit logs with filtering
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/superadmin";

export async function GET(request: Request) {
  const session = await auth();

  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType") || "";
    const action = searchParams.get("action") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.type = { contains: action, mode: "insensitive" };
    }

    // Get total count
    const total = await prisma.activityLog.count({ where });

    // Get logs - ActivityLog doesn't have user relation, so we get userId directly
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get user info for all userIds in the logs
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(users.map(u => [u.id, u]));

    // Combine logs with user info
    const logsWithUser = logs.map(log => ({
      ...log,
      user: log.userId ? userMap.get(log.userId) || null : null,
    }));

    return NextResponse.json({
      logs: logsWithUser,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
