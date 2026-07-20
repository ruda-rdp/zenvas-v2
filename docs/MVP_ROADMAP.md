# MVP_ROADMAP.md

Status: Locked v1.0

Depends On: all locked foundation documents (CONTEXT.md, FOUNDATION.md,
BUSINESS_OS.md, PROJECT_OS.md, HUMAN_CAPITAL_OS.md, KNOWLEDGE_ENGINE.md)

---

# Purpose

The foundation documents define the full, correct shape of Zenvas. This
document exists to prevent a common failure mode: trying to build all of it
at once. Phase 1 takes **one complete, working path** through the system —
Order → Project → Delivery → Payout — for one Brand (EPE Studio), and
defers everything else explicitly.

Nothing deferred here is wrong or cancelled. It is designed, locked, and
waiting. Phase 1 exists to get EPE Studio operational as fast as honestly
possible without violating the foundation already agreed.

---

# Phase 1 Goal

**A Client can order a Real Estate video edit from EPE Studio, an Editor can
be assigned and paid for it, and both the Client and the Owner can see
progress in real time — without spreadsheets, WhatsApp status updates, or
manual tracking.**

---

# In Scope for Phase 1

**Business OS (minimal):**
- One Brand: EPE Studio (data model supports multiple Brands, but only one
  is populated)
- One or two Services (e.g. Real Estate Edit), each with its own Intake Form
- Order lifecycle: Draft → Confirmed → Completed (skip complex Proposal/
  Quotation flow for now — direct Order from fixed price list only)
- Client Portal: simple, read-only progress view (Stage-level, expandable to
  Task detail)
- Odoo integration: Client record + Invoice creation only (manual trigger is
  acceptable for Phase 1 — full automatic sync can wait)

**Project OS (minimal):**
- Service Template with Stage + Task definitions for Real Estate Edit
- Project created on Order Confirmed
- Task checklist with timestamps, visible progress to Client
- Stale Task Detection (this is core to the "clients feel cared for"
  value proposition — worth including even in Phase 1)
- Subtask hierarchy (up to 4 levels deep) and Task Category
  (PRE_PRODUCTION/PRODUCTION/POST_PRODUCTION) — confirmed in-scope for
  Phase 1; EPE Studio's own work benefits from task breakdown, not just
  KreatifProduction's more complex productions

**Human Capital OS (minimal):**
- User with Brand Access (single Brand active, but model supports more)
- Employment Type: Freelance only (defer Inhouse entirely — no salary, no
  Clock-In/Out needed yet)
- Roles: Owner, Manager, Editor only (defer Producer — not needed until
  KreatifProduction-style multi-editor productions are in scope)
- Board: single-editor Apply/Assign only (defer multi-editor Task-split)
- Payout: manual allocation at Project creation, manual Wallet withdrawal
  (exactly as designed — this was already scoped as MVP-simple)
- Financial Confidentiality & Client Relationship Ownership: **enforced from
  day one**, not deferred — these are access-control rules, cheap to build
  correctly now, expensive to retrofit later

**Explicitly out of Phase 1 UI, but not forgotten:**
- Knowledge Engine: no library UI yet. If trivial, a single free-text "Notes"
  field on the Service Template is acceptable as a placeholder — not the
  full Knowledge Entry/Surfacing system.

---

# Phase 1.5 Gap Fixes (Added 2026-07-20)

Critical gaps identified during test scenario review:

| Gap | Document | Status | Action |
|-----|----------|--------|--------|
| Lead Management | LEAD_MANAGEMENT.md | ✅ Designed | See new module below |
| Budget Tracking | BUDGET_TRACKING.md | ✅ Designed | Phase 2 placeholder |
| Cancellation/Refund | TBD | 🔴 Pending | Must design before Phase 1 ships |
| Drama Studio (AI Content) | TEST-SCENARIO-DRAMA.md | ✅ Planned | Phase 3 |

---

## LEAD MANAGEMENT MODULE (Phase 1.5 — Critical Gap Fix)

### Why This Is Critical

Without Lead Management, EPE-001 and EPE-002 scenarios cannot work. Happy has no place to capture, qualify, and convert incoming leads.

### Scope

```
Lead Management includes:
├── Lead capture (manual + future integration)
├── Lead qualification (status, priority, tags)
├── Lead-to-Order conversion (one-click)
├── Lead dashboard (Mission Control integration)
├── Stale lead detection
├── Template suggestions (smart matching)
└── Source tracking & reporting

Lead Management does NOT include:
├── Lead scoring (complex — Phase 2+)
├── Lead nurturing sequences (Phase 3+)
└── Full CRM (Odoo handles this)
```

### Build Priority

**HIGH** — Must be included in Phase 1 or Phase 1.5. Without this, EPE daily operations cannot use Zenvas.

---

## BUDGET TRACKING MODULE (Phase 2 — Production Cost Management)

### Why This Is Needed

KP-001 scenario requires tracking production costs (Talent: Rp 2.4M, Drone: Rp 4.5M, etc.) alongside Business OS revenue tracking.

### Scope

```
Budget Tracking includes:
├── Project budget with line items
├── Category breakdown (Talent, Crew, Location, Equipment, etc.)
├── Planned vs Actual tracking
├── Scene change budget impact calculation
├── Integration with Talent/Location library
└── Budget reporting

Budget Tracking does NOT include:
├── Client revenue (Business OS)
├── Editor payouts (Human Capital OS)
└── Full accounting (Odoo)
```

