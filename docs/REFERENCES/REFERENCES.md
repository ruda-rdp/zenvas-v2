# REFERENCES.md

Status: Locked v1.0

Purpose: Documented research on existing tools Zenvas draws inspiration
from, or deliberately avoids rebuilding. Each entry: what the tool does
well, what it lacks, and what Zenvas should take or explicitly not build.

---

# Category: Business OS References

## Odoo (self-hosted) — Primary Architectural Inspiration
Already the basis of ADR-0001 (CRM/Invoice/Payment) and the multi-company
access model behind Brand Access (CONTEXT.md, HUMAN_CAPITAL_OS.md).
**Strength:** general business operations, modular activate/deactivate.
**Gap:** not specific to creative production — no Service Template with
Stage/Task granularity, no Board, no creative review workflow. This gap is
exactly what Zenvas exists to fill.

## Wayfront (wayfront.com)
Client portal + billing for "productized agencies." Very close to Business
OS's Client Portal + Order concept.

**Take:**
- **Team capacity view** ("see who has capacity before assigning the next
  project") — a concrete visual for what Mission Control should answer
  ("which team members need support").
- **Helpdesk tied to full context** — support threads shown beside a
  Client's payment, project, and delivery history in one place, so anyone
  answering has full context without asking the Client to repeat themselves.
  This strengthens the case for a Chat/Communication object living directly
  on the Project (see Zendo below), not a separate disconnected support tool.
- **Client-side teams** — a Client Account can have multiple people with
  their own logins/permissions, not just one contact. **Not yet in our
  Client object — flagged as a gap to close (see Synthesis below).**
- **Granular client notification preferences** — Clients control what they
  get notified about, not all-or-nothing.
- **Complete white-label** (custom domain, 7 languages) — concrete proof
  point for how far "Invisible Infrastructure" should go in practice.

**Don't take:** Reselling/white-label-for-other-agencies feature — this is
Wayfront's Stage-2-equivalent, not relevant until Zenvas's own Stage 2.

### Addendum: wayfront.com/video-editing-agencies (deep dive)

This vertical-specific page directly validated and changed one locked
decision:

- **Subscription, revised:** Wayfront frames subscriptions as a **request
  quota** ("limited/unlimited requests," with a **concurrent active-request
  cap**) rather than time capacity. This replaced Zenvas's earlier "1
  Editor, 8 hours/day" model — the request-slot model needs no time
  tracking to verify, only a request counter. See BUSINESS_OS.md's revised
  Subscription section.
- **Client Brand Profile** — Clients save reusable brand assets/guidelines
  once, auto-filled into future Order intake forms. Not yet in Zenvas —
  candidate addition to Knowledge Engine's Client Preference concept.
- **Upsells & add-ons** on an Order to increase LTV — not yet in Zenvas's
  Order/Service model (currently one Service, one flat price). Candidate
  future addition, not urgent.
- **Native large file upload (5GB/file)** vs Zenvas's link-only approach —
  confirmed as a deliberate difference, not a gap: EPE Studio's actual
  workflow already uses Google Drive links (per CONTEXT.md), so Wayfront's
  upload feature solves a problem Zenvas doesn't have in this context.

## Zendo (getzendo.io)
Client portal + service catalog + workflow tool for agencies selling
productized/custom/subscription services. **The closest single match to
Business OS's Service → Order → Client Portal design** of anything researched.

**Take:**
- **Chat as the core object of a Request** — "every message, decision,
  approved quote, and file exchanged is recorded here." This is a strong,
  validated answer to PROJECT_OS.md's open item #5 (communication
  mechanics): Chat should live directly on the Project, not be bolted on.
- **Three view types (List / Table / Kanban)** for the same underlying
  Request data, switchable per user preference — good pattern for both the
  Board (HUMAN_CAPITAL_OS.md) and Mission Control.
- **Status visibility control per Workflow** — a Status can be marked
  internal-only (never shown to the Client) or Client-visible, and Zendo can
  suppress Client notifications for internal-only statuses. This refines
  our Stage/Task visibility model: it's not just "Stage visible, Task
  expandable" — individual Tasks can be marked purely internal.
- **"Watchers"** — people who follow a Request without being assigned to
  it. Useful concept for a Producer or Manager who wants visibility without
  formally holding a Task.

**Don't take:** Zendo's pricing/seat model, storefront-checkout flow — not
relevant to Zenvas's internal-tool posture.

