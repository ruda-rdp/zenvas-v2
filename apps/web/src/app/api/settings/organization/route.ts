/**
 * API: /api/settings/organization
 * Organization settings with ADR-0005 Modular Architecture support
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasBusinessOS, getVisibleNavItems } from "@/lib/features";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organization with apps and brands
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

    // Get visible nav items based on installed apps
    const navItems = await getVisibleNavItems(
      user.organization.id,
      null, // No specific brand selected
      session.user.role
    );

    return NextResponse.json({
      organization: user.organization,
      navItems,
    });
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
    const { name, plan, apps } = body;

    // Get user's organization
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    // If user already has org, they must be OWNER to modify
    if (existingUser?.organization) {
      if (session.user.role !== "OWNER") {
        return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
      }

      // Build update data
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (plan !== undefined) updateData.plan = plan;

      // Apps can only be modified by adding/removing optional apps
      // Core apps cannot be removed
      if (apps !== undefined) {
        const coreApps = ["project-os", "human-capital-os"];
        const validApps = [
          ...coreApps,
          ...(apps.includes("business-os") ? ["business-os"] : []),
          ...(apps.includes("lead-management") ? ["lead-management"] : []),
          ...(apps.includes("odoo-sync") ? ["odoo-sync"] : []),
        ];
        updateData.apps = validApps;
      }

      const updated = await prisma.organization.update({
        where: { id: existingUser.organization.id },
        data: updateData,
        include: { brands: true },
      });

      return NextResponse.json({ organization: updated });
    }

    // No org yet - allow creation for new users
    const org = await prisma.organization.create({
      data: {
        name: name || session.user.name || "My Organization",
        slug: generateSlug(name || session.user.name || "my-org"),
        // Default apps: core apps only (Solo Creator mode)
        apps: ["project-os", "human-capital-os"],
        plan: "solo",
        users: {
          connect: { id: session.user.id },
        },
      },
      include: { brands: true },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating organization:", error);
    return NextResponse.json({ error: "Failed to create/update organization" }, { status: 500 });
  }
}

/**
 * PATCH - Partial update organization
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, plan, apps } = body;

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Only OWNER can modify organization
    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (plan !== undefined) updateData.plan = plan;

    // Apps modification
    if (apps !== undefined) {
      const coreApps = ["project-os", "human-capital-os"];
      const newApps = [...coreApps];

      // Add optional apps
      if (apps.includes("business-os") && !newApps.includes("business-os")) {
        newApps.push("business-os");
      }
      if (apps.includes("lead-management") && !newApps.includes("lead-management")) {
        newApps.push("lead-management");
      }
      if (apps.includes("odoo-sync") && !newApps.includes("odoo-sync")) {
        newApps.push("odoo-sync");
      }

      // Remove optional apps
      if (!apps.includes("business-os")) {
        const idx = newApps.indexOf("business-os");
        if (idx > -1) newApps.splice(idx, 1);
      }
      if (!apps.includes("lead-management")) {
        const idx = newApps.indexOf("lead-management");
        if (idx > -1) newApps.splice(idx, 1);
      }
      if (!apps.includes("odoo-sync")) {
        const idx = newApps.indexOf("odoo-sync");
        if (idx > -1) newApps.splice(idx, 1);
      }

      updateData.apps = newApps;
    }

    const updated = await prisma.organization.update({
      where: { id: user.organization.id },
      data: updateData,
      include: { brands: true },
    });

    return NextResponse.json({ organization: updated });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

/**
 * Generate URL-safe slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}
