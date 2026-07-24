/**
 * Database Default Values
 *
 * SINGLE SOURCE OF TRUTH for default apps and packages.
 * Schema.prisma @default(...) values are kept in sync with these constants.
 *
 * Usage: Call ensureDefaultApps(orgId) after creating a new Organization.
 *        The function is idempotent — safe to call multiple times.
 */

import { prisma } from "./db";

/**
 * Default apps for a new organization
 * Core apps: Project OS (projects/stages/tasks/board) + Human Capital OS (team/payouts)
 */
export const DEFAULT_APPS = [
  // Project OS core
  "projects",
  "stages",
  "tasks",
  "board",
  // Human Capital OS core
  "team",
  "payouts",
] as const;

/**
 * Default packages for a new organization
 * Each package enables a set of apps above
 */
export const DEFAULT_PACKAGES = [
  "project-os",
  "human-capital-os",
] as const;

/**
 * Ensure organization has default apps AND packages set.
 * Idempotent — only updates if apps is empty or packages is empty.
 * Call this after creating a new Organization.
 */
export async function ensureDefaultApps(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { apps: true, packages: true },
  });

  if (!org) return;

  // Only update if apps OR packages is empty (handles legacy data / partial state)
  if (org.apps.length === 0 || org.packages.length === 0) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        apps: [...DEFAULT_APPS],
        packages: [...DEFAULT_PACKAGES],
      },
    });
  }
}

/**
 * Get default apps (as string array)
 */
export function getDefaultApps(): string[] {
  return [...DEFAULT_APPS];
}

/**
 * Get default packages (as string array)
 */
export function getDefaultPackages(): string[] {
  return [...DEFAULT_PACKAGES];
}
