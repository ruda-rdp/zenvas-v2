/**
 * App Dependency Resolver - Zenvas Modular Architecture
 *
 * Handles dependency resolution for installing/uninstalling apps.
 * Uses topological sort to determine correct install order.
 *
 * Based on ADR-0005: Modular Architecture
 */

import { APPS, getApp, type App } from "./apps";
import {
  PACKAGES,
  getPackage,
  getPackageApps,
  calculatePackageInstallApps,
  type Package
} from "./packages";

export interface ResolveResult {
  success: boolean;
  toInstall: string[];
  order: string[];
  toUninstall: string[];
  conflicts: ConflictInfo[];
  errors: string[];
}

export interface ConflictInfo {
  appId: string;
  reason: string;
}

export interface InstallPlan {
  packageId: string;
  appsToInstall: string[];
  appsToUninstall: string[];
  order: string[];
}

/**
 * Resolve all dependencies for installing an app.
 * Returns apps that need to be installed in correct order.
 *
 * Uses topological sort to handle dependency chains.
 */
export function resolveDependencies(appId: string): ResolveResult {
  const toInstall = new Set<string>();
  const order: string[] = [];
  const errors: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(id: string): boolean {
    // Cycle detection
    if (visiting.has(id)) {
      errors.push(`Circular dependency detected: ${id}`);
      return false;
    }

    if (visited.has(id)) {
      return true; // Already processed
    }

    const app = getApp(id);
    if (!app) {
      errors.push(`App not found: ${id}`);
      return false;
    }

    visiting.add(id);

    // Visit all dependencies first (depth-first)
    for (const depId of app.dependencies) {
      const depApp = getApp(depId);
      if (!depApp) {
        errors.push(`Dependency not found: ${depId} (required by ${app.name})`);
        continue;
      }

      if (!visit(depId)) {
        // Error already logged in recursive call
        continue;
      }
    }

    visiting.delete(id);
    visited.add(id);

    // Add to install list
    toInstall.add(id);
    order.push(id);

    return true;
  }

  // Start with the requested app
  const startApp = getApp(appId);
  if (!startApp) {
    return {
      success: false,
      toInstall: [],
      order: [],
      toUninstall: [],
      conflicts: [],
      errors: [`App not found: ${appId}`]
    };
  }

  visit(appId);

  return {
    success: errors.length === 0,
    toInstall: Array.from(toInstall),
    order: order.reverse(), // Reverse to get correct install order
    toUninstall: [],
    conflicts: [],
    errors
  };
}

/**
 * Check if an app can be uninstalled.
 * Returns false if other installed apps depend on it.
 */
export function canUninstall(
  appId: string,
  installedApps: string[]
): { can: boolean; reason?: string; blockedBy?: string[] } {
  const app = getApp(appId);

  if (!app) {
    return { can: false, reason: "App not found" };
  }

  // Core apps cannot be uninstalled
  if (app.isCore) {
    return {
      can: false,
      reason: `${app.name} is a core app and cannot be uninstalled`
    };
  }

  // Check if any installed app depends on this one
  const dependents = APPS.filter(a =>
    a.dependencies.includes(appId) && installedApps.includes(a.id)
  );

  if (dependents.length > 0) {
    return {
      can: false,
      reason: `${app.name} is required by: ${dependents.map(d => d.name).join(", ")}`,
      blockedBy: dependents.map(d => d.id)
    };
  }

  return { can: true };
}

/**
 * Uninstall app and cascade to apps that depend only on it.
 * Returns apps that should be uninstalled together.
 */