## Hello Bonsai (hellobonsai.com)
Freelancer business tool: proposals, contracts (e-signature), invoicing,
basic time tracking, light task management.

**Take:**
- **E-signature on contracts** — Zenvas's Proposal/Quotation
  (BUSINESS_OS.md, currently under-specified) could use this pattern when
  formalized.
- **Automated overdue-payment reminders** — a small, high-value automation
  candidate once Odoo integration matures.

**Don't take (important negative signal):** Multiple reviews independently
note Bonsai's project management is "extremely basic" — this **validates**
the decision in ADR-0001 to delegate billing to Odoo while building Project
OS ourselves: a tool that's strong at billing and weak at project execution
is not a model to imitate for the execution side.

---

# Category: Project OS / Filmmaking References

## StudioBinder (studiobinder.com)
Deep pre-production and production tool: script breakdown, stripboards,
shooting schedules, call sheets, talent/crew/vendor contact catalogs,
storyboards, shot lists.

**Take:**
- **Call sheets with read/delivery tracking** — "track view counts and
  delivery status of every call sheet sent." A concrete implementation
  pattern for the kind of granular, reassuring status visibility
  PROJECT_OS.md already commits to, applied to crew/talent instead of
  Clients.
- **Custom lists for talent/vendors/crew/models** — strong validation that
  KNOWLEDGE_ENGINE.md's Resource Library (Talent & Location) is a real,
  valued feature category, not a speculative one.
- **Location details include practical context** (weather, hospital
  auto-added by location) — an enhancement idea for the Location Profile.

**Don't take — explicit non-goal:** Script breakdown, stripboards, shot
lists, storyboarding. This is deep, specialized pre-production tooling that
StudioBinder (and Celtx, and Storyflow) already do well. **Zenvas's Project
OS should not attempt to rebuild this.** For KreatifProduction's
full-production Services that need this depth, the right move is
integration or parallel tool use, not native Zenvas features.

## Yamdu (yamdu.com)
Similar production management category to StudioBinder, with additional
strength in **time cards / labor tracking** and an explicit MovieLabs OMC
API for industry interoperability.

**Take:**
- **Time cards tied to reusable labor-agreement templates**, with
  "visibility and approval" built in, exporting to payroll. This is a
  mature version of what our Clock-In/Clock-Out (HUMAN_CAPITAL_OS.md)
  is aiming at for Inhouse Users — worth revisiting Yamdu's approach when
  Clock-In/Out execution mechanics get designed.
- Reviews note the tool can feel "cumbersome" and expensive for smaller
  teams — a caution for Zenvas: don't let Project OS accumulate this kind
  of complexity, especially given the Editor UI Philosophy in
  HUMAN_CAPITAL_OS.md already commits to the opposite.

## Contentmaker (contentmaker.space) — Closest Overall Vision Match
Explicitly positions itself as "not project management — an operating
system for production," combining production management, client portal,
talent marketplace, asset library, and chat in one workspace. Currently in
private beta.

**Take (high-value findings):**
- **Talent marketplace as a two-sided system** — agencies post
  jobs/briefs, browse vetted profiles, match talent to requirements; talent
  builds a portfolio, gets discovered, manages proposals/contracts, sets
  their own rates/availability. This is a more mature version of our Board
  — worth treating as a **future direction** for the Board (freelancers
  eventually setting their own availability/rate) rather than something to
  build in Phase 1.
- **"No blank-slate setup"** — importing existing projects from
  Notion/spreadsheets on onboarding. Directly useful when Balistory or
  KreatifProduction get onboarded to Zenvas later (Phase 2+) — they likely
  have existing tracking in some ad hoc tool today.
- **Critical strategic validation: they integrate Frame.io for video
  review rather than building their own.** "Pull reviews, comments, and
  approvals directly into the project timeline." This is the single most
  important finding from this research pass — see Synthesis below.
- **Fathom (AI meeting notes) and Tally (intake forms) as native
  integrations, feeding directly into the project as tasks** — a pattern
  for how Zenvas's own AI Context (KNOWLEDGE_ENGINE.md, deferred) and
  Intake Form (PROJECT_OS.md) could eventually reduce manual data entry.

## Storyflow (storyflow.so)
AI-native infinite canvas, narrowly scoped to **pre-production planning
only** (script, storyboard, shot list, schedule, moodboard, generated from
an AI prompt). Explicitly does not touch the edit itself.

**Take:** A live example of what KNOWLEDGE_ENGINE.md's deferred "AI
Context" section gestures at — AI drafting structured planning artifacts
from a brief. Good reference for that feature's eventual shape, not
something to build now.

