# SYSTEM-MAP.md

**Status:** 🟢 Updated — Reflects ADR-0005 Modular Architecture
**Purpose:** Visual architecture showing CORE vs OPTIONAL modules

---

# The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                            ZENVAS v2                                    │
│                  Operating System for Creative Businesses                │
│                    (and Creative Individuals)                            │
│                                                                         │
│   "Starts simple as a solo creator, grows into a full agency."          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# The Three OS Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ZENVAS ARCHITECTURE                             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  IDENTITY LAYER (Always On)                                      │   │
│   │  Organization · User · Role · RBAC · Activity Log               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                 │                                       │
│        ┌───────────────────────┼───────────────────────┐              │
│        ▼                       ▼                       ▼              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │  PROJECT OS   │     │ HUMAN CAPITAL │     │  BUSINESS OS  │        │
│  │  ★ CORE       │     │    OS ★        │     │  ○ OPTIONAL   │        │
│  ├──────────────┤     ├──────────────┤     ├──────────────┤        │
│  │  Project     │     │  User        │     │  Lead        │        │
│  │  Stage        │     │  Role        │     │  Client      │        │
│  │  Task         │     │  Brand Access│     │  Order       │        │
│  │  Script       │     │  Board       │     │  Invoice     │        │
│  │  Storyboard   │     │  Payout      │     │  Client      │        │
│  │  Media        │     │  Wallet      │     │    Portal    │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
│        │                       │                       │              │
│        └───────────────────────┼───────────────────────┘              │
│                                ▼                                       │
│                  ┌─────────────────────────┐                          │
│                  │    KNOWLEDGE ENGINE      │                          │
│                  │    (Phase 2+)            │                          │
│                  ├─────────────────────────┤                          │
│                  │  Knowledge Entries       │                          │
│                  │  Resource Library        │                          │
│                  │  Lessons Learned         │                          │
│                  └─────────────────────────┘                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Module Status Legend

| Symbol | Meaning |
|--------|---------|
| **★ CORE** | Always installed, cannot be uninstalled |
| **○ OPTIONAL** | Installable via App Store |

---

# User Journeys (Updated)

## Journey 1: Jacob (Solo Creator)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  JACOB — Solo Filmmaker                                                │
│                                                                         │
│  GOAL: "Manage my film projects, scripts, storyboards"                │
│                                                                         │
│  Setup:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Organization: "Jacob Org"                                      │   │
│  │  Plan: Solo                                                     │   │
│  │  Apps: Project OS ★, Human Capital OS ★                         │   │
│  │  Brand: "Jacob Film"                                             │   │
│  │    ├── hasClientPortal: false                                   │   │
│  │    └── No domain needed                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Uses:                                                                  │
│  ✓ /projects — Create film projects                                    │
│  ✓ /projects/[id]/scripts — Write scripts                              │
│  ✓ /projects/[id]/storyboard — Storyboard images                      │
│  ✓ /tasks — Manage tasks across projects                               │
│  ✓ /board — Personal task board                                        │
│                                                                         │
│  No access to:                                                         │
│  ✗ /clients (Business OS not installed)                                │
│  ✗ /orders (Business OS not installed)                                 │
│  ✗ Client Portal (not needed)                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Journey 2: Dewa (Growing Creator)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DEWA — YouTuber → Content Business                                     │
│                                                                         │
│  PHASE 1: Solo YouTuber                                                │
│  ────────────────────────────────────────────────────────────────────  │
│  Plan: Solo                                                            │
│  Apps: Project OS ★, Human Capital OS ★                                 │
│  Brand: "Dewa Personal" (hasClientPortal: false)                       │
│                                                                         │
│  PHASE 2: First Hotel Collaboration                                     │
│  ────────────────────────────────────────────────────────────────────  │
│  • Installs "Business OS" from App Store                               │
│  • Creates client "Ayana Resort"                                       │
│  • Project linked to client (no portal needed)                         │
│  • Invoice generated manually                                          │
│                                                                         │
│  PHASE 3: Multiple Collaborations                                       │
│  ────────────────────────────────────────────────────────────────────  │
│  • Creates brand "Dewa Collaboration"                                  │
│  • hasClientPortal: true                                              │
│  • Gets free subdomain: dewa-collab.zenvas-portal.app                 │
│  • Some clients login to track progress                                 │
│                                                                         │
│  PHASE 4: Professional Setup                                            │
│  ────────────────────────────────────────────────────────────────────  │
│  • Builds website dewa.id                                              │
│  • CNAME: studio.dewa.id → dewa-collab.zenvas-portal.app              │
│  • Custom domain working                                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Journey 3: EatPrayEdit (Full Agency)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EATPRAYEDIT — Full Video Production Studio                             │
│                                                                         │
│  Organization: "EatPrayEdit"                                            │
│  Plan: Agency                                                           │
│  Apps: All core apps + business-os + odoo-sync + lead-management       │
│                                                                         │
│  Brands:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  EPE Studio — studio.eatprayedit.com                            │   │
│  │  EPE Wedding — wedding.eatprayedit.com                          │   │
│  │  Both: hasClientPortal: true, custom domains                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Team: Owner, 2 Managers, 5 Editors                                    │
│  Odoo Integration: Synced clients, invoices                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Flow (Updated)

