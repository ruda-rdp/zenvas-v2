# Technical Specification: Modular App System

**Document Version:** 2.0
**Date:** 2026-07-24
**Status:** Final
**Author:** Claude

---

## 1. Overview

Zenvas uses an **Odoo-style app architecture** — users install individual Apps one by one, not "OS layers." The OS labels (Project OS, Human Capital OS, Business OS) are **store shelf categories** that help users browse and find related Apps.

### 1.1 Key Concepts

| Concept | Definition |
|---------|------------|
| **App** | Individual tool (Scriptwriter, Clients, Team) |
| **Category** | Store shelf label for browsing (Project OS, Business OS, etc.) |
| **Package** | Curated UI shortcut that selects multiple Apps at once |
| **Dependency** | Auto-install when parent App is installed |

### 1.2 Non-Goals

- Complex conflict detection
- App versioning
- Marketplace/third-party apps
- Billing integration

---

## 2. Terminology

| Term | Definition | Example |
|------|------------|---------|
| **App** | Individual feature/tool | `scriptwriter`, `clients`, `leads` |
| **Category** | Store shelf label (browsing only) | `project-os`, `business-os` |
| **Package** | Curated shortcut for selecting multiple Apps | "Business Suite" button |
| **Core Apps** | Apps mandatory-within-bundle | `projects`, `tasks` for Project OS |
| **Always-Enabled** | Apps that cannot be disabled at all | Dashboard, Settings, Profile, Projects, Tasks, Team |
| **Dependency** | App A requires App B to function | `orders` requires `clients` |
| **buildType** | How the App is built | `native` (Built-in) or `integration` (Powered by Odoo) |

---

## 3. Data Model

### 3.1 Organization Schema

```typescript
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String?  @unique

  // Plan & Apps
  plan      String   @default("solo")  // "solo" | "growing" | "agency"
  apps      String[] @default(["projects", "stages", "tasks", "board", "team", "payouts"])
            // Individual app IDs that are enabled for this organization
            // "scriptwriter", "storyboard", "clients", "orders", "leads", etc.
  
  // ... other fields
}
```

### 3.2 App Definition

```typescript
interface App {
  id: string;                    // Unique ID: "scriptwriter"
  name: string;                  // Display name: "Scriptwriter"
  description: string;           // Short description
  icon: string;                  // Emoji or icon class
  route: string;                 // Main route: "/scriptwriter"
  settingsRoute?: string;        // Optional settings page

  // Categories (Store Shelves)
  category: AppCategory;         // "project-os" | "human-capital-os" | "business-os" | etc.

  // Build Type (User-Visible)
  buildType: "native" | "integration";  // "Built-in" vs "Powered by Odoo"

  // Always-Enabled (Cannot Be Disabled)
  alwaysEnabled: boolean;        // true = cannot be disabled at all

  // Installation
  isCore: boolean;               // true = mandatory-within-bundle
  isStandalone: boolean;         // true = can install without package

  // Dependencies (D12a)
  dependencies: string[];        // App IDs that auto-install when this is installed

  // Access
  requiredRole: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER" | "ALL";

  // Implementation
  isImplemented: boolean;        // false = Coming Soon
}

type AppCategory = 
  | "core"                        // Dashboard, Settings, Profile
  | "project-os"                  // Project management tools
  | "human-capital-os"            // Team management
  | "business-os"                  // Client/business tools
  | "ai-content-os"               // AI content production
  | "collaboration"                // Chat, video calls
  | "integrations";               // Third-party integrations
```

---

## 4. App Categories vs Packages

### 4.1 Categories Are Shelves, Not Installable Units

Users **browse** by category but **install** individual Apps.

```
User Journey:
1. Opens App Store
2. Browses "Project OS" category
3. Sees: Scriptwriter, Storyboard, Shotlist, etc.
4. Clicks "Install" on Scriptwriter
5. (Dependencies auto-install)
```

### 4.2 Packages Are Curated Shortcuts (D12b)

Packages are **optional shortcuts** that select multiple Apps at once:

```typescript
// packages.ts
export const PACKAGES = [
  {
    id: "business-suite",
    name: "Business Suite",
    description: "Everything for client management",
    icon: "🏢",
    apps: ["clients", "orders", "leads", "invoices"]
  }
];
```

**Key point:** Installing a Package is equivalent to clicking "Install" on each App individually. The Package is just a convenience UI, not a prerequisite layer.

---

## 5. Dependency Resolution (D12a)

### 5.1 Auto-Install Dependencies

When a user installs an App, its `dependencies[]` are automatically installed first.

```typescript
// Installing "storyboard" auto-installs "scriptwriter"
const storyboard: App = {
  id: "storyboard",
  name: "Storyboard",
  dependencies: ["scriptwriter"],  // Scriptwriter installed first
  // ...
};
```

