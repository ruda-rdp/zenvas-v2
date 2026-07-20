/**
 * API: /api/settings/brands
 * Brand CRUD
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
    const brands = await prisma.brand.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, domain, primaryColor } = body;

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Name and domain are required" },
        { status: 400 }
      );
    }

    // Check if domain is already taken
    const existingBrand = await prisma.brand.findUnique({
      where: { domain },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Domain already taken" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        domain,
        primaryColor: primaryColor || "#2563EB",
        isPersonalBrand: false,
        organizationId: session.user.organizationId,
      },
    });

    // Auto-create default service for new brand
    await prisma.service.createMany({
      data: [
        {
          brandId: brand.id,
          name: "Standard Project",
          price: 2500000,
          intakeFormSchema: {
            fields: [
              { name: "description", type: "text", label: "Project Description", required: true },
            ],
          },
          stageTemplate: [
            {
              name: "Planning",
              tasks: [
                { name: "Kickoff meeting", expectedDurationMinutes: 60, visibility: true },
                { name: "Requirements gathering", expectedDurationMinutes: 120, visibility: true },
              ],
            },
            {
              name: "Execution",
              tasks: [
                { name: "Work on project", expectedDurationMinutes: 480, visibility: true },
              ],
            },
            {
              name: "Delivery",
              tasks: [
                { name: "Review & feedback", expectedDurationMinutes: 60, visibility: true },
                { name: "Deliver final", expectedDurationMinutes: 30, visibility: true },
              ],
            },
          ],
        },
      ],
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
