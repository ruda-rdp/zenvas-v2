/**
 * API: /api/settings/apps
 * Manage organization apps (App Store functionality)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can manage apps
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const organization = user.organization;

    return NextResponse.json({
      apps: organization.apps,
      plan: organization.plan,
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can manage apps
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { apps, plan } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Only update apps if provided
    if (Array.isArray(apps)) {
      // Validate apps (only allow known app IDs)
      const knownApps = [
        "project-os",
        "human-capital-os",
        "business-os",
        "lead-management",
        "odoo-sync",
      ];
      const validApps = apps.filter((app: string) => knownApps.includes(app));
      updateData.apps = validApps;
    }

    // Only update plan if provided
    if (plan && ["solo", "growing", "agency"].includes(plan)) {
      updateData.plan = plan;
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: user.organization.id },
      data: updateData,
    });

    return NextResponse.json({
      apps: updatedOrganization.apps,
      plan: updatedOrganization.plan,
    });
  } catch (error) {
    console.error("Error updating apps:", error);
    return NextResponse.json({ error: "Failed to update apps" }, { status: 500 });
  }
}
