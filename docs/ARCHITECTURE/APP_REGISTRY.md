# APP_REGISTRY.md - Zenvas App Registry

**Status:** Final v1.0
**Date:** 2026-07-24
**Supersedes:** `docs/MODULES/APP_STORE.md`, `docs/MODULES/MODULE_REGISTRY.md`

---

## Overview

This is the **single source of truth** for the Zenvas App model. All other documentation should reference this file.

---

## App Schema

```typescript
interface App {
  id: string;                    // Unique identifier, e.g., "scriptwriter"
  name: string;                  // Display name, e.g., "Scriptwriter"
  description: string;           // Short description for cards
  longDescription?: string;      // Detailed description for App Store
  features?: string[];           // Feature list for App Store
  
  icon: string;                  // Emoji or icon class
  
  category: AppCategory;         // Store shelf label (see D11)
  buildType: "native" | "integration"; // D6 - visible to user
  alwaysEnabled: boolean;        // D10 - cannot be disabled
  
  // Installation
  dependencies: string[];         // D12a - auto-install these when this App is installed
  partOf: string;                // D12b - UI grouping/bundle metadata only
  isCore: boolean;               // true = mandatory-within-bundle (not globally mandatory)
  isStandalone: boolean;         // true = can install without a bundle

  // Access
  requiredRole: "OWNER" | "MANAGER" | "EDITOR" | "PRODUCER" | "ALL";
  
  // Implementation
  isImplemented: boolean;        // false = Coming Soon
  route: string;                 // Main route
  settingsRoute?: string;        // Optional settings page
}
```

### App Categories (Store Shelves Only)

Categories are **store shelf labels** — they help users browse, but users do not "install" a category.

| Category | Description |
|----------|-------------|
| `core` | Dashboard, Settings, Profile — always present |
| `project-os` | Project management tools (Scriptwriter, Storyboard, etc.) |
| `human-capital-os` | Team management (Team, Payouts, etc.) |
| `business-os` | Client/business tools (Clients, Orders, etc.) |
| `ai-content-os` | AI content production tools |
| `collaboration` | Chat, video calls, file sharing |
| `integration` | Third-party integrations (Odoo, etc.) |

### Build Type (D6)

Every non-core App must declare its `buildType`, which is **displayed to users** in the App Store:

| Build Type | Badge Example | Meaning |
|------------|--------------|---------|
| `native` | "Built-in" | Built by Zenvas |
| `integration` | "Powered by Odoo" | Integrates with external service |

### Always-Enabled Apps (D10)

These Apps **cannot be disabled** under any circumstances:

- Dashboard
- Settings
- Profile
- Projects
- Tasks
- Team

Additionally, these platform capabilities exist but are **not listed in the App Store** (always present):
- Auth
- Organization
- Brand
- Roles

### Packages/Bundles (D12b)

Packages (e.g., "Business Suite") are **curated UI shortcuts** — they select multiple Apps at once for convenience. They are NOT a prerequisite layer; only `dependencies[]` determines auto-install behavior.

---

## Platform Capabilities (Not Apps)

These are platform capabilities that are always present but are not shown in the App Store:

- **Auth** — User authentication and session management
- **Organization** — Multi-tenant container
- **Brand** — Identity within an organization
- **Roles** — RBAC system (Owner, Manager, Producer, Editor)

---

## Dependency Resolution (D12a)

When an App is installed, its `dependencies[]` are automatically installed:

```typescript
// Example: Installing Storyboard auto-installs Scriptwriter
const storyboard: App = {
  id: "storyboard",
  dependencies: ["scriptwriter"],  // Scriptwriter installed first
  // ...
};
```

### Dependency Rules

1. **No circular dependencies** — Apps cannot depend on each other in a loop
2. **Dependencies auto-install** — User does not need to manually install each dependency
3. **Uninstall blocked if dependents exist** — Cannot uninstall an App if another installed App depends on it

---

## Collaboration Apps

### Team Chat (IMPLEMENTED)

| Field | Value |
|-------|-------|
| **ID** | `chat` |
| **Name** | Team Chat |
| **Description** | Internal team messaging — channels, direct messages, presence. |
| **Category** | `collaboration` |
| **Build Type** | `native` ("Built-in") |
| **Route** | `/chat` |
| **Dependencies** | None |
| **isCore** | `false` |
| **isStandalone** | `true` |
| **alwaysEnabled** | `false` (optional app, owner can enable via App Store) |
| **isImplemented** | `true` |

```typescript
const chat: App = {
  id: "chat",
  name: "Team Chat",
  description: "Internal team messaging — channels, direct messages, presence.",
  category: "collaboration",
  route: "/chat",
  buildType: "native",
  dependencies: [],
  isCore: false,
  isStandalone: true,
  isImplemented: true,
  requiredRole: "ALL",
  alwaysEnabled: false,
};
```

**Note:** Team Chat is distinct from the Omnichannel Inbox (`docs/MODULES/OMNICHANNEL_INBOX.md`). Team Chat handles **internal** communication between team members, while Omnichannel Inbox aggregates **external** messages from clients (Facebook, WhatsApp, website chat).

---

## App Store Display

The App Store UI must:

1. **Show build type badge** for every non-core App
2. **Hide always-enabled Apps from install/uninstall** — they have no toggle
3. **Group by category** for browsing (not installation)
4. **Show curated bundles** as shortcuts, not requirements

### Example App Card

```
┌─────────────────────────────────────────┐
│  ✍️  Scriptwriter                    │
│                                         │
│  AI-powered screenplay writing and      │
│  scene breakdown                        │
│                                         │
│  [Built-in] · Project OS                │
│                                         │
│  [Open]                                 │
└─────────────────────────────────────────┘
```

---

## Document History

- v1.0 (2026-07-24): Final schema based on D6-D12 decisions
  - Added `buildType` field with user-visible badges
  - Added `alwaysEnabled` for globally mandatory Apps
  - Clarified categories are shelf labels, not installable units
  - Defined Packages as curated shortcuts, not prerequisites
  - Supersedes APP_STORE.md and MODULE_REGISTRY.md
