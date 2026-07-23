/**
 * App Checks - Centralized Feature Flag Utilities
 *
 * Provides utilities for checking app availability based on:
 * - Organization level (apps installed)
 * - Package level (packages installed)
 * - User level (role)
 *
 * Based on ADR-0005: Modular Architecture
 */

import { prisma } from "@/lib/db";
import { APPS, getApp, isAppEnabled, getAppsByCategory } from "./apps";
import { PACKAGES, getPackage, isPackageInstalled } from "./packages";

// ─────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────

export interface OrganizationApps {
  packages: string[];
  apps: string[];
}

export interface DashboardSection {
  type: "stats" | "today-focus" | "upcoming" | "projects" | "team" | "business" | "activity";
  apps?: string[];
}

// ─────────────────────────────────────────────────────────────────
// CORE CHECKS
// ─────────────────────────────────────────────────────────────────

/**
 * Get all installed packages for an organization
 */
export async function getInstalledPackages(orgId: string): Promise<string[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { packages: true }
  });
  return org?.packages ?? [];
}

/**
 * Get all installed apps for an organization
 */
export async function getInstalledApps(orgId: string): Promise<string[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { apps: true }
  });
  return org?.apps ?? [];
}

/**
 * Get both packages and apps for an organization
 */
export async function getOrganizationApps(orgId: string): Promise<OrganizationApps> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { packages: true, apps: true }
  });

  return {
    packages: org?.packages ?? [],
    apps: org?.apps ?? []
  };
}

/**
 * Check if specific app is installed
 */
export async function isAppInstalled(
  orgId: string,
  appId: string
): Promise<boolean> {
  const apps = await getInstalledApps(orgId);
  return apps.includes(appId);
}

/**
 * Check if package is installed
 */
export async function hasPackage(
  orgId: string,
  packageId: string
): Promise<boolean> {
  const packages = await getInstalledPackages(orgId);
  return packages.includes(packageId);
}

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE CHECKS - Package Level
// ─────────────────────────────────────────────────────────────────

/**
 * Check if Project OS is installed
 */
export async function hasProjectOS(orgId: string): Promise<boolean> {
  return hasPackage(orgId, "project-os");
}

/**
 * Check if Human Capital OS is installed
 */
export async function hasHumanCapitalOS(orgId: string): Promise<boolean> {
  return hasPackage(orgId, "human-capital-os");
}

/**
 * Check if Business OS is installed
 */
export async function hasBusinessOS(orgId: string): Promise<boolean> {
  return hasPackage(orgId, "business-os");
}

/**
 * Check if a brand has client portal enabled
 */
export async function hasClientPortal(brandId: string): Promise<boolean> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { hasClientPortal: true }
  });
  return brand?.hasClientPortal ?? false;
}

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE CHECKS - App Level (Business OS)
// ─────────────────────────────────────────────────────────────────

/**
 * Check if Clients app is installed
 */
export async function hasClientsApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "clients");
}

/**
 * Check if Orders app is installed
 */
export async function hasOrdersApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "orders");
}

/**
 * Check if Leads app is installed
 */
export async function hasLeadsApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "leads");
}

/**
 * Check if Invoices app is installed
 */
export async function hasInvoicesApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "invoices");
}

// ─────────────────────────────────────────────────────────────────
// CONVENIENCE CHECKS - App Level (Project OS)
// ─────────────────────────────────────────────────────────────────

/**
 * Check if Projects app is installed
 */
export async function hasProjectsApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "projects");
}

/**
 * Check if Board app is installed
 */
export async function hasBoardApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "board");
}

/**
 * Check if Scriptwriter app is installed
 */
export async function hasScriptwriterApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "scriptwriter");
}

/**
 * Check if Storyboard app is installed
 */
export async function hasStoryboardApp(orgId: string): Promise<boolean> {
  return isAppInstalled(orgId, "storyboard");
}

