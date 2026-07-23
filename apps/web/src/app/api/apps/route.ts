import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PACKAGES, getPackage, calculatePackageInstallApps } from "@/lib/packages";
import { canUninstall, resolveDependencies } from "@/lib/app-resolver";
import { getApp, getAppsByPackage } from "@/lib/apps";

/**
 * GET /api/apps
 * Get installed packages and apps for current organization
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { packages: true, apps: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Build app details with implementation status
    const getAppDetails = (pkgId: string) => {
      const pkgApps = getAppsByPackage(pkgId);
      return pkgApps.map(app => ({
        id: app.id,
        name: app.name,
        description: app.description,
        longDescription: app.longDescription,
        features: app.features,
        icon: app.icon,
        isImplemented: app.isImplemented,
        isCore: app.isCore,
        dependencies: app.dependencies,
        isInstalled: org.apps?.includes(app.id) || false,
      }));
    };

    return NextResponse.json({
      packages: org.packages || [],
      apps: org.apps || [],
      availablePackages: PACKAGES.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        icon: pkg.icon,
        coreApps: pkg.coreApps,
        optionalApps: pkg.optionalApps,
        isCore: pkg.isCore,
        tier: pkg.tier,
        isInstalled: org.packages?.includes(pkg.id) || false,
        apps: getAppDetails(pkg.id),
      })),
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}

/**
 * POST /api/apps
 * Install a package with optional apps
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can install packages" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { packageId, optionalApps = [] } = body;

    if (!packageId) {
      return NextResponse.json({ error: "packageId is required" }, { status: 400 });
    }

    // Get the package
    const pkg = getPackage(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Get current organization state
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { packages: true, apps: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if already installed
    if (org.packages?.includes(packageId)) {
      return NextResponse.json({ error: "Package already installed" }, { status: 400 });
    }

    // Calculate apps to install
    const appsToInstall = calculatePackageInstallApps(packageId, optionalApps);

    // Resolve dependencies for each app
    const allAppsToInstall = new Set<string>(appsToInstall);
    for (const appId of appsToInstall) {
      const deps = resolveDependencies(appId);
      deps.toInstall.forEach(dep => allAppsToInstall.add(dep));
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        packages: {
          push: packageId,
        },
        apps: {
          push: Array.from(allAppsToInstall),
        },
      },
      select: { packages: true, apps: true },
    });

    return NextResponse.json({
      success: true,
      packages: updatedOrg.packages,
      apps: updatedOrg.apps,
      message: `${pkg.name} installed successfully`,
    });
  } catch (error) {
    console.error("Error installing package:", error);
    return NextResponse.json({ error: "Failed to install package" }, { status: 500 });
  }
}

/**
 * DELETE /api/apps
 * Uninstall a package
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can uninstall packages" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json({ error: "packageId is required" }, { status: 400 });
    }

    // Get the package
    const pkg = getPackage(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Cannot uninstall core packages
    if (pkg.isCore) {
      return NextResponse.json({ error: "Cannot uninstall core packages" }, { status: 400 });
    }

    // Get current organization state
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { packages: true, apps: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if package is installed
    if (!org.packages?.includes(packageId)) {
      return NextResponse.json({ error: "Package not installed" }, { status: 400 });
    }

    // Get all apps that belong to this package
    const packageApps = [...pkg.coreApps, ...pkg.optionalApps];

    // Check if any apps are required by other packages
    // Note: We only remove from the apps[] array, NOT from the database.
    // This means data is PRESERVED and can be recovered when reinstalling.
    const appsToRemove: string[] = [];
    const appsToKeep: string[] = [];

    for (const appId of packageApps) {
      if (org.apps?.includes(appId)) {
        const canRemove = canUninstall(appId, org.apps || []);
        if (canRemove.can) {
          appsToRemove.push(appId);
        } else {
          appsToKeep.push(appId);
        }
      }
    }

    // Remove package and apps
    const updatedOrg = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        packages: org.packages.filter(p => p !== packageId),
        apps: org.apps?.filter(a => !appsToRemove.includes(a)) || [],
      },
      select: { packages: true, apps: true },
    });

    return NextResponse.json({
      success: true,
      packages: updatedOrg.packages,
      apps: updatedOrg.apps,
      message: `${pkg.name} uninstalled successfully`,
      removedApps: appsToRemove,
      keptApps: appsToKeep,
    });
  } catch (error) {
    console.error("Error uninstalling package:", error);
    return NextResponse.json({ error: "Failed to uninstall package" }, { status: 500 });
  }
}
