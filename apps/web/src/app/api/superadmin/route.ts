/**
 * API: /api/superadmin
 * Super Admin dashboard - get system stats
 *
 * GET: Get overview stats (orgs, users, brands, etc.)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/superadmin";

export async function GET() {
  const session = await auth();

  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Get counts
    const [
      orgCount,
      userCount,
      brandCount,
      projectCount,
      taskCount,
      orderCount,
      leadCount,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.brand.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.order.count(),
      prisma.lead.count(),
    ]);

    // Get recent organizations
    const recentOrgs = await prisma.organization.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            brands: true,
          },
        },
      },
    });

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        organization: {
          select: { name: true },
        },
      },
    });

    // Get activity stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newOrgsLast30Days,
      newUsersLast30Days,
      newProjectsLast30Days,
    ] = await Promise.all([
      prisma.organization.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.project.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // System stats
    const stats = {
      organizations: orgCount,
      users: userCount,
      brands: brandCount,
      projects: projectCount,
      tasks: taskCount,
      orders: orderCount,
      leads: leadCount,
      trends: {
        newOrgsLast30Days,
        newUsersLast30Days,
        newProjectsLast30Days,
      },
    };

    return NextResponse.json({
      stats,
      recentOrgs,
      recentUsers,
    });
  } catch (error) {
    console.error("Super admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
