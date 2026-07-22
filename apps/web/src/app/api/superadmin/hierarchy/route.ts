/**
 * API: /api/superadmin/hierarchy
 * Get full organization hierarchy tree
 * 
 * GET: Returns org -> brands -> users tree
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
    // Get all organizations with their brands and users
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brands: {
          include: {
            _count: {
              select: { projects: true },
            },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            brands: true,
            users: true,
          },
        },
      },
    });
    
    // Get stats
    const [orgCount, userCount, brandCount, projectCount] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.brand.count(),
      prisma.project.count(),
    ]);
    
    return NextResponse.json({
      organizations,
      stats: {
        organizations: orgCount,
        users: userCount,
        brands: brandCount,
        projects: projectCount,
      },
    });
  } catch (error) {
    console.error("Error fetching hierarchy:", error);
    return NextResponse.json({ error: "Failed to fetch hierarchy" }, { status: 500 });
  }
}
