# PROJECT_OS.md

Status: Locked v1.0 (Layer 4 domain review)

Depends On:
- FOUNDATION.md
- BUSINESS_OS.md
- CONTEXT.md

---

# Purpose

Project OS transforms a confirmed business commitment (a Confirmed Order,
per BUSINESS_OS.md) into creative execution.

Every Project is a living workspace where the brief, files, communication,
progress, and review exist together — visible to the Client without them
needing to ask "where are we?"

Project OS does not handle money (that's Business OS) or compensation
(that's Human Capital OS). It handles **the work itself, and its visibility**.

---

# Relationship to Other Pillars

- **Business OS → Project OS:** A Project is created only after an Order
  reaches status `Confirmed` (DP received). See BUSINESS_OS.md → Customer
  Journey & Order Lifecycle. Personal Brand is the one exception (no Order
  behind its Projects — see CONTEXT.md).
- **Project OS → Business OS:** When a Project's final Delivery is approved
  by the Client, this triggers the Final Invoice in Business OS.
- **Project OS → Human Capital OS:** Projects (or their Tasks/Stages — see
  below) are posted to the cross-brand Board. Payout is calculated per
  assignment and credited only after Client approves final Delivery. See
  BUSINESS_OS.md → Financial Confidentiality & Payout Trigger.

---

# Core Objects

## Service Template
Every Service (defined in the Business OS Service Catalog) owns its own:
- **Intake Form** — the fields a Client fills when placing an Order (e.g. a
  Real Estate Edit form asks for a Google Drive link; a Color Grading
  service form asks for DaVinci Resolve project/server access instead).
- **Stage definition** — an ordered list of Stages this type of Service goes
  through. A "Quick Edit" Service may have 3 Stages; a "Full Production"
  Service may have 6. Stages are never one-size-fits-all across a Brand —
  they belong to the Service, not the Brand.
- **Task definition per Stage** — the checklist of granular Tasks inside
  each Stage, each with an **expected duration** (a soft SLA, e.g. "Download
  raw files: expected < 2 hours").

This is the concrete mechanism behind Product Principle #2 (Framework, Not
Workflow): the framework is the Service Template structure; each Brand's
Services fill in their own Stages, Tasks, and Forms.

## Project
One instance of a Service Template, created for one Confirmed Order (or
directly for Personal Brand work). Inherits its Stage/Task structure from
its Service Template at creation time.

## Stage
A phase within a Project (e.g. "Intake & File Transfer," "Editing," "Review
& Delivery"). Stages are sequential. A Project's overall progress, shown
simply to the Client, is expressed as "Stage X of Y."

## Task
A granular, checkable unit of work inside a Stage (e.g. "Download raw
files," "Rough cut," "Color grading," "Render final"). Each Task has:
- A timestamp for when it started and when it was checked complete
- An assignee (a User — see Assignment Model below)
- An expected duration inherited from its Service Template definition
- An optional `category` (PRE_PRODUCTION / PRODUCTION / POST_PRODUCTION) for
  reporting and workload distribution across phases
- A flag `isFromTemplate` to distinguish template-generated tasks from
  manually-added ones

### Task Hierarchy (Subtasks)

Tasks can have **up to 3 levels of nesting** — max 4 total rows deep:
- Level 1: Root Task (parentTaskId = null)
- Level 2: Subtask (parentTaskId = root)
- Level 3: Sub-subtask (parentTaskId = subtask)
- Level 4: Sub-sub-subtask (parentTaskId = sub-subtask) — maximum depth

A Task is either a *root task* (parentTaskId = null) or a *child task*
(parentTaskId set).

**Why 3 levels max:**
- Prevents infinite nesting (cognitive overhead)
- Covers real-world complexity (e.g., Edit episode → Rough cut → Cut selects → Music sync)
- Matches ClickUp-style simplicity without going overboard
- PostgreSQL supports recursive CTEs or precomputed tree for efficient queries

**Use case (Westin Commercial Bali):**
```
Project: Westin Commercial Bali
Stage 1: Pre-Production
  ├─ Task: Script review (from template) ✓
  ├─ Task: Location research (from template) ✓
  └─ Task: Make new script               ← Manually added by Owner
      ├─ Subtask: Meeting klien bahas script
      └─ Subtask: Cari inspirasi baru
```

**Inheritance rules (subtasks inherit from parent):**
- Assignee (unless explicitly overridden per subtask)
- Category (PRE/PROD/POST)
- payoutAmount (defaults to null for subtasks — payout flows to parent)

**Completion cascade:**
- When a subtask is marked COMPLETE → parent's `completedChildren` count
  increments, parent task shows progress %
- When ALL children are COMPLETE → parent auto-transitions to COMPLETE
  (no manual click needed on parent)
- If a parent is marked COMPLETE manually before all children → children
  are auto-closed (or kept OPEN if explicitly required)

**Origin (template vs manual):**
- `isFromTemplate = true`: auto-generated from `Service.stageTemplate` on
  Order confirm. Default `expectedDurationMinutes` from template, default
  `payoutAmount` from template (overridable).
- `isFromTemplate = false`: manually added by Owner/Manager to an
  existing Project. Stays even if the Service Template is later modified.

**Who can add tasks (authorization rules):**

| Action | Owner | Manager | Editor |
|--------|-------|---------|--------|
| Add root task | ✅ Anywhere | ✅ Anywhere | ❌ Never |
| Add subtask to any task | ✅ Anywhere | ✅ Anywhere | ❌ Never |
| Add subtask to **own assigned task** | ✅ | ✅ | ✅ **Allowed** |
| Reassign own task to others | ❌ | ❌ | ❌ Never |
| Reassign any task (delegate) | ✅ | ✅ | ❌ Never |
| Delete any task | ✅ | ✅ | ❌ Never |

**Why Editor CAN add subtasks to their own assigned tasks:**
- It's how they break down work according to their method (like ClickUp)
- It's internal task planning — does NOT breach Client Relationship Ownership
- Owner/Manager can always override or delete

**Why Editor CANNOT reassign/delegate to others:**
- Assigning work belongs to the Brand (Owner/Manager), not individual
- Prevents Editor from "dumping" work to others
- CONSTITUTION.md #2 enforced: Client relationship stays with Brand

**Use case — Editor breaks down their own task:**
```
Day 1: Ruda assigns "Edit Episode 3" to Cakra
Day 2: Cakra clicks "+ Add subtask":
  - "Watch raw footage"
  - "Cut selects"
  - "Add B-roll"
  - "Color grading"
Day 5: Cakra completes each subtask
        → Parent "Edit Episode 3" auto-completes
```

**Use case — Manager delegates mid-work:**
```
Day 5: Client adds "German subtitles" requirement
Day 5: Manager clicks "+ Add subtask" to "Edit Episode 3":
  - "Add German subtitles"
  - Assigns to: Andi (different person)
Day 7: Andi completes German subtitles
Day 8: Cakra finishes rest → parent auto-completes
```

**Payout flow with subtasks:**
- Default: subtasks have `payoutAmount = null`; payout is on the parent,
  credited to the parent's assignee when Delivery approved.
- Optional split: Owner/Manager can attach a payout to a specific subtask
  (rare, when different people work different subtasks). Creates separate
  `Payout` records per subtask.
- The "Why" behind subtasks is granular tracking and clarity — payout
  splitting is secondary, not primary.

**UI behavior (per CONSTITUTION.md #6 — Editor UI Stays Minimal):**
- Editor sees subtasks as **inline checklist under parent** on
  `/tasks/:taskId` page (no separate navigation).
- Editor checks off subtasks one by one.
- Owner/Manager sees subtasks as **collapsible group** on
  `/projects/:projectId`, can add/edit/delete them, can reassign them
  individually.

**Task Visibility (Hybrid model — set in Service Template, override in Project):**

Per Wayfront/Zendo research (REFERENCES.md), Tasks can be marked:

| Visibility | Who Sees |
|------------|----------|
| `CLIENT_VISIBLE` (default) | Client + Owner/Manager |
| `INTERNAL_ONLY` | Owner/Manager only |

**Why this matters:**
- "Internal QC" tasks should not appear in Client Portal
- "Client approves" milestone visible to Client
- "Revision rounds" (internal) hidden from Client

**Default set in Service Template:**
```
Service: Real Estate Edit
├── Stage: Editing
│   ├── Task: Rough cut        [CLIENT_VISIBLE]
│   ├── Task: Color grading   [CLIENT_VISIBLE]
│   └── Task: Internal QC     [INTERNAL_ONLY] ← Default for QC-type tasks
```

**Override in Project (Owner/Manager can change):**
```
Project: Wayfront Hotel Commercial
├── Override: "Client wants to see Internal QC progress"
│   └── Internal QC → CLIENT_VISIBLE (override)
```

**Query logic:**
```
function getTaskVisibility(task, serviceTemplate):
  if (task.clientVisible !== null):
    return task.clientVisible  // explicit override
  else:
    return serviceTemplate.find(task).visibility  // inherit from template default
```

**UI wireframe — Service Template Editor:**
```
Stage: Post-Production
  • Offline editing        [👁 Client Visible ▼]
  • Color grading          [👁 Client Visible ▼]
  • Internal QC            [🔒 Internal Only ▼]
  • Final render           [👁 Client Visible ▼]

[👁 Client Visible ▾] = dropdown:
  • 👁 Client Visible (default)
  • 🔒 Internal Only
```

**UI wireframe — Project Detail (override):**
```
Stage: Post-Production
▶ Offline editing         [👁 Client Visible ▼]  ← can override
▶ Internal QC             [🔒 Internal Only ▼] ← can override
▶ Color grading           [👁 Client Visible ▼]
```

---

# Progress Visibility Model

Progress is tracked at two levels, matching the Layer 4 decision:

```
Project
 └─ Stage 1: Intake & File Transfer         [Client sees: "Stage 1 of 3"]
     ├─ Task: Order received & brief logged   09:02 ✓
     ├─ Task: Editor assigned                 09:15 ✓
     ├─ Task: Editor accepted                 09:16 ✓
     ├─ Task: File transfer started            09:20 ✓
     └─ Task: File transfer complete           10:45 ✓  [Client can expand to see this]
 └─ Stage 2: Editing
     ├─ Task: Rough cut                       11:00 → 13:30 ✓
     ├─ Task: Color grading                   13:35 → 15:00 ✓
     └─ Task: Render                          15:10 → ...
 └─ Stage 3: Review & Delivery
     ├─ Task: Internal QC review
     └─ Task: Sent to Client
```

The Client's default view is simple ("Stage 2 of 3: Editing") because, per
CONTEXT.md and the "Client Portal Philosophy," clients should feel cared
for, not overwhelmed. The Task-level detail is available if they choose to
expand it — this is what produces the steady stream of small, reassuring
notifications ("File transfer complete," "Editing in progress") that make
clients feel the project is alive and moving, without them needing to ask.

---

# Stale Task Detection (not a manual "Blocked" status)

A Task that remains unchecked past its expected duration is **automatically**
surfaced to Mission Control as "Needs Attention." This is inferred from
elapsed time, not manually declared by anyone.

Example: a "Download raw files" Task with an expected duration of 2 hours
that is still open after 6 hours appears in Mission Control without anyone
having to report a problem. The Owner/Manager investigates from there —
communication (chat, in future) is where the resulting conversation happens,
but it is not the detection mechanism itself.

This directly answers the Mission Control questions already defined in
BUSINESS_OS.md: "Where is the bottleneck? What changed since yesterday?"

---

# Assignment Model

Assignment happens at the **Task or Stage level, not only at the whole-Project
level**. A single Project can involve multiple editors — e.g. one editor for
Rough Cut, a different specialist for Color Grading.

> **Cross-domain implication for Human Capital OS (not yet resolved):**
> If assignment happens per Task/Stage rather than per whole Project, Payout
> (currently assumed as one flat amount per Project in BUSINESS_OS.md) likely
> needs to be split per Task/Stage assignment instead. The Board in Human
> Capital OS may need to surface individual Tasks/Stages as opportunities,
> not only whole Projects. This must be resolved in the Human Capital OS
> session — flagged here, not designed here.

---

# Task Category Examples

Task categories (PRE_PRODUCTION / PRODUCTION / POST_PRODUCTION) help with:
- **Workload reporting**: "80% of our work is POST_PRODUCTION"
- **Capacity planning**: "Do we need more production crew?"
- **Pricing insights**: "PRODUCTION costs more — we should charge accordingly"

## Category Definitions

| Category | Description | Examples |
|----------|-------------|----------|
| **PRE_PRODUCTION** | Planning, creative development, before any principal work | Script, storyboard, location recce, casting, equipment prep |
| **PRODUCTION** | Principal work — actual shoot, recording, capture | Shoot day, principal photography, pickup shots, audio recording |
| **POST_PRODUCTION** | Everything after production | Editing, color grading, sound design, VFX, graphics, rendering, delivery |

---

## Example A: Real Estate Edit (Simple)

Mostly POST_PRODUCTION — footage is already captured.

```
Stages: Pre-Production → Post-Production
(Note: no PRODUCTION stage because footage already exists)

Pre-Production:
  └─ Task: Setup (PRE_PRODUCTION)
       ├─ Subtask: Create project folder structure
       └─ Subtask: Receive footage link from client

Post-Production:
  └─ Task: Editing (POST_PRODUCTION)
       ├─ Subtask: Rough cut
       └─ Subtask: Color grading
  └─ Task: Deliver (POST_PRODUCTION)
       ├─ Subtask: Render final
       └─ Subtask: Upload to client

Category breakdown: PRE 15%, PRODUCTION 0%, POST 85%
```

**Insight**: Real Estate = 85% POST_PRODUCTION. No PRODUCTION capacity needed.

---

## Example B: Wedding Highlight (Mid-Complexity)

All POST_PRODUCTION — creative interpretation of existing footage.

```
Stages: Pre-Production → Post-Production

Pre-Production:
  └─ Task: Preparation (PRE_PRODUCTION)
       ├─ Subtask: Client interview call
       ├─ Subtask: Song selection
       └─ Subtask: Footage review

Post-Production:
  └─ Task: Editing (POST_PRODUCTION)
       ├─ Subtask: Select best moments
       ├─ Subtask: Sync to music
       ├─ Subtask: Color grading
       └─ Subtask: Transitions & pacing
  └─ Task: Sound (POST_PRODUCTION)
       └─ Subtask: Music licensing & mix
  └─ Task: Deliver (POST_PRODUCTION)
       └─ Subtask: Final render & upload

Category breakdown: PRE 20%, PRODUCTION 0%, POST 80%
```

**Insight**: Wedding = pure creative POST_PRODUCTION. Shoot is done by separate party.

---

## Example C: Westin Commercial Bali (Complex — Film/Commercial)

Has ALL 3 categories — full production cycle.

```
Stages: Pre-Production → Production → Post-Production

Pre-Production:
  └─ Task: Script development (PRE_PRODUCTION)
       ├─ Subtask: Client brief meeting
       ├─ Subtask: Research & inspiration
       ├─ Subtask: First draft
       └─ Subtask: Client revision & approval
  └─ Task: Planning (PRE_PRODUCTION)
       ├─ Subtask: Location scouting
       ├─ Subtask: Casting talent
       ├─ Subtask: Equipment booking
       └─ Subtask: Shot list / storyboard

Production:
  └─ Task: Principal shoot (PRODUCTION)
       ├─ Subtask: Setup lighting
       ├─ Subtask: Principal photography
       └─ Subtask: Behind-the-scenes footage
  └─ Task: Pickup shots (PRODUCTION)
       └─ Subtask: Additional coverage

Post-Production:
  └─ Task: Offline editing (POST_PRODUCTION)
       ├─ Subtask: Watch all takes
       ├─ Subtask: Cut selects
       └─ Subtask: Rough assembly
  └─ Task: Online editing (POST_PRODUCTION)
       ├─ Subtask: Fine cut
       └─ Subtask: Transitions & titles
  └─ Task: Color grading (POST_PRODUCTION)
       ├─ Subtask: Primary correction
       └─ Subtask: Creative look
  └─ Task: Sound design (POST_PRODUCTION)
       ├─ Subtask: Music sync
       ├─ Subtask: Sound effects
       └─ Subtask: Voiceover recording
  └─ Task: Graphics & VFX (POST_PRODUCTION)
       ├─ Subtask: Logo animation
       ├─ Subtask: Lower thirds
       └─ Subtask: 3D animation
  └─ Task: Delivery (POST_PRODUCTION)
       ├─ Subtask: Final render (multiple formats)
       └─ Subtask: Upload & client review link

Category breakdown: PRE 25%, PRODUCTION 15%, POST 60%
```

**Insight**: Commercial has balanced workload. But ratio matters:
- If POST is 60% of hours but we charge flat fee, we might under-price
- PRODUCTION = our bottleneck (need reliable crew)
- PRE = often overlooked but critical for quality

---

## Monthly Reporting (Owner View)

```
EPE Studio — June 2026

Tasks by Category:
┌────────────────────┬────────┬─────────┐
│ Category           │ Tasks  │ Hours   │
├────────────────────┼────────┼─────────┤
│ PRE_PRODUCTION     │   45   │   120h  │
│ PRODUCTION        │    8   │    64h  │
│ POST_PRODUCTION    │  240   │   720h  │
├────────────────────┼────────┼─────────┤
│ TOTAL             │  293   │   904h  │
└────────────────────┴────────┴─────────┘

Distribution: PRE 13% | PRO 7% | POST 80%

Insights:
- "80% POST_PRODUCTION — matches our service mix (RE + Wedding)"
- "PRODUCTION only 7% — all from Commercial work"
- "PRE rarely tracked before — now we see it's 120h/month"
  → Should PRE be quoted separately?
```

---

## Implementation Note

Category is set at the **root task level**. Subtasks inherit parent's category
(unless manually overridden). This keeps reporting clean — one category per
work unit, not per line item.

Owner/Manager can filter Dashboard by category:
- "Show all PRODUCTION tasks across all active projects"
- "Who's handling PRE_PRODUCTION work this week?"

---

# Worked Examples (illustrating Framework, Not Workflow)

**EPE Studio — Real Estate Edit (simple):**
Stages: Intake & File Transfer → Editing (rough cut, color grade, text/render) → Review & Delivery.
Intake Form asks for: property address, Google Drive link, brand style reference.

**EPE Studio — Color Grading Only (DaVinci Resolve specialist service):**
Stages: Intake & Project Access → Grading → Review & Delivery.
Intake Form asks for: DaVinci Resolve project/server access (not a raw
footage link) — a completely different form because the input itself is
different.

These two Services live under the same Brand but have entirely independent
Service Templates. Zenvas does not force one shape onto both.

---

# Open Items for Future Sessions

1. **Payout split per Task/Stage** (see Assignment Model above) — belongs to
   Human Capital OS.
2. **Revision/review cycles** — how many rounds of Client-requested revision
   are allowed, how a revision re-opens a Stage/Task, not yet defined.
3. **Internal QC as a formal step** — the story described an internal
   Owner/Manager review before sending to the Client; whether this is always
   a distinct Task or optional per Service Template is not yet defined.
4. ~~File storage integration~~ → **RESOLVED, see UX_MODES.md.** Zenvas
   stores links/references to external storage (Dropbox, Google Drive,
   local server) only — never raw production files. This is a permanent
   scope boundary, not a Phase 1 simplification (see CONSTITUTION.md #10
   and REFERENCES.md's DAM non-goal).
5. ~~Communication/chat mechanics~~ → **RESOLVED.** Global chat with
   per-project threads, floating bubble (always accessible), AI chat (Phase 2).
   See UI Structure below and MOCKUPS.md.
6. ~~Smart Relations (scene → storyboard → shot → schedule)~~ → **RESOLVED.**
   Automatic relation tracking without AI. When scenes change, all linked items
   are detected and cascade options provided. See Smart Relations section below.

---

# Smart Relations — Fundamental Data Linking

Zenvas tracks relationships between Script, Storyboard, Shot List, and Schedule
**automatically, without AI**. This is core to the "smart OS" philosophy.

## Relation Model

```typescript
interface SceneRelation {
  id: string;
  sourceType: 'script' | 'scene' | 'storyboard_frame' | 'shot';
  sourceId: string;
  targetType: 'storyboard_frame' | 'shot' | 'schedule_slot' | 'location' | 'talent' | 'crew';
  targetId: string;
  createdAt: DateTime;
}
```

## Scene Change Cascade

```
When Scene 3 is deleted from Script:

┌─────────────────────────────────────────────────────────────────┐
│  Scene 3 was linked to:                                         │
│                                                                  │
│  ✓ Storyboard: 2 frames (3.1, 3.2)                          │
│  ✓ Shot List: 4 shots (Shot-3-01 to Shot-3-04)              │
│  ✓ Schedule: Day 1, 10:00-11:30 (scheduled)                  │
│  ✓ Location: Beach-Sunset                                      │
│  ✓ Talent: Wayan Sudiarta (confirmed)                         │
│  ✓ Crew: Drone pilot Ketut (confirmed)                         │
│  ✓ Budget: Rp 1,200,000 allocated                            │
│                                                                  │
│  Impact Analysis:                                               │
│  • 90 minutes freed on Day 1                                   │
│  • Beach sunset slot now empty                                 │
│  • Talent + Crew now available Day 1                           │
│                                                                  │
│  Options:                                                      │
│  [ Delete scene + all linked items ]                           │
│  [ Delete scene + keep orphan frames ]                         │
│  [ Keep scene, just remove links ]                              │
└─────────────────────────────────────────────────────────────────┘
```

## Scheduling Auto-Adjustment

```
Day 1 Schedule — BEFORE:
06:00-07:00  Setup
07:00-08:00  Scene 1 (Beach wide) ✓
08:00-09:00  Scene 2 (Lobby) ✓
09:00-10:00  Scene 4 (Pool) ✓
10:00-11:30  Scene 3 (Beach sunset) ⚠️ DELETED
11:30-12:30  Scene 5 (Restaurant)

Day 1 Schedule — AFTER (auto-suggested):
06:00-07:00  Setup
07:00-08:00  Scene 1 (Beach wide) ✓
08:00-09:00  Scene 2 (Lobby) ✓
09:00-10:00  Scene 4 (Pool) ✓
10:00-11:30  ░░░░ FREE SLOT ░░░░ (was Scene 3)
11:30-12:30  Scene 5 (Restaurant)

⏱️ 90 minutes freed. Available for:
• Extend Scene 4 (pool)
• Add pickup shots
• Buffer time

[ Apply suggestions ]  [ Adjust manually ]
```

## Data Flow: Script → Scene → Storyboard → Shot List → Schedule

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCRIPT                                                                       │
│  └── Scenes detected (AI or manual)                                           │
│       ├── Scene 1: Beach establishing                                       │
│       ├── Scene 2: Lobby wide                                                 │
│       └── Scene 3: Pool aerial                                               │
│                                                                               │
│  ═════════════════════════╬════════════════════════╬═════════════════════════│
│                          ▼                ▼                ▼                  │
│                                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│  │  STORYBOARD  │   │  SHOT LIST   │   │  SCHEDULE   │              │
│  │              │   │              │   │              │              │
│  │ Frame 1.1   │   │ Shot 1.1     │   │ Day 1, AM  │              │
│  │ (Scene 1)   │   │ (Scene 1)   │   │ Scene 1+2   │              │
│  │              │   │              │   │              │              │
│  │ Frame 1.2   │   │ Shot 1.2     │   │ Day 1, PM  │              │
│  │ (Scene 1)   │   │ (Scene 1)   │   │ Scene 3      │              │
│  └──────────────┘   └──────────────┘   └──────────────┘              │
│                                                                               │
│  ALL RELATIONS TRACKED AUTOMATICALLY — NO AI REQUIRED                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# UI Structure (DaVinci Resolve + Figma Inspired)

Zenvas uses a **hybrid layout** inspired by DaVinci Resolve (workflow tabs) and Figma (persistent left panel).

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│ ┌──────────┬───────────────────────────────────────────────┐            │
│ │          │                                                │            │
│ │  LEFT    │         CONTENT AREA                         │            │
│ │  PANEL   │         (varies by selection)                 │            │
│ │          │                                                │            │
│ │  (always │                                                │            │
│ │   fixed) │                                                │            │
│ │          │                                                │            │
│ │          │                                                │            │
│ │          │                                                │            │
│ │          ├───────────────────────────────────────────────┤            │
│ │          │  📋 PRE  │  🎬 PROD  │  🎞 POST  │  📤 DEL  │            │
│ │          └───────────────────────────────────────────────┘            │
│ │                                                             ┌───┐│   │
│ │                                                             │💬 ││   │
│ │                                                             └───┘│   │
│ └───────────────────────────────────────────────────────────────    │   │
│                                                                  floating │
│                                                                   chat  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Left Panel Navigation (Always Visible)

The left panel is a **context switcher** — always visible, never disappears:

```
┌────────────────────────────────┐
│  🏠 Dashboard                 │
│                                │
│  📁 Projects                  │
│     └─ [expandable list]      │
│     • Westin Commercial       │
│     • Real Estate — 123 Maple│
│     • Wedding — Diaz          │
│                                │
│  👥 Clients                   │
│                                │
│  📋 Team                      │
│                                │
│  💰 Payouts                   │
│                                │
│  ──────────────────            │
│                                │
│  ⚙️ Settings                  │
│     ├─ Services               │
│     ├─ Brands                 │
│     └─ Team                   │
│                                │
│  ──────────────────            │
│                                │
│  🚪 Logout                    │
└────────────────────────────────┘
```

**Navigation behavior:**
| Option | Action |
|--------|--------|
| 🏠 Dashboard | Go to Business OS landing (Mission Control) |
| 📁 Projects | Expand project list, select one → opens Project OS |
| 👥 Clients | Business OS: Client management |
| 📋 Team | Business OS: Team management |
| 💰 Payouts | Business OS: Withdrawal requests |
| ⚙️ Settings | Global settings (accessible from anywhere) |

## Project Workspace (When Project Selected)

When a project is selected from the left panel, the content area shows the Project OS:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Zenvas Internal                                            [👤 Ruda ▾]│
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                             │
│  🏠        │  PROJECT: Westin Commercial Bali                           │
│  Dashboard │  Client: Westin Hotel · Status: IN PROGRESS · Due: Feb 10 │
│            │                                                             │
│  📁        ├────────────────────────────────────────────────────────────┤
│  Projects ▼│                                                             │
│    • Westin│  ⏱️ 21 days remaining                                      │
│    • RE-42 │  ████████████░░░░░░░░░░░░░░░░  35%                       │
│    • Wedding│                                                            │
│            │  ┌──────────────────────────────────────────────────────┐ │
│  👥        │  │  📋 PRE  │  🎬 PROD  │  🎞 POST  │  📤 DEL  │      │ │
│  Clients   │  └──────────────────────────────────────────────────────┘ │
│            │                                                             │
│  📋        │  ── PRE-PRODUCTION ─────────────────────────────────     │
│  Team      │                                                             │
│            │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  💰        │  │ 📝 SCRIPT │ │ 🎨 STORY  │ │ 🗺️ LOCS │         │
│  Payouts   │  │ v3 · 2h    │ │ 15 frames │ │ 3 spots  │         │
│            │  │ [Open]     │ │ [Open]    │ │ [Open]   │         │
│  ─────────│  └────────────┘ └────────────┘ └────────────┘         │
│            │                                                             │
│  ⚙️       │  ┌────────────┐ ┌────────────┐                        │
│  Settings  │  │ 🎭 CAST   │ │ 👥 CREW   │                        │
│            │  │ 4 talent   │ │ 8 crew    │                        │
│            │  │ [Open]     │ │ [Open]    │                        │
│  ─────────│  └────────────┘ └────────────┘                        │
│            │                                                             │
│  🚪        │  ── Quick Access ────────────────────────────────     │
│  Logout    │  📋 Tasks (5 open)  ·  📎 Files (12)                 │
│            │                                                        ┌──┐│
│            │                                                        │💬││
│            │                                                        └──┘│
└────────────┴───────────────────────────────────────────────────────────│
```

## 4 Workflow Tabs (DaVinci Resolve Inspired)

Each tab represents a major phase of filmmaking:

| Tab | Full Name | Purpose |
|-----|-----------|---------|
| 📋 PRE | Pre-Production | Script, storyboard, locations, cast, crew |
| 🎬 PROD | Production | Shooting schedule, call sheets, daily reports |
| 🎞 POST | Post-Production | Editorial, color, sound, graphics |
| 📤 DEL | Delivery | Client review, approvals, final deliverables |

## Floating Chat Bubble

The chat bubble appears **everywhere** — bottom-right corner, always accessible:

```
Key features:
• Always visible on every page
• Smart notifications (badge shows unread count)
• Project context (shows current project name)
• Global access (get notification → click → chat immediately)
• AI-ready (future: chat with AI assistant)
```

**Chat UX:**
```
┌─────────────────────────────────────────────────────────┐
│ 💬 Chat                                          [—][×] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📌 Discussing: [ Select project ▾ ]                  │
│                                                          │
│ Current context: Westin Commercial Bali ✓              │
│                                                          │
│ Jan 20, 2:00 PM — Manager                            │
│ "Color grading uploaded! Please review."               │
│                                                          │
│ Jan 19, 5:00 PM — Cakra                              │
│ "Rough cut v2 ready. Added transitions."              │
│                                                          │
│ ────────────────────────────────────────────────────    │
│ [Type a message...]                          [Send ➤] │
└─────────────────────────────────────────────────────────┘
```

**AI Chat (Phase 2):**
```
Future: AI integrated into chat bubble
• Answer questions about projects, tasks, team
• Generate reports
• Create tasks
• Provide insights
• Run workflows with AI assistance
```

## Client Portal (Simplified View)

Client Portal shows a simplified view — no left panel, just the essentials:

```
┌─────────────────────────────────────────────────────────┐
│  [EPE Logo]   Your Projects              [👤 Sinta ▾]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Your Projects                                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📽 Real Estate — 123 Maple St                    │  │
│  │     ████████████████████░░░░░  72%             │  │
│  │     ⏱️ 14h 23m remaining                        │  │
│  │     [ Open Project ]                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [ + Request New Project ]                              │
│                                                      ┌──┐│
│                                                      │💬││
│                                                      └──┘│
└──────────────────────────────────────────────────────────┘
```

Client sees:
- Simplified project cards with progress
- Countdown timer (hours remaining)
- Quick access to open project
- Chat bubble for communication

## Comparison with Reference Tools

| Tool | Navigation | Tabs | Chat |
|------|------------|------|------|
| DaVinci Resolve | Page tabs | Bottom workflow tabs | None |
| Figma | Left panel | None | Floating right |
| Yamdu | Left sidebar | None | Hidden |
| **Zenvas** | **Left panel (persistent)** | **Bottom 4 tabs** | **Floating right (always)** |

**Zenvas combines the best:**
- Figma's persistent navigation (never lose context)
- DaVinci's workflow tabs (organized by phase)
- WhatsApp-style floating chat (always accessible)
- AI-ready architecture (future-ready)

---

# Project OS Module Roadmap

Zenvas follows a **modular OS architecture** (see FOUNDATION.md).
Project OS consists of modules that can be installed independently.

## Phase 1 Modules (MVP)

```
PROJECT OS — PHASE 1
│
├── TASKS MODULE ✓ (CORE)
│   ├── Stages (Pre → Prod → Post)
│   ├── Tasks with subtasks (3 levels)
│   ├── Assignment + Payout
│   ├── Categories (PRE/PROD/POST)
│   ├── Visibility (Client/Internal)
│   └── Stale detection
│
├── DELIVERY MODULE ✓ (CORE)
│   ├── Review links (Google Drive, Vimeo)
│   ├── Version history
│   ├── Client approval flow
│   └── Revision tracking
│
└── COMMUNICATION (built into Project OS)
    ├── Chat/Discuss (per-project threads)
    ├── Activity Log (immutable)
    └── Global chat access (always available)
```

## Phase 2 Modules (Creative Core)

```
PROJECT OS — PHASE 2
│
├── SCRIPT WRITER MODULE
│   ├── Script import (Final Draft, Fountain, PDF)
│   ├── Script breakdown (AI-powered)
│   ├── Shot list generation
│   ├── Synopsis generator
│   └── Export to Final Draft
│
├── STORYBOARD CANVAS MODULE
│   ├── Frame-by-frame drawing
│   ├── Timing notation
│   ├── Camera direction
│   └── AI generation from script
│
├── SHOT LIST MODULE
│   ├── Shot descriptions
│   ├── Camera types
│   ├── Duration tracking
│   └── Import from storyboard
│
└── SCHEDULING MODULE
    ├── Shooting schedule
    ├── Call sheet builder
    ├── Day out of Days reports
    └── Import: Movie Magic, Fuzzlecheck
```

## Phase 3 Modules (Creative Suite)

```
PROJECT OS — PHASE 3
│
├── FREE-FORM CANVAS MODULE (MILANOTE killer)
│   ├── Drag & drop cards
│   ├── Notes, images, links, videos
│   ├── Free positioning (infinite canvas)
│   ├── Color-coded sections
│   └── Collaboration (real-time)
│
├── CREATIVE DEPARTMENTS MODULE
│   ├── Cast Management
│   ├── Location Scouting
│   ├── Costume Design
│   ├── Production Design
│   └── Makeup & Hair
│
└── MOODBOARD MODULE
    ├── Image gallery
    ├── Pinterest import
    └── Visual references
```

## Phase 4 Modules (Full Suite)

```
PROJECT OS — PHASE 4
│
├── CREW MANAGEMENT MODULE
│   ├── Crew directory
│   ├── Roles & responsibilities
│   └── Contact list
│
├── RECRUITMENT MODULE
│   ├── Job postings
│   ├── Applications
│   └── Hiring pipeline
│
└── DISTRIBUTION MODULE
    ├── Delivery formats
    ├── Platform targets (YouTube, Vimeo)
    └── Metadata
```

## Growth Potential

Modules can grow to become standalone products:

```
Script Writer:
├── v0.1: Basic import/export
├── v1.0: Full formatting + collaboration
├── v2.0: + AI writing assistant
└── Standalone: "Zenvas Script" product

Free-Form Canvas:
├── v0.1: Basic cards + positioning
├── v1.0: Real-time collaboration
├── v2.0: + Templates + AI suggestions
└── Standalone: "Zenvas Canvas" product
```
