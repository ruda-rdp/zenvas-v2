# PAGE-FLOWS.md

Status: Locked v1.0 (Phase 1 scope, per MVP_ROADMAP.md)

Depends On: ADR-0003 (domain routing), HUMAN_CAPITAL_OS.md (Roles &
Permissions, Editor UI Philosophy), BUSINESS_OS.md, PROJECT_OS.md

---

# Purpose

Defines every page Phase 1 needs, which of the two contexts (Client Portal
or Internal) it lives in, and what happens when a User of a given Role
lands on the app. This is deliberately Phase 1-only — Producer-specific
pages, Subscription pages, Knowledge Engine library, and Points/Level UI
are out of scope here (see MVP_ROADMAP.md).

---

# Two Root Contexts (recap of ADR-0003)

```
Hostname matches a Brand's domain (e.g. studio.eatprayedit.com)
   → CLIENT PORTAL CONTEXT — Client-facing only

Hostname matches the one internal domain (app.zenvas.com)
   → INTERNAL CONTEXT — Owner / Manager / Editor only

Anything else → 404 / neutral landing, never falls through to either context
```

No page in this document exists in both contexts. A page's context is fixed
by which domain serves it, enforced by middleware (ADR-0003), not by login
state alone.

---

# Client Portal (Brand domain, e.g. studio.eatprayedit.com)

**Key UX decisions:**
- **"Projects" not "Orders"** — Client Portal uses "Projects" terminology.
  Creates ownership psychology: "Your Projects" feels like a studio, not a transaction.
- **Progress bars** — Each project shows loading-style progress bar with %.
  Estimated delivery date visible. Creates anticipation and planning clarity.
- **Chat widget** — Bottom-right chat icon, per-project communication thread.
  Same pattern as Odoo message threads.

```
/login                          Register / Login (branded as the Brand, never "Zenvas")
/                                Redirect → /projects if logged in, else /login
/projects                        List of this Client's Projects (all statuses)
                                    - Progress bar per project (█░░░░░░░ 67%)
                                    - Estimated delivery date
                                    - Last activity timestamp
/projects/new                    Project Form = Service's Intake Form (Product Principle: Service First)
/projects/:projectId              Project detail:
                                    - Project status (In Progress/Completed)
                                    - Stage progress (Stage X of Y, expandable to Task detail)
                                    - Invoice status (synced from Odoo, read display only)
/projects/:projectId/pay         Redirect to Odoo-hosted or embedded payment step for DP/Final
/projects/:projectId/delivery   Delivery review — Client approves or requests revision
                                    (approval triggers Final Invoice + Payout crediting,
                                    per BUSINESS_OS.md and HUMAN_CAPITAL_OS.md)
/account                         Client's own profile/contact info
```

**Flow: placing and tracking a Project**
```
/login → /projects (empty state: "Create your first project")
   → /projects/new (fills Intake Form for a Service)
   → Project created [Draft] → Invoice DP issued (Odoo)
   → /projects/:projectId/pay → DP paid → Project [In Progress]
   → /projects/:projectId (Client watches Stage progress live, gets notifications)
   → Delivery ready → /projects/:projectId/delivery → Client approves
   → Project [Completed]
```

