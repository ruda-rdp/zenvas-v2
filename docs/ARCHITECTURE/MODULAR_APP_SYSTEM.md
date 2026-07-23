# Technical Specification: Modular App System

**Document Version:** 1.0  
**Date:** 2026-07-23  
**Status:** Draft  
**Author:** Claude

---

## 1. Overview

Sistem modular app terinspirasi dari Odoo - memungkinkan user menginstall/uninstall apps sesuai kebutuhan. User tidak dibebani fitur yang tidak diperlukan, dan system ready untuk SaaS tiering di masa depan.

### 1.1 Goals

1. **User Isolation** - Solo user tidak melihat Leads/Orders/Clients yang membingungkan
2. **Dependency Safety** - Install/uninstall aman, tidak terjadi broken state
3. **SaaS Ready** - Setiap package/app bisa di-enable/disable berdasarkan tier subscription
4. **Flexible** - User bisa install hanya apps yang dibutuhkan

### 1.2 Non-Goals (v1)

- Complex conflict detection
- App versioning
- Marketplace/third-party apps
- Billing integration

---

## 2. Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Package** | Bundle of related apps, installed as one unit | `project-os`, `business-os`, `human-capital-os` |
| **App** | Individual feature/tool | `scriptwriter`, `clients`, `leads` |
| **Core Apps** | Apps that are mandatory when package is installed | `projects`, `tasks` for `project-os` |
| **Optional Apps** | Apps user can choose to enable/disable | `scriptwriter`, `storyboard` |
| **Dependency** | App A requires App B to function | `orders` requires `clients` |

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
  packages  String[] @default(["project-os", "human-capital-os"])
            // Installed packages: "project-os", "business-os", "human-capital-os"
  apps      String[] @default(["projects", "stages", "tasks", "board", "team", "payouts"])
            // Individual apps, including optional ones
            // "scriptwriter", "storyboard", "clients", "orders", "leads", etc.
  
  // ... other fields
}
```

### 3.2 Database Changes

```prisma
// apps array now stores INDIVIDUAL app IDs
apps      String[] @default(["projects", "stages", "tasks", "board", "team"])
```

---

## 4. App Registry Structure

### 4.1 App Definition

```typescript
interface AppDefinition {
  id: string;                    // Unique ID: "scriptwriter"
  name: string;                  // Display name: "Scriptwriter"
  description: string;           // Short description
  icon: string;                  // Emoji or icon class
  route: string;                 // Main route: "/scriptwriter"
  settingsRoute?: string;        // Optional settings page

  // Installation
  isCore: boolean;               // true = mandatory with package
  isStandalone: boolean;         // true = can install without package

  // Dependencies
  requires: string[];            // App IDs that MUST be installed first
  requiredBy: string[];          // App IDs that depend on this (auto-calculated)

  // Access
  requiredRole: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER" | "ALL";
  
  // Metadata
  category: AppCategory;
  tags: string[];                // For filtering: ["production", "pre-production"]
}

type AppCategory = 
  | "core"                        // Dashboard, Settings, Profile
  | "project-os"                  // Project management tools
  | "human-capital-os"            // Team management
  | "business-os"                // Client/business tools
  | "integrations";               // Third-party integrations
```

### 4.2 Package Definition

```typescript
interface PackageDefinition {
  id: string;                    // "project-os"
  name: string;                  // "Project OS"
  description: string;           // "Project management and production tools"
  icon: string;                  // "🎬"

  // Contents
  coreApps: string[];            // Apps that install automatically: ["projects", "stages", "tasks", "board"]
  optionalApps: string[];        // Apps user can choose: ["scriptwriter", "storyboard", "shotlist"]

  // Installation
  isCore: boolean;               // true = cannot uninstall

  // Access
  requiredRole: "OWNER" | "MANAGER";  // Who can install
  requiredPlan?: string;         // Minimum plan: "growing", "agency"

