/**
 * App Registry - Zenvas Modular Architecture
 *
 * Structure: Core apps always present + Optional apps (app store model)
 * Based on organization.apps array to enable/disable features
 *
 * Each app defines:
 * - dependencies: Apps that must be installed before this app
 * - partOf: Package this app belongs to
 * - isCore: Whether this is a core app (auto-installed with package)
 *
 * Based on ADR-0005: Modular Architecture
 */

export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AppCategory;
  route: string;
  settingsRoute?: string;

  // Dependency system
  dependencies: string[];      // App IDs that MUST be installed first
  partOf: string;              // Package ID this app belongs to (e.g., "project-os", "business-os")

  // Installation
  isCore: boolean;            // true = mandatory with package, cannot deselect
  isStandalone: boolean;       // true = can install without a package

  // Access
  requiredRole: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER" | "ALL";
  alwaysEnabled?: boolean;     // true = always shown (dashboard, settings, profile)
}

export type AppCategory =
  | "core"                     // Dashboard, Settings, Profile
  | "project-os"              // Project management tools
  | "human-capital-os"        // Team management
  | "business-os"             // Client/business tools
  | "integrations";           // Third-party integrations

// ─────────────────────────────────────────────────────────────────
// APP DEFINITIONS
// ─────────────────────────────────────────────────────────────────

