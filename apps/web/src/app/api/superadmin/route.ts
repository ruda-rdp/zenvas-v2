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
  
  // Check super admin
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
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.brand.count(),
      prisma.project.count(),
      prisma.task.count(),
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
    
    // Get system stats
    const stats = {
      organizations: orgCount,
      users: userCount,
      brands: brandCount,
      projects: projectCount,
      tasks: taskCount,
    };
    
    return NextResponse.json({
      stats,
      recentOrgs,
    });
  } catch (error) {
    console.error("Super admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