```
                                    INBOUND (Business OS)
                          Lead/Client interest (optional)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BUSINESS OS (Optional — installed per Organization)                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ① Lead capture (if lead-management app installed)                │ │
│  │  ② Client creation (if business-os installed)                    │ │
│  │  ③ Service selection                                              │ │
│  │  ④ Order (Draft → Confirmed)                                      │ │
│  │  ⑤ Invoice via Odoo                                               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                     │                                  │
│                         ORDER CONFIRMED (optional)                     │
│                                     ▼                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PROJECT OS (CORE — always active)                                       │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ⑥ Project created (always possible, even without order)          │ │
│  │     • From confirmed order (business flow)                         │ │
│  │     • Direct creation (solo/creative flow)                        │ │
│  │  ⑦ Stages + Tasks from Service template                           │ │
│  │  ⑧ Tasks on Board → Editor applies/is assigned                    │ │
│  │  ⑨ Tasks completed → Delivery sent (if Client Portal active)      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                        CLIENT APPROVED (optional, if portal active)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  HUMAN CAPITAL OS (CORE — always active)                                │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ⑩ Payout credited to Editor's Wallet                             │ │
│  │  ⑪ Withdrawal requested → Owner transfers                        │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

                              ODOO (External)
┌─────────────────────────────────────────────────────────────────────────┐
│  Source of Truth (if odoo-sync app installed):                         │
│  • res.partner (Clients) — synced to Zenvas                           │
│  • account.move (Invoices) — synced to Zenvas                         │
│  • account.payment (Payments) — status only                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# User Roles & Permissions

| Role | Sees | Can Do |
|------|------|--------|
| **Owner** | Everything (if authorized) | All operations, manage organization |
| **Manager** | Project OS + Human Capital OS + (Business OS if authorized) | Day-to-day operations |
| **Editor** | Project OS (assigned) + Human Capital OS (own tasks) | Apply to board, complete assigned tasks |
| **Client** | Client Portal only (if hasClientPortal = true) | Track progress, approve delivery |

### Permission Matrix by Feature

| Feature | Owner | Manager | Editor | Client |
|---------|-------|---------|--------|--------|
| **Project OS** | | | | |
| Create Project | ✅ | ✅ | ❌ | ❌ |
| View Project | ✅ | ✅ | Assigned only | Own only |
| Edit Tasks | ✅ | ✅ | Own only | ❌ |
| **Human Capital OS** | | | | |
| View Board | ✅ | ✅ | Own only | ❌ |
| Payout/Wallet | ✅ (all) | ✅ (all) | Own only | ❌ |
| **Business OS** | | | | |
| View Clients | ✅ | ✅ | ❌ | ❌ |
| View Orders | ✅ | ✅ | ❌ | ❌ |
| View Invoices | ✅ | ✅ | ❌ | Own only (via portal) |
| Client Portal | ✅ | ✅ | ❌ | Read/Approve only |

---

# Module Architecture

```
ZENVAS CORE (always loaded)
├── Identity Layer
│   ├── Organization management
│   ├── User management
│   ├── RBAC enforcement
│   └── Activity Log (immutable)
└── Module Registry

CORE MODULES (always installed)
├── project-os
│   ├── Models: Project, Stage, Task
│   ├── Routes: /projects, /tasks, /board
│   └── Dependencies: None
│
└── human-capital-os
    ├── Models: User, Role, BrandAccess, Payout, Wallet
    ├── Routes: /team, /board, /payout
    └── Dependencies: None

