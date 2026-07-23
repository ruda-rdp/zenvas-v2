import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getApp } from "@/lib/apps";

/**
 * GET /api/apps/check
 *
 * Check if the current user has access to a specific app.
 * Query params:
 *   - appId: The app ID to check
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ hasAccess: false }, { status: 401 });
  }

  const appId = request.nextUrl.searchParams.get("appId");

  if (!appId) {
    return NextResponse.json({ hasAccess: false, error: "appId required" }, { status: 400 });
  }

  const app = getApp(appId);

  if (!app) {
    return NextResponse.json({ hasAccess: false, error: "App not found" }, { status: 404 });
  }

  // Always allow access to alwaysEnabled apps
  if (app.alwaysEnabled) {
    return NextResponse.json({ hasAccess: true });
  }

  // Check role permission
  if (app.requiredRole !== "ALL") {
    if (app.requiredRole === "OWNER" && session.user.role !== "OWNER") {
      return NextResponse.json({ hasAccess: false, error: "Owner role required" });
    }
    if (app.requiredRole === "MANAGER" && !["OWNER", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ hasAccess: false, error: "Manager role required" });
    }
  }

  // Check if app is installed
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { apps: true, packages: true },
  });

  if (!org) {
    return NextResponse.json({ hasAccess: false, error: "Organization not found" }, { status: 404 });
  }

  // Check if app is installed
  const isInstalled = org.apps.includes(appId);

  if (!isInstalled) {
    return NextResponse.json({ hasAccess: false, error: "App not installed" });
  }

  return NextResponse.json({ hasAccess: true });
}