  // SaaS Tiering
  tier: "starter" | "growing" | "agency";
  price?: string;                // For future: "included", "premium"
}
```

---

## 5. Initial App Registry

### 5.1 Core Apps (Always Present)

| ID | Name | Route | Category | Required Role |
|----|------|-------|----------|---------------|
| dashboard | Dashboard | /dashboard | core | ALL |
| settings | Settings | /settings | core | ALL |
| profile | My Profile | /profile | core | ALL |

### 5.2 Project OS Package

**Package ID:** `project-os`  
**Core Apps (Wajib):**
| ID | Name | Route |
|----|------|-------|
| projects | Projects | /projects |
| stages | Stages | /projects (internal) |
| tasks | Tasks | /projects |
| board | Board | /board |

**Optional Apps (Pilihan):**
| ID | Name | Route | Requires |
|----|------|-------|----------|
| scriptwriter | Scriptwriter | /scriptwriter | - |
| storyboard | Storyboard | /storyboard | - |
| shotlist | Shotlist | /shotlist | - |
| timeline-notes | Timeline Notes | /timeline | - |
| scheduling | Scheduling | /schedule | - |
| locations | Locations | /locations | - |
| dailies | Dailies | /dailies | - |
| vfx-tracker | VFX Tracker | /vfx | - |
| deliverables | Deliverables | /deliverables | - |
| music-sound | Music & Sound | /music | - |

### 5.3 Human Capital OS Package

**Package ID:** `human-capital-os`  
**Core Apps (Wajib):**
| ID | Name | Route |
|----|------|-------|
| team | Team | /team |
| payouts | Payouts | /payouts |

**Optional Apps (Pilihan):**
| ID | Name | Route | Requires |
|----|------|-------|----------|
| attendance | Attendance | /attendance | - |
| payroll | Payroll | /payroll | payouts |
| recruitment | Recruitment | /recruitment | - |

### 5.4 Business OS Package

**Package ID:** `business-os`  
**Core Apps (Wajib):**
| ID | Name | Route |
|----|------|-------|
| clients | Clients | /clients |
| leads | Leads | /leads |
| orders | Orders | /orders |

**Optional Apps (Pilihan):**
| ID | Name | Route | Requires |
|----|------|-------|----------|
| invoices | Invoices | /invoices | orders |
| client-portal | Client Portal | /portal | clients |
| odoo-sync | Odoo Sync | /settings/integrations/odoo | clients |
| analytics | Analytics | /analytics | clients |
| branding-kit | Branding Kit | /branding | clients |

---

## 6. Dependency Graph

```
project-os
├── projects (core)
├── stages (core)
├── tasks (core)
├── board (core)
├── scriptwriter
├── storyboard
├── shotlist
└── [other optional]

human-capital-os
├── team (core)
├── payouts (core)
├── attendance (optional)
├── payroll (requires: payouts)
└── recruitment (optional)

business-os
├── clients (core)
├── leads (requires: clients)
├── orders (requires: clients)
├── invoices (requires: orders)
├── client-portal (requires: clients)
├── odoo-sync (optional)
├── analytics (requires: clients)
└── branding-kit (requires: clients)
```

---

## 7. Dependency Resolver

### 7.1 Algorithm

```typescript
/**
 * Resolves all apps that need to be installed for a given app.
 * Uses topological sort to determine install order.
 */
function resolveDependencies(appId: string, allApps: AppDefinition[]): {
  toInstall: string[];
  order: string[];
  hasConflict: boolean;
  conflicts: string[];
} {
  const toInstall = new Set<string>();
  const order: string[] = [];
  
  function visit(id: string, visiting: Set<string>, visited: Set<string>) {
    // Cycle detection
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected: ${id}`);
    }
    if (visited.has(id)) return;
    
    visiting.add(id);
    
    const app = allApps.find(a => a.id === id);
    if (!app) return;
    
    // Visit dependencies first
    for (const dep of app.requires) {
      visit(dep, visiting, visited);
    }
    
    visiting.delete(id);
    visited.add(id);
    toInstall.add(id);
    order.push(id);
  }
  
  visit(appId, new Set(), new Set());
  
  return {
    toInstall: Array.from(toInstall),
    order,
    hasConflict: false,
    conflicts: []
  };
}
```

### 7.2 Validation Rules

1. **Cannot uninstall if required by another app**
   ```typescript
   function canUninstall(appId: string, installedApps: string[]): {can: boolean; reason?: string} {
     const app = getApp(appId);
     const dependents = app.requiredBy;
     const activeDependents = dependents.filter(id => installedApps.includes(id));
     
     if (activeDependents.length > 0) {
       return {
         can: false,
         reason: `Required by: ${activeDependents.join(", ")}`
       };
     }
     return { can: true };
   }
   ```

2. **Package install requires all core apps**
   ```typescript
   function installPackage(packageId: string): string[] {
     const pkg = getPackage(packageId);
     return [
       ...pkg.coreApps,           // All core apps
       ...pkg.optionalApps         // User can deselect these
     ];
   }
   ```

---

## 8. Feature Flag Utilities

### 8.1 Centralized Check Functions

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
 * Check if package is installed
 */
export async function isPackageInstalled(orgId: string, packageId: string): Promise<boolean> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { packages: true }
  });
  return org?.packages?.includes(packageId) ?? false;
}

