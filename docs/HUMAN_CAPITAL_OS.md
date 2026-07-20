# HUMAN_CAPITAL_OS.md

Status: Locked v1.2 (Layer 4 domain review, added Roles & Permissions)

Depends On:
- FOUNDATION.md
- CONTEXT.md
- BUSINESS_OS.md
- PROJECT_OS.md
- KNOWLEDGE_ENGINE.md (for Internal Education content — not yet written)

---

# Purpose

Human Capital OS transforms individuals into a resilient creative
organization. It owns the **outbound** side of Zenvas: who has access to
what, how they find work, and how they get compensated.

People may change. The organization must continue. Human Capital OS is what
makes that possible — a Project must never depend on one irreplaceable
person, and a person must never need to "start over" when their role changes.

---

# Relationship to Other Pillars

- **Business OS → Human Capital OS:** Order value is confidential and never
  crosses this boundary. Only the Payout value (calculated internally) does.
  See BUSINESS_OS.md → Financial Confidentiality & Payout Trigger.
- **Project OS → Human Capital OS:** Assignment happens at the Task/Stage
  level, not only whole-Project. The Board surfaces these as individual
  opportunities. See PROJECT_OS.md → Assignment Model.

---

# Core Objects

## User
A single, brand-agnostic identity. One person = one User, regardless of how
many Brands they work across or whether their status is Freelance or
Inhouse. A User never has multiple accounts.

## Brand Access
A simple grant (toggle) connecting a User to a Brand. Modeled after Odoo's
multi-company access pattern. Changing a User's Brand Access does not create
a new identity — it changes what appears on their Board.

## Employment Type
An attribute on User, not a separate object: **Freelance** or **Inhouse**.
Determines the compensation rule (see below). Moving from Freelance to
Inhouse is a status change on the same User — full history carries over.

| | Freelance | Inhouse |
|---|---|---|
| Base compensation | None — Payout is the full compensation | Fixed monthly salary (managed in Odoo/payroll, not detailed here) |
| Task/Stage Payout | Yes, full value | Yes, smaller "bonus" value |
| Points | Yes | Yes |
| Benefits | None | Yes (e.g. health insurance — administered outside Zenvas for now) |
| Board priority | Standard | Can be prioritized for larger Projects |

## Roles & Permissions

