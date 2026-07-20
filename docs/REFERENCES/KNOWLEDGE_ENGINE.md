# KNOWLEDGE_ENGINE.md

Status: Locked v1.1 (Layer 4 domain review, added Resource Library)

Depends On:
- FOUNDATION.md
- BUSINESS_OS.md
- PROJECT_OS.md
- HUMAN_CAPITAL_OS.md

---

# Purpose

Knowledge Engine transforms every completed Project into organizational
intelligence. It exists so that knowledge belongs to the organization, never
to one person — directly serving FOUNDATION.md's Organization Memory
principle and PHILOSOPHY.md's "Knowledge should compound."

Knowledge Engine does not have its own heavy destination UI. Its job is to
**surface the right knowledge at the right moment**, inside the places
people already work (the Brief in Project OS, the training list in Human
Capital OS) — not to become one more place to dig through.

---

# Core Insight

At the start of this domain's design, all four candidate knowledge types
were found equally undocumented today: SOP/Style Guide, Client Preference
History, Template/Asset Library, and Internal Education. Rather than
prioritize one, Knowledge Engine uses **one structure that holds all four**,
attached at the level of the existing Business Objects hierarchy
(Organization → Brand → Service → Client → Project) instead of inventing a
separate one.

---

# Core Objects

## Knowledge Entry
A single piece of documented knowledge. Every Entry has a **type** and an
**attachment level**:

| Type | Typical attachment level | Example |
|---|---|---|
| SOP / Style Guide | Service (sometimes Brand) | "How EPE Studio grades real estate videos" |
| Template / Asset | Service (sometimes Brand or Organization) | Intro/outro files, DaVinci project templates, color presets |
| Client Preference | Client | "This Client prefers faster cuts, no text overlays" |
| Lessons Learned | Project | Post-mortem note after a specific Project's Delivery |
| Training Material / Test | Organization | Internal Education content — see Human Capital OS |

Attaching Knowledge at the same level as the object it describes (Service,
Client, Project) means it is automatically reachable from that object — no
separate navigation structure required.

## Knowledge Surfacing (the actual mechanism)
Rather than requiring people to browse a library, relevant Knowledge Entries
are injected directly into existing surfaces:
- An Editor's **Brief** (from PROJECT_OS.md) automatically includes the
  Service's SOP/Style Guide and the Client's Preference notes, if any exist.
- Owner/Manager/Producer, when reviewing a Project, see the same information
  plus the ability to add new Entries.

A dedicated browsing view (a "library") exists for Owner/Manager/Producer to
manage Entries directly, but it is not the primary way Editors encounter
this knowledge — they encounter it inside the Brief they already read.

---

# The Compounding Loop (Lessons Learned)

After a Project's Delivery is approved (per BUSINESS_OS.md's Order
lifecycle), Owner/Manager/Producer gets a lightweight, **optional** prompt:
capture what worked or what didn't. This is deliberately low-friction — a
short note, not a mandatory report — consistent with Product Principle #3
(Human Before Software).

A Lessons Learned entry can, at the Owner/Manager's discretion, be
**promoted**: generalized into an update to the relevant Service's SOP, or
added to the Template/Asset library. This is how individual Project
experience compounds into reusable organizational knowledge over time — the
mechanism behind FOUNDATION.md's Creative Business Flywheel ("Better
Projects improve organizational Knowledge").

This step is never mandatory and never blocks Order/Project completion — it
is an invitation, not a gate.

---

# Relationship to Human Capital OS (Internal Education)

Knowledge Engine owns the actual training content and skill tests. Human
Capital OS only tracks attendance/completion as a Point trigger (see
HUMAN_CAPITAL_OS.md → Points Model). Knowledge Engine does not manage
compensation, levels, or reputation — that stays entirely in Human Capital
OS.

---

# AI Context (forward-looking)

