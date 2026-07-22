/**
 * Feature Flags Utility
 * Based on ADR-0005: Modular Architecture
 *
 * Provides utilities for checking feature availability based on:
 * - Organization level (apps installed, plan)
 * - Brand level (hasClientPortal)
 * - User level (role)
 */

import { prisma } from "@/lib/db";

// Core apps that cannot be uninstalled
export const CORE_APPS = ["project-os", "human-capital-os"] as const;

// Optional apps available in App Store
export const OPTIONAL_APPS = ["business-os", "lead-management", "odoo-sync"] as const;

// All available apps
export const ALL_APPS = [...CORE_APPS, ...OPTIONAL_APPS] as const;

export type AppName = (typeof ALL_APPS)[number];

/**
 * Check if an organization has a specific app installed
 */
export async function hasAppInstalled(
  organizationId: string,
  app: AppName
): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { apps: true },
  });

  if (!org) return false;

  // Core apps are always available
  if (CORE_APPS.includes(app as typeof CORE_APPS[number])) {
    return true;
  }

  return org.apps.includes(app);
}

/**
 * Check if business-os is available for an organization
 */
export async function hasBusinessOS(organizationId: string): Promise<boolean> {
  return hasAppInstalled(organizationId, "business-os");
}

/**
 * Check if a brand has client portal enabled
 */
export async function hasClientPortal(brandId: string): Promise<boolean> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { hasClientPortal: true },
  });

  return brand?.hasClientPortal ?? false;
}

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
      freeSubdomain: true,
    },
  });

  if (!brand || !brand.hasClientPortal) {
    return null;
  }

  // Prefer custom domain over free subdomain
  return brand.domain || brand.freeSubdomain || null;
}

/**
 * Get organization plan
 */
export async function getOrganizationPlan(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  return org?.plan || "solo";
}

/**
 * Check if user can access business features
 * Requires: business-os app installed AND (OWNER or MANAGER role)
 */
export async function canAccessBusinessFeatures(
  organizationId: string,
  userRole: string
): Promise<boolean> {
  const hasApp = await hasBusinessOS(organizationId);
  const hasPermission = userRole === "OWNER" || userRole === "MANAGER";

  return hasApp && hasPermission;
}

/**
 * Get visible navigation items based on installed apps
 * Used for sidebar/menu rendering
 */
export async function getVisibleNavItems(
  organizationId: string,
  brandId: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userRole: string // Reserved for future role-based filtering
): Promise<{
  items: string[];
  businessItems: string[];
}> {
  const hasBusiness = await hasBusinessOS(organizationId);
  const hasPortal = brandId ? await hasClientPortal(brandId) : false;

  // Core items always visible
  const coreItems = [
    "projects",
    "tasks",
    "board",
    "settings",
  ];

  // Team always visible for all users
  const teamItems = ["team"];

  // Business items only if business-os installed
  const businessItems = hasBusiness ? [
    "clients",
    "orders",
    "leads",
    "invoices",
  ] : [];

  // Client Portal visible if brand has it enabled
  const portalItems = hasPortal ? ["client-portal"] : [];

  return {
    items: [...coreItems, ...teamItems, ...portalItems],
    businessItems,
  };
}

/**
 * Middleware helper: Check if request should go to Client Portal
 * Returns brandId if yes, null if internal request
 */
export async function resolveBrandFromHost(host: string): Promise<string | null> {
  const hostname = host.split(":")[0]; // Remove port

  // Internal domains (never Client Portal)
  const internalDomains = [
    "app.zenvas.com",
    "localhost",
    "127.0.0.1",
    process.env.INTERNAL_DOMAIN,
    process.env.INTERNAL_DOMAIN_ALT,
  ].filter(Boolean);

  if (internalDomains.includes(hostname)) {
    return null;
  }

  // Check for free subdomain pattern
  const freeSubdomainSuffix = process.env.FREE_SUBDOMAIN_SUFFIX || "zenvas-portal.app";
  if (hostname.endsWith(`.${freeSubdomainSuffix}`)) {
    const brand = await prisma.brand.findUnique({
      where: { freeSubdomain: hostname },
      select: { id: true, hasClientPortal: true },
    });

    if (brand?.hasClientPortal) {
      return brand.id;
    }
  }

  // Check for custom domain
  const brand = await prisma.brand.findUnique({
    where: { domain: hostname },
    select: { id: true, hasClientPortal: true },
  });

  if (brand?.hasClientPortal) {
    return brand.id;
  }

  return null;
}