Role is a **functional** attribute, separate from Employment Type
(Freelance/Inhouse describes *how someone is paid*; Role describes *what
they're allowed to see and do*). A User can be Inhouse and hold the Editor
role, or Inhouse and hold the Producer role — the two attributes are
independent.

| | Owner | Manager | Producer | Editor |
|---|---|---|---|---|
| Order/Client value (raw revenue) | Full | Full | No | No |
| Internal Payout Budget (project pool) | Full | Full | Full, for Projects they run | No — only their own Payout |
| Own Payout value | — | — | — | Yes, own only |
| Direct Client communication | Yes | Yes | Yes (production coordination) | **No — never** |
| Task/Brief visibility | All | All | Projects they run | Own assigned Task/Stage only |
| Board visibility | All Brands/Projects | All Brands/Projects | Assigned Brands/Projects | Own assigned Brands, own opportunities |

This table is a direct implementation of both the Financial Confidentiality
Principle and the Client Relationship Ownership Principle in CONTEXT.md. It
must be enforced as real access control, not just hidden by UI convention —
an Editor's queries should never be *able* to return Order values or Client
contact details, not merely have them hidden on screen.

Producer sits between Manager and Editor: they coordinate production and
need visibility into the internal budget pool to do their job (matching
editors to Tasks, per PROJECT_OS.md's multi-editor Assignment Model), but
never see what the Client actually paid — preserving margin secrecy even one
level below Manager.

## Editor UI Philosophy

Editors should never be burdened with file management, creative canvases, or
anything that competes with their actual tool (e.g. DaVinci Resolve). Their
Zenvas experience is deliberately minimal:

- Their Board (own assigned opportunities)
- The Brief for their current Task/Stage
- A checklist to mark progress
- Their own Payout and Point balance
- Discussion with Manager/Producer (never with Client)

Nothing else. This is a direct application of Product Principle #3 (Human
Before Software) and #4 (Creativity Without Chaos): Zenvas helps an Editor
get work, understand it, and get paid for it — it never tries to replace the
creative tool they already master.

## The Board
An aggregated, cross-brand list of open opportunities, scoped to whatever
Brand Access the viewing User currently has. A Board item is a **Task or
Stage** (per PROJECT_OS.md's Assignment Model) — not always a whole Project.

Two entry mechanisms coexist:
- **Apply** — User browses the Board and requests an item.
- **Assign** — Owner/Manager directly assigns a User to an item.

---

# Payout Model

**Allocation (Order value → Payout value):**
Happens when a Task/Stage is posted to the Board, so the assignee always
knows their Payout value before accepting (per BUSINESS_OS.md). For
single-editor Projects, a default rule can apply automatically (e.g. 20%
margin), with manual override available.

**Multi-editor Projects have no formula.** When a Project needs to be split
across several editors (e.g. a $500 project divided into offline edit,
animation, and color grading), the split is entirely at Owner/Manager
discretion — there is no automatic formula. This is a deliberate design
choice: it preserves the Owner's judgment for a decision that is inherently
situational (urgency, editor skill match, workload), rather than forcing a
rigid rule onto something that doesn't have one.

**Crediting (Payout value → Wallet):**
Only happens after the Client approves the final Delivery — not merely when
the assignee submits their work. See BUSINESS_OS.md.

**Wallet & Withdrawal (MVP):**
- Dashboard shows completed Tasks/Stages and accumulated balance.
- User requests withdrawal.
- Owner/Manager transfers manually (bank transfer).
- Balance is cleared on confirmation.
- Automation (payment gateway, auto-transfer) is a future iteration, not a
  day-one requirement.

**Confidentiality (hard rule):** Assignees only ever see their own Payout
value. They never see the original Order value. See BUSINESS_OS.md →
Financial Confidentiality.

---

# Points Model

Points exist to keep the team motivated, and to give Owner/Manager a
reputation and performance signal — a KPI, not just a bonus mechanic. Points
are bidirectional: they can go up and down.

**Earned automatically** (from data Project OS already records — no manual
work required):
- Task completed within its expected duration (inverse of PROJECT_OS.md's
  Stale Task Detection signal)
- Delivery approved by Client without a revision request
- Task accepted quickly after being posted to the Board

**Earned from Knowledge Engine activity** (cross-domain — see
KNOWLEDGE_ENGINE.md, not yet written):
- Attending internal education sessions
- Passing internal skill tests
Human Capital OS only tracks attendance/completion as a Point trigger. The
actual training content and tests belong to Knowledge Engine.

**Deducted automatically:**
- A Task that finally completes past its expected duration (the same signal
  that flagged it as "Needs Attention" in Mission Control, resolved late)

**Deducted manually (Owner/Manager judgment only — never automatic):**
- Serious violations (e.g. abandoning a Project, unresponsiveness)
This mirrors the Payout split rule: some things are inherently a judgment
call and should never be forced into a formula.

**Points are not directly cash.** They accumulate in a balance separate from
the Payout Wallet. Owner opens a **redemption window** (e.g. monthly) during
which accumulated Points convert to money at a rate Owner sets — keeping
cash flow under Owner's control while still delivering the motivational and
financial promise.

---

# Level System

Accumulated Points unlock **Levels** (e.g. Junior Editor → Editor → Senior
Editor, or custom names) — a visible progression, similar to a game, but
with real financial and professional stakes attached.

A higher Level can grant: priority visibility on the Board, first
consideration for larger Projects or multi-editor splits, and a visible
reputation marker Owner/Manager can rely on instead of relying on memory.

This is the concrete mechanism behind Human Capital OS's role as described
in FOUNDATION.md: a place that not only organizes people, but helps the
organization **identify and grow its best people** over time.

> **Deferred:** Exact Point thresholds per Level and Level names are
> intentionally left open — this is a first idea that needs to mature before
> implementation, not a decision to lock today.

---

# Point System Stability (governance rule)

Because Points and Levels become part of an editor's career and reputation
inside Zenvas, the rules **must behave like a stable contract once live** —
not like a UI setting that can be casually adjusted.

Specifically:
- Once a Point-earning or Point-losing rule is active, changing it must
  never retroactively devalue Points or Levels already earned under the old
  rule ("grandfathering").
- Rule changes apply forward, from the date they're introduced, and should
  be communicated, not silently changed.
- This principle exists because trust in the Point system **is** the
  product for the editor — if it feels arbitrary, it stops motivating and
  starts alienating. This directly serves Product Principle #3 (Human
  Before Software).

---

# Clock-In / Clock-Out (Inhouse)

Mandatory for all Inhouse Users — because Inhouse is compensated against a
committed time capacity (e.g. 8 hours/day), not purely against Task output
like Freelance.

**Purpose:** Zenvas captures the raw hours log as **salary/payroll input** —
actual payroll calculation is delegated to Odoo (per ADR-0001's pattern),
Zenvas is the source of the hours data, not the payroll engine.

> **Note:** an earlier draft of this section also justified Clock-In/Out as
> the verification mechanism for Subscription capacity ("1 Editor, 8
> hours/day"). That's no longer needed — BUSINESS_OS.md's Subscription model
> was revised to a request-slot quota (Wayfront-inspired), which needs no
> time tracking to verify. Clock-In/Out now stands on the payroll rationale
> alone, which is sufficient on its own.

Not required for Freelance — they are compensated per Task/Stage output,
not per hour, so a time log doesn't apply to their compensation model.

> **Deferred:** Exact clock-in/out UX (manual button vs. activity detection),
> and whether partial/flexible hours are allowed for Inhouse, are
> implementation details for a later session.

---

# Operational Continuity

A Project must survive an editor resigning, a producer being unavailable, or
a manager changing. Because Task/Stage-level assignment and full Payout/Point
history live on the User (not on a Brand-specific record), a person's
history and reputation move with them — reassigning work does not mean
starting from zero, for either the organization or the User.

---

# Open Items for Future Sessions

1. Exact Point trigger values, and whether brand-specific tuning is needed.
2. Level thresholds and names — first idea only, needs maturing before
   implementation (see Point System Stability — get this right before going
   live, since it can't be casually changed after).
3. Inhouse salary/payroll — likely delegated to Odoo (per ADR-0001 pattern),
   using Clock-In/Out hours as input; not yet fully decided.
4. Benefits administration (health insurance, etc.) — likely out of Zenvas's
   scope entirely; not yet confirmed.
5. Freelance → Inhouse promotion — is this ever system-suggested (based on
   Points/Level), or always a fully manual Owner decision?
6. Clock-in/out UX details (manual vs. automatic detection, flexible hours).