### 5.2 Uninstall Protection

An App cannot be uninstalled if another installed App depends on it:

```typescript
function canUninstallApp(appId: string, installedApps: string[]): {can: boolean; reason?: string} {
  const dependents = getDependentApps(appId);
  const activeDependents = dependents.filter(a => installedApps.includes(a.id));
  
  if (activeDependents.length > 0) {
    return {
      can: false,
      reason: `Required by: ${activeDependents.map(a => a.name).join(", ")}`
    };
  }
  return { can: true };
}
```

---

## 6. Build Type (D6)

Every non-core App must declare its `buildType`, which is **displayed to users**:

| buildType | Badge | Example |
|-----------|-------|---------|
| `native` | "Built-in" | Scriptwriter, Storyboard, Shotlist |
| `integration` | "Powered by Odoo" | Invoices |

### 6.1 Native Apps (Core Filmmaking Toolchain)

Per Constitution Rule #10 (D8), Zenvas builds natively for:
- Scriptwriter
- Storyboard
- Shotlist
- Timeline Notes
- Scheduling
- Locations
- Dailies
- VFX Tracker
- Deliverables
- Music & Sound
- Analytics
- Branding Kit
- Client Portal

### 6.2 Integration Apps

Apps that primarily use external services:
- Odoo Sync (Powered by Odoo)
- Invoices (via Odoo)

---

## 7. Always-Enabled Apps (D10)

These Apps **cannot be disabled** under any circumstances:

| App | Reason |
|-----|--------|
| Dashboard | Core workspace overview |
| Settings | Configuration hub |
| Profile | User settings |
| Projects | Core production management |
| Tasks | Core task management |
| Team | Core team management |

Platform capabilities (not shown in App Store, always present):
- Auth
- Organization
- Brand
- Roles

---

## 8. Dependency Graph

```
project-os
├── projects (always-enabled)
├── stages (always-enabled)
├── tasks (always-enabled)
├── board (always-enabled)
├── scriptwriter (native, dependencies: [projects])
├── storyboard (native, dependencies: [projects])
├── shotlist (native, dependencies: [projects])
└── [other optional]

human-capital-os
├── team (always-enabled)
├── payouts (always-enabled)
├── attendance (native)
├── payroll (native, dependencies: [team, payouts])
└── recruitment (native)

business-os
├── clients (core-within-bundle)
├── leads (core-within-bundle, dependencies: [clients])
├── orders (core-within-bundle, dependencies: [clients])
├── invoices (integration, dependencies: [orders])
├── client-portal (native, dependencies: [clients])
├── odoo-sync (integration, dependencies: [clients])
├── analytics (native, dependencies: [clients])
└── branding-kit (native, dependencies: [clients])
```

---

## 9. Feature Flag Utilities

### 9.1 Centralized Check Functions

```typescript
// src/lib/app-checks.ts

/**
 * Get all installed apps for organization
 */
export async function getInstalledApps(orgId: string): Promise<string[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { apps: true }
  });
  return org?.apps ?? [];
}

/**
 * Check if specific app is installed
 */
export async function isAppInstalled(orgId: string, appId: string): Promise<boolean> {
  const apps = await getInstalledApps(orgId);
  return apps.includes(appId);
}

/**
 * Check if app is always-enabled (cannot be disabled)
 */
export function isAlwaysEnabled(appId: string): boolean {
  const ALWAYS_ENABLED = ["dashboard", "settings", "profile", "projects", "tasks", "team"];
  return ALWAYS_ENABLED.includes(appId);
}

/**
 * Get apps for dashboard display based on installed apps
 */
export async function getDashboardSections(orgId: string): Promise<DashboardSection[]> {
  const apps = await getInstalledApps(orgId);

  const sections: DashboardSection[] = [];

  // Always show these
  sections.push({ type: "stats", apps: ["projects", "tasks"] });
  sections.push({ type: "today-focus" });
  sections.push({ type: "team" });

  // Conditional based on installed apps
  if (apps.includes("leads")) {
    sections.push({ type: "stats", apps: ["leads"] });
  }

  if (apps.includes("orders")) {
    sections.push({ type: "stats", apps: ["orders"] });
  }

  if (apps.includes("clients")) {
    sections.push({ type: "recent-clients" });
  }

  return sections;
}
```

### 9.2 React Hook

```typescript
// src/hooks/useOrganizationApps.ts

export function useOrganizationApps() {
  const [apps, setApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organization/apps")
      .then(res => res.json())
      .then(data => {
        setApps(data.apps);
        setLoading(false);
      });
  }, []);

  return {
    apps,
    loading,
    hasApp: (id: string) => apps.includes(id),
    isLoading: loading
  };
}
```

---

## 10. Route Protection

