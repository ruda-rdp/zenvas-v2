/**
 * Feature Flags Utility
 *
 * DEPRECATED: This module is being replaced by app-checks.ts
 *
 * Migration Guide:
 * - Use `app-checks.ts` for all new code
 * - All functions have been moved to app-checks.ts
 *
 * Based on ADR-0005: Modular Architecture
 */

// Re-export everything from app-checks for backward compatibility
export {
  isAppInstalled,
  hasBusinessOS,
  hasClientPortal,
  getOrganizationPlan,
  canAccessBusinessFeatures,
  getVisibleNavItems,
  getInstalledPackages,
  getInstalledApps,
  getOrganizationApps,
  getDashboardSections,
  getOrderStats,
  getLeadStats,
  checkRouteAccess,
  getClientPortalUrl,
  hasProjectOS,
  hasHumanCapitalOS,
  hasClientsApp,
  hasOrdersApp,
  hasLeadsApp,
  hasProjectsApp,
  hasBoardApp,
  hasPackage,
} from "./app-checks";

// Re-export types
export type { OrganizationApps, DashboardSection, NavItem } from "./app-checks";

// ─────────────────────────────────────────────────────────────────
// DEPRECATED CONSTANTS
// ─────────────────────────────────────────────────────────────────

/**
 * @deprecated Use `isAppInstalled(orgId, "project-os")` from app-checks.ts
 */
export const CORE_APPS = ["project-os", "human-capital-os"] as const;

/**
 * @deprecated Use packages from packages.ts instead
 */
export const OPTIONAL_APPS = ["business-os", "lead-management", "odoo-sync"] as const;

/**
 * @deprecated Use ALL_APPS from apps.ts instead
 */
export const ALL_APPS = [...CORE_APPS, ...OPTIONAL_APPS] as const;

/**
 * @deprecated Use `getApp(appId)` from apps.ts instead
 */
export type AppName = (typeof ALL_APPS)[number];

/**
 * Core packages that are always installed
 * @deprecated Use packages from packages.ts
 */
export const CORE_PACKAGES = ["project-os", "human-capital-os"] as const;

/**
 * Packages that need to be installed separately
 * @deprecated Use packages from packages.ts
 */
export const OPTIONAL_PACKAGES = ["business-os"] as const;
