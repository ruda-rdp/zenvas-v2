# SYSTEM-MAP.md

**Status:** 🟢 Reviewed — architecture confirmed, 2 of 5 open questions resolved (see ADR-0002, ADR-0003)

**Purpose:** Visual architecture of Zenvas v2. Shows how the Four Pillars connect, where data flows, and what the modular boundaries look like.

---

# The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                            ZENVAS v2                                     │
│                  Operating System for Creative Businesses                │
│                                                                         │
│   "Quietly manage the business so creators can create."                 │
│                                                                         │
│   Product Owner → Opens Zenvas → Sees Mission Control → Drills in      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Four Pillars (Core Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ZENVAS v2 — CORE                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Auth · Organization · User · RBAC · Activity Log (Immutable)   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│  BUSINESS OS        │ │ PROJECT OS          │ │ HUMAN CAPITAL OS    │
│  (Inbound Flow)    │ │ (Creative Execution)│ │ (Outbound Flow)     │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│  Brand             │ │ Service Template   │ │ User                │
│  Service Catalog   │ │ Project             │ │ Brand Access        │
│  Client            │ │ Stage               │ │ Role + Employment   │
│  Order             │ │ Task                │ │ Board               │
│  Invoice (Odoo)    │ │ Delivery            │ │ Payout              │
│  Client Portal     │ │ Stale Detection     │ │ Wallet              │
├────────────────────┤ ├────────────────────┤ ├────────────────────┤
│  Documents:        │ │ Documents:          │ │ Documents:          │
│  BUSINESS_OS.md    │ │ PROJECT_OS.md       │ │ HUMAN_CAPITAL_OS.md │
└────────────────────┘ └────────────────────┘ └────────────────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                  ┌─────────────────────────┐
                  │  KNOWLEDGE ENGINE        │
                  │  (Deferred to Phase 2)   │
                  ├─────────────────────────┤
                  │  Knowledge Entries        │
                  │  Resource Library         │
                  │  Lessons Learned          │
                  └─────────────────────────┘
```

---

# Data Flow Between Pillars

```
                                    INBOUND
                          Brand gets Client interest
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BUSINESS OS                                                     │
│  ① Prospect → ② Service Catalog → ③ Order (Draft)               │
│     │                                                            │
│     ▼                                                            │
│  ④ Invoice (DP) issued via Odoo → Client pays DP                 │
│     │                                                            │
│     ▼                                                            │
│  ⑤ Order → Confirmed ─────────────────────┐                     │
└───────────────────────────────────────────┼─────────────────────┘
                                            │ ORDER CONFIRMED
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT OS                                                      │
│  ⑥ Service Template defines Stages + Tasks                       │
│     │                                                            │
│     ▼                                                            │
│  ⑦ Project created, populated with Stages + Tasks                │
│     │                                                            │
│     ▼                                                            │
│  ⑧ Tasks posted to Board → Editor applies/is assigned            │
│     │                                                            │
│     ▼                                                            │
│  ⑨ Editor completes Tasks → Delivery sent to Client              │
│     │                                                            │
│     ▼                                                            │
│  ⑩ Client approves Delivery                                      │
└───────────────────────────────────────────┬─────────────────────┘
                                            │ CLIENT APPROVES
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  HUMAN CAPITAL OS                                                │
│  ⑪ Payout credited to Editor's Wallet                            │
│  ⑫ Editor requests Withdrawal → Owner transfers manually        │
└─────────────────────────────────────────────────────────────────┘

                              ODOO (External)
┌─────────────────────────────────────────────────────────────────┐
│  Source of Truth for:                                            │
│  • Clients (synced to Zenvas)                                    │
│  • Invoices (synced to Zenvas)                                   │
│  • Payments (status only, not duplicated in Zenvas)              │
└─────────────────────────────────────────────────────────────────┘
```

---

# User Roles & What They See

| Role | Sees | Can Do |
|------|------|--------|
| **Owner** | Everything: revenue, payout pool, client details | All operations |
| **Manager** | Everything except Owner-only ops | Day-to-day ops |
| **Editor** | ONLY their own Board, own Payout, own Tasks | Apply to board, complete assigned tasks |
| **Client** | ONLY their own Project, their own Delivery | Track progress, approve delivery |

> **Hard constraint (Financial Confidentiality):** Editor cannot see Order value, Client list, or internal Payout Budget pool.
>
> **Hard constraint (Client Relationship):** Editor cannot contact Client directly. Only Owner/Manager can.

---

# Module Architecture (Odoo-Inspired, Modern Stack)

```
ZENVAS CORE (always loaded, never disabled)
├── Auth & Identity
├── Organization management
├── User management
├── RBAC enforcement
├── Activity Log (immutable)
└── Module Registry

MODULES (can be activated/deactivated)
├── business-os          ← Phase 1 required
├── project-os           ← Phase 1 required
├── human-capital-os     ← Phase 1 required
├── knowledge-engine     ← Phase 2
├── review-and-approval  ← Phase 2
├── subscription         ← Deferred
└── ... future modules

Each module:
├── Has its own Prisma models (or shares core models)
├── Registers its own routes/pages
├── Declares dependencies on other modules
└── Has feature flag in Organization settings
```

---

# Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WORDPRESS (eatprayedit.com)               │
│                        Landing + Marketing pages                 │
│                        ┌──────────────────┐                     │
│                        │  [Order Now]     │ ──────┐             │
│                        └──────────────────┘       │             │
└────────────────────────────────────────────────────┼─────────────┘
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              ZENVAS CLIENT PORTAL (app.eatprayedit.com)          │
│              ┌──────────────────────────────────────────┐        │
│              │  Register / Login                        │        │
│              │  Order Form (Intake from Service)        │        │
│              │  Track Project Progress (Stage/Task)     │        │
│              │  Approve Delivery                        │        │
│              │  View Invoice (synced from Odoo)         │        │
│              └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ (API Integration)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              ZENVAS APP (app.zenvas-internal.com or admin panel) │
│              Owner / Manager / Editor workflows                  │
│              Mission Control, Board, Payout, Wallet              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ (XML-RPC / JSON-RPC API)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              ODOO (bisnis.kreatifproduction.com)                 │
│              Contacts · CRM · Invoice · Payment · Accounting    │
│              ┌──────────────────────────────────────────┐        │
│              │  res.partner (Clients)                   │        │
│              │  account.move (Invoices)                 │        │
│              │  account.payment (Payments)              │        │
│              └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

# Phase 1 Scope (MVP)

Per `docs/MVP_ROADMAP.md`, only the core path is implemented:

| Component | In Scope | Out of Scope (Phase 2+) |
|-----------|----------|------------------------|
| Brand | ✅ EPE Studio only | Balistory, Kreatif, Personal (data model ready) |
| Service | ✅ Real Estate Edit (1-2) | More services |
| Order | ✅ Draft → Confirmed → Completed | Proposal/Quotation |
| Invoice | ✅ Odoo sync (manual trigger OK) | Full auto sync |
| Client Portal | ✅ Read-only progress view | Full self-service |
| Project | ✅ Service Template-based | Custom workflows |
| Stage/Task | ✅ From template | Manual customization |
| Stale Detection | ✅ Auto | Manual "Blocked" status |
| Board | ✅ Single-editor Apply/Assign | Multi-editor Task split |
| Payout | ✅ Manual allocation & withdrawal | Auto transfer |
| Wallet | ✅ Manual withdrawal | Auto withdrawal |
| Roles | ✅ Owner, Manager, Editor | Producer (deferred) |
| Financial Confidentiality | ✅ Enforced at access-control | — |
| Client Relationship Ownership | ✅ Enforced at access-control | — |

---

# What This Document Does NOT Define

- **Page URLs** → see PAGE-FLOWS.md (next)
- **Database schema details** → see DATA-MODELS.md
- **API request/response shapes** → see API-CONTRACTS.md
- **UI screens** → see MOCKUPS/
- **Build order / file structure** → see IMPLEMENTATION-PLAN.md

---

# Open Questions

1. ~~**Client subdomain routing**~~ → **RESOLVED, see ADR-0003.** Dynamic
   per-Brand domain resolution via middleware, from day one.

2. ~~**Internal vs External app**~~ → **RESOLVED, see ADR-0003.** One
   application, split by middleware into Client Portal context (per-Brand
   domain) and Internal context (single internal domain).

3. ~~**Odoo sync timing**~~ → **RESOLVED, 2026-07-20.** Dual mechanism:
   - **Auto-check:** System automatically checks Odoo status periodically
   - **Manual trigger:** Owner/Manager can manually trigger sync
   - **Error handling:** If Odoo is unreachable, notify Owner with error details
   - See ADR-0001-odoo-integration.md for implementation details

4. **Module Registry:** Real on/off toggle per Organization, or just feature
   flags in code? → Recommendation: feature flags in code for Phase 1;
   building a real dynamic registry now is premature for a single
   Organization — revisit when Stage 2 (multi-tenant) gets closer.

5. **Multi-Brand UI:** Single unified Brand selector, or per-Brand distinct
   UI? → Deferred — not blocking Phase 1 (EPE only), decide when Balistory/
   KreatifProduction come online.

---

*Last updated: 2026-07-20*
