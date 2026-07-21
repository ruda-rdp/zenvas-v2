# ADR-0005: Modular Architecture - Business OS as Optional Plugin

**Status:** Accepted
**Date:** 2026-07-21
**Replaces:** Part of ADR-0003 domain routing
**Context:** CONTEXT.md (Updated)

**Updated:** 2026-07-21 — Added Three-Phase roadmap

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

When ready, install Business OS:
- Lead Management
- Client Portal
- Order Flow
- Odoo Integration
- Invoicing

---

This is a **fundamental architectural decision** that affects:
- Database schema (Brand model)
- Routing system (domain/subdomain handling)
- Feature flag system
- Onboarding flow

## Decision

### 1. Three OS Layers with Different Availability

| Layer | Availability | Description |
|-------|--------------|-------------|
| **Project OS** | CORE (always on) | Projects, Stages, Tasks, Scripts, Storyboards |
| **Human Capital OS** | CORE (always on) | Users, Roles, Board, Payout, Wallet |
| **Business OS** | OPTIONAL (installable) | Clients, Orders, Invoices, Client Portal |

### 2. Brand Simplification

```
BEFORE (assumes Business OS):
model Brand {
  domain         String  @unique  // HARUS ADA
  isPersonalBrand Boolean
  // ...
}

AFTER (Business OS optional):
model Brand {
  slug           String  @unique  // URL-safe identifier (always required)
  domain         String? @unique  // Optional - only for Client Portal
  freeSubdomain  String? @unique  // Free: "jacobfilm.zenvas-portal.app"
  hasClientPortal Boolean @default(false)  // Toggle for Business features
  // ...
}
```

### 3. Organization Apps Model

Organizations install "apps" to enable features:

```
model Organization {
  // ...
  plan      String   @default("solo")  // solo | growing | agency
  apps      String[] @default(["project-os", "human-capital-os"]) 
  // ...
}
```

| Plan | Default Apps | Can Add |
|------|--------------|---------|
| **Solo** | Project OS, Human Capital OS | Business OS |
| **Growing** | Project OS, Human Capital OS, Business OS | Lead Management |
| **Agency** | All core apps | Odoo Sync, etc. |

### 4. Routing Strategy for Client Portal

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

### 5. Subdomain Tiers

| Tier | Example | Cost | Use Case |
|------|---------|------|----------|
| **Free subdomain** | `jacobfilm.zenvas-portal.app` | FREE | Solo/Growing creators |
| **Custom domain** | `studio.eatprayedit.com` | User pays | Established studios |

**Free subdomain logic:**
```
slug: "jacob-film"
freeSubdomain: "jacobfilm.zenvas-portal.app"
```

Users can later add custom domain:
```
domain: "studio.jacobfilms.com"
freeSubdomain: (still active, redirects to custom domain)
```

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

1. **Centralized Feature Hook** — Single `useFeatures(brandId)` hook for all feature checks
2. **Route Guards** — Redirect if Business OS not installed
3. **Default Onboarding** — Solo mode by default, prompted to add features later

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

## Implementation Notes

### Phase 1: Core Solo Mode

```
New User Onboarding:
1. Create Organization
2. Create First Brand (slug only, no domain)
3. hasClientPortal: false by default
4. apps: ["project-os", "human-capital-os"]
5. Land on /projects
```

### Phase 2: Enable Business

```
App Store → Install "Business OS"
1. Update organization.apps = ["project-os", "human-capital-os", "business-os"]
2. User can now create Clients
3. User can now create Orders
4. (Optional) Enable Client Portal for any brand
```

### Phase 3: Client Portal

```
Brand Settings → Client Portal
1. hasClientPortal: true
2. freeSubdomain: auto-generated from slug
3. User gets: jacobfilm.zenvas-portal.app
4. User can optionally add custom domain
```

## Files to Update

| File | Changes |
|------|---------|
| `schema.prisma` | Add `slug`, `freeSubdomain`, `hasClientPortal` to Brand; add `apps`, `plan` to Organization |
| `pages/settings/brands` | Update create/edit to include new fields |
| `middleware/proxy.ts` | Handle slug-based routing + free subdomain |
| `lib/features.ts` | Create feature flag utilities |
| `pages/onboarding` | Solo-first onboarding flow |

---

*Last updated: 2026-07-21*
