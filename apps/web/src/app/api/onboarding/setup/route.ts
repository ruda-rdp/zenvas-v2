/**
 * API: /api/onboarding/setup
 * Solo Creator onboarding - ADR-0005 Modular Architecture
 *
 * Creates Organization + first Brand with Solo Creator mode by default
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Constants
const FREE_SUBDOMAIN_SUFFIX = process.env.FREE_SUBDOMAIN_SUFFIX || "zenvas-portal.app";

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generate free subdomain from slug
 */
function generateFreeSubdomain(slug: string): string {
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normalizedSlug}.${FREE_SUBDOMAIN_SUFFIX}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orgName, brandName, hasClientPortal, primaryColor } = body;

    if (!orgName || !brandName) {
      return NextResponse.json(
        { error: "Organization name and brand name are required" },
        { status: 400 }
      );
    }

    // Check if user already has an organization
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: { include: { brands: true } } },
    });

    if (existingUser?.organization) {
      // Check if organization already has brands
      if (existingUser.organization.brands.length > 0) {
        return NextResponse.json(
          { error: "Organization already has a brand", organization: existingUser.organization },
          { status: 400 }
        );
      }

      // User already has org but no brand yet - create brand
      const slug = generateSlug(brandName);

      // Check slug availability
      const slugTaken = await prisma.brand.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json(
          { error: "Brand name already taken. Please choose a different name." },
          { status: 400 }
        );
      }

      // Determine client portal setting
      const enableClientPortal = hasClientPortal === true;
      const freeSubdomain = enableClientPortal ? generateFreeSubdomain(slug) : null;

      // Create brand
      const brand = await prisma.brand.create({
        data: {
          name: brandName.trim(),
          slug,
          primaryColor: primaryColor || "#2563EB",
          hasClientPortal: enableClientPortal,
          freeSubdomain,
          organizationId: existingUser.organization.id,
        },
      });

      // Update organization name
      await prisma.organization.update({
        where: { id: existingUser.organization.id },
        data: { name: orgName.trim() },
      });

      // Auto-create default service
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

      // Get updated organization
      const updatedOrg = await prisma.organization.findUnique({
        where: { id: existingUser.organization.id },
        include: { brands: true },
      });

      return NextResponse.json({
        organization: updatedOrg,
        brand,
        onboardingComplete: true,
        mode: enableClientPortal ? "growing" : "solo",
      }, { status: 201 });
    }

    // Create new organization + brand
    const slug = generateSlug(brandName);

    // Check slug availability
    const slugTaken = await prisma.brand.findUnique({ where: { slug } });
    if (slugTaken) {
      return NextResponse.json(
        { error: "Brand name already taken. Please choose a different name." },
        { status: 400 }
      );
    }

    // Determine mode
    const enableClientPortal = hasClientPortal === true;
    const plan = enableClientPortal ? "growing" : "solo";
    const freeSubdomain = enableClientPortal ? generateFreeSubdomain(slug) : null;

    // Create organization with default apps (Solo mode)
    const org = await prisma.organization.create({
      data: {
        name: orgName.trim(),
        slug: generateSlug(orgName),
        plan,
        // Default apps: core apps + business-os if enabled
        apps: enableClientPortal
          ? ["project-os", "human-capital-os", "business-os"]
          : ["project-os", "human-capital-os"],
        users: {
          connect: { id: session.user.id },
        },
      },
    });

    // Create first brand
    const brand = await prisma.brand.create({
      data: {
        name: brandName.trim(),
        slug,
        primaryColor: primaryColor || "#2563EB",
        hasClientPortal: enableClientPortal,
        freeSubdomain,
        organizationId: org.id,
      },
    });

    // Auto-create default service
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

    return NextResponse.json({
      organization: { ...org, brands: [brand] },
      brand,
      onboardingComplete: true,
      mode: enableClientPortal ? "growing" : "solo",
    }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
