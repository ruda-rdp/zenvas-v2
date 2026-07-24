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
 * - buildType: "native" (built by Zenvas) or "integration" (third-party)
 *
 * Based on ADR-0005: Modular Architecture
 * Updated per D6-D12 decisions (2026-07-24)
 */

export type BuildType = "native" | "integration";

export interface App {
  id: string;
  name: string;
  description: string;
  longDescription?: string;   // Detailed description for app store
  features?: string[];          // Feature list for app store
  icon: string;
  category: AppCategory;
  route: string;
  settingsRoute?: string;

  // Build type - user-visible badge in App Store (D6)
  buildType: BuildType;

  // Implementation status
  isImplemented: boolean;        // false = Coming Soon

  // Dependency system
  dependencies: string[];      // App IDs that MUST be installed first
  partOf: string;              // Package ID this app belongs to (e.g., "project-os", "business-os")

  // Installation
  isCore: boolean;            // true = mandatory with package, cannot deselect
  isStandalone: boolean;       // true = can install without a package

  // Access
  requiredRole: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER" | "ALL";
  alwaysEnabled?: boolean;     // true = always shown, cannot be disabled (D10)
}

export type AppCategory =
  | "core"                     // Dashboard, Settings, Profile
  | "project-os"              // Project management tools
  | "human-capital-os"        // Team management
  | "business-os"             // Client/business tools
  | "ai-content-os"          // AI content production
  | "collaboration"          // Chat, video calls
  | "integrations";           // Third-party integrations

