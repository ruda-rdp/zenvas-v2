# UX_MODES.md

Status: Locked v1.0

Depends On: PAGE-FLOWS.md, CONSTITUTION.md, MOCKUPS.md

---

# Purpose

Zenvas is not a collection of pages — it is three distinct **Modes** a User
moves through. This document defines what changes (and what stays
constant) as a User moves between them. This is a genuine differentiator:
the goal is that switching Modes feels like switching workspaces (DaVinci
Resolve, Figma, Notion), not like navigating a website.

---

# The Three Modes

```
Business Mode                Project Mode                 Focus Mode
(Owner/Manager)              (anyone inside a              (one unit of work,
                                specific Project)             everything else hidden)

Dashboard                     Overview                      Task Detail (Editor)
Projects                      Workflow (Stage/Task)          — or —
Clients                       Assets (external links only)  Delivery Review (Owner/Manager)
Team                          Review
Reports                       Delivery
Settings                      Finance (role-gated, see below)

      ────────────►  Enter a Project  ────────────►  Open a Task/Review  ────────────►
```

## Business Mode
The Owner/Manager's operating layer — cross-Project, cross-Client view. This
is where decisions about the business itself get made: which Projects need
attention, which Clients are active, how the team is doing. Maps to the
Owner/Manager routes already defined in PAGE-FLOWS.md.

**Key change:** "Orders" renamed to "Projects" for Client-facing language.
Client Portal shows "Your Projects" — creates ownership psychology,
not transactional feel. Internal still uses "Projects" terminology.

## Project Mode
Entering a specific Project changes the interface into a focused production
workspace — everything about that one Project (Stage/Task progress, Review,
Delivery, Finance) and nothing about any other Project or Client. This
already matches PROJECT_OS.md's design; this document formalizes it as a
distinct Mode, not just a detail page.

**Assets, clarified:** Project Mode surfaces **links/references** to
external storage (Dropbox, Google Drive, local server) — Zenvas never
stores or manages raw production files itself. This closes PROJECT_OS.md's
previously open "file storage integration" item.

**Finance, clarified:** Project Mode's Finance view is Role-gated per
CONSTITUTION.md #1 — Owner/Manager see Project value and margin; a Producer
(when that Role exists) sees only the internal Payout budget pool; this
view does not exist at all for Editors, who never enter Project Mode in
the first place (they work in Workspace Mode directly — see below).

**Communication:** Chat thread attached to each Project, per Zendo/Contentmaker
patterns (REFERENCES.md). Both Client and internal team contribute to the
same thread — Owner/Manager sees all, Client sees their thread only.

## Focus Mode (Editor Workspace)
The Editor's personal operating layer — designed for engagement and clarity.

**Editor Dashboard (new concept):** When an Editor logs in, they land on their
personal dashboard — not the shared Board. The dashboard is gamified to create
engagement (game-like progression system) while remaining functional:

- **Level & XP** — completed projects = XP, levels unlock at thresholds
- **Stats** — lifetime earnings, completed projects, pending payouts
- **Available Projects** — Board filtered to their access, presented as
  "opportunities" with difficulty indicators
- **Continue Working** — quick access to last active task
- **Achievements** — badges for milestones (e.g., "Quick Starter", "Top Earner")

**Psychology:** Editors should enjoy logging in — like a game that rewards
consistent work. Low friction, high clarity, always something to work on.

**After Dashboard:** Editor navigates to Projects list or directly to their
active task (Focus Mode below).

## Focus Mode
The most immersive Mode: one unit of work, everything else stripped away.
For Zenvas, this is deliberately **not** a creative tool (no Storyboard,
Script, or Canvas — that territory is explicitly out of scope, per
REFERENCES.md's Synthesis: StudioBinder/Celtx/Storyflow already serve it
well). Instead, Focus Mode is:

- **Task Detail (Editor)** — Brief, checklist, own Payout, discussion with
  Manager/Producer, subtasks for work breakdown. This is MOCKUPS.md screen #17,
  elevated from "a page" to "the Editor's entire Mode." An Editor's session
  in Zenvas is, by design, almost entirely spent in Focus Mode — this is the
  concrete expression of CONSTITUTION.md #6 (Editor UI stays minimal).
- **Delivery Review (Owner/Manager)** — when reviewing a specific Delivery
  before sending to a Client, or reviewing a Client's revision request,
  Owner/Manager can enter the same kind of stripped-down, single-purpose
  view — no sidebar, no other Projects, just this one decision.

---

# Mission Control — Reconciling Two Roles

Earlier drafts described Mission Control two ways: (1) BUSINESS_OS.md's
original definition — a dashboard answering "what needs attention" — and
(2) a persistent global layer (search, notifications, quick navigation)
available above every page. **Both are correct, and they don't conflict:**

- **Mission Control the page** (`/dashboard`) — the bottleneck/needs-attention
  view, already designed in MOCKUPS.md screen #2. Lives in Business Mode.
- **Mission Control the layer** — a persistent, lightweight utility
  (notifications, search, quick-jump) available across Business Mode and
  Project Mode. **Not available in Focus Mode** — Focus Mode's entire point
  is removing everything non-essential, including global chrome. This is a
  deliberate exception, not an oversight.

---

# What Does Not Change Across Modes

Per CONSTITUTION.md rules #1, #2, #4: Role-based data visibility is
enforced identically regardless of Mode. Entering Focus Mode does not loosen
any access-control rule — it only changes what's *shown*, never what's
*permitted*. An Editor in Focus Mode still cannot see Order value, Client
contact info, or another editor's Payout, exactly as in every other context.

---

# Brand Theming

Direct implementation of CONSTITUTION.md #9 (Brand First, Zenvas Invisible).

**Client Portal (per-Brand domain, ADR-0003):** dynamically themed from
`Brand.logoUrl` and `Brand.primaryColor` (DATA-MODELS.md). If `logoUrl` is
unset, the Brand's name renders as a styled text wordmark instead of a
broken image — never a Zenvas placeholder logo. Owner sets both via
`/settings/brand` (PAGE-FLOWS.md), including a color picker — no code
change needed to onboard a new Brand's look, same reasoning as ADR-0003's
domain resolution.

**Internal app:** one fixed, neutral/professional theme — does **not**
change color per active Brand. Owner/Manager/Editor need visual consistency
while working across Brands (per HUMAN_CAPITAL_OS.md's cross-Brand Board);
a shifting internal UI would work against that, not for it.

**Phase 1 (EPE Studio):** no real logo/asset available yet — ships with
`logoUrl = null` (renders "EPE" as a text wordmark) and a placeholder
`primaryColor`. Both are meant to be replaced via `/settings/brand` the
moment real brand assets exist — this is a working default, not a
limitation to design around.

---

# Open Items for Future Sessions

1. Exact transition/animation treatment between Modes — a design detail for
   implementation, not a foundation decision.
2. Whether Focus Mode gets its own URL structure or is a UI state layered
   over existing routes (e.g. `/tasks/:id?focus=true` vs. a dedicated
   route) — technical detail for IMPLEMENTATION-PLAN.md's next revision.
3. "Skills" as a People attribute (mentioned in early draft material) —
   not yet part of HUMAN_CAPITAL_OS.md's User model; flagged, not decided.