export function resolveUninstall(
  appId: string,
  installedApps: string[]
): { toUninstall: string[]; order: string[] } {
  const toUninstall = new Set<string>();
  const order: string[] = [];

  function shouldUninstall(id: string, checked = new Set<string>()): boolean {
    if (checked.has(id)) return toUninstall.has(id);
    checked.add(id);

    const app = getApp(id);
    if (!app) return false;

    // If this app is installed and has dependencies, check if they would become orphans
    for (const depId of app.dependencies) {
      // Check if depId is still needed by other installed apps
      const stillNeeded = APPS.some(a =>
        a.id !== id &&
        installedApps.includes(a.id) &&
        a.dependencies.includes(depId)
      );

      if (!stillNeeded && depId !== id) {
        // depId is no longer needed, mark for uninstall
        toUninstall.add(depId);
        shouldUninstall(depId, checked); // Recursively check
      }
    }

    toUninstall.add(id);
    return true;
  }

  shouldUninstall(appId);

  // Build reverse order (uninstall in reverse of install order)
  const allToUninstall = Array.from(toUninstall);
  for (let i = allToUninstall.length - 1; i >= 0; i--) {
    order.push(allToUninstall[i]);
  }

  return {
    toUninstall: Array.from(toUninstall),
    order
  };
}

/**
 * Calculate the install plan for a package.
 * Returns all apps to install (core + selected optional).
 */
export function planPackageInstall(
  packageId: string,
  selectedOptionalApps: string[] = [],
  currentApps: string[] = []
): ResolveResult {
  const pkg = getPackage(packageId);

  if (!pkg) {
    return {
      success: false,
      toInstall: [],
      order: [],
      toUninstall: [],
      conflicts: [],
      errors: [`Package not found: ${packageId}`]
    };
  }

  const toInstall = new Set<string>();
  const errors: string[] = [];
  const conflicts: ConflictInfo[] = [];

  // Add all core apps
  for (const appId of pkg.coreApps) {
    toInstall.add(appId);
  }

  // Add selected optional apps
  for (const appId of selectedOptionalApps) {
    if (pkg.optionalApps.includes(appId)) {
      toInstall.add(appId);
    } else {
      errors.push(`${appId} is not an optional app for ${pkg.name}`);
    }
  }

  // Check dependencies for each app
  const order: string[] = [];
  for (const appId of Array.from(toInstall)) {
    const deps = resolveDependencies(appId);
    for (const depId of deps.order) {
      toInstall.add(depId);
    }
    if (deps.errors.length > 0) {
      errors.push(...deps.errors);
    }
  }

  // Build final order
  const visited = new Set<string>();
  for (const appId of toInstall) {
    buildOrder(appId, order, visited);
  }

  return {
    success: errors.length === 0,
    toInstall: order.filter(id => !currentApps.includes(id)),
    order,
    toUninstall: [],
    conflicts,
    errors
  };
}

/**
 * Calculate uninstall plan for a package.
 * Returns apps to uninstall (excludes core apps).
 */