// Always-enabled apps that cannot be disabled (D10)
export const ALWAYS_ENABLED_APPS = [
  "dashboard",
  "settings",
  "profile",
  "projects",
  "tasks",
  "team"
] as const;

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
    longDescription: "Your central hub for monitoring all workspace activities. View project progress, team performance, and business metrics at a glance.",
    features: ["Real-time project overview", "Team activity feed", "Performance metrics", "Quick actions"],
    icon: "🎯",
    category: "core",
    route: "/dashboard",
    buildType: "native",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "settings",
    name: "Settings",
    description: "Workspace and app settings",
    longDescription: "Configure your workspace settings, manage integrations, and control user access.",
    features: ["Workspace configuration", "Team management", "Integration settings", "Security settings"],
    icon: "⚙️",
    category: "core",
    route: "/settings",
    buildType: "native",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "profile",
    name: "My Profile",
    description: "Personal account settings",
    longDescription: "Manage your personal account settings, password, and notification preferences.",
    features: ["Profile information", "Password management", "Notification preferences", "Avatar upload"],
    icon: "👤",
    category: "core",
    route: "/profile",
    buildType: "native",
    dependencies: [],
    partOf: "core",
    isCore: true,
    isStandalone: true,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PROJECT OS - Core Apps (IMPLEMENTED)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "projects",
    name: "Projects",
    description: "Project management with stages and tasks",
    longDescription: "Organize and manage all your production projects. Create stages, add tasks, and track progress from pre-production to delivery.",
    features: ["Project creation", "Stage management", "Task tracking", "Progress analytics"],
    icon: "📁",
    category: "project-os",
    route: "/projects",
    buildType: "native",
    dependencies: [],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "stages",
    name: "Stages",
    description: "Project stages (internal)",
    icon: "📋",
    category: "project-os",
    route: "/projects",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "ALL",
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Task management (internal)",
    longDescription: "Break down work into manageable tasks. Assign to team members, set priorities, and track completion.",
    features: ["Task creation", "Assignment", "Priority levels", "Due dates", "Comments"],
    icon: "✅",
    category: "project-os",
    route: "/projects",
    buildType: "native",
    dependencies: ["projects", "stages"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "board",
    name: "Board",
    description: "Kanban board for task visibility",
    longDescription: "Visual Kanban board for editors to see and manage their assigned tasks. Drag and drop to update status.",
    features: ["Kanban view", "Drag & drop", "Quick status updates", "Editor focus view"],
    icon: "🎯",
    category: "project-os",
    route: "/board",
    buildType: "native",
    dependencies: ["projects", "tasks"],
    partOf: "project-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "EDITOR",
  },

  // ═══════════════════════════════════════════════════════════════
  // PROJECT OS - Optional Apps (COMING SOON)
  // Native filmmaking tools per Constitution Rule #10 (D8)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "scriptwriter",
    name: "Scriptwriter",
    description: "AI-powered screenplay writing and scene breakdown",
    longDescription: "A professional screenplay writing tool with AI assistance. Auto-format to industry standards, generate scene breakdowns, and get AI suggestions for dialogue and action lines.",
    features: [
      "Industry-standard screenplay format",
      "AI dialogue suggestions",
      "Auto scene breakdown",
      "Character management",
      "Location tracking",
      "Export to PDF/Final Draft"
    ],
    icon: "✍️",
    category: "project-os",
    route: "/scriptwriter",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "storyboard",
    name: "Storyboard",
    description: "Visual storyboard canvas for shot planning",
    longDescription: "Create stunning visual storyboards with our Milanote-inspired canvas. Draw, upload images, add annotations, and plan your shots visually.",
    features: [
      "Visual canvas workspace",
      "Upload reference images",
      "Draw and annotate",
      "Shot composition notes",
      "Export to PDF",
      "Team collaboration"
    ],
    icon: "🎨",
    category: "project-os",
    route: "/storyboard",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "shotlist",
    name: "Shotlist",
    description: "Detailed shot breakdown and production planning",
    longDescription: "Create comprehensive shot lists for production days. Plan every shot with camera angles, lenses, movements, and equipment requirements.",
    features: [
      "Shot database per project",
      "Camera & lens specs",
      "Movement notation",
      "Equipment checklist",
      "Export to call sheet",
      "Day-by-day planning"
    ],
    icon: "🎬",
    category: "project-os",
    route: "/shotlist",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "timeline-notes",
    name: "Timeline Notes",
    description: "Editorial notes and timeline annotations",
    longDescription: "Add notes directly to your editing timeline. Mark review points, communicate feedback, and track approval status on specific timecodes.",
    features: [
      "Timeline annotation",
      "Timecode markers",
      "Feedback comments",
      "Approval workflow",
      "Export notes to PDF"
    ],
    icon: "📝",
    category: "project-os",
    route: "/timeline",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "EDITOR",
  },
  {
    id: "scheduling",
    name: "Scheduling",
    description: "Production calendar and call sheet generation",
    longDescription: "Plan your production schedule with an intuitive calendar. Automatically generate professional call sheets for crew.",
    features: [
      "Production calendar",
      "Automatic call sheet generation",
      "Crew scheduling",
      "Location booking",
      "Weather integration",
      "Google Calendar sync"
    ],
    icon: "📅",
    category: "project-os",
    route: "/schedule",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "locations",
    name: "Locations",
    description: "Location scouting and management",
    longDescription: "Build your location library, schedule scouts, track permits, and manage sound reports for all your shooting locations.",
    features: [
      "Location database",
      "Photo gallery",
      "Scout scheduling",
      "Permit tracking",
      "Sound reports",
      "Map integration"
    ],
    icon: "📍",
    category: "project-os",
    route: "/locations",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "dailies",
    name: "Dailies",
    description: "Daily footage review and sync",
    longDescription: "Review daily footage with your team. Sync from cameras, add notes, and manage approval workflow for takes.",
    features: [
      "Camera sync",
      "Frame.io integration",
      "Print/Favorite/Reject takes",
      "Timestamped notes",
      "Team review",
      "Sync to editing"
    ],
    icon: "🎥",
    category: "project-os",
    route: "/dailies",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "EDITOR",
  },
  {
    id: "vfx-tracker",
    name: "VFX Tracker",
    description: "Track visual effects from onset to delivery",
    longDescription: "Manage your VFX pipeline from shot planning to final delivery. Track vendors, versions, and approval status.",
    features: [
      "VFX shot database",
      "Vendor assignment",
      "Version tracking",
      "Delivery timeline",
      "Approval workflow",
      "Client review portal"
    ],
    icon: "✨",
    category: "project-os",
    route: "/vfx",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "deliverables",
    name: "Deliverables",
    description: "Delivery specifications and QC checklist",
    longDescription: "Ensure every delivery meets specifications. Build QC checklists for Netflix, broadcast, and streaming requirements.",
    features: [
      "Spec templates (Netflix, broadcast)",
      "QC checklist",
      "Technical verification",
      "Audio loudness check",
      "Delivery tracking",
      "Archive management"
    ],
    icon: "📦",
    category: "project-os",
    route: "/deliverables",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "music-sound",
    name: "Music & Sound",
    description: "Music licensing and soundtrack management",
    longDescription: "Manage your music library and licensing. Track cues, sync rights, and delivery specifications for music.",
    features: [
      "Music cue database",
      "License tracking",
      "Royalty management",
      "Mix delivery specs",
      "Music cue sheets",
      "Library integration"
    ],
    icon: "🎵",
    category: "project-os",
    route: "/music",
    buildType: "native",
    dependencies: ["projects"],
    partOf: "project-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // HUMAN CAPITAL OS - Core Apps (IMPLEMENTED)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "team",
    name: "Team",
    description: "Manage team members and workspace access",
    longDescription: "Build and manage your production team. Invite members, assign roles, and control access to projects and brands.",
    features: ["Member invitations", "Role management", "Brand access control", "Activity tracking"],
    icon: "👥",
    category: "human-capital-os",
    route: "/team",
    buildType: "native",
    dependencies: [],
    partOf: "human-capital-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: true,
  },
  {
    id: "payouts",
    name: "Payouts",
    description: "Editor wallet and withdrawal management",
    longDescription: "Track editor earnings, manage wallets, and process withdrawal requests. Editors can see their balance and request payouts.",
    features: ["Editor earnings tracking", "Wallet balance", "Withdrawal requests", "Payment history"],
    icon: "💰",
    category: "human-capital-os",
    route: "/payouts",
    buildType: "native",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // HUMAN CAPITAL OS - Optional Apps (COMING SOON)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "attendance",
    name: "Attendance",
    description: "Team clock in/out tracking",
    longDescription: "Track team working hours with clock in/out functionality. Perfect for in-house teams and freelancers tracking billable hours.",
    features: ["Clock in/out", "Working hours tracking", "Billable hours", "Attendance reports"],
    icon: "🕐",
    category: "human-capital-os",
    route: "/attendance",
    buildType: "native",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "payroll",
    name: "Payroll",
    description: "Salary calculation and payment processing",
    longDescription: "Process monthly payroll for your team. Calculate salaries based on hours worked, deduct taxes, and generate payment batches.",
    features: ["Salary calculation", "Tax deductions", "Payment batches", "Payslip generation"],
    icon: "💳",
    category: "human-capital-os",
    route: "/payroll",
    buildType: "native",
    dependencies: ["team", "payouts"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "recruitment",
    name: "Recruitment",
    description: "Hiring pipeline and talent management",
    longDescription: "Build a talent pipeline for your production needs. Post openings, track candidates, and manage the hiring process.",
    features: ["Job postings", "Candidate tracking", "Interview scheduling", "Offer management"],
    icon: "🤝",
    category: "human-capital-os",
    route: "/recruitment",
    buildType: "native",
    dependencies: ["team"],
    partOf: "human-capital-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS OS - Core Apps (IMPLEMENTED)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "clients",
    name: "Clients",
    description: "Client management and contacts",
    longDescription: "Manage your client database with contacts, company info, and communication history. Perfect for production studios with multiple clients.",
    features: ["Client database", "Contact management", "Company profiles", "Communication history"],
    icon: "🏢",
    category: "business-os",
    route: "/clients",
    buildType: "native",
    dependencies: [],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "OWNER",
  },
  {
    id: "orders",
    name: "Orders",
    description: "Order lifecycle and project management",
    longDescription: "Create and manage project orders from proposal to delivery. Track intake forms, create projects, and monitor order status.",
    features: ["Order creation", "Intake forms", "Project linking", "Status tracking"],
    icon: "📋",
    category: "business-os",
    route: "/orders",
    buildType: "native",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "OWNER",
  },
  {
    id: "leads",
    name: "Leads",
    description: "Lead capture and qualification funnel",
    longDescription: "Capture and qualify leads from various sources. Track status from new to won, manage follow-ups, and convert to clients.",
    features: ["Lead capture", "Pipeline kanban", "Status qualification", "Source tracking", "Follow-up reminders"],
    icon: "📝",
    category: "business-os",
    route: "/leads",
    buildType: "native",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: true,
    isStandalone: false,
    isImplemented: true,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS OS - Optional Apps (COMING SOON)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "invoices",
    name: "Invoices",
    description: "Invoice creation and payment tracking",
    longDescription: "Generate professional invoices and track payments. Integrate with Odoo for accounting and financial reporting.",
    features: ["Invoice generation", "Payment tracking", "Odoo sync", "Financial reports"],
    icon: "📄",
    category: "business-os",
    route: "/invoices",
    buildType: "integration",
    dependencies: ["orders"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "White-label client-facing project portal",
    longDescription: "Give clients their own portal to view project progress, review deliverables, and approve content. White-label with your branding.",
    features: ["Project progress view", "Review & approval", "Deliverable downloads", "Custom branding", "Custom domain"],
    icon: "🌐",
    category: "business-os",
    route: "/portal",
    buildType: "native",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Business analytics and insights",
    longDescription: "Get deep insights into your business performance. Track revenue, project metrics, team productivity, and lead conversion.",
    features: ["Revenue analytics", "Project metrics", "Team productivity", "Lead conversion funnel"],
    icon: "📊",
    category: "business-os",
    route: "/analytics",
    buildType: "native",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },
  {
    id: "branding-kit",
    name: "Branding Kit",
    description: "Brand assets and guidelines management",
    longDescription: "Centralize brand assets for clients. Upload logos, color palettes, and brand guidelines. Clients can access from their portal.",
    features: ["Asset library", "Color palettes", "Brand guidelines", "Client access"],
    icon: "🎨",
    category: "business-os",
    route: "/branding",
    buildType: "native",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
    requiredRole: "OWNER",
  },

  // ═══════════════════════════════════════════════════════════════
  // COLLABORATION - Core Apps (IMPLEMENTED)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "chat",
    name: "Team Chat",
    description: "Internal team messaging — channels, direct messages, presence.",
    longDescription: "Team Chat enables real-time communication within your workspace. Create channels for different topics, send direct messages, and see team member presence at a glance.",
    features: [
      "Channel-based messaging",
      "Direct messages",
      "Real-time presence",
      "Message threading",
      "File sharing in chat",
      "@mentions and notifications"
    ],
    icon: "💬",
    category: "collaboration",
    route: "/chat",
    buildType: "native",
    dependencies: [],
    partOf: "collaboration",
    isCore: false,
    isStandalone: true,
    isImplemented: true,
    requiredRole: "ALL",
    alwaysEnabled: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // INTEGRATIONS (COMING SOON)
  // ═══════════════════════════════════════════════════════════════

  {
    id: "odoo-sync",
    name: "Odoo Accounting",
    description: "Sync with Odoo ERP for accounting",
    longDescription: "Two-way sync with Odoo ERP. Sync clients as contacts, orders as sales orders, and invoices automatically.",
    features: ["Client sync", "Order sync", "Invoice sync", "Real-time sync"],
    icon: "🔄",
    category: "integrations",
    route: "/settings/integrations/odoo",
    buildType: "integration",
    dependencies: ["clients"],
    partOf: "business-os",
    isCore: false,
    isStandalone: false,
    isImplemented: false,
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

  // Always-enabled apps cannot be uninstalled (D10)
  if (app?.alwaysEnabled) {
    return {
      can: false,
      reason: "This app cannot be disabled"
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
