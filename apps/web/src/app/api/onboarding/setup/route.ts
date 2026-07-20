/**
 * API: /api/onboarding/setup
 * Simple onboarding - create first brand
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { brandName, brandDomain, primaryColor } = body;

    if (!brandName || !brandDomain) {
      return NextResponse.json(
        { error: "brandName and brandDomain are required" },
        { status: 400 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: { include: { brands: true } } },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "No organization found. Please contact support." },
        { status: 400 }
      );
    }

    const org = user.organization;

    // Check if org already has brands
    if (org.brands && org.brands.length > 0) {
      return NextResponse.json(
        { error: "Organization already has a brand", organization: org },
        { status: 400 }
      );
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        domain: brandDomain,
        primaryColor: primaryColor || "#2563EB",
        isPersonalBrand: false, // Universal - all brands same
        organizationId: org.id,
      },
    });

    // Auto-create default service for the brand
    await prisma.service.createMany({
      data: [
        {
          brandId: brand.id,
          name: "Standard Project",
          price: 2500000,
          intakeFormSchema: {
            fields: [
              { name: "description", type: "textarea", label: "Project Description", required: true },
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

    // Update organization name
    await prisma.organization.update({
      where: { id: org.id },
      data: { name: brandName },
    });

    return NextResponse.json({
      organization: { ...org, name: brandName },
      brand,
      onboardingComplete: true,
    }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
