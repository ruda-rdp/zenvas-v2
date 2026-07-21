# MVP_ROADMAP.md

**Status:** Updated v2.0 (2026-07-21)

**Previous:** v1.0 (Client-first approach)

**Change Summary:** Refocused on Solo Creator first. Phase 1 is project management for filmmakers without requiring business features.

---

# Purpose

The foundation documents define the full, correct shape of Zenvas. This
document exists to prevent a common failure mode: trying to build all of it
at once.

**Updated Approach (v2.0):** Zenvas starts as project management for solo filmmakers. Business features are Phase 3, not Phase 1.

---

# Three-Phase Roadmap

## Phase 1: Solo Creator (CORE)
**Focus:** Project & Task Management

A solo filmmaker can:
- Create projects
- Manage stages and tasks
- Track progress
- Use script and storyboard tools

> **This is complete on its own. No client required.**

## Phase 2: Project OS Enhancement
**Focus:** Filmmaker Tools

Per-session deep development:
- Script Writer module
- Storyboard Canvas
- Scene Breakdown
- Production Templates
- Calendar/Scheduling
- And more...

## Phase 3: Business OS (Optional)
**Focus:** Client Management

When ready, install Business OS:
- Lead Management
- Client Portal
- Order Flow
- Odoo Integration
- Invoicing

---

# Phase 1 Goals

**Primary:** A solo filmmaker can manage their creative projects without any client or business features.

**Secondary:** A team can collaborate on projects with task assignment and payout tracking.

---

# Phase 1 In Scope

**Project OS (CORE):**
- Projects with Stages and Tasks
- Subtask hierarchy (up to 4 levels deep)
- Task categories (PRE_PRODUCTION, PRODUCTION, POST_PRODUCTION)
- Script content (markdown storage - UI deferred to Phase 2)
- Storyboard URLs (storage - visual canvas deferred to Phase 2)
- Task status tracking

**Human Capital OS (CORE):**
- User with roles (Owner, Manager, Editor)
- Team management
- Board for task discovery
- Apply/Assign workflow
- Payout tracking
- Wallet (manual withdrawal)

**Human Capital OS (Minimal - Phase 1):**
- Employment Type: Freelance only
- Roles: Owner, Manager, Editor (Producer deferred)
- Single-editor apply/assign

---

# Phase 1 Out of Scope

**Explicitly deferred to Phase 2 or 3:**
- Script Writer UI (storage exists, UI deferred)
- Storyboard Canvas (URLs stored, visual deferred)
- Lead Management (Phase 3)
- Client Portal (Phase 3)
- Order Flow (Phase 3)
- Odoo Integration (Phase 3)
- Proposal/Quotation (Phase 3)
- Subscription Model (Phase 3+)
- Clock-In/Out (Phase 3+)
- Inhouse employment (Phase 3+)
- Producer role (Phase 3+)
- Budget Tracking (Phase 2)

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

Critical gaps identified during test scenario review — **ALL RESOLVED 2026-07-20**:

| Gap | Document | Status | Notes |
|-----|----------|--------|-------|
| Lead Management | LEAD_MANAGEMENT.md | ✅ Locked v1.0 | Dual-path: self-service + manual |
| Odoo Sync Strategy | ADR-0001-odoo-integration.md | ✅ Resolved | Auto-check + Manual trigger |
| Cancellation/Refund | CANCELLATION_POLICY.md | ✅ Locked v1.0 | Stage-based rules |
| Subtask Depth | PROJECT_OS.md, GLOSSARY.md | ✅ Resolved | 3 levels (root + 2 nesting) |
| Payout Split | HUMAN_CAPITAL_OS.md | ✅ Resolved | Per Task, hidden from Editor |
| **Payment Gateway** | **ADR-0004** | ✅ **Proposed** | **Multi-gateway: PayPal → LemonSqueezy → Creem → Manual** |
| Budget Tracking | BUDGET_TRACKING.md | ✅ Designed | Phase 2 placeholder |
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
| Cancellation/Refund flow | CANCELLATION_POLICY.md | ✅ Locked v1.0 |
| Budget Tracking | BUDGET_TRACKING.md | Phase 2 — needed for KP-001 scenario |
| AI Content OS | FOUNDATION.md, TEST-SCENARIO-DRAMA.md | Phase 3 — Drama Studio brand |

---

# All Phase 1 Gaps Resolved ✅

All critical gaps identified during test scenario review have been resolved:

- ✅ Cancellation/Refund Policy — CANCELLATION_POLICY.md (Locked v1.0)
- ✅ Lead Management — LEAD_MANAGEMENT.md (Locked v1.0)
- ✅ Odoo Sync — ADR-0001-odoo-integration.md (Resolved)
- ✅ Subtask Depth — PROJECT_OS.md (Resolved: 3 levels)
- ✅ Payout Split — HUMAN_CAPITAL_OS.md (Resolved: per Task)
- ✅ Payment Gateway — ADR-0004 (Proposed: Multi-gateway strategy)

**Ready for Phase 1 coding.**

---

# Payment Gateway Strategy (ADR-0004)

See `ADR-0004-payment-gateway.md` for full details.

**Gateway Stack (Priority Order):**
1. PayPal (primary — client familiar)
2. LemonSqueezy (to try)
3. Creem.io (to try)
4. Manual/Wire Transfer (fallback)

**Phase 1:** Manual confirmation (Happy confirms payment after seeing in gateway/bank)
**Phase 2+:** Webhook integration for auto-confirmation

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
9. Lead Management Module
10. Payment Gateway (PayPal links + manual confirmation)
11. Cancellation/Refund flow

---

# Definition of Done for Phase 1

A real EPE Studio Client can place a real Order, get a Confirmed status
after DP, watch their Project move through Stages with live Task updates, an
Editor can Apply/be Assigned and get paid via the Wallet flow, and the Owner
never needs a spreadsheet or a WhatsApp message to know where any of it
stands.
