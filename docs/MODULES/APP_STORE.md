# APP_STORE.md

**Status:** Draft v0.1 (Proposed for Phase 2)

**Depends On:**
- FOUNDATION.md
- MVP_ROADMAP.md
- PLANNING/IMPLEMENTATION-PLAN.md

**Phase:** Phase 2+

---

# Purpose

Zenvas follows a **modular OS architecture** — like Odoo Apps, DaVinci Resolve panels, or iPhone App Store. This document defines the Module Manager (App Store) — how users browse, install, upgrade, and manage modules across the platform.

The App Store is the central hub where organizations customize their Zenvas experience based on their business needs.

---

# The Problem It Solves

```
BEFORE (Monolithic):
All features installed by default → Complex UI → Users overwhelmed → Bad adoption

AFTER (Modular OS):
Organization chooses what they need → Lean, focused UI → Better adoption → Happy users
```

---

# Module Manager Architecture

## Design Principles

| Principle | Description |
|-----------|-------------|
| **Core is Sacred** | Core modules cannot be uninstalled. They form the foundation. |
| **Opt-in by Default** | Not everything is installed. Organizations choose. |
| **Dependency Aware** | Installing a module auto-installs its dependencies. |
| **Zero Latency** | Module loading doesn't slow down the app. |
| **Reversible** | Modules can be uninstalled without breaking the system. |

## Module States

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MODULE LIFECYCLE                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │  AVAILABLE  │───▶│ INSTALLED   │───▶│   ACTIVE    │                │
│  │             │    │             │    │             │                │
│  │ Listed in   │    │ Downloaded  │    │ Running &   │                │
│  │ App Store,  │    │ to org,    │    │ visible in  │                │
│  │ not yet     │    │ can be     │    │ dashboard   │                │
│  │ installed   │    │ activated  │    │             │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
│        │                  │                   │                        │
│        │                  │                   │                        │
│        │                  ▼                   │                        │
│        │           ┌─────────────┐            │                        │
│        │           │ UNINSTALLED │            │                        │
│        │           │             │            │                        │
│        │           │ Removed but │            │                        │
│        │           │ data kept   │            │                        │
│        │           └─────────────┘            │                        │
│        │                                       │                        │
│        │◀──────────────────────────────────────┘                        │
│        │            (Can re-install)                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# App Store UI Design

## Module Manager Page (`/settings/modules` or `/app-store`)

### Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MODULE MANAGER                                              [Search 🔍]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  [Tabs: All | Business | Project | Creative | Collaboration]    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ FILTER:                                                          │    │
│  │ [✓] Show Installed  [ ] Show Available  [ ] Show Coming Soon   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │ ╔═══════════════╗   │  │ ╔═══════════════╗   │                      │
│  │ ║   [ICON]     ║   │  │ ║   [ICON]     ║   │                      │
│  │ ║ Budget Track ║   │  │ ║ Communication ║   │                      │
│  │ ║   Tracking   ║   │  │ ║    Hub        ║   │                      │
│  │ ╚═══════════════╝   │  │ ╚═══════════════╝   │                      │
│  │ Business • v1.0     │  │ Collaboration • v1.0│                      │
│  │ ⭐⭐⭐⭐⭐ (24)        │  │ ⭐⭐⭐⭐⭐ (18)        │                      │
│  │                       │  │                       │                      │
│  │ [Installed] [Open]    │  │ [Available] [Install]  │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │ ╔═══════════════╗   │  │ ╔═══════════════╗   │                      │
│  │ ║   [ICON]     ║   │  │ ║   [ICON]     ║   │                      │
│  │ ║  Script     ║   │  │ ║  Analytics   ║   │                      │
│  │ ║  Writer     ║   │  │ ║  Dashboard   ║   │                      │
│  │ ╚═══════════════╝   │  │ ╚═══════════════╝   │                      │
│  │ Creative • v2.1     │  │ Business • v1.0       │                      │
│  │ ⭐⭐⭐⭐ (12)         │  │ ⭐⭐⭐⭐⭐ (31)        │                      │
│  │                       │  │                       │                      │
│  │ [Coming Soon]         │  │ [Available] [Install]  │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Card Component