### Financial Separation

```
┌────────────────────────────────────────────────────────────────┐
│  THREE MONEY FLOWS — Never Mixed                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BUSINESS OS: Order Value (Rp 35M) — Client pays              │
│  → Owner/Manager only                                          │
│                                                                 │
│  BUDGET TRACKING: Production Cost (Rp 11.6M) — Internal spend │
│  → Owner/Manager/Producer                                       │
│                                                                 │
│  HUMAN CAPITAL OS: Editor Payout (Rp 5M) — Editor gets        │
│  → Editor sees own only                                        │
│                                                                 │
│  Studio Margin = Order - Budget - Payout = Rp 18.4M           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## DRAMA STUDIO — AI Content Brand (Phase 3)

### New Brand Concept

```
┌────────────────────────────────────────────────────────────────┐
│  DRAMA STUDIO — Brand Overview                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WHAT: YouTube/Reels/Facebook creator brand                    │
│  CONTENT: Episodic vertical dramas (9:16)                     │
│  STYLE: Full AI production (characters, voices, animation)     │
│  THEME: Nusantara historical workplace drama                    │
│                                                                 │
│  SESSION 1: "Kerajaan Nusantara"                              │
│  • 9 episodes × 2-3 minutes each                             │
│  • Full AI pipeline: Flux + ElevenLabs + Runway              │
│  • Target cost: Rp 200-400K per episode                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### AI Content OS Module

New module category that extends Zenvas for internal media production:

```
AI CONTENT OS includes:
├── Content Series (Session = N episodes)
├── Episode tracking (production status per episode)
├── Character Library (AI character assets, LoRA models)
├── AI Asset Library (backgrounds, props, voice clones)
├── AI Pipeline Config (tool settings, cost tracking)
├── Performance Analytics (views, retention, engagement)
└── Multi-platform publishing (YouTube, IG, FB)

AI CONTENT OS does NOT include:
├── Client/Order flow (internal production only)
├── Client Portal (team internal only)
└── Creative generation (external AI tools handle this)
```

### Drama Studio Test Scenario

See `TEST-SCENARIO-DRAMA.md` for full DRAMA-001 scenario (Episode 1 production).

---

# Explicitly Deferred (designed, not built yet)

| Item | Where it's designed | Why deferred |
|---|---|---|
| Subscription (request-slot model, Wayfront-inspired) | BUSINESS_OS.md | Model decided (request quota, not hours); execution still needs a track record of one-off Orders first |
| Points & Level system | HUMAN_CAPITAL_OS.md | Needs real usage data before thresholds mean anything |
| Clock-In/Clock-Out | HUMAN_CAPITAL_OS.md | Only needed once Inhouse or Subscription exists |
| Inhouse employment type | HUMAN_CAPITAL_OS.md | No inhouse hires yet at Phase 1 launch |
| Producer role | HUMAN_CAPITAL_OS.md | Needed for multi-editor Projects — not EPE's typical case |
| Multi-editor Task split | PROJECT_OS.md, HUMAN_CAPITAL_OS.md | Follows from Producer role |
| Resource Library (Talent/Location) | KNOWLEDGE_ENGINE.md | More relevant to KreatifProduction/Balistory than EPE |
| Full Knowledge Entry/Surfacing system | KNOWLEDGE_ENGINE.md | Not blocking EPE's core flow |
| Additional Brands (Balistory, KreatifProduction, Personal) | CONTEXT.md | Data model ready; UI/rollout is sequential |
| Cancellation/Refund flow | *(not yet designed anywhere)* | 🔴 Must design before Phase 1 ships |
| Budget Tracking | BUDGET_TRACKING.md | Phase 2 — needed for KP-001 scenario |
| AI Content OS | FOUNDATION.md, TEST-SCENARIO-DRAMA.md | Phase 3 — Drama Studio brand |

---

# One Gap to Close Before Coding: Cancellation/Refund

No locked document currently defines what happens if an Order is cancelled
after DP payment, or a Project is cancelled mid-way. This is a real
scenario, not a hypothetical, and should get a short dedicated discussion —
ideally before Phase 1 ships, since it touches Order state, Invoice
(refund), and Payout (what does an Editor keep if work was already done).

---

# Suggested Build Order

1. Data Model / Schema draft (can be delegated to Claude Code, reviewing
   against all locked foundation docs)
2. Tech Stack decision (ADR-0002 — not yet written)
3. Auth & Role enforcement mechanism (technical decision, not just the
   conceptual matrix already locked)
4. Odoo integration: Client + Invoice (minimal, manual-trigger acceptable)
5. Order flow (Draft → Confirmed)
6. Project OS: Service Template, Stage, Task, Stale Detection
7. Human Capital OS: Board, Apply/Assign, Payout, Wallet
8. Client Portal (read-only progress view)
9. Cancellation/Refund flow (design + build)

---

# Definition of Done for Phase 1

A real EPE Studio Client can place a real Order, get a Confirmed status
after DP, watch their Project move through Stages with live Task updates, an
Editor can Apply/be Assigned and get paid via the Wallet flow, and the Owner
never needs a spreadsheet or a WhatsApp message to know where any of it
stands.
