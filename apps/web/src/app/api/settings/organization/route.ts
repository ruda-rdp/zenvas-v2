/**
 * API: /api/settings/organization
 * Organization settings
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            brands: true,
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization: user.organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    // Check if user already has an organization
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // If user already has org, they must be OWNER to modify
    if (existingUser?.organization) {
      if (session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
      }
      // Update existing
      const updated = await prisma.organization.update({
        where: { id: existingUser.organization.id },
        data: { name },
        include: { brands: true },
      });
      return NextResponse.json({ organization: updated });
    }

    // No org yet - allow creation for new users
    const org = await prisma.organization.create({
      data: {
        name: name || session.user.name || "My Organization",
        users: {
          connect: { id: session.user.id },
        },
      },
      include: { brands: true },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