```
┌─────────────────────────────────────────┐
│  ┌─────┐                               │
│  │     │  Module Name                  │
│  │ ICON│  Category • v1.0              │
│  │     │                               │
│  └─────┘                               │
│                                         │
│  Short description of what this        │
│  module does in one or two lines.      │
│                                         │
│  ⭐⭐⭐⭐⭐ (24 installs)               │
│                                         │
│  [STATUS BUTTON]                        │
│  ├── Installed → [Open] [Uninstall]    │
│  ├── Available → [Install]             │
│  ├── Coming Soon → [Notify Me]         │
│  └── Update Available → [Update]       │
└─────────────────────────────────────────┘
```

## Module Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  ┌─────┐                                                                 │
│  │     │  Budget Tracking                                                │
│  │ ICON│  Business Module • v1.0 • by Zenvas                             │
│  │     │                                                                 │
│  └─────┘                                                                 │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ## Description                                                          │
│  Track production costs, manage line items, and monitor budget           │
│  utilization across projects. Perfect for agencies managing multiple     │
│  clients and complex productions.                                       │
│                                                                          │
│  ## Features                                                            │
│  ✓ Real-time budget tracking                                            │
│  ✓ Line item management                                                 │
│  ✓ Scene change impact analysis                                         │
│  ✓ Multi-currency support                                               │
│  ✓ Export to PDF/Excel                                                  │
│                                                                          │
│  ## Screenshots                                                         │
│  ┌────────────┐ ┌────────────┐                                          │
│  │  [SCREEN]  │ │  [SCREEN]  │                                          │
│  └────────────┘ └────────────┘                                          │
│                                                                          │
│  ## Dependencies                                                        │
│  Requires: Tasks Module (already installed ✓)                            │
│                                                                          │
│  ## Reviews                                                             │
│  ⭐⭐⭐⭐⭐ 4.8 (24 reviews)                                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Cancel]  [Install Free]                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Module Data Model

## Database Schema

```prisma
// Module Registry (Platform-level)
model Module {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique  // e.g., "budget-tracking"
  description     String
  icon            String   // emoji or icon name
  category        ModuleCategory
  version         String   // semver
  status          ModuleStatus
  
  // Module metadata
  developer       String   @default("Zenvas")
  documentation   String? // URL to docs
  changelog       String?
  
  // Module configuration
  dependencies    String[] // module slugs
  settingsSchema  Json?   // JSON Schema for module settings
  
  // Stats
  installCount    Int      @default(0)
  rating          Float    @default(0)
  reviewCount     Int      @default(0)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  installations   OrganizationModule[]
}

enum ModuleCategory {
  CORE        // Always installed
  BUSINESS    // CRM, Invoicing, etc.
  PROJECT     // Tasks, Delivery, etc.
  CREATIVE    // Script, Storyboard, etc.
  COLLABORATION  // Chat, Video, etc.
  INTEGRATION // Odoo, Frame.io, etc.
}

enum ModuleStatus {
  AVAILABLE    // In App Store, can install
  COMING_SOON  // Announced but not ready
  BUNDLED      // Comes with subscription
  DEPRECATED   // No longer supported
}

// Organization's Module Installation
model OrganizationModule {
  id            String   @id @default(cuid())
  
  // Relations
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  moduleId       String
  module         Module       @relation(fields: [moduleId], references: [id])
  
  // Installation state
  status        InstallationStatus
  
  // Version info
  installedVersion String
  latestVersion    String?   // For update notifications
  
  // Settings (module-specific, stored as JSON)
  settings      Json?     @default("{}")
  
  // Timestamps
  installedAt   DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  uninstalledAt DateTime?
  
  @@unique([organizationId, moduleId])
}

enum InstallationStatus {
  INSTALLED   // Downloaded, part of org
  ACTIVE      // Running, visible in UI
  DISABLED    // Installed but turned off
  UNINSTALLED // Removed (data kept)
}
```

---

# API Contracts

## Module Manager Endpoints

### GET `/api/modules`
List all available modules in the App Store.