/**
 * Check if Business OS is installed (convenience)
 */
export async function hasBusinessOS(orgId: string): Promise<boolean> {
  return isPackageInstalled(orgId, "business-os");
}

/**
 * Check if Project OS is installed
 */
export async function hasProjectOS(orgId: string): Promise<boolean> {
  return isPackageInstalled(orgId, "project-os");
}

/**
 * Get apps for dashboard display based on installed packages
 */
export async function getDashboardSections(orgId: string): Promise<DashboardSection[]> {
  const [packages, apps] = await Promise.all([
    getInstalledPackages(orgId),
    getInstalledApps(orgId)
  ]);

  const sections: DashboardSection[] = [];

  // Always show these
  sections.push({ type: "stats", apps: ["projects", "tasks"] });
  sections.push({ type: "today-focus" });
  sections.push({ type: "team" });

  // Conditional based on packages
  if (packages.includes("project-os")) {
    sections.push({ type: "projects" });
  }

  if (packages.includes("business-os")) {
    sections.push({ type: "stats", apps: ["orders", "leads"] });
    sections.push({ type: "clients" });
  }

  if (packages.includes("human-capital-os")) {
    sections.push({ type: "payouts" });
  }

  return sections;
}
```

### 8.2 React Hook

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
    hasPackage: (id: string) => /* check packages */,
    isLoading: loading
  };
}
```

---

## 9. Route Protection

### 9.1 Middleware Logic

```typescript
// middleware.ts or route guard component

export async function checkAppAccess(
  appId: string,
  organizationId: string
): Promise<{allowed: boolean; redirectTo?: string}> {
  const installedApps = await getInstalledApps(organizationId);
  
  if (!installedApps.includes(appId)) {
    return {
      allowed: false,
      redirectTo: "/apps"  // Prompt to install
    };
  }
  
  return { allowed: true };
}

// Usage in page
export async function getServerSideProps(context) {
  const { appId } = context.params;
  const session = await getSession();
  
  const access = await checkAppAccess(appId, session.user.organizationId);
  
  if (!access.allowed) {
    return {
      redirect: {
        destination: access.redirectTo,
        permanent: false
      }
    };
  }
  
  return { props: {} };
}
```

### 9.2 App Route Guard Component

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
    if (!isLoading && !hasApp(appId)) {
      router.push("/apps");
    }
  }, [isLoading, hasApp, appId, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasApp(appId)) {
    return fallback || <AppNotInstalled appId={appId} />;
  }

  return <>{children}</>;
}
```

---

## 10. Dashboard Isolation

### 10.1 Conditional Rendering Map

```typescript
// Dashboard sections based on installed apps

interface DashboardConfig {
  sections: SectionConfig[];
}

const getDashboardConfig = (installedApps: string[], packages: string[]): DashboardConfig => {
  const sections: SectionConfig[] = [];

  // ALWAYS SHOW (Core)
  sections.push({
    id: "greeting",
    type: "greeting"
  });

  sections.push({
    id: "stats-overview",
    type: "stats-grid",
    apps: ["projects", "tasks"]  // Always show project stats
  });

  // CONDITIONAL
  if (installedApps.includes("leads")) {
    sections.push({
      id: "stats-leads",
      type: "stats-card",
      app: "leads"
    });
  }

  if (installedApps.includes("orders")) {
    sections.push({
      id: "stats-orders", 
      type: "stats-card",
      app: "orders"
    });
  }

  if (installedApps.includes("projects")) {
    sections.push({
      id: "today-focus",
      type: "today-tasks"
    });

    sections.push({
      id: "upcoming",
      type: "upcoming-tasks"
    });
  }

  if (installedApps.includes("clients") || packages.includes("business-os")) {
    sections.push({
      id: "recent-clients",
      type: "recent-list",
      app: "clients"
    });
  }

  // ALWAYS SHOW (Core)
  sections.push({
    id: "team",
    type: "team-overview"
  });

  sections.push({
    id: "recent-activity",
    type: "activity-feed"
  });

  return { sections };
};
```

### 10.2 Dashboard Page Changes

```typescript
// dashboard/page.tsx - Simplified structure

