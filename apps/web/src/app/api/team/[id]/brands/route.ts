/**
 * API: /api/team/[id]/brands
 * Manage user brand access
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can manage brand access
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage brand access" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { brandId } = body;

    if (!brandId) {
      return NextResponse.json({ error: "brandId required" }, { status: 400 });
    }

    // Verify brand belongs to organization
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, organizationId: session.user.organizationId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if access already exists
    const existing = await prisma.brandAccess.findUnique({
      where: {
        userId_brandId: {
          userId: id,
          brandId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Access already exists" });
    }

    // Grant access
    const access = await prisma.brandAccess.create({
      data: {
        userId: id,
        brandId,
      },
    });

    return NextResponse.json({ access });
  } catch (error) {
    console.error("Error granting brand access:", error);
    return NextResponse.json({ error: "Failed to grant access" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can manage brand access" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json({ error: "brandId required" }, { status: 400 });
    }

    await prisma.brandAccess.delete({
      where: {
        userId_brandId: {
          userId: id,
          brandId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing brand access:", error);
    return NextResponse.json({ error: "Failed to remove access" }, { status: 500 });
  }
}