// ─────────────────────────────────────────────────────────────────
// ROLE-BASED ACCESS
// ─────────────────────────────────────────────────────────────────

/**
 * Check if user can access business features
 * Requires: business-os package AND (OWNER or MANAGER role)
 */
export async function canAccessBusinessFeatures(
  orgId: string,
  userRole: string
): Promise<boolean> {
  const hasBusiness = await hasBusinessOS(orgId);
  const hasPermission = userRole === "OWNER" || userRole === "MANAGER";
  return hasBusiness && hasPermission;
}

/**
 * Check if user can install/uninstall apps
 */
export async function canManageApps(userRole: string): Promise<boolean> {
  return userRole === "OWNER";
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Get dashboard sections to display based on installed apps
 * This controls what cards/widgets show on the dashboard
 */
export async function getDashboardSections(orgId: string): Promise<DashboardSection[]> {
  const [packages, apps] = await Promise.all([
    getInstalledPackages(orgId),
    getInstalledApps(orgId)
  ]);

  const sections: DashboardSection[] = [];

  // Always show these core sections
  sections.push({ type: "stats", apps: ["projects", "tasks"] });
  sections.push({ type: "today-focus" });
  sections.push({ type: "team" });

  // Conditional sections based on packages
  if (packages.includes("project-os")) {
    sections.push({ type: "projects" });
  }

  // Business OS sections - only show if package is installed
  if (packages.includes("business-os")) {
    sections.push({ type: "stats", apps: ["orders", "leads"] });
    sections.push({ type: "business" });
  }

  sections.push({ type: "activity" });

  return sections;
}

/**
 * Check if dashboard should show business metrics
 * Returns true only if Business OS package is installed
 */
export async function shouldShowBusinessMetrics(orgId: string): Promise<boolean> {
  return hasBusinessOS(orgId);
}

/**
 * Get visible navigation items based on installed apps and user role
 */
export async function getVisibleNavItems(
  orgId: string,
  userRole: string
): Promise<{
  items: NavItem[];
  businessItems: NavItem[];
}> {
  const [packages, apps] = await Promise.all([
    getInstalledPackages(orgId),
    getInstalledApps(orgId)
  ]);

  const items: NavItem[] = [];
  const businessItems: NavItem[] = [];

  // Core items - always visible
  items.push({ id: "dashboard", name: "Dashboard", href: "/dashboard", icon: "🎯" });
  items.push({ id: "projects", name: "Projects", href: "/projects", icon: "📁" });

  // Board - only for editors
  if (apps.includes("board")) {
    items.push({ id: "board", name: "Board", href: "/board", icon: "🎯" });
  }

  // Team - always visible
  items.push({ id: "team", name: "Team", href: "/team", icon: "👥" });

  // Payouts - owner/manager only
  if (apps.includes("payouts") && ["OWNER", "MANAGER"].includes(userRole)) {
    items.push({ id: "payouts", name: "Payouts", href: "/payouts", icon: "💰" });
  }

  // Business OS items - only if package installed
  if (packages.includes("business-os") && ["OWNER", "MANAGER"].includes(userRole)) {
    if (apps.includes("clients")) {
      businessItems.push({ id: "clients", name: "Clients", href: "/clients", icon: "🏢" });
    }
    if (apps.includes("orders")) {
      businessItems.push({ id: "orders", name: "Orders", href: "/orders", icon: "📋" });
    }
    if (apps.includes("leads")) {
      businessItems.push({ id: "leads", name: "Leads", href: "/leads", icon: "📝" });
    }
    if (apps.includes("invoices")) {
      businessItems.push({ id: "invoices", name: "Invoices", href: "/invoices", icon: "📄" });
    }
  }

  // Settings - always visible
  items.push({ id: "settings", name: "Settings", href: "/settings", icon: "⚙️" });

  // App Store - owner only
  if (userRole === "OWNER") {
    items.push({ id: "apps", name: "App Store", href: "/apps", icon: "🛒" });
  }

  return { items, businessItems };
}

export interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: string;
}