**Hard rule enforced on every page in this context (CONSTITUTION.md #1, #9):**
No page here may ever display another Client's data, any Editor's identity
beyond what a Brand chooses to show, the raw Order value if that's ever
distinct from what the Client themselves paid, or anything that reveals the
word "Zenvas" or internal-app URLs.

---

# Internal (single internal domain)

## Shared
```
/login                           Internal login (Owner/Manager/Editor — distinct from Client Portal login)
/                                 Redirect based on Role (see Landing Rules below)
```

## Owner / Manager routes
```
/dashboard                       Mission Control: what needs attention, bottlenecks, stale Tasks
/orders                          All Orders across the active Brand (Phase 1: EPE only)
/orders/:orderId                 Order detail incl. real Order/Invoice value (Owner/Manager only)
/projects                        All Projects, filterable by Stage
/projects/:projectId             Project detail: Stages, Tasks, assign/reassign Editor,
                                   set/override Payout allocation, view Client's Intake Form
/clients                         Client list (Owner/Manager only — CONSTITUTION.md #2)
/clients/:clientId               Client detail: Order history, preferences (if any Knowledge
                                   Entry exists — Phase 1 may just be a free-text notes field)
/team                             User list: Editors, their Brand Access, Employment Type
/team/:userId                    User detail: assignment history, Wallet balance (view only)
/payouts                         Pending withdrawal requests → mark as paid (manual transfer)
/settings/services                Service Catalog + Service Template (Stages/Tasks/Intake Form) editor
/settings/brand                  Brand profile: domain mapping (ADR-0003), logo upload,
                                   primary color picker (see UX_MODES.md → Brand Theming)
```

## Editor routes (deliberately small — per Editor UI Philosophy, CONSTITUTION.md #6)

**Key UX decisions:**
- **Gamified Dashboard** — Landing page shows Level, XP, stats, achievements.
  Creates engagement, like logging into a game that rewards work.
- **Board as "Opportunities"** — Available tasks shown as project opportunities
  with difficulty indicators and rewards.
- **Continue Working** — Quick access to last active task.

```
/dashboard                         Editor Dashboard (LANDING PAGE)
                                       - Level & XP progress bar
                                       - Stats: Lifetime earnings, Completed projects, Pending payout
                                       - Available Projects (Board as "opportunities")
                                       - Continue Working (last active task)
                                       - Achievements badges
/projects                          Editor's assigned projects list
/projects/:projectId               Project detail (read-only — can't modify project settings)
/tasks/:taskId                    Task detail: Brief, checklist, mark step complete,
                                   subtasks, discussion with Manager/Producer (never Client)
/wallet                           Own Payout balance, completed Tasks history, request withdrawal
/profile                          Own profile, Brand Access shown (read-only)
```

**Editor sidebar navigation:**
```
🎯 Dashboard   ← Landing
📁 Projects
📝 Tasks (→ /tasks/:id)
💰 Wallet
👤 Profile
```

No other route exists for the Editor Role. Anything not listed above is a
structural 403, not a hidden menu item.

---

# Landing Rules (on login, by Role)

```
Owner / Manager  → /dashboard (Mission Control)
Editor           → /dashboard (Editor Dashboard — gamified personal workspace)
```

**Note:** Editor's `/dashboard` is DIFFERENT from Owner/Manager's `/dashboard`:
- Owner/Manager sees: Mission Control (needs attention, bottlenecks)
- Editor sees: Personal workspace (level, XP, opportunities, continue working)

This redirect is a convenience, not the security boundary — the boundary is
enforced by route-level access control per CONSTITUTION.md #4, so a
mistyped URL by an Editor must fail structurally, not just fail to appear
in navigation.

---

# Order → Project → Payout, Mapped to Pages

```
Client: /orders/new  →  Owner/Manager: /orders/:orderId (reviews, DP tracked via Odoo)
   → Order Confirmed → Owner/Manager: /projects/:projectId (assign Editor, set Payout)
   → Editor: /board (sees it) → /tasks/:taskId (works it, checks off Tasks)
   → Client: /orders/:orderId (watches Stage progress live)
   → Delivery ready → Client: /orders/:orderId/delivery (approves)
   → Editor: /wallet (Payout now credited) → requests withdrawal
   → Owner/Manager: /payouts (marks paid)
```

---

# Explicitly Out of Scope for Phase 1 Page Flows

- Producer-specific views (no Producer role yet)
- Points/Level UI (Points/Levels deferred per MVP_ROADMAP.md)
- Knowledge Engine library browsing UI (Phase 2)
- Subscription setup/management pages (deferred)
- Clock-In/Clock-Out UI (no Inhouse Users yet)
- Multi-Brand switcher (EPE only in Phase 1 — UI can ignore this until Balistory/KreatifProduction onboard)

---

# Open Items for Future Sessions

1. Exact internal domain name (placeholder used above).
2. Whether Order payment (`/orders/:orderId/pay`) embeds Odoo's payment
   flow or redirects out to it entirely — an implementation detail, not
   blocking this page-flow design.
3. Mobile-specific behavior for Editor's `/board` and `/tasks/:taskId` —
   not designed here, worth a dedicated pass before MOCKUPS/.
4. Empty states and error states — not detailed here, belongs in MOCKUPS/.
