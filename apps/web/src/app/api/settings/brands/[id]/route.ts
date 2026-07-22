/**
 * API: /api/settings/brands/[id]
 * Brand CRUD for specific brand
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Constants
const FREE_SUBDOMAIN_SUFFIX = process.env.FREE_SUBDOMAIN_SUFFIX || "zenvas-portal.app";

/**
 * Generate a free subdomain from slug
 */
function generateFreeSubdomain(slug: string): string {
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${normalizedSlug}.${FREE_SUBDOMAIN_SUFFIX}`;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const brand = await prisma.brand.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: {
            clients: true,
            orders: true,
            projects: true,
            services: true,
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

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow OWNER and MANAGER to update brands
  if (session.user.role !== "OWNER" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden - Owner or Manager only" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      primaryColor,
      logoUrl,
      hasClientPortal,
      domain,
    } = body;

    // Verify brand belongs to organization
    const existingBrand = await prisma.brand.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      const newSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

      // Check if new slug is taken by another brand
      if (newSlug !== existingBrand.slug) {
        const slugTaken = await prisma.brand.findUnique({
          where: { slug: newSlug },
        });

        if (slugTaken && slugTaken.id !== id) {
          return NextResponse.json(
            { error: "Slug already taken" },
            { status: 400 }
          );
        }

        updateData.slug = newSlug;
      }
    }

    if (primaryColor !== undefined) {
      updateData.primaryColor = primaryColor;
    }

    if (logoUrl !== undefined) {
      updateData.logoUrl = logoUrl;
    }

    // Handle hasClientPortal toggle
    if (hasClientPortal !== undefined) {
      updateData.hasClientPortal = hasClientPortal;

      // Generate or remove free subdomain based on setting
      if (hasClientPortal) {
        const slugForSubdomain = (slug || existingBrand.slug);
        updateData.freeSubdomain = generateFreeSubdomain(slugForSubdomain);
      } else {
        updateData.freeSubdomain = null;
        updateData.domain = null; // Also clear custom domain
      }
    }

    // Handle custom domain
    if (domain !== undefined) {
      if (domain) {
        // Validate domain format
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
          return NextResponse.json(
            { error: "Invalid domain format" },
            { status: 400 }
          );
        }

        // Check if domain is taken by another brand
        const domainTaken = await prisma.brand.findUnique({
          where: { domain },
        });

        if (domainTaken && domainTaken.id !== id) {
          return NextResponse.json(
            { error: "Domain already in use" },
            { status: 400 }
          );
        }
      }

      updateData.domain = domain || null;
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            clients: true,
            orders: true,
            projects: true,
            services: true,
          },
        },
      },
    });

    return NextResponse.json({ brand: updated });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can delete brands
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Verify brand belongs to organization
    const brand = await prisma.brand.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if this is the last brand
    const brandCount = await prisma.brand.count({
      where: { organizationId: session.user.organizationId },
    });

    if (brandCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the last brand in organization" },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