export default async function DashboardPage() {
  const session = await auth();
  const orgId = session.user.organizationId;
  
  // Get installed apps ONCE
  const { apps: installedApps, packages } = await getOrganizationApps(orgId);
  
  // Get data based on installed apps
  const [projectStats, taskStats] = await Promise.all([
    installedApps.includes("projects") ? getProjectStats(orgId) : null,
    installedApps.includes("tasks") ? getTaskStats(orgId) : null,
  ]);

  const orderStats = installedApps.includes("orders") ? await getOrderStats(orgId) : null;
  const leadStats = installedApps.includes("leads") ? await getLeadStats(orgId) : null;

  // Only fetch business data if business-os is installed
  const hasBusiness = packages.includes("business-os");

  return (
    <div className="min-h-screen">
      {/* Stats Grid - Conditional */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Always show */}
        <StatsCard icon="projects" count={projectStats.total} />
        <StatsCard icon="tasks" count={taskStats.open} />
        
        {/* Conditional - only if installed */}
        {orderStats && (
          <StatsCard icon="orders" count={orderStats.active} />
        )}
        
        {leadStats && (
          <StatsCard icon="leads" count={leadStats.open} />
        )}
      </div>

      {/* Quick Actions - Conditional */}
      <QuickActions>
        <QuickAction href="/projects" icon="folder">Projects</QuickAction>
        
        {/* Only show if leads is installed */}
        {installedApps.includes("leads") && (
          <QuickAction href="/leads" icon="users">Leads</QuickAction>
        )}
        
        {/* Only show if orders is installed */}
        {installedApps.includes("orders") && (
          <QuickAction href="/orders" icon="clipboard">Orders</QuickAction>
        )}
        
        <QuickAction href="/team" icon="team">Team</QuickAction>
      </QuickActions>
      
      {/* ... rest of dashboard */}
    </div>
  );
}
```

---

## 11. Sidebar Changes

### 11.1 Navigation with App Check

```typescript
// sidebar.tsx - Updated navigation array

const navigation = [
  // Always visible
  { id: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "projects", name: "Projects", href: "/projects", icon: FolderKanban, requiresApp: "projects" },
  { id: "board", name: "Board", href: "/board", icon: Target, requiresApp: "board", roles: ["EDITOR"] },
  { id: "team", name: "Team", href: "/team", icon: Users, requiresApp: "team" },
  { id: "payouts", name: "Payouts", href: "/payouts", icon: Wallet, requiresApp: "payouts", roles: ["OWNER", "MANAGER"] },

  // Business OS - only if installed
  { id: "clients", name: "Clients", href: "/clients", requiresApp: "clients", roles: ["OWNER", "MANAGER"] },
  { id: "orders", name: "Orders", href: "/orders", requiresApp: "orders", roles: ["OWNER", "MANAGER"] },
  { id: "leads", name: "Leads", href: "/leads", requiresApp: "leads", roles: ["OWNER", "MANAGER"] },
  { id: "invoices", name: "Invoices", href: "/invoices", requiresApp: "invoices", roles: ["OWNER", "MANAGER"] },

  // Project OS Optional Apps
  { id: "scriptwriter", name: "Scriptwriter", href: "/scriptwriter", requiresApp: "scriptwriter", roles: ["OWNER", "MANAGER"] },
  { id: "storyboard", name: "Storyboard", href: "/storyboard", requiresApp: "storyboard", roles: ["OWNER", "MANAGER"] },

  // Settings & Admin
  { id: "apps", name: "App Store", href: "/apps", icon: ShoppingCart, roles: ["OWNER"] },
  { id: "settings", name: "Settings", href: "/settings", icon: Settings },
];
```

### 11.2 Filter Logic

```typescript
function filterNavigation(nav: NavItem[], userRole: string, installedApps: string[]) {
  return nav.filter(item => {
    // Role check
    if (item.roles && !item.roles.includes(userRole)) {
      return false;
    }
    
    // App dependency check - USE INSTALLED APPS, NOT FEATURES.TS
    if (item.requiresApp && !installedApps.includes(item.requiresApp)) {
      return false;
    }
    
    return true;
  });
}
```

---

## 12. Implementation Plan

### Phase 1: Foundation (This PR)

1. **Create `packages.ts`** - Package definitions
2. **Update `apps.ts`** - Add dependency fields
3. **Create `app-resolver.ts`** - Dependency resolution utility
4. **Create `app-checks.ts`** - Centralized feature flags
5. **Update `features.ts`** - Deprecate old constants, use new system
6. **Update Dashboard** - Conditional rendering
7. **Update Sidebar** - App-based filtering
8. **Update Schema** - (Optional, may not need changes)

### Phase 2: App Store UI (Next PR)

1. **Create `/apps` page** - Browse packages
2. **Create `/apps/[packageId]` page** - Package detail with optional apps
3. **Create API endpoints** - Install/uninstall apps
4. **Create App Not Installed page**

### Phase 3: Route Protection (Next PR)

1. **Middleware for protected routes**
2. **App route guard component**
3. **Better 404/error pages**

---

## 13. Breaking Changes

### 13.1 Features.ts Deprecation

The following need to be updated:

```typescript
// OLD (deprecated)
export const CORE_APPS = ["project-os", "human-capital-os"];
export const OPTIONAL_APPS = ["business-os", "lead-management", "odoo-sync"];