export function planPackageUninstall(
  packageId: string,
  currentApps: string[]
): ResolveResult {
  const pkg = getPackage(packageId);

  if (!pkg) {
    return {
      success: false,
      toInstall: [],
      order: [],
      toUninstall: [],
      conflicts: [],
      errors: [`Package not found: ${packageId}`]
    };
  }

  // Cannot uninstall core packages
  if (pkg.isCore) {
    return {
      success: false,
      toInstall: [],
      order: [],
      toUninstall: [],
      conflicts: [],
      errors: [`${pkg.name} is a core package and cannot be uninstalled`]
    };
  }

  const toUninstall: string[] = [];
  const errors: string[] = [];

  // Find all apps that belong to this package
  for (const appId of [...pkg.coreApps, ...pkg.optionalApps]) {
    if (currentApps.includes(appId)) {
      const canRemove = checkAppCanBeRemoved(appId, currentApps);

      if (canRemove.can) {
        toUninstall.push(appId);
      } else {
        errors.push(`Cannot remove ${appId}: ${canRemove.reason}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    toInstall: [],
    order: [],
    toUninstall,
    conflicts: [],
    errors
  };
}

/**
 * Check if app can be removed (utility for uninstall flow)
 */
function checkAppCanBeRemoved(
  appId: string,
  installedApps: string[]
): { can: boolean; reason?: string } {
  const app = getApp(appId);

  if (!app) {
    return { can: false, reason: "App not found" };
  }

  if (app.isCore) {
    return { can: false, reason: "Core apps cannot be removed" };
  }

  const dependents = APPS.filter(a =>
    a.dependencies.includes(appId) &&
    installedApps.includes(a.id) &&
    a.id !== appId
  );

  if (dependents.length > 0) {
    return {
      can: false,
      reason: `Required by: ${dependents.map(d => d.name).join(", ")}`
    };
  }

  return { can: true };
}

/**
 * Build topological order for installation
 */
function buildOrder(
  appId: string,
  order: string[],
  visited: Set<string>
): void {
  if (visited.has(appId)) return;
  visited.add(appId);

  const app = getApp(appId);
  if (!app) return;

  // Visit dependencies first
  for (const depId of app.dependencies) {
    buildOrder(depId, order, visited);
  }

  // Add to order if not already there
  if (!order.includes(appId)) {
    order.push(appId);
  }
}

/**
 * Get apps that would be installed with a package (preview)
 */
export function previewPackageInstall(
  packageId: string,
  selectedOptionalApps: string[] = []
): {
  coreApps: string[];
  optionalApps: string[];
  totalApps: string[];
  hasConflicts: boolean;
  conflicts: ConflictInfo[];
} {
  const pkg = getPackage(packageId);

  if (!pkg) {
    return {
      coreApps: [],
      optionalApps: [],
      totalApps: [],
      hasConflicts: true,
      conflicts: [{ appId: packageId, reason: "Package not found" }]
    };
  }

  const result = planPackageInstall(packageId, selectedOptionalApps, []);
  const conflicts: ConflictInfo[] = [];

  // Check conflicts (apps that are not available)
  for (const appId of [...pkg.coreApps, ...selectedOptionalApps]) {
    const app = getApp(appId);
    if (!app) {
      conflicts.push({ appId, reason: "App not found" });
    }
  }

  return {
    coreApps: pkg.coreApps,
    optionalApps: selectedOptionalApps.filter(id =>
      pkg.optionalApps.includes(id)
    ),
    totalApps: result.order,
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Validate organization apps array.
 * Returns apps that should be removed (orphans, conflicts).
 */
export function validateOrganizationApps(
  apps: string[],
  packages: string[]
): {
  isValid: boolean;
  validApps: string[];
  orphanedApps: string[];
  missingDependencies: string[];
  errors: string[];
} {
  const validApps = new Set<string>();
  const errors: string[] = [];
  const missingDependencies: string[] = [];

  // Add all apps from installed packages
  for (const pkgId of packages) {
    const pkgApps = getPackageApps(pkgId);
    for (const appId of pkgApps) {
      validApps.add(appId);
    }
  }

  // Validate each app
  const orphanedApps: string[] = [];
  for (const appId of apps) {
    const app = getApp(appId);

    if (!app) {
      orphanedApps.push(appId);
      continue;
    }

    // Check if app belongs to an installed package
    if (!packages.includes(app.partOf)) {
      // App doesn't belong to any installed package
      // Check if it has dependencies that are satisfied
      const depsSatisfied = app.dependencies.every(depId =>
        apps.includes(depId)
      );

      if (!depsSatisfied && !app.isStandalone) {
        errors.push(
          `${app.name} is missing dependencies or belongs to an uninstalled package`
        );
        orphanedApps.push(appId);
      } else {
        validApps.add(appId);
      }
    } else {
      validApps.add(appId);
    }

    // Check dependencies
    for (const depId of app.dependencies) {
      if (!validApps.has(depId) && !apps.includes(depId)) {
        missingDependencies.push(`${app.name} requires ${depId}`);
      }
    }
  }

  return {
    isValid: errors.length === 0 && orphanedApps.length === 0,
    validApps: Array.from(validApps),
    orphanedApps,
    missingDependencies,
    errors
  };
}