```typescript
// Request
GET /api/modules?category=business&status=available

// Response 200 OK
{
  "modules": [
    {
      "id": "mod_budget_tracking",
      "name": "Budget Tracking",
      "slug": "budget-tracking",
      "description": "Track production costs and manage line items",
      "icon": "💰",
      "category": "BUSINESS",
      "version": "1.0.0",
      "status": "AVAILABLE",
      "developer": "Zenvas",
      "rating": 4.8,
      "reviewCount": 24,
      "installCount": 156,
      "dependencies": ["tasks"],
      "isInstalled": false,
      "isUpdateAvailable": false
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 45
  }
}
```

### GET `/api/modules/[slug]`
Get detailed module information.

```typescript
// Response 200 OK
{
  "id": "mod_budget_tracking",
  "name": "Budget Tracking",
  "slug": "budget-tracking",
  "description": "Track production costs and manage line items across projects...",
  "longDescription": "Full markdown description...",
  "icon": "💰",
  "category": "BUSINESS",
  "version": "1.0.0",
  "status": "AVAILABLE",
  "developer": "Zenvas",
  "documentation": "https://docs.zenvas.com/budget-tracking",
  "changelog": "## v1.0.0\n- Initial release...",
  "screenshots": [
    "/modules/budget-tracking/screenshot-1.png",
    "/modules/budget-tracking/screenshot-2.png"
  ],
  "features": [
    "Real-time budget tracking",
    "Line item management",
    "Scene change impact analysis"
  ],
  "dependencies": [
    { "slug": "tasks", "name": "Tasks Module", "isInstalled": true }
  ],
  "stats": {
    "rating": 4.8,
    "reviewCount": 24,
    "installCount": 156
  },
  "isInstalled": false,
  "installedVersion": null,
  "isUpdateAvailable": false
}
```

### GET `/api/org/modules`
List modules installed for the current organization.

```typescript
// Response 200 OK
{
  "installed": [
    {
      "id": "inst_001",
      "module": { "slug": "tasks", "name": "Tasks Module", "icon": "📋" },
      "status": "ACTIVE",
      "installedVersion": "1.2.0",
      "latestVersion": "1.2.0",
      "installedAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "inst_002",
      "module": { "slug": "budget-tracking", "name": "Budget Tracking", "icon": "💰" },
      "status": "INSTALLED",
      "installedVersion": "1.0.0",
      "latestVersion": "1.1.0",
      "isUpdateAvailable": true,
      "installedAt": "2026-06-01T14:20:00Z"
    }
  ],
  "available": [
    // Modules available to install
  ]
}
```

### POST `/api/org/modules/install`
Install a module for the organization.

```typescript
// Request
{
  "moduleSlug": "budget-tracking"
}

// Response 201 Created
{
  "success": true,
  "installation": {
    "id": "inst_003",
    "module": { "slug": "budget-tracking", "name": "Budget Tracking" },
    "status": "INSTALLED",
    "installedVersion": "1.0.0",
    "installedAt": "2026-07-21T10:00:00Z"
  },
  "dependenciesInstalled": [
    // Any dependencies that were auto-installed
  ],
  "setupRequired": true,
  "setupUrl": "/settings/modules/budget-tracking/setup"
}

// Response 400 Bad Request (dependency not met)
{
  "error": "DEPENDENCY_NOT_MET",
  "message": "Cannot install Budget Tracking without Tasks Module",
  "requiredDependencies": [
    { "slug": "tasks", "name": "Tasks Module", "installUrl": "/api/org/modules/install" }
  ]
}
```

### POST `/api/org/modules/[slug]/activate`
Activate an installed module (make it visible in UI).

```typescript
// Response 200 OK
{
  "success": true,
  "module": {
    "slug": "budget-tracking",
    "status": "ACTIVE"
  },
  "navigationUpdated": true,
  "newRoutes": ["/budget", "/settings/budget"]
}
```

### POST `/api/org/modules/[slug]/deactivate`
Deactivate a module (hide from UI but keep installed).

```typescript
// Response 200 OK
{
  "success": true,
  "module": {
    "slug": "budget-tracking",
    "status": "DISABLED"
  }
}
```

