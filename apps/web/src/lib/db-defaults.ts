/**
 * Database Default Values
 *
 * Provides default values for database records.
 * Use these when creating new records to ensure proper defaults.
 */

import { prisma } from "./db";

/**
 * Default apps for a new organization
 * These are the core apps that are always installed
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
 */
export const DEFAULT_PACKAGES = [
  "project-os",
  "human-capital-os",
] as const;

/**
 * Ensure organization has default apps set
 * Call this after creating a new organization
 */
export async function ensureDefaultApps(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { apps: true, packages: true },
  });

  if (!org) return;

  // Only update if apps is empty
  if (org.apps.length === 0) {
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
