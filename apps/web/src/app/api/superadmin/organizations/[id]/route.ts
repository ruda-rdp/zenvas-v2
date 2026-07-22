/**
 * API: /api/superadmin/organizations/[id]
 * Super Admin organization management
 * 
 * GET: Get organization detail
 * DELETE: Delete organization (cascade)
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
    
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        brands: {
          include: {
            _count: { select: { projects: true } },
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
    
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    
    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
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
    
    // Delete organization (cascade should handle related records based on schema)
    await prisma.organization.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: "Organization deleted" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