**Don't take:** Building our own AI-native planning canvas. Out of scope —
same reasoning as StudioBinder/Celtx above.

## Milanote (milanote.com)
Freeform visual moodboard/brainstorm canvas — explicitly not a project
management tool.

**Take:** Validates that a **Brief benefits from being visual, not just a
flat text form** — images, video, references pinned alongside the text.
Minor enhancement idea for the Intake Form / Task Brief in PROJECT_OS.md,
not an architectural change.

## Celtx (celtx.com)
Screenwriting + pre-production suite (budgeting, scheduling, storyboarding,
character/location resource library). Same category as StudioBinder —
industry-standard, deep, specialized.

**Take:** Same as StudioBinder — its Resource Library (character bios,
location files) further validates KNOWLEDGE_ENGINE.md's Resource Library
design. **Don't take:** scriptwriting/storyboarding — explicit non-goal.

---

# Synthesis: What Changes in Zenvas's Foundation

## 1. New candidate ADR: Video Review — Integrate, Don't Build
Every filmmaking-adjacent tool researched (Contentmaker explicitly, others
implicitly) treats frame-accurate video review/annotation (the Frame.io
category) as a specialized tool to integrate with, not rebuild. This is the
same reasoning as ADR-0001 (Odoo for CRM/Invoice). **Recommendation:** when
PROJECT_OS.md's "Review & Delivery" Stage is implemented, the review step
should integrate with an existing video review tool (Frame.io being the
consistent choice across references) rather than Zenvas building native
frame-accurate commenting. This deserves its own ADR before implementation.

## 2. Client Account needs multi-contact support
Both Wayfront and Zendo treat a Client Account as potentially multiple
people (Client adds their own team members, each with their own login).
BUSINESS_OS.md currently implies one Client = one contact. **Flagged as a
gap** — not urgent for EPE Studio Phase 1 (likely single-contact clients),
but should be in the data model as a one-to-many relationship from the
start, per the same "cheap now, expensive later" reasoning already applied
elsewhere.

## 3. Chat/Communication object — now has a validated design, closes Project OS open item #5
Zendo and Contentmaker both converge on the same pattern: a chat thread
attached directly to the Project/Request, recording messages, decisions,
approved quotes, and files together. This should be the answer when
PROJECT_OS.md's deferred communication mechanics get designed — not a
separate messaging system.

## 4. Explicit non-goals, now backed by evidence
Script breakdown, stripboards, shot lists, storyboarding, and AI-native
pre-production canvases are deep, mature, well-served categories (Celtx,
StudioBinder, Storyflow all compete here). **Zenvas's Project OS should
formally treat these as out of scope**, not just "not built yet" — the
market has already solved this well, and rebuilding it would violate
FOUNDATION.md's "What Zenvas Is Not" reasoning applied one layer deeper.

## 5. Board's future direction (not Phase 1)
Contentmaker's two-sided marketplace (freelancers set their own rate/
availability, build a portfolio, manage proposals) is a more mature version
of HUMAN_CAPITAL_OS.md's Board. Worth keeping in mind as a Phase 2+
direction, but the current Owner/Manager-driven Apply/Assign model remains
correct for Phase 1's scale (a handful of known freelancers, not an open
marketplace).

---

# Open Items for Future Sessions

1. **ADR candidate: Video review tool integration (Frame.io/Dropbox Replay)** —
   needed before PROJECT_OS.md's Review & Delivery Stage is implemented.
   MVP: simple link delivery only (Google Drive/Dropbox). Phase 2+: integrate
   video review tool. See wayfront.com/video-editing-agencies reference.
2. ~~Client Account multi-contact data model~~ — **RESOLVED**: `ClientContact`
   model added to DATA-MODELS.md. Client == Account, each Account can have
   multiple Contacts with their own logins/permissions. ClientContact includes:
   canApproveDelivery, canSeeAllProjects, canSeeInvoices, notification prefs.
3. **Task visibility control** — **RESOLVED**: `clientVisible` boolean (Phase 1)
   + Service Template defaults with Project-level override. Per Zendo's
   internal-only status pattern. Owner/Manager sets per Task in Service
   Template or per Project. Editor never sees this control.
4. Chat/Communication object design — now has strong reference patterns
   (Zendo, Contentmaker); ready to design in a focused session.
5. Board evolution toward marketplace-style talent discovery — explicitly
   deferred, revisit post-Phase-1.