export const APPS: App[] = [
  // ═══════════════════════════════════════════════════════════════
  // CORE APPS - Always enabled for all organizations
  // ═══════════════════════════════════════════════════════════════

  {
    id: "dashboard",
    name: "Dashboard",
    description: "Mission Control - Overview & Analytics",
    icon: "🎯",
    category: "core",
    route: "/dashboard",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Workspace and app settings",
    icon: "⚙️",
    category: "core",
    route: "/settings",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "profile",
    name: "My Profile",
    description: "Personal account settings",
    icon: "👤",
    category: "core",
    route: "/profile",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PROJECT OS - Core Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "projects",
    name: "Projects",
    description: "Project management with stages and tasks",
    icon: "📁",
    category: "project-os",
    route: "/projects",
    dependencies: [],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "ALL",
  },
  {
    id: "stages",
    name: "Stages",
    description: "Project stages (internal)",
    icon: "📋",
    category: "project-os",
    route: "/projects", // Internal, accessed via projects
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "ALL",
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Task management (internal)",
    icon: "✅",
    category: "project-os",
    route: "/projects",
    dependencies: ["projects", "stages"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "ALL",
  },
  {
    id: "board",
    name: "Board",
    description: "Kanban board for task visibility",
    icon: "🎯",
    category: "project-os",
    route: "/board",
    dependencies: ["projects", "tasks"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "EDITOR",
  },

  // ═══════════════════════════════════════════════════════════════
  // PROJECT OS - Optional Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "scriptwriter",
    name: "Scriptwriter",
    description: "Screenplay and script writing tool",
    icon: "✍️",
    category: "project-os",
    route: "/scriptwriter",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false, // Optional - user can deselect
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "storyboard",
    name: "Storyboard",
    description: "Visual storyboard canvas",
    icon: "🎨",
    category: "project-os",
    route: "/storyboard",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "shotlist",
    name: "Shotlist",
    description: "Production shot breakdown",
    icon: "🎬",
    category: "project-os",
    route: "/shotlist",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "timeline-notes",
    name: "Timeline Notes",
    description: "Editorial timeline notes",
    icon: "📝",
    category: "project-os",
    route: "/timeline",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "EDITOR",
  },
  {
    id: "scheduling",
    name: "Scheduling",
    description: "Production scheduling and calendar",
    icon: "📅",
    category: "project-os",
    route: "/schedule",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "locations",
    name: "Locations",
    description: "Location management and recce",
    icon: "📍",
    category: "project-os",
    route: "/locations",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "dailies",
    name: "Dailies",
    description: "Daily footage review",
    icon: "🎥",
    category: "project-os",
    route: "/dailies",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "EDITOR",
  },
  {
    id: "vfx-tracker",
    name: "VFX Tracker",
    description: "Visual effects tracking",
    icon: "✨",
    category: "project-os",
    route: "/vfx",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "deliverables",
    name: "Deliverables",
    description: "Delivery specifications and tracking",
    icon: "📦",
    category: "project-os",
    route: "/deliverables",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "music-sound",
    name: "Music & Sound",
    description: "Music and sound library",
    icon: "🎵",
    category: "project-os",
    route: "/music",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // HUMAN CAPITAL OS - Core Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "team",
    name: "Team",
    description: "Manage team members and brand access",
    icon: "👥",
    category: "human-capital-os",
    route: "/team",
    dependencies: [],
    partOf: "human-capital-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "ALL",
  },
  {
    id: "payouts",
    name: "Payouts",
    description: "Editor wallet and withdrawal management",
    icon: "💰",
    category: "human-capital-os",
    route: "/payouts",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // HUMAN CAPITAL OS - Optional Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "attendance",
    name: "Attendance",
    description: "Team clock in/out tracking",
    icon: "🕐",
    category: "human-capital-os",
    route: "/attendance",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Salary calculation and processing",
    icon: "💳",
    category: "human-capital-os",
    route: "/payroll",
    dependencies: ["team", "payouts"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "recruitment",
    name: "Recruitment",
    description: "Hiring pipeline and candidate management",
    icon: "🤝",
    category: "human-capital-os",
    route: "/recruitment",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS OS - Core Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "clients",
    name: "Clients",
    description: "Client management and contacts",
    icon: "🏢",
    category: "business-os",
    route: "/clients",
    dependencies: [],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "orders",
    name: "Orders",
    description: "Order lifecycle and invoice management",
    icon: "📋",
    category: "business-os",
    route: "/orders",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "leads",
    name: "Leads",
    description: "Lead capture and qualification funnel",
    icon: "📝",
    category: "business-os",
    route: "/leads",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS OS - Optional Apps
  // ═══════════════════════════════════════════════════════════════

  {
    id: "invoices",
    name: "Invoices",
    description: "Invoice creation and tracking",
    icon: "📄",
    category: "business-os",
    route: "/invoices",
    dependencies: ["orders"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Client-facing project portal",
    icon: "🌐",
    category: "business-os",
    route: "/portal",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Business analytics and insights",
    icon: "📊",
    category: "business-os",
    route: "/analytics",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
  {
    id: "branding-kit",
    name: "Branding Kit",
    description: "Brand assets and guidelines",
    icon: "🎨",
    category: "business-os",
    route: "/branding",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════

  {
    id: "odoo-sync",
    name: "Odoo Accounting",
    description: "Sync clients and invoices with Odoo ERP",
    icon: "🔄",
    category: "integrations",
    route: "/settings/integrations/odoo",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    requiredRole: "OWNER",
  },
];

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

export const APP_CATEGORIES = {
  core: {
    label: "Core",
    description: "Essential workspace tools",
  },
  "project-os": {
    label: "Project OS",
    description: "Project management and production tools",
  },
  "human-capital-os": {
    label: "Human Capital OS",
    description: "Team and human resources",
  },
  "business-os": {
    label: "Business OS",
    description: "Client and business management",
  },
  integrations: {
    label: "Integrations",
    description: "Connect with external services",
  },
} as const;

// ─────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get app by ID
 */
export function getApp(appId: string): App | undefined {
  return APPS.find(app => app.id === appId);
}

/**
 * Get apps by category
 */
export function getAppsByCategory(category: App["category"]): App[] {
  return APPS.filter(app => app.category === category);
}

/**
 * Get apps by package
 */
export function getAppsByPackage(packageId: string): App[] {
  return APPS.filter(app => app.partOf === packageId);
}

/**
 * Get core apps for a package
 */
export function getCoreAppsForPackage(packageId: string): App[] {
  return APPS.filter(app => app.partOf === packageId && app.isCore);
}

/**
 * Get optional apps for a package
 */
export function getOptionalAppsForPackage(packageId: string): App[] {
  return APPS.filter(app => app.partOf === packageId && !app.isCore);
}

/**
 * Get enabled apps based on organization config
 */
export function getEnabledApps(organizationApps?: string[]): App[] {
  if (!organizationApps) {
    // Return core/alwaysEnabled apps only if no config
    return APPS.filter(app => app.alwaysEnabled || app.isCore);
  }
  return APPS.filter(app =>
    app.alwaysEnabled || organizationApps.includes(app.id)
  );
}

/**
 * Check if app is enabled
 */
export function isAppEnabled(appId: string, organizationApps?: string[]): boolean {
  const app = APPS.find(a => a.id === appId);
  if (!app) return false;
  if (app.alwaysEnabled) return true;
  if (app.isCore) return true;
  return organizationApps?.includes(appId) ?? false;
}

/**
 * Get apps that depend on a specific app
 */
export function getDependentApps(appId: string): App[] {
  return APPS.filter(app => app.dependencies.includes(appId));
}

/**
 * Check if app can be uninstalled
 * Returns false if any other installed app depends on it
 */
export function canUninstallApp(
  appId: string,
  installedApps: string[]
): { can: boolean; reason?: string } {
  const app = getApp(appId);

  // Core apps cannot be uninstalled
  if (app?.isCore) {
    return {
      can: false,
      reason: "This is a core app and cannot be uninstalled"
    };
  }

  // Check if any other installed app depends on this one
  const dependents = getDependentApps(appId);
  const activeDependents = dependents.filter(a =>
    installedApps.includes(a.id)
  );

  if (activeDependents.length > 0) {
    return {
      can: false,
      reason: `Required by: ${activeDependents.map(a => a.name).join(", ")}`
    };
  }

  return { can: true };
}

/**
 * Get nav items for sidebar (filtered by role and installed apps)
 */
export function getNavItems(
  userRole: string,
  organizationApps?: string[]
): App[] {
  return getEnabledApps(organizationApps).filter(app => {
    // Always show alwaysEnabled apps
    if (app.alwaysEnabled) return true;

    // Core apps - check if package is installed
    if (app.isCore) {
      // For now, assume core apps are always available
      // In the future, check if package is installed
      return true;
    }

    // Filter by role
    if (app.requiredRole !== "ALL") {
      if (app.requiredRole === "OWNER" && userRole !== "OWNER") return false;
      if (app.requiredRole === "MANAGER" && !["OWNER", "MANAGER"].includes(userRole)) return false;
      if (app.requiredRole === "EDITOR" && !["OWNER", "MANAGER", "EDITOR"].includes(userRole)) return false;
    }

    // Check if app is installed
    return organizationApps?.includes(app.id) ?? false;
  });
}

/**
 * Get apps that should be installed by default for a new organization
 * These are the core apps from core packages
 */
export function getDefaultApps(): string[] {
  return APPS
    .filter(app => app.alwaysEnabled || app.isCore)
    .map(app => app.id);
}