### POST `/api/org/modules/[slug]/update`
Update a module to the latest version.

```typescript
// Response 200 OK
{
  "success": true,
  "module": {
    "slug": "budget-tracking",
    "installedVersion": "1.1.0",
    "previousVersion": "1.0.0"
  },
  "breakingChanges": [],
  "migrationRequired": false
}
```

### DELETE `/api/org/modules/[slug]`
Uninstall a module (data is kept).

```typescript
// Response 200 OK
{
  "success": true,
  "message": "Budget Tracking has been uninstalled. Your data has been preserved.",
  "dataExportUrl": "/api/org/modules/budget-tracking/export"
}
```

### GET `/api/org/modules/[slug]/settings`
Get module settings for the organization.

```typescript
// Response 200 OK
{
  "moduleSlug": "budget-tracking",
  "settings": {
    "defaultCurrency": "IDR",
    "alertThreshold": 80,
    "autoArchiveProjects": true
  },
  "schema": {
    // JSON Schema for settings form
  }
}
```

### PATCH `/api/org/modules/[slug]/settings`
Update module settings.

```typescript
// Request
{
  "defaultCurrency": "USD",
  "alertThreshold": 90
}

// Response 200 OK
{
  "success": true,
  "settings": {
    "defaultCurrency": "USD",
    "alertThreshold": 90,
    "autoArchiveProjects": true
  }
}
```

---

# Module Structure

## Module File Organization

```
modules/
└── budget-tracking/
    ├── module.json          # Module manifest
    ├── package.json         # NPM dependencies
    ├── src/
    │   ├── index.ts         # Module entry point
    │   ├── routes/          # API routes (if any)
    │   │   ├── route.ts
    │   │   └── [id]/route.ts
    │   ├── pages/          # UI pages (optional)
    │   │   ├── page.tsx
    │   │   └── settings/page.tsx
    │   ├── components/     # Module-specific components
    │   │   ├── BudgetCard.tsx
    │   │   └── LineItemForm.tsx
    │   ├── hooks/          # Custom hooks
    │   └── utils/          # Utilities
    ├── prisma/
    │   └── migrations/     # Module-specific DB migrations
    ├── docs/
    │   ├── README.md
    │   └── CHANGELOG.md
    └── tests/
        └── budget-tracking.test.ts
```

## Module Manifest (`module.json`)

```json
{
  "id": "mod_budget_tracking",
  "name": "Budget Tracking",
  "slug": "budget-tracking",
  "version": "1.0.0",
  "description": "Track production costs and manage line items",
  "icon": "💰",
  "category": "BUSINESS",
  "developer": {
    "name": "Zenvas",
    "website": "https://zenvas.com"
  },
  "dependencies": {
    "required": ["tasks"],
    "optional": []
  },
  "routes": {
    "main": "/budget",
    "settings": "/settings/modules/budget-tracking"
  },
  "navigation": {
    "section": "business",
    "label": "Budget",
    "icon": "💰",
    "permission": "VIEW_BUDGET"
  },
  "permissions": [
    "VIEW_BUDGET",
    "MANAGE_BUDGET",
    "EXPORT_BUDGET"
  ],
  "settings": {
    "schema": "./schemas/settings.json",
    "defaultValues": {
      "defaultCurrency": "IDR",
      "alertThreshold": 80
    }
  },
  "database": {
    "migrations": "./prisma/migrations"
  },
  "api": {
    "prefix": "/api/modules/budget-tracking",
    "routes": "./src/routes"
  }
}
```

---

# Module Loading Architecture

## How Modules Are Loaded

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ZENVAS CORE (Always Running)                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. App boots → Load Organization config                                │
│  2. Fetch installed modules from OrganizationModule table               │
│  3. Load module manifests for each ACTIVE module                        │
│  4. Register routes from modules (/budget, /settings/modules/...)       │
│  5. Register navigation items                                           │
│  6. Mount module React components                                       │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │   CORE      │  │   MODULE   │  │   MODULE   │                     │
│  │  (Auth,    │  │   (Tasks)  │  │  (Budget)  │                     │
│  │   Orgs)    │  │   Active   │  │   Active   │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Loader (Conceptual)