OPTIONAL MODULES (App Store)
├── business-os
│   ├── Models: Client, Order, Invoice
│   ├── Routes: /clients, /orders
│   ├── Dependencies: project-os
│   └── Features:
│       ├── Client Portal (subdomain routing)
│       ├── Order workflow
│       └── Invoice management
│
├── lead-management
│   ├── Models: Lead
│   ├── Routes: /leads
│   └── Dependencies: business-os
│
├── odoo-sync
│   ├── Sync: res.partner, account.move
│   └── Dependencies: business-os
│
└── knowledge-engine (Phase 2+)
    ├── Models: KnowledgeEntry, Resource
    └── Dependencies: project-os

FEATURE FLAGS
├── Organization-level: Installed apps
├── Brand-level: hasClientPortal, domain
└── User-level: Role, BrandAccess
```

---

# Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORDPRESS (optional)                             │
│                        Landing + Marketing pages                        │
│                        ┌──────────────────┐                             │
│                        │  [Order Now]     │ ──────┐                     │
│                        │  [Get a Quote]   │       │                     │
│                        └──────────────────┘       │                     │
└────────────────────────────────────────────────────┼─────────────────────┘
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         CLIENT PORTAL (Optional — subdomain or custom domain)           │
│         ┌──────────────────────────────────────────┐                    │
│         │  Login / Track Progress / Approve        │                    │
│         │  Available only if:                       │                    │
│         │  • business-os app installed              │                    │
│         │  • brand.hasClientPortal = true          │                    │
│         └──────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ (API Integration)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ZENVAS APP (Internal)                                │
│                    app.zenvas.com / localhost                           │
│                                                                         │
│         ┌────────────────────────────────────────────┐                   │
│         │  Owner / Manager / Editor workspaces       │                   │
│         │                                             │                   │
│         │  • Project OS always available             │                   │
│         │  • Human Capital OS always available       │                   │
│         │  • Business OS shown only if installed     │                   │
│         └────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ (XML-RPC / JSON-RPC API)
                                ▼ (if odoo-sync installed)
┌─────────────────────────────────────────────────────────────────────────┐
│                         ODOO (External)                                 │
│                         bisnis.kreatifproduction.com                     │
│                         ┌──────────────────────────────────────────┐    │
│                         │  res.partner (Clients)                   │    │
│                         │  account.move (Invoices)                 │    │
│                         │  account.payment (Payments)              │    │
│                         └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Phase 1 Scope (Updated)

| Component | In Scope | Notes |
|-----------|----------|-------|
| **Identity Layer** | ✅ | Organization, User, RBAC |
| **Project OS** | ✅ CORE | Always installed |
| **Human Capital OS** | ✅ CORE | Always installed |
| **Business OS** | ✅ Optional | Installable app |
| **Client Portal** | ✅ Optional | Only if hasClientPortal = true |
| **Free Subdomain** | ✅ | For brands without custom domain |
| **Custom Domain** | ✅ Optional | User brings their own |
| **App Store** | 🟡 Basic | Install/uninstall optional modules |
| **Odoo Sync** | 🟡 Basic | Manual trigger OK |

### Out of Scope (Phase 2+)

| Component | Status |
|-----------|--------|
| Knowledge Engine | Phase 2 |
| Cast Management | Phase 2 |
| Communication Module | Phase 2 |
| Marketplace | Phase 3 |
| White-label | Phase 3 |

---

# Open Questions (Updated)

1. ~~**Client subdomain routing**~~ → **RESOLVED, ADR-0003.** Dynamic per-Brand domain resolution.

2. ~~**Internal vs External app**~~ → **RESOLVED, ADR-0003.** One application, split by middleware.

3. ~~**Odoo sync timing**~~ → **RESOLVED, ADR-0001.** Dual mechanism: auto-check + manual trigger.

4. ~~**Multi-Brand UI**~~ → **RESOLVED, ADR-0005.** Brand selector in nav, per-brand feature flags.

5. ~~**Business OS optionality**~~ → **RESOLVED, ADR-0005.** Modular architecture with App Store.

6. **App Store UX:** How should users discover and install apps?
   → Recommendation: Simple modal in Settings, shown when plan allows

7. **Migration Path:** How to migrate from Solo → Growing → Agency?
   → Recommendation: In-place upgrade, no data migration needed

---

*Last updated: 2026-07-21*