// NEW - Import from apps.ts
import { APPS, getAppsByCategory } from "./apps";
import { PACKAGES } from "./packages";

// Use these instead
export const CORE_PACKAGES = ["project-os", "human-capital-os"];
```

### 13.2 Database Field

`organization.apps` still works, but now stores individual app IDs, not package IDs.

---

## 14. Testing Strategy

### 14.1 Unit Tests

```typescript
describe("DependencyResolver", () => {
  test("resolves direct dependency", () => {
    const result = resolveDependencies("orders", APPS);
    expect(result.toInstall).toContain("clients");
    expect(result.toInstall).toContain("orders");
  });

  test("throws on circular dependency", () => {
    expect(() => resolveDependencies("app-with-cycle", APPS)).toThrow();
  });
});

describe("canUninstall", () => {
  test("returns false if app is required by another", () => {
    const result = canUninstall("clients", ["clients", "orders"]);
    expect(result.can).toBe(false);
    expect(result.reason).toContain("orders");
  });
});
```

### 14.2 Integration Tests

```typescript
describe("Dashboard Isolation", () => {
  test("solo user with only project-os does not see leads", () => {
    // Setup: org with project-os only
    const org = createOrg({ packages: ["project-os"], apps: ["projects", "tasks", "board", "team"] });
    
    // Render dashboard
    const dashboard = renderDashboard(org);
    
    // Assert: no leads section
    expect(dashboard.queryByText("Leads")).toBeNull();
  });
});
```

---

## 15. Files to Create/Modify

### Create
- `apps/web/src/lib/packages.ts` - Package definitions
- `apps/web/src/lib/app-resolver.ts` - Dependency resolver
- `apps/web/src/lib/app-checks.ts` - Centralized checks
- `docs/ARCHITECTURE/MODULAR_APP_SYSTEM.md` - This spec

### Modify
- `apps/web/src/lib/apps.ts` - Add dependency fields
- `apps/web/src/lib/features.ts` - Update to use new system
- `apps/web/src/app/(dashboard)/dashboard/page.tsx` - Conditional rendering
- `apps/web/src/components/dashboard/sidebar.tsx` - App filtering
- `apps/web/prisma/schema.prisma` - (if needed)

### Future
- `apps/web/src/app/(dashboard)/apps/page.tsx` - App Store UI
- `apps/web/src/app/api/apps/route.ts` - Install/uninstall API

---

## Appendix A: Default Installation

### Fresh Install (Solo Plan)
```
packages: ["project-os", "human-capital-os"]
apps: [
  // Project OS core
  "projects", "stages", "tasks", "board",
  // Human Capital OS core
  "team", "payouts",
  // Core
  "dashboard", "settings", "profile"
]
```

### After Installing Business OS
```
packages: ["project-os", "human-capital-os", "business-os"]
apps: [
  // Previous apps...
  // Business OS core
  "clients", "leads", "orders"
]
```

---

## Appendix B: App ID Reference

### Core
- `dashboard`, `settings`, `profile`

### Project OS
- `projects`, `stages`, `tasks`, `board`
- `scriptwriter`, `storyboard`, `shotlist`, `timeline-notes`
- `scheduling`, `locations`, `dailies`, `vfx-tracker`
- `deliverables`, `music-sound`

### Human Capital OS
- `team`, `payouts`
- `attendance`, `payroll`, `recruitment`

### Business OS
- `clients`, `leads`, `orders`, `invoices`
- `client-portal`, `odoo-sync`, `analytics`, `branding-kit`

---

*Last updated: 2026-07-23*
