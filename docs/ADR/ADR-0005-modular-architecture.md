# ADR-0005: Modular Architecture - Apps System

**Status:** Accepted
**Date:** 2026-07-21
**Updated:** 2026-07-24 (v1.1)
**Context:** CONTEXT.md (Updated)
**Supersedes:** This ADR is superseded by `docs/ARCHITECTURE/APP_REGISTRY.md` for the App schema definition. See that file as the authoritative source.

---

## Context

After reviewing user journeys (Jacob the filmmaker, Dewa the YouTuber), we realized the current architecture assumes ALL users need Business OS features (Client Portal, Orders, Invoices).

**The Problem:**
```
Current Assumption:
User → Brand → Domain → Client Portal → Order → Project

Reality:
Solo Creator (Jacob): Just needs Project OS
├── "I'm making films, no clients yet"
├── "I don't need a client portal"
└── "I just want to organize my projects, scripts, tasks"

Growing Creator (Dewa): Might have clients, but not website
├── "Hotel wants a video collaboration"
├── "I don't have studio.dewa.com yet"
└── "Client prefers WhatsApp anyway"
```

---

## Terminology Update (v1.1)

**IMPORTANT:** As of 2026-07-24, the terminology has been refined:

| Old Term | New Term | Notes |
|----------|----------|-------|
| Paket | **Category** | Store shelf label for browsing, not installable |
| Apps | **Apps** | Individual tools, installable one by one |
| `paket` field | N/A | Removed — no longer used in database |

See `docs/ARCHITECTURE/APP_REGISTRY.md` for the definitive App schema.

---

## Core Concepts

### 1. Apps Are Installed One by One

Users browse the App Store by **category** but install **individual Apps**:

```
User Journey:
1. Opens App Store
2. Browses "Project OS" category
3. Sees: Scriptwriter, Storyboard, Shotlist, etc.
4. Clicks "Install" on Scriptwriter
5. (Dependencies auto-install if any)
```

### 2. Categories Are Shelves, Not Units

Categories (Project OS, Human Capital OS, Business OS) are **store shelf labels** — they help users browse. Users do not "install a category."

### 3. Packages Are Curated Shortcuts

Packages (e.g., "Business Suite") are **optional shortcuts** that select multiple Apps at once. They are NOT a prerequisite layer.

### 4. Always-Enabled Apps

Some Apps cannot be disabled:
- Dashboard
- Settings
- Profile
- Projects
- Tasks
- Team

Platform capabilities (always present, not in App Store):
- Auth
- Organization
- Brand
- Roles

---

## Three-Phase Roadmap

### Phase 1: Solo Creator (CORE)
**Focus:** Project Management for Filmmakers

Solo filmmaker can:
- Create and manage projects
- Organize stages and tasks
- Track progress
- Write scripts (Phase 2)
- Create storyboards (Phase 2)

> **No client required. Complete on its own.**

### Phase 2: Project OS Enhancement
**Focus:** Filmmaker Tools

Per-session deep development:
- Script Writer with markdown editor
- Storyboard Canvas with visual tools
- Scene Breakdown
- Production Templates
- Calendar/Scheduling
- And more...

### Phase 3: Business OS (Optional Add-on)
**Focus:** Client Management

When ready, install Business OS Apps:
- Lead Management
- Client Portal
- Order Flow
- Odoo Integration
- Invoicing

> **Note:** Business OS can be installed at any time — it's not gated to a specific phase. The roadmap phases describe a typical journey, not technical gates.

---

## Organization Schema

```typescript
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String?  @unique

  // Plan & Apps
  plan      String   @default("solo")  // "solo" | "growing" | "agency"
  apps      String[] @default(["projects", "stages", "tasks", "board", "team", "payouts"])
            // Individual app IDs that are enabled
  
  // ... other fields
}
```

| Plan | Default Apps | Can Add |
|------|--------------|---------|
| **Solo** | Dashboard, Settings, Profile, Projects, Tasks, Team, Board, Payouts | Any optional App |
| **Growing** | Same as Solo + Clients, Leads, Orders | Analytics, Invoices, etc. |
| **Agency** | All core apps | Odoo Sync, etc. |

---

## Routing Strategy for Client Portal

```
┌─────────────────────────────────────────────────────────────────────┐
│  ROUTING DECISION TREE                                              │
│                                                                     │
│  Request: app.zenvas.com/brand/dewa-personal                        │
│                    │                                                │
│                    ▼                                                │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  BRAND LOOKUP by slug                                         │ │
│  │  brand.slug = "dewa-personal"                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                    │                                                │
│          ┌────────┴────────┐                                       │
│          ▼                 ▼                                        │
│    hasClientPortal      hasClientPortal                              │
│          │                 │                                        │
│          ▼                 ▼                                        │
│        false               true                                      │
│          │                 │                                        │
│          ▼                 ▼                                        │
│    Redirect to          Check hasClientPortal:                       │
│    /app/projects        │                                           │
│    (internal view)      ├── has freeSubdomain?                       │
│                         │     └── serve: [slug].zenvas-portal.app   │
│                         │                                           │
│                         ├── has domain?                              │
│                         │     └── serve: [domain]                    │
│                         │                                           │
│                         └── neither                                 │
│                               └── serve: [slug].zenvas-portal.app  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Consequences

### Positive

1. **Solo Creator First** — Jacob can use Zenvas on day 1 without any business overhead
2. **Gradual Complexity** — Users add features as they grow, not before
3. **Odoo-like Flexibility** — Apps can be installed/uninstalled per organization
4. **No Forced Domain** — Personal brands don't need `studio.dewa.com`
5. **Migration Path** — Solo → Growing → Agency is natural, not a rebuild

### Negative / Risks

1. **Complexity in Code** — Feature flag checks needed throughout the app
2. **Routing Logic** — Need middleware to determine if request is internal vs portal
3. **Testing Surface** — 4 combinations (Solo/Growing/Agency × Personal/Business brand)

### Mitigations

1. **Centralized Feature Hook** — Single `useApps(brandId)` hook for all app checks
2. **Route Guards** — Redirect if required App not installed
3. **Default Onboarding** — Solo mode by default, prompted to add features later

---

## Alternatives Considered

### 1. Two Separate Products (Zenvas Solo + Zenvas Business)

**Rejected** — Same code, two products means:
- Duplicate maintenance
- Hard to migrate from Solo → Business
- Confusing positioning

### 2. Domain Required for All Brands

**Rejected** — Forces personal creators to buy domains:
- Jacob: "I'm just making films, why do I need studio.jacob.com?"
- Barrier to entry

### 3. Personal Brand = No Brand at All

**Rejected** — Brand still useful for:
- Organization of personal content
- Future client projects
- Multi-content-type separation (YouTube vs Wedding)

---

## References

- **App Schema:** `docs/ARCHITECTURE/APP_REGISTRY.md` (authoritative source)
- **Technical Spec:** `docs/ARCHITECTURE/MODULAR_APP_SYSTEM.md`
- **Constitution Rule #10:** `docs/DESIGN/CONSTITUTION.md` (integrate-first, native-when-matters)

---

## Document History

- v1.1 (2026-07-24): Updated terminology — categories are shelves, apps are installable units. Added reference to APP_REGISTRY.md as authoritative source.
- v1.0 (2026-07-21): Initial version with Paket vs Apps distinction
- (2026-07-23): Refined terminology: Paket vs Apps distinction
