/**
 * API: /api/superadmin/brands/[id]
 * Super Admin brand management
 * 
 * GET: Get brand detail
 * DELETE: Delete brand
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/superadmin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });
    
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    
    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.activityLog.deleteMany({
        where: { entityType: "Brand", entityId: id },
      });
      
      // Delete brand
      await tx.brand.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ message: "Brand deleted" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