### 10.1 Middleware Logic

```typescript
// middleware.ts or route guard component

export async function checkAppAccess(
  appId: string,
  organizationId: string
): Promise<{allowed: boolean; redirectTo?: string}> {
  // Always-Enabled apps are always allowed
  if (isAlwaysEnabled(appId)) {
    return { allowed: true };
  }

  const installedApps = await getInstalledApps(organizationId);
  
  if (!installedApps.includes(appId)) {
    return {
      allowed: false,
      redirectTo: "/apps"  // Prompt to install
    };
  }
  
  return { allowed: true };
}
```

### 10.2 App Route Guard Component

```typescript
// src/components/AppRouteGuard.tsx

interface AppRouteGuardProps {
  appId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AppRouteGuard({ appId, children, fallback }: AppRouteGuardProps) {
  const { hasApp, isLoading } = useOrganizationApps();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasApp(appId) && !isAlwaysEnabled(appId)) {
      router.push("/apps");
    }
  }, [isLoading, hasApp, appId, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasApp(appId) && !isAlwaysEnabled(appId)) {
    return fallback || <AppNotInstalled appId={appId} />;
  }

  return <>{children}</>;
}
```

---

## 11. Sidebar Navigation

### 11.1 Navigation with App Check

```typescript
// sidebar.tsx - Updated navigation array

const navigation = [
  // Always visible (alwaysEnabled)
  { id: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, alwaysEnabled: true },
  { id: "projects", name: "Projects", href: "/projects", icon: FolderKanban, alwaysEnabled: true },
  { id: "board", name: "Board", href: "/board", icon: Target, roles: ["EDITOR"] },
  { id: "team", name: "Team", href: "/team", icon: Users, alwaysEnabled: true },

  // Business OS - only if installed
  { id: "clients", name: "Clients", href: "/clients", requiresApp: "clients", roles: ["OWNER", "MANAGER"] },
  { id: "orders", name: "Orders", href: "/orders", requiresApp: "orders", roles: ["OWNER", "MANAGER"] },
  { id: "leads", name: "Leads", href: "/leads", requiresApp: "leads", roles: ["OWNER", "MANAGER"] },

  // Project OS Optional Apps
  { id: "scriptwriter", name: "Scriptwriter", href: "/scriptwriter", requiresApp: "scriptwriter", roles: ["OWNER", "MANAGER"] },
  { id: "storyboard", name: "Storyboard", href: "/storyboard", requiresApp: "storyboard", roles: ["OWNER", "MANAGER"] },

  // Settings & Admin
  { id: "apps", name: "App Store", href: "/apps", icon: ShoppingCart, roles: ["OWNER"] },
  { id: "settings", name: "Settings", href: "/settings", icon: Settings, alwaysEnabled: true },
];
```

### 11.2 Filter Logic

```typescript
function filterNavigation(nav: NavItem[], userRole: string, installedApps: string[]) {
  return nav.filter(item => {
    // Always-enabled apps always show
    if (item.alwaysEnabled) return true;
    
    // Role check
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    
    // App dependency check
    if (item.requiresApp && !installedApps.includes(item.requiresApp)) {
      return false;
    }
    
    return true;
  });
}
```

---

## 12. Files to Create/Modify

### Create
- `docs/ARCHITECTURE/APP_REGISTRY.md` - App schema (source of truth)

### Modify
- `apps/web/src/lib/apps.ts` - Add `buildType`, `alwaysEnabled` fields
- `apps/web/src/lib/app-checks.ts` - Update to use new model
- `apps/web/src/components/dashboard/sidebar.tsx` - App-based filtering

---

## Appendix A: Default Installation

### Fresh Install (Solo Plan)
```
apps: [
  // Always-enabled
  "dashboard", "settings", "profile", "projects", "tasks", "team",
  // Core within bundle
  "stages", "board", "payouts"
]
```

### After Installing Business OS
```
apps: [
  // Previous apps...
  // Business OS
  "clients", "leads", "orders"
]
```

---

## Appendix B: App ID Reference

### Always-Enabled
- `dashboard`, `settings`, `profile`, `projects`, `tasks`, `team`

### Project OS
- `stages`, `board` (core-within-bundle)
- `scriptwriter`, `storyboard`, `shotlist`, `timeline-notes` (native)
- `scheduling`, `locations`, `dailies`, `vfx-tracker` (native)
- `deliverables`, `music-sound` (native)

### Human Capital OS
- `payouts` (core-within-bundle)
- `attendance`, `payroll`, `recruitment` (native)

### Business OS
- `clients`, `leads`, `orders` (core-within-bundle)
- `invoices`, `client-portal`, `analytics`, `branding-kit` (native/integration)
- `odoo-sync` (integration)

---

*Last updated: 2026-07-24*