PHILOSOPHY.md states "People create great work; AI amplifies people." The
accumulated Knowledge Entries — SOP, Style Guides, Client Preferences,
Templates — are the natural raw material for any future AI-assisted feature
inside Zenvas (e.g. drafting a Client update in the Brand's tone, checking a
rough cut against a Service's style guide).

> **Deferred:** No AI feature is specified or scoped yet. This section only
> establishes that Knowledge Engine is the eventual source of context for
> such features, so future AI work is not designed against a blank slate.

---

# Out of Scope

Knowledge Engine does not replace a general-purpose file storage or DAM
(Digital Asset Management) system. It stores structured Knowledge Entries
(text, references, small assets) — not raw production footage or large
media libraries. See PROJECT_OS.md → Open Items (file storage integration)
for where raw project files are addressed.

---

# Resource Library: Talent, Location & Crew

Beyond documentation-style Knowledge Entries, the studio accumulates
**reusable resources** as it gains experience. These are Brand-level assets
that grow smarter with every project.

---

## Philosophy: The Smarter Zenvas Gets

```
╔═════════════════════════════════════════════════════════════════════════╗
║  "Every project makes Zenvas smarter."                                   ║
║                                                                          ║
║  WEEK 1: First project with Wayan Sudiarta                             ║
║  Wayan: "Name, photo, first project"                                    ║
║                                                                          ║
║  YEAR 1: After 12 projects with Wayan                                   ║
║  Wayan: Skills, rates, approval history, preferred times, clients...   ║
║                                                                          ║
║  YEAR 2: After 50+ projects                                           ║
║  Wayan: ZENVAS KNOWS "Best for beach resort scenes, book 2 weeks ahead"║
╚═════════════════════════════════════════════════════════════════════════╝
```

---

## Smart Relations — WITHOUT AI

This is **fundamental**, not AI-dependent. Zenvas tracks relationships
between data automatically.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SMART RELATIONS — Scene Change Cascade                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  When a Scene is CHANGED, ADDED, or DELETED:                            │
│                                                                          │
│  Scene 3 deleted from script:                                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Scene 3 was linked to:                                         │   │
│  │                                                                  │   │
│  │  ✓ Storyboard: 2 frames (3.1, 3.2)                             │   │
│  │  ✓ Shot List: 4 shots (Shot-3-01 to Shot-3-04)                │   │
│  │  ✓ Schedule: Day 1, 10:00-11:30 (scheduled)                   │   │
│  │  ✓ Location: Beach location (Beach-Sunset)                     │   │
│  │  ✓ Cast: Wayan Sudiarta (confirmed)                            │   │
│  │  ✓ Crew: Drone pilot Ketut (confirmed)                         │   │
│  │  ✓ Budget: Rp 1,200,000 allocated                             │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Impact Analysis:                                                       │
│  • 90 minutes freed on Day 1                                         │
│  • Beach location sunset slot now empty                               │
│  • Wayan + Ketut now available Day 1                                │
│                                                                          │
│  Options:                                                              │
│  [ Delete scene + all linked items ]                                  │
│  [ Delete scene + keep orphan frames ]                                │
│  [ Keep scene, just remove links ]                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Relation Types (No AI Required)

```typescript
interface Relation {
  id: string;
  sourceType: 'script' | 'scene' | 'storyboard' | 'shot';
  sourceId: string;
  targetType: 'storyboard' | 'shot' | 'schedule' | 'location' | 'cast' | 'crew' | 'budget';
  targetId: string;
  createdAt: DateTime;
}
```

### Cascade Behaviors

| Action | Auto-Detected | User Decision |
|--------|---------------|---------------|
| Delete scene | All linked items identified | What to do with them |
| Add scene | Empty slots in schedule detected | Where to insert |
| Move scene | Schedule conflicts detected | Reschedule or keep |
| Edit scene | Text changes noted | Notify if significant |

### Scheduling Auto-Adjustment

```
Scene 3 deleted from Day 1:

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

---

## Brand-Level Templates

For repeatable project types.

```
KNOWLEDGE ENGINE — Templates (Brand Level)
│
├── 📋 Project Templates
│    ├── Commercial Video (60s) ← Most used (12x)
│    ├── Real Estate Edit (Standard)
│    └── Wedding Highlight
│
├── 📄 Script Templates
│    ├── Standard Commercial Structure
│    └── Real Estate Formula
│
└── 📅 Schedule Templates
     ├── Half-Day Shoot
     └── Full-Day Commercial
```

### Project Template Example

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Template: Commercial Video (60s)                            │
│  EPE Studio · Used 12 times                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Service Config ────────────────────────────────────         │
│  Name: Commercial Video (60s)                                    │
│  Price: Rp 15,000,000                                          │
│  Duration: 60 seconds                                           │
│                                                                  │
│  ── Default Stages ────────────────────────────────              │
│  ✓ Pre-Production (3-5 days)                                   │
│  ✓ Production (1 day)                                          │
│  ✓ Post-Production (5-7 days)                                 │
│  ✓ Delivery                                                    │
│                                                                  │
│  ── Default Locations ──────────────────────────────               │
│  Suggestions from past projects:                                   │
│  • [Westin Beach] — used 8x                                  │
│  • [Mandapa Resort] — used 5x                                │
│                                                                  │
│  ── Default Cast Requirements ──────────────────────             │
│  • Lead: 1 person (casual professional)                       │
│  • Supporting: 1-2 extras                                     │
│                                                                  │
│  ── Default Crew ─────────────────────────────────              │
│  • Drone pilot (if outdoor)                                    │
│  • Gaffer                                                      │
│                                                                  │
│  ── Pricing Breakdown ─────────────────────────────              │
│  Production: Rp 5,000,000                                      │
│  Post-Production: Rp 7,000,000                                │
│  Management: Rp 3,000,000                                     │
│  Total: Rp 15,000,000                                         │
│                                                                  │
│  [Edit Template]  [Use for New Project]  [Duplicate]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Talent Library — Comprehensive Profile

Every project adds to talent's profile.

```
┌─────────────────────────────────────────────────────────────────┐
│  🎭 Talent: Wayan Sudiarta                                         │
│  EPE Studio · Top Rated ⭐⭐⭐⭐⭐                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Profile ────────────────────────────────────────             │
│  Name: Wayan Sudiarta                                              │
│  Type: Male · 28 · Bali                                           │
│  Categories: Beach scenes, family, casual professional           │
│  Rate: Rp 750,000/day (negotiated)                              │
│                                                                  │
│  ── Performance History ────────────────────────────             │
│  Projects completed: 12                                           │
│  Approval rate: 94% (first take)                                │
│  Average feedback: "Professional, always on time"               │
│  Rating: ⭐⭐⭐⭐⭐ 4.8                                            │
│                                                                  │
│  ── Skills & Preferences ──────────────────────────               │
│  Best at: Quick turnaround, minimal direction needed            │
│  Preferred times: Morning (6-10 AM)                             │
│  Equipment: Minimal — natural look                               │
│  Scene types mastered: Beach, resort, pool, restaurant        │
│                                                                  │
│  ── Rate History ────────────────────────────────                │
│  2024: Rp 500,000/day (starting rate)                          │
│  2025: Rp 600,000/day (+20%)                                   │
│  2026: Rp 750,000/day (+25%) — demand increased                │
│                                                                  │
│  ── Availability ────────────────────────────────                 │
│  Calendar: [Visual calendar view]                               │
│  Typical availability: 2+ weeks booking ahead                   │
│  Current status: ⚠️ Booked Feb 5-10 (Westin)                  │
│                                                                  │
│  ── Clients Who Requested ──────────────────────                │
│  • Westin Hotel (4 projects)                                    │
│  • Mandapa Resort (3 projects)                                   │
│  • COMO Shambhala (2 projects)                                  │
│                                                                  │
│  ── Project History ──────────────────────────────                │
│  • Westin Commercial (2026) — ✅ Approved                      │
│  • RE-Mandapa Suite (2025) — ✅ Approved                        │
│  • Wedding-Diaz (2025) — ✅ Minor revision                      │
│                                                                  │
│  ── Documents ────────────────────────────────                   │
│  ✅ NDA — Valid until Jan 2027                                  │
│  ✅ Contract Westin 2026 — Active                               │
│  ⚠️ MoU Mandapa — Expiring in 90 days                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Talent Documents — Contract Memory

Zenvas remembers every agreement.

```
┌─────────────────────────────────────────────────────────────────┐
│  🎭 Documents — Wayan Sudiarta                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 NDA — General (EPE Studio)                             │   │
│  │    Signed: Jan 15, 2025                                │   │
│  │    Expires: Jan 15, 2027                               │   │
│  │    Status: ✅ Valid                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 Contract — Westin Commercial 2026                      │   │
│  │    Project: Westin Commercial Bali                      │   │
│  │    Signed: Feb 1, 2026                                   │   │
│  │    Rate: Rp 800,000/day (project rate)                 │   │
│  │    Terms: "Overtime Rp 100,000/hour after 8h"         │   │
│  │    Special: "Beach scenes only, max 4 hours"            │   │
│  │    Status: ✅ Active                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 MoU — Mandapa Resort Talent List 2026                 │   │
│  │    Company: Mandapa Resort                              │   │
│  │    Signed: Dec 10, 2025                                 │   │
│  │    Terms: "Preferred talent for resort shoots"         │   │
│  │    Validity: Until Dec 2026                            │   │
│  │    Status: ⚠️ Expiring soon (90 days)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ── Project-Specific Agreements ──────────────────────────────│
│                                                                  │
│  Westin Commercial (2026):                                       │
│  • Rate: Rp 800,000/day                                       │
│  • Special: Beach scenes only, overtime Rp 100,000/hr          │
│  • Requirements: Natural look, no heavy makeup                 │
│                                                                  │
│  Mandapa Resort (2026):                                         │
│  • Rate: Rp 750,000/day                                       │
│  • Special: Elegant resort vibes                               │
│  • Requirements: Formal attire available                      │
│                                                                  │
│  ── Document Types ────────────────────────────────────────   │
│                                                                  │
│  • NDA — Non-disclosure agreement                              │
│  • Contract — Project-specific terms                           │
│  • MoU — Memorandum of understanding                          │
│  • Release — Talent release form                               │
│  • Insurance — Certificate                                    │
│  • Certification — Skills certifications                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Document Types

```typescript
enum DocumentType {
  NDA = 'nda',
  CONTRACT = 'contract',
  MOU = 'mou',
  RELEASE = 'release',
  INSURANCE = 'insurance',
  CERTIFICATION = 'certification',
  OTHER = 'other'
}

interface TalentDocument {
  id: string;
  talentId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  signedAt?: DateTime;
  expiresAt?: DateTime;
  projectId?: string;
  terms?: string;
  notes?: string;
  status: 'pending' | 'valid' | 'expired' | 'archived';
}
```

### Intelligent Reminders

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 Document Reminders                                           │
│                                                                  │
│  ⚠️ NDA expiring: Wayan Sudiarta (exp: Jan 15, 2027)          │
│     [Send renewal request]  [View Document]                      │
│                                                                  │
│  ⚠️ Contract expiring: Mandapa MoU (exp: Mar 15, 2026)        │
│     [Send renewal request]  [View Document]                      │
│                                                                  │
│  📋 Pending: Wayan Sudiarta — New project contract             │
│     Project: RE-NusaDua Suite (2026)                           │
│     Status: Awaiting signature                                  │
│     [Send for signing]  [View]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Crew Library

```
┌─────────────────────────────────────────────────────────────────┐
│  👥 Crew: Ketut Ramtha                                           │
│  EPE Studio · Drone Pilot ⭐⭐⭐⭐⭐                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Profile ────────────────────────────────────────             │
│  Name: Ketut Ramtha                                              │
│  Role: Drone Pilot                                               │
│  Type: Freelance                                                 │
│  Rate: Rp 1,500,000/day                                         │
│                                                                  │
│  ── Skills & Equipment ──────────────────────────────            │
│  Skills: A2C license, underwater drone, mapping                │
│  Equipment: DJI Mavic 3, GoPro Hero 12                         │
│  Specializations: Beach aerial, resort overview, sunset shots   │
│                                                                  │
│  ── Performance ─────────────────────────────────              │
│  Projects: 12 completed                                          │
│  Rating: ⭐⭐⭐⭐⭐ 4.9 (8 reviews)                              │
│  Safety record: Zero incidents                                   │
│                                                                  │
│  ── Availability ────────────────────────────────               │
│  Calendar: [Visual calendar]                                     │
│  Current: Available Feb 1-3 (Westin)                            │
│                                                                  │
│  ── Project History ──────────────────────────────              │
│  • Westin Commercial (2026)                                      │
│  • RE-Mandapa Suite (2025)                                      │
│  • Wedding-Sunset Beach (2025)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Location Library — Full Scouting Module

```
┌─────────────────────────────────────────────────────────────────┐
│  🗺️ Location: The Westin Resort Nusa Dua                        │
│  EPE Studio · Premium (verified)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ── Basic Info ────────────────────────────────                 │
│  Name: The Westin Resort Nusa Dua                                │
│  Address: BT. 123, Benoa, South Kuta, Badung, Bali            │
│  Category: Resort / Hotel                                        │
│  📍 -8.8197° S, 115.2319° E                                    │
│  [ Open in Maps ↗ ]                                            │
│                                                                  │
│  ── Highlights ────────────────────────────────                 │
│  • Private beach access                                          │
│  • Multiple pool areas (beachfront, infinity)                   │
│  • Conference room (indoor option)                               │
│  • Spa facilities                                               │
│                                                                  │
│  ── Photos ──────────────────────────────────────                │
│  📸 24 photos  ·  🎥 3 sample videos                           │
│                                                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │📷  │ │📷  │ │📷  │ │📷  │ │📷  │ │📷  │ │📷  │         │
│  │    │ │    │ │    │ │    │ │    │ │    │ │    │         │
│  │Lobby│ │Pool │ │Beach│ │Beach│ │Spa │ │Room│ │Rest│         │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                                  │
│  ── Frame Scouts (Specific Angles) ─────────────────           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Frame 1: Beachfront Establish                            │   │
│  │ 📍 Coordinates: -8.8198° S, 115.2320° E              │   │
│  │ 📷 Photo: [Beach-Frame1.jpg]                          │   │
│  │ 📝 Notes: "Stand on rocks for height, face east"     │   │
│  │ 🎬 Time: Best 6-7 AM, golden hour                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Frame 2: Pool Aerial                                     │   │
│  │ 📍 Coordinates: -8.8195° S, 115.2315° E              │   │
│  │ 📷 Photo: [Pool-Aerial-Frame2.jpg]                   │   │
│  │ 📝 Notes: "Drone required, 30m altitude max"           │   │
│  │ 🎬 Time: Any time, avoid 12-2 PM (harsh light)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ── Permit & Cost ────────────────────────────────             │
│  Permit required: ✅ Yes                                        │
│  Permit cost: Rp 500,000/day                                    │
│  Permit status: ✅ Confirmed (until Dec 2026)                  │
│  Permit document: [View PDF ↗]                                 │
│                                                                  │
│  Usage fee: Rp 2,000,000/day                                   │
│  Parking: Rp 10,000/day (valet)                                │
│  Catering: Mandatory from hotel (min Rp 500,000)              │
│                                                                  │
│  ── Scout Notes ────────────────────────────────────           │
│  Best time: Golden hour (6-7 AM) or magic hour (5-6 PM)       │
│  Crowds: Medium on weekdays, high on weekends                   │
│  Parking: Valet only, Rp 10,000/day                            │
│  Power: 24/7 available                                         │
│                                                                  │
│  ── Contact ──────────────────────────────────────              │
│  Marketing Dept: Maya Dewi                                      │
│  Phone: +62 811 2345 6789                                     │
│  Email: maya@westinbalibali.com                                 │
│  Response time: Usually within 24 hours                        │
│                                                                  │
│  ── Project History ──────────────────────────────             │
│  • Westin Commercial (2026) — 3 days, approved                │
│  • RE-Mandapa Resort (2025) — 2 days, approved               │
│  • RE-Nusa Dua Suite (2025) — 1 day, approved                 │
│                                                                  │
│  ── ZENVAS INSIGHTS ──────────────────────────────              │
│  "Most used beach location. Best for sunrise shots.             │
│   Book 1 week ahead for permit confirmation."                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Knowledge Accumulation Per Resource

| Resource | Data That Accumulates |
|----------|----------------------|
| **Talent** | Profile, skills, rates, availability, documents, project history, performance rating, client requests |
| **Crew** | Skills, equipment, rates, availability, safety record, project history |
| **Location** | Basic info, coordinates, frame scouts, photos, permits, costs, weather patterns, success stories, client feedback |

---

## Ownership Model

A Talent, Crew, or Location record is **owned by one Brand by default** — 
isolated, the same way Odoo Contacts are scoped to one Company by default.
A record can be explicitly shared with additional Brands, exactly like
the User Brand Access pattern in HUMAN_CAPITAL_OS.md.

---

## Visibility

Cost/rate data (talent rate, permit fee) follows the same confidentiality
tier as the internal Payout Budget: visible to Owner/Manager/Producer,
not to Editor.

---

# Open Items for Future Sessions

1. Exact promotion workflow (Lessons Learned → SOP update) — who can
   approve a promotion, and whether it requires review.
2. Template/Asset storage mechanics (file size, hosting) — likely needs the
   same integration decision as PROJECT_OS.md's file storage open item.
3. AI feature scoping — deferred entirely, see AI Context above.
4. Whether Producer can create/edit SOP, or only view it (their permission
   level for Knowledge Entries hasn't been checked against the Roles &
   Permissions matrix in HUMAN_CAPITAL_OS.md).
5. Confirm Talent/Location cost visibility tier (currently assumed same as
   Payout Budget — Owner/Manager/Producer only).
