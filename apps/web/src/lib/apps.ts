/**
 * App Registry - Zenvas Modular Architecture
 *
 * Structure: Core modules always present + Optional modules (app store model)
 * Based on organization.apps array to enable/disable features
 */

export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "core" | "business" | "productivity" | "integrations";
  route: string;
  settingsRoute?: string;
  requiredRole?: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER";
  alwaysEnabled?: boolean;
}

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
    alwaysEnabled: true,
  },
  {
    id: "project-os",
    name: "Projects",
    description: "Project management with stages and tasks",
    icon: "📁",
    category: "core",
    route: "/projects",
    alwaysEnabled: true,
  },
  {
    id: "human-capital-os",
    name: "Team",
    description: "Manage team members and brand access",
    icon: "👥",
    category: "core",
    route: "/team",
    alwaysEnabled: true,
  },
  {
    id: "payouts",
    name: "Payouts",
    description: "Editor wallet and withdrawal management",
    icon: "💰",
    category: "core",
    route: "/payouts",
    requiredRole: "OWNER",
    alwaysEnabled: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS APPS - Business OS modules
  // ═══════════════════════════════════════════════════════════════

  {
    id: "clients",
    name: "Clients",
    description: "Client management and contacts",
    icon: "🏢",
    category: "business",
    route: "/clients",
    requiredRole: "OWNER",
  },
  {
    id: "orders",
    name: "Orders",
    description: "Order lifecycle and invoice management",
    icon: "📋",
    category: "business",
    route: "/orders",
    requiredRole: "OWNER",
  },
  {
    id: "leads",
    name: "Leads",
    description: "Lead capture and qualification funnel",
    icon: "📝",
    category: "business",
    route: "/leads",
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════

  {
    id: "odoo-sync",
    name: "Odoo Accounting",
    description: "Sync clients and invoices with Odoo ERP",
    icon: "📊",
    category: "integrations",
    route: "/settings/integrations/odoo",
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════

  {
    id: "settings",
    name: "Settings",
    description: "Workspace and app settings",
    icon: "⚙️",
    category: "core",
    route: "/settings",
    alwaysEnabled: true,
  },
  {
    id: "profile",
    name: "My Profile",
    description: "Personal account settings",
    icon: "👤",
    category: "core",
    route: "/profile",
    alwaysEnabled: true,
  },
];

// App categories for display
export const APP_CATEGORIES = {
  core: {
    label: "Core",
    description: "Essential workspace tools",
  },
  business: {
    label: "Business",
    description: "Client and order management",
  },
  productivity: {
    label: "Productivity",
    description: "Tools to boost productivity",
  },
  integrations: {
    label: "Integrations",
    description: "Connect with external services",
  },
} as const;

// Get apps by category
export function getAppsByCategory(category: App["category"]): App[] {
  return APPS.filter(app => app.category === category);
}

// Get enabled apps based on organization config
export function getEnabledApps(organizationApps?: string[]): App[] {
  if (!organizationApps) {
    // Return core apps only if no config
    return APPS.filter(app => app.alwaysEnabled);
  }
  return APPS.filter(app =>
    app.alwaysEnabled || organizationApps.includes(app.id)
  );
}

// Check if app is enabled
export function isAppEnabled(appId: string, organizationApps?: string[]): boolean {
  const app = APPS.find(a => a.id === appId);
  if (!app) return false;
  if (app.alwaysEnabled) return true;
  return organizationApps?.includes(appId) ?? false;
}

// Get nav items for sidebar (filtered by role)
export function getNavItems(userRole: string, organizationApps?: string[]): App[] {
  return getEnabledApps(organizationApps).filter(app => {
    // Always show alwaysEnabled apps
    if (app.alwaysEnabled) return true;

    // Filter by role
    if (app.requiredRole === "OWNER" && userRole !== "OWNER") return false;
    if (app.requiredRole === "MANAGER" && !["OWNER", "MANAGER"].includes(userRole)) return false;

    return true;
  });
}