```typescript
// lib/module-loader.ts

interface ModuleLoader {
  loadOrganizationModules(orgId: string): Promise<LoadedModule[]>;
  registerModuleRoutes(module: LoadedModule, app: NextApp): void;
  registerNavigation(module: LoadedModule): void;
  initializeModule(module: LoadedModule): Promise<void>;
}

async function loadOrganizationModules(orgId: string) {
  // 1. Get org's installed modules
  const installations = await db.organizationModule.findMany({
    where: { organizationId: orgId, status: 'ACTIVE' },
    include: { module: true }
  });
  
  // 2. Load each module's manifest
  const modules = await Promise.all(
    installations.map(async (inst) => {
      const manifest = await loadModuleManifest(inst.module.slug);
      return { ...inst, manifest };
    })
  );
  
  // 3. Resolve dependencies
  const resolved = resolveDependencyOrder(modules);
  
  return resolved;
}

function resolveDependencyOrder(modules: LoadedModule[]): LoadedModule[] {
  // Topological sort based on dependencies
  const sorted: LoadedModule[] = [];
  const visited = new Set<string>();
  
  function visit(module: LoadedModule) {
    if (visited.has(module.id)) return;
    visited.add(module.id);
    
    // Visit dependencies first
    for (const depSlug of module.manifest.dependencies.required) {
      const dep = modules.find(m => m.slug === depSlug);
      if (dep) visit(dep);
    }
    
    sorted.push(module);
  }
  
  modules.forEach(visit);
  return sorted;
}
```

---

# Module Security

## Sandboxed Execution

Modules run in isolation to prevent security issues:

```typescript
interface ModuleSandbox {
  // Modules cannot access other modules' data directly
  // All cross-module communication goes through defined APIs
  // Permissions are enforced at the API layer
  
  // Module code runs server-side only
  // No arbitrary code execution from module UI
  
  // Module can only access:
  // - Its own database tables
  // - Organization data it has permission for
  // - Core APIs via defined interfaces
}
```

## Permission Enforcement

```typescript
// Modules define required permissions in manifest
const MODULE_PERMISSIONS = {
  'budget-tracking': ['VIEW_BUDGET', 'MANAGE_BUDGET', 'EXPORT_BUDGET'],
  'communication': ['MANAGE_CHANNELS', 'VIEW_MESSAGES']
};

// Core permission system checks module permissions
async function checkModuleAccess(userId: string, moduleSlug: string, action: string) {
  const user = await getUser(userId);
  const module = await getModule(moduleSlug);
  const requiredPermission = `${moduleSlug.toUpperCase()}_${action.toUpperCase()}`;
  
  return user.permissions.includes(requiredPermission);
}
```

---

# Future: Community Modules

## Vision for Phase 3+

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMMUNITY MODULE ECOSYSTEM                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Phase 3+ allows third-party developers to create and publish modules.   │
│                                                                          │
│  ├── Module Marketplace (monetization)                                   │
│  ├── Developer SDK & Documentation                                       │
│  ├── Module Review Process                                               │
│  ├── Revenue Sharing Model                                               │
│  └── Sandbox Limits (CPU, RAM, API calls)                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

## Phase 2 Tasks

- [ ] Create `Module` and `OrganizationModule` database models
- [ ] Build Module Registry seed data (Phase 1-2 modules)
- [ ] Implement `/api/modules/*` endpoints
- [ ] Create Module Manager page UI (`/settings/modules`)
- [ ] Build Module Card component
- [ ] Build Module Detail Modal
- [ ] Implement install/uninstall flow
- [ ] Implement module activation/deactivation
- [ ] Add dependency resolution
- [ ] Create module loading system
- [ ] Add module settings UI
- [ ] Implement module update mechanism
- [ ] Add navigation registration
- [ ] Write user-facing docs

## Phase 3+ Tasks

- [ ] Module review/approval system
- [ ] Community module marketplace
- [ ] Developer SDK
- [ ] Module monetization
- [ ] Module analytics dashboard

---

# Appendix: Phase 2 Module List

See `MODULE_REGISTRY.md` for the complete list of modules planned for Phase 2+.

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
