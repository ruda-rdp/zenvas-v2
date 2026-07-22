/**
 * API: /api/organization/apps
 * Install/uninstall apps for organization
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const FREE_APPS = ["clients", "orders", "leads"];
const PRO_APPS = ["analytics", "branding", "automation"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can install/uninstall apps
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { appId, action } = body;

    if (!appId || !action) {
      return NextResponse.json({ error: "appId and action required" }, { status: 400 });
    }

    // Validate app ID
    const validApps = [...FREE_APPS, ...PRO_APPS];
    if (!validApps.includes(appId)) {
      return NextResponse.json({ error: "Invalid app ID" }, { status: 400 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "User has no organization" }, { status: 400 });
    }

    if (action === "install") {
      // Add app to organization using push
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId },
      });

      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      if (org.apps.includes(appId)) {
        return NextResponse.json({ error: "App already installed" }, { status: 400 });
      }

      await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          apps: {
            push: appId,
          },
        },
      });

      return NextResponse.json({ success: true, message: "App installed" });
    }

    if (action === "uninstall") {
      // Remove app from organization - need to filter manually
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId },
      });

      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      await prisma.organization.update({
        where: { id: user.organizationId },
        data: {
          apps: org.apps.filter(id => id !== appId),
        },
      });

      return NextResponse.json({ success: true, message: "App uninstalled" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing apps:", error);
    return NextResponse.json({ error: "Failed to manage apps" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ apps: [] });
    }

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { apps: true },
    });

    return NextResponse.json({ apps: org?.apps || [] });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}
