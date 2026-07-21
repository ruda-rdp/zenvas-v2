/**
 * API: /api/settings/brands
 * Brand CRUD with ADR-0005 Modular Architecture support
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Constants for subdomain
const FREE_SUBDOMAIN_SUFFIX = process.env.FREE_SUBDOMAIN_SUFFIX || "zenvas-portal.app";

/**
 * Generate a free subdomain from slug
 * e.g., "jacob-film" → "jacobfilm.zenvas-portal.app"
 */
function generateFreeSubdomain(slug: string): string {
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normalizedSlug}.${FREE_SUBDOMAIN_SUFFIX}`;
}

/**
 * Generate slug from name
 * e.g., "Jacob Film" → "jacob-film"
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brands = await prisma.brand.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        _count: {
          select: {
            clients: true,
            orders: true,
            projects: true,
          },
        },
      },
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

  // Allow OWNER and MANAGER to create brands
  if (session.user.role !== "OWNER" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden - Owner or Manager only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug: providedSlug, primaryColor, hasClientPortal } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    // Generate or use provided slug
    const slug = providedSlug?.trim() || generateSlug(name);

    // Sanitize slug
    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check if slug is already taken
    const existingSlug = await prisma.brand.findUnique({
      where: { slug: sanitizedSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already taken. Please choose a different name." },
        { status: 400 }
      );
    }

    // Determine hasClientPortal (default: false for Solo Creator mode)
    const enableClientPortal = hasClientPortal === true;

    // Generate free subdomain if client portal is enabled
    const freeSubdomain = enableClientPortal ? generateFreeSubdomain(sanitizedSlug) : null;

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: sanitizedSlug,
        primaryColor: primaryColor || "#2563EB",
        hasClientPortal: enableClientPortal,
        freeSubdomain,
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: {
            clients: true,
            orders: true,
            projects: true,
          },
        },
      },
    });

    // Auto-create default service (always, regardless of client portal setting)
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