// ─────────────────────────────────────────────────────────────────
// QUERY HELPERS
// ─────────────────────────────────────────────────────────────────

/**
 * Get order stats - only if Business OS installed
 */
export async function getOrderStats(orgId: string): Promise<{
  total: number;
  confirmed: number;
  inProgress: number;
  completed: number;
} | null> {
  const hasBusiness = await hasBusinessOS(orgId);
  if (!hasBusiness) return null;

  const brands = await prisma.brand.findMany({
    where: { organizationId: orgId },
    select: { id: true }
  });
  const brandIds = brands.map(b => b.id);

  const orders = await prisma.order.groupBy({
    by: ["status"],
    where: { brandId: { in: brandIds } },
    _count: true
  });

  const stats = { total: 0, confirmed: 0, inProgress: 0, completed: 0 };
  for (const o of orders) {
    stats.total += o._count;
    if (o.status === "CONFIRMED") stats.confirmed = o._count;
    if (o.status === "IN_PROGRESS") stats.inProgress = o._count;
    if (o.status === "COMPLETED") stats.completed = o._count;
  }

  return stats;
}

/**
 * Get lead stats - only if Business OS installed
 */
export async function getLeadStats(orgId: string): Promise<{
  total: number;
  new: number;
  qualified: number;
  converted: number;
} | null> {
  const hasBusiness = await hasBusinessOS(orgId);
  if (!hasBusiness) return null;

  const brands = await prisma.brand.findMany({
    where: { organizationId: orgId },
    select: { id: true }
  });
  const brandIds = brands.map(b => b.id);

  const leads = await prisma.lead.groupBy({
    by: ["status"],
    where: { brandId: { in: brandIds } },
    _count: true
  });

  const stats = { total: 0, new: 0, qualified: 0, converted: 0 };
  for (const l of leads) {
    stats.total += l._count;
    if (l.status === "NEW") stats.new = l._count;
    if (l.status === "QUALIFIED") stats.qualified = l._count;
    if (l.status === "CONVERTED" || l.status === "WON") stats.converted = l._count;
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────────
// ROUTE PROTECTION
// ─────────────────────────────────────────────────────────────────

/**
 * Check if user can access a specific route
 * Returns redirect path if access is denied
 */
export async function checkRouteAccess(
  orgId: string,
  route: string,
  userRole: string
): Promise<{ allowed: boolean; redirectTo?: string }> {
  // Get app that handles this route
  const app = APPS.find(a => route.startsWith(a.route));

  if (!app) {
    return { allowed: true }; // Unknown route, allow
  }

  // Always allow core apps
  if (app.alwaysEnabled) {
    return { allowed: true };
  }

  // Check role
  if (app.requiredRole !== "ALL") {
    if (app.requiredRole === "OWNER" && userRole !== "OWNER") {
      return { allowed: false, redirectTo: "/dashboard" };
    }
    if (app.requiredRole === "MANAGER" && !["OWNER", "MANAGER"].includes(userRole)) {
      return { allowed: false, redirectTo: "/dashboard" };
    }
  }

  // Check if app is installed
  const installed = await isAppInstalled(orgId, app.id);
  if (!installed) {
    return { allowed: false, redirectTo: "/apps" };
  }

  return { allowed: true };
}

/**
 * Get organization plan
 */
export async function getOrganizationPlan(orgId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true }
  });
  return org?.plan || "solo";
}

// ─────────────────────────────────────────────────────────────────
// CLIENT PORTAL
// ─────────────────────────────────────────────────────────────────

/**
 * Get the client portal URL for a brand
 * Returns custom domain if available, otherwise free subdomain
 */
export async function getClientPortalUrl(brandId: string): Promise<string | null> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: {
      hasClientPortal: true,
      domain: true,
      freeSubdomain: true
    }
  });

  if (!brand || !brand.hasClientPortal) {
    return null;
  }

  return brand.domain || brand.freeSubdomain || null;
}
