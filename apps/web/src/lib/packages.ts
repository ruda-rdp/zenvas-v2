/**
 * Package Registry - Zenvas Modular Architecture
 *
 * Packages are CURATED BUNDLES (shortcuts) — not a prerequisite layer.
 * They let users install multiple related apps with one click.
 * Individual apps can also be installed/uninstalled independently.
 *
 * Key distinction (D12):
 * - Packages = UI convenience (curated bundle shortcuts)
 * - Dependencies = technical requirements (auto-install when App X is installed)
 *
 * Based on ADR-0005: Modular Architecture
 */

export interface Package {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Package contents
  coreApps: string[];      // Apps that install automatically
  optionalApps: string[]; // Apps user can choose to enable

  // Installation rules
  isCore: boolean;        // true = cannot be uninstalled (core packages)
  requiredRole: "OWNER" | "MANAGER";
  requiredPlan?: "solo" | "growing" | "agency";

  // SaaS tiering (for future)
  tier: "starter" | "growing" | "agency";
  price?: string;
}

export const PACKAGES: Package[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE PACKAGES - Always present, cannot uninstall
  // ═══════════════════════════════════════════════════════════════

  {
    id: "project-os",
    name: "Project OS",
    description: "Project management, stages, tasks, and production tools",
    icon: "🎬",
    coreApps: [
      "projects",
      "stages",
      "tasks",
      "board"
    ],
    optionalApps: [
      "scriptwriter",
      "storyboard",
      "shotlist",
      "timeline-notes",
      "scheduling",
      "locations",
      "dailies",
      "vfx-tracker",
      "deliverables",
      "music-sound"
    ],
    isCore: true,
    requiredRole: "OWNER",
    tier: "starter"
  },

  {
    id: "human-capital-os",
    name: "Human Capital OS",
    description: "Team management, payouts, and human resources",
    icon: "👥",
    coreApps: [
      "team",
      "payouts"
    ],
    optionalApps: [
      "attendance",
      "payroll",
      "recruitment"
    ],
    isCore: true,
    requiredRole: "OWNER",
    tier: "starter"
  },

  // ═══════════════════════════════════════════════════════════════
  // OPTIONAL PACKAGES - Installable on demand
  // ═══════════════════════════════════════════════════════════════

  {
    id: "business-os",
    name: "Business OS",
    description: "Client management, orders, leads, and business tools",
    icon: "🏢",
    coreApps: [
      "clients",
      "leads",
      "orders"
    ],
    optionalApps: [
      "invoices",
      "client-portal",
      "odoo-sync",
      "analytics",
      "branding-kit"
    ],
    isCore: false,
    requiredRole: "OWNER",
    tier: "growing"
  }
];

// Package categories for display
export const PACKAGE_CATEGORIES = {
  core: {
    label: "Core",
    description: "Essential workspace packages",
  },
  business: {
    label: "Business",
    description: "Client and business management",
  },
  integrations: {
    label: "Integrations",
    description: "Connect with external services",
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────

/**
 * Get package by ID
 */
export function getPackage(packageId: string): Package | undefined {
  return PACKAGES.find(p => p.id === packageId);
}

/**
 * Get all apps (core + optional) for a package
 */
export function getPackageApps(packageId: string): string[] {
  const pkg = getPackage(packageId);
  if (!pkg) return [];
  return [...pkg.coreApps, ...pkg.optionalApps];
}

/**
 * Get all core apps for a package
 */
export function getPackageCoreApps(packageId: string): string[] {
  const pkg = getPackage(packageId);
  return pkg?.coreApps ?? [];
}

/**
 * Get all optional apps for a package
 */
export function getPackageOptionalApps(packageId: string): string[] {
  const pkg = getPackage(packageId);
  return pkg?.optionalApps ?? [];
}

/**
 * Get packages that contain a specific app
 */
export function getPackagesContainingApp(appId: string): Package[] {
  return PACKAGES.filter(pkg =>
    pkg.coreApps.includes(appId) || pkg.optionalApps.includes(appId)
  );
}

/**
 * Get packages by tier
 */
export function getPackagesByTier(tier: Package["tier"]): Package[] {
  return PACKAGES.filter(p => p.tier === tier);
}

/**
 * Get installable packages (non-core)
 */
export function getInstallablePackages(): Package[] {
  return PACKAGES.filter(p => !p.isCore);
}

/**
 * Get core packages (cannot uninstall)
 */
export function getCorePackages(): Package[] {
  return PACKAGES.filter(p => p.isCore);
}

/**
 * Calculate apps that will be installed when installing a package
 * (all core apps + specified optional apps)
 */
export function calculatePackageInstallApps(
  packageId: string,
  selectedOptionalApps: string[] = []
): string[] {
  const pkg = getPackage(packageId);
  if (!pkg) return [];

  const apps: string[] = [...pkg.coreApps];

  // Only add optional apps that were selected
  for (const appId of selectedOptionalApps) {
    if (pkg.optionalApps.includes(appId)) {
      apps.push(appId);
    }
  }

  return apps;
}

/**
 * Check if app is a core app for any installed package
 */
export function isCoreAppForPackage(appId: string, installedPackages: string[]): boolean {
  for (const pkgId of installedPackages) {
    const pkg = getPackage(pkgId);
    if (pkg?.coreApps.includes(appId)) {
      return true;
    }
  }
  return false;
}

/**
 * Get app details with package info
 */
export function getAppPackageInfo(appId: string): {
  packages: Package[];
  isCoreApp: boolean;
  isOptionalApp: boolean;
} {
  const packages = getPackagesContainingApp(appId);
  const isCoreApp = packages.some(p => p.coreApps.includes(appId));
  const isOptionalApp = packages.some(p => p.optionalApps.includes(appId));

  return {
    packages,
    isCoreApp,
    isOptionalApp
  };
}

/**
 * Check if a package is installed (helper for app-checks.ts)
 * Note: This is a simple check - actual installation check should be done via database
 */
export function isPackageInstalled(installedPackages: string[], packageId: string): boolean {
  return installedPackages.includes(packageId);
}
