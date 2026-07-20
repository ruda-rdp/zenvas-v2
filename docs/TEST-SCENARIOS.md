# TEST-SCENARIOS.md

**Purpose:** Real-world benchmark scenarios for Zenvas development.
Every feature must pass these scenarios before moving to next phase.

**Last Updated:** 2026-07-20

---

# The Organizations

```
ZENVAS ECOSYSTEM
│
├── ORGANIZATION: KreatifProduction (Ruda's company)
│   │
│   ├── BRAND: EPE (Eat Pray Edit)
│   │   └── Daily leads, high volume, quick turnaround
│   │
│   ├── BRAND: Balistory (Bali Wedding Stories)
│   │   └── Premium wedding films
│   │
│   └── BRAND: KreatifProduction (Main)
│       └── Commercial, corporate, large projects
│
└── ORGANIZATION: Dewa's Studio (Solo)
    │
    └── SOLO OPERATION — No brands
        └── Fully customizable modules
        └── Grows to team when ready
```

---

# The Team

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TEAM — KreatifProduction                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FOUNDER                                                               │
│  └── Ruda — Solo Videographer, Founder                                 │
│      │                                                                 │
│      ├── "Hands on camera" — does all principal photography            │
│      ├── Dreams big — full service production house vision              │
│      └── Uses Zenvas daily on phone + laptop                           │
│                                                                          │
│  CO-FOUNDER / MANAGER                                                  │
│  └── Happy — Wife, Operations Manager                                   │
│      │                                                                 │
│      ├── Manages all client communication                              │
│      ├── Handles invoicing, contracts, admin                           │
│      └── Works from home, coordinates everything                        │
│                                                                          │
│  IN-HOUSE EDITOR                                                       │
│  └── Cakra — Full-time Editor                                          │
│      │                                                                 │
│      ├── Primary editor for all projects                                │
│      ├── Works in-office (or home, flexible)                           │
│      └── Gets tasks assigned via Zenvas                                 │
│                                                                          │
│  FREELANCE PRODUCER                                                    │
│  └── Andi — Freelance Producer                                         │
│      │                                                                 │
│      ├── Joins for BIG projects only                                   │
│      ├── Manages from brief to delivery                                │
│      └── Remote, charged per project                                    │
│                                                                          │
│  FREELANCE REMOTE EDITORS                                              │
│  └── Dimas, Wira, Sari — Remote Editing Pool                          │
│      │                                                                 │
│      ├── Used when Cakra overloaded                                     │
│      ├── Pay per task or per project                                   │
│      └── Communication via Zenvas chat                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TEAM — Dewa's Studio (Solo)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SOLO CREATOR                                                          │
│  └── Dewa — YouTube Traveler, Bali                                     │
│      │                                                                 │
│      ├── Solo content creator                                           │
│      ├── Growing business, needs structure                             │
│      ├── Gets collaboration project at Labuan Bajo (Ayana)              │
│      └── Using Zenvas solo, simpler needs                              │
│                                                                          │
│  Philosophy: "Solo first, grow as you go"                            │
│  Not all modules needed from day 1.                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario 1: EPE-001 — Daily Lead Flow

**Brand:** EPE (Eat Pray Edit) | **Persona:** Happy | **Priority:** 1️⃣

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: EPE-001 — Daily Lead to Project                             │
│  Persona: Happy (Manager) | Brand: EPE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  It's 9:00 AM. Happy opens Zenvas, sees 2 new leads from EPE.          │
│  Yesterday Ruda DM'd them on Facebook.                                 │
│                                                                          │
│  STEP 1: Lead comes in                                                 │
│  ─────────────────────────────────────────────────────────────────────│
│  • New lead notification appears in Zenvas                            │
│  • Source: studio.eatprayedit.com registration                         │
│  • Client: "Budi Santoso" (Real Estate Agent)                          │
│  • Interest: "Villa in Seminyak, 60s video"                           │
│  • Budget: "Rp 5-8 juta"                                              │
│  • Timeline: "ASAP, listing goes live in 2 weeks"                     │
│                                                                          │
│  STEP 2: Happy creates lead in Zenvas                                  │
│  ─────────────────────────────────────────────────────────────────────│
│  • Creates Lead in EPE brand                                          │
│  • Adds notes from Facebook DM conversation                            │
│  • Sets priority: HIGH (timeline tight)                                │
│  • Tags: #realestate #seminyak #urgent                                │
│                                                                          │
│  STEP 3: Quick qualification                                           │
│  ─────────────────────────────────────────────────────────────────────│
│  • Happy sends WhatsApp to confirm                                     │
│  • Budget confirmed: Rp 6 juta                                        │
│  • Villa location: [Google Maps link]                                 │
│  • Client can provide drone                                          │
│  • Client has reference videos (likes a style)                        │
│                                                                          │
│  STEP 4: Create Project                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  • Happy creates Project: "RE-Seminyak Villa"                         │
│  • Brand: EPE                                                          │
│  • Service: Real Estate Video (Standard) — from template               │
│  • Client: Auto-linked to Budi Santoso                                 │
│  • Stages auto-created from template:                                  │
│  │   Pre-Production → Post-Production → Delivery                    │
│  • Tasks auto-populated from template                                  │
│                                                                          │
│  STEP 5: Assign work                                                   │
│  ─────────────────────────────────────────────────────────────────────│
│  • Pre-Production task "Create project folder" → Ruda                │
│  • Pre-Production task "Client intake form" → Happy                   │
│  • Post-Production task "Edit video" → Cakra (or Wira if busy)      │
│                                                                          │
│  STEP 6: Project kicked off                                            │
│  ─────────────────────────────────────────────────────────────────────│
│  • Notification sent to Ruda: "New project: RE-Seminyak Villa"       │
│  • Project appears in Ruda's dashboard                                │
│  • Timer starts on tasks                                              │
│                                                                          │
│  EXPECTED OUTCOME:                                                     │
│  ✓ Project created in < 10 minutes                                    │
│  ✓ All tasks auto-generated from template                             │
│  ✓ Team knows what's next                                             │
│  ✓ Client feels professional from day 1                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario 2: EPE-002 — Peak Day (3 Leads in 1 Day)

**Brand:** EPE | **Persona:** Happy + Ruda + Remote Editor | **Priority:** 2️⃣

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: EPE-002 — Peak Day (3 leads, multiple projects)            │
│  Persona: Happy (Manager), Ruda (Director), Remote Editors            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  Tuesday. EPE had a GOOD day. 3 new leads on Facebook.                │
│  Happy needs to handle all 3 without getting overwhelmed.              │
│                                                                          │
│  09:00 AM — First lead comes in                                       │
│  ─────────────────────────────────────────────────────────────────────│
│  • New lead: "Villa Canggu for Remote"                               │
│  • Budget: Rp 4 juta                                                 │
│  • Timeline: 10 days                                                 │
│                                                                          │
│  Happy acts FAST:                                                     │
│  • Creates Lead in Zenvas                                            │
│  • Tags: #realestate #canggu #quick                                 │
│  • Qualifies via WhatsApp (15 min)                                   │
│  • Budget confirmed: Rp 4.5 juta                                     │
│                                                                          │
│  Creates Project: "RE-Canggu Villa"                                  │
│  • Template: Real Estate Video (Standard)                             │
│  • Client auto-created                                              │
│  • Tasks auto-generated                                             │
│                                                                          │
│  Assigns:                                                             │
│  • Pre-production: Ruda                                              │
│  • Post-production: Dimas (remote, available)                         │
│                                                                          │
│  10:30 AM — Second lead comes in                                     │
│  ─────────────────────────────────────────────────────────────────────│
│  • New lead: "Product showcase for local brand"                      │
│  • Budget: Rp 2 juta                                                 │
│  • Timeline: 7 days                                                 │
│                                                                          │
│  Happy processes:                                                    │
│  • Creates Lead + Project                                            │
│  • Template: Product Showcase (EPE has this!)                         │
│  • Assigns: Ruda (prep), Wira (edit, available)                     │
│                                                                          │
│  11:45 AM — Third lead comes in                                      │
│  ─────────────────────────────────────────────────────────────────────│
│  • New lead: "Restaurant promotion video"                            │
│  • Budget: Rp 3 juta                                                 │
│  • Timeline: 14 days                                                │
│  • URGENT: Opening in 2 weeks, needs fast turnaround                 │
│                                                                          │
│  Happy sees URGENT tag                                               │
│  • Creates Lead + Project FAST                                       │
│  • Template: Social Media Video (Quick Turnaround)                    │
│  • Priority: HIGH                                                    │
│  • Assigns: Ruda (prep + shoot), Cakra (edit, prioritized)          │
│                                                                          │
│  12:00 PM — Happy's dashboard                                         │
│  ─────────────────────────────────────────────────────────────────────│
│  Happy sees 3 active projects in pipeline:                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ACTIVE PROJECTS — EPE                                        │    │
│  │                                                              │    │
│  │ 1. RE-Canggu Villa         │ Ruda: Prep │ Dimas: Edit │     │    │
│  │ 2. Product Showcase Brand  │ Ruda: Prep │ Wira: Edit │     │    │
│  │ 3. Restaurant Promo ⚠️    │ Ruda: Prep │ Cakra: Edit │    │    │
│  │    (HIGH PRIORITY)         │ Client: URGENT                 │    │
│  │                                                              │    │
│  │ Ruda's load: 3 projects (manageable)                        │    │
│  │ Cakra's load: 1 project (HIGH priority)                    │    │
│  │ Remote editors: 2 projects (manageable)                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  02:00 PM — Ruda responds                                           │
│  ─────────────────────────────────────────────────────────────────────│
│  • "Restaurant promo is tight. I'll shoot tomorrow AM."              │
│  • Updates task: "Shoot: Tomorrow 8 AM"                             │
│  • Happy notifies client                                            │
│                                                                          │
│  05:00 PM — All 3 projects on track                                 │
│  ─────────────────────────────────────────────────────────────────────│
│  ✓ Project 1: Prep done, waiting for client footage                  │
│  ✓ Project 2: Brief sent to client                                  │
│  ✓ Project 3: Shoot scheduled for tomorrow                          │
│                                                                          │
│  EXPECTED OUTCOME:                                                   │
│  ✓ Happy handled 3 leads without panic                              │
│  ✓ Templates saved 30+ minutes of setup                             │
│  ✓ Team load visible at a glance                                    │
│  ✓ No leads dropped                                                  │
│  ✓ Priority clear for everyone                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario 3: BALI-001 — Wedding Film (Complex)

**Brand:** Balistory | **Persona:** Happy + Ruda + Cakra | **Priority:** 3️⃣

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: BALI-001 — Wedding Film: Diaz & Sarah                       │
│  Persona: Happy (Manager), Ruda (Videographer), Cakra (Editor)          │
│  Duration: 4-6 weeks                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  Diaz & Sarah booked Balistory for their July wedding in Uluwatu.     │
│  Contract signed, DP received. Project starts.                          │
│                                                                          │
│  PHASE 1: Pre-Production (3 weeks before wedding)                     │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEEK 1: Setup & Planning                                             │
│  • Happy creates Project: "Wedding-DiazSarah"                         │
│  • Brand: Balistory                                                   │
│  • Service: Wedding Cinematic (Full Day) — from template               │
│  • Client profile auto-created from contract                           │
│                                                                          │
│  Pre-Production tasks generated:                                        │
│  □ Pre-wedding consultation call (Happy)                              │
│  □ Receive shot list from couple                                      │
│  □ Location scouting (if needed)                                       │
│  □ Equipment check                                                   │
│  □ Backup equipment arranged                                          │
│                                                                          │
│  Client preferences saved:                                             │
│  • "Love cinematic, slow-motion shots"                                │
│  • "Don't like drone shots"                                           │
│  • Music preference: "Jazz or acoustic"                               │
│  • Saved to Client history for future reference                      │
│                                                                          │
│  WEEK 2: Pre-wedding shoot (if applicable)                            │
│  • Ruda does pre-wedding shoot                                        │
│  • Photos uploaded to project                                         │
│  • Notes added for wedding day                                        │
│                                                                          │
│  WEEK 3: Final prep                                                   │
│  • Timeline finalized                                                 │
│  • Call sheet created                                                 │
│  • Team briefing (Cakra knows the couple's style preference)          │
│                                                                          │
│  PHASE 2: Production (Wedding Day)                                     │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEDDING DAY — Uluwatu Temple                                         │
│                                                                          │
│  Morning: Preparation                                                 │
│  • Ruda captures bride & groom preparation                             │
│  • Second shooter (freelance) covers both sides                       │
│                                                                          │
│  Ceremony: Uluwatu Temple                                             │
│  • Main ceremony coverage                                            │
│  • Drone shots (Ketut — drone pilot from library)                     │
│                                                                          │
│  Reception: Jimbaran                                                   │
│  • Full coverage                                                       │
│                                                                          │
│  Post-shoot:                                                          │
│  • Ruda backs up footage immediately                                  │
│  • Notes in Zenvas: "Ceremony ran 30min late, got all shots"          │
│  • Ketut uploads drone footage                                        │
│                                                                          │
│  PHASE 3: Post-Production (2-3 weeks)                                │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Cakra works on edit:                                                 │
│                                                                          │
│  □ Watch all footage (Ruda's notes help)                             │
│  □ Select best moments                                                │
│  □ First cut: "Teaser" (sent at 1 week)                              │
│  □ Client reviews teaser                                              │
│  │   → "Love the music choice!" ✓                                   │
│  │   → "Can we have more shots of Sarah's dress?"                   │
│  □ Cakra adds requested shots                                         │
│  │   → Second edit                                                   │
│  □ Client approves "Fine cut"                                         │
│  │   → "Perfect!"                                                   │
│  □ Color grading                                                     │
│  □ Sound mix                                                          │
│  □ Final render (multiple formats)                                     │
│                                                                          │
│  PHASE 4: Delivery                                                    │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  ✓ Final video uploaded to project                                    │
│  ✓ Client notified via Zenvas                                         │
│  ✓ Client portal shows: "Your wedding film is ready!"                 │
│  ✓ Client downloads from link                                         │
│  ✓ Feedback collected                                                 │
│                                                                          │
│  POST-PROJECT: Lessons Learned                                        │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Happy prompted: "Any notes for next wedding?"                        │
│  → "Uluwatu ceremony starts late, always budget extra 30min"         │
│  → Saved to Balistory brand knowledge                                 │
│                                                                          │
│  EXPECTED OUTCOME:                                                     │
│  ✓ Timeline tracked at each phase                                     │
│  ✓ Client never asks "where are we?"                                 │
│  ✓ Ruda focused on creative, not admin                                │
│  ✓ Cakra knows style preferences from client history                 │
│  ✓ Knowledge accumulated for next wedding                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario 4: KP-001 — Westin Commercial (Largest)

**Brand:** KreatifProduction | **Persona:** Andi (Producer) | **Priority:** 4️⃣

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: KP-001 — Westin Commercial Video (60s)                     │
│  Persona: Andi (Producer), Ruda (Director), Cakra (Editor)             │
│  Duration: 4 weeks                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  Westin Hotel Bali wants a 60s commercial.                             │
│  Budget: Rp 35 juta. Timeline: 4 weeks.                               │
│  Andi brought in as producer. This is a BIG project.                   │
│                                                                          │
│  PHASE 1: Brief & Planning (Week 1)                                   │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Day 1: Client meeting                                                │
│  • Andi meets with Westin marketing team                               │
│  • Client brief created:                                               │
│  │   - "Luxury beachfront resort, warm tones, family-friendly"       │
│  │   - "Modern yet welcoming"                                        │
│  │   - "Show amenities: beach, pool, spa, rooms"                    │
│  │   - "Target: families, millennials"                               │
│  │   - "Music: jazz, upbeat"                                         │
│  │   - "Deliverable: 60s, plus 30s cut"                             │
│  │   - "Revisions: 2 rounds included"                               │
│  • Andi uploads brief to Zenvas                                       │
│                                                                          │
│  Day 2: Script & Storyboard                                           │
│  ─────────────────────────────────────────────────────────────────────│
│  • Ruda creates script:                                               │
│  │   - Scene 1: Drone establishing beach (5s)                        │
│  │   - Scene 2: Family at pool (8s)                                  │
│  │   - Scene 3: Spa treatment (6s)                                  │
│  │   - Scene 4: Room tour (10s)                                     │
│  │   - Scene 5: Sunset aerial (5s)                                   │
│  │   - Scene 6: Restaurant dinner (8s)                              │
│  │   - Scene 7: Logo fade (remaining time)                          │
│  │   TOTAL: 52s (room for flexibility)                              │
│  • AI detects scenes automatically (or manual)                        │
│  • Storyboard generated from scenes                                   │
│                                                                          │
│  Day 3: Storyboard review                                             │
│  • Ruda builds storyboard:                                            │
│  │   - Frame 1.1: Beach aerial, golden hour                         │
│  │   - Frame 2.1: Kids in pool, slow-mo                             │
│  │   - etc.                                                          │
│  │   ALL FRAMES LINKED BACK TO SCENES                               │
│  • Shot list auto-generated from storyboard                          │
│  │   - Shot 1.1: Beach drone wide                                   │
│  │   - Shot 1.2: Beach drone tracking                               │
│  │   - etc.                                                          │
│                                                                          │
│  Day 4: Client approves script + storyboard                           │
│  • Happy sends to Westin via Zenvas                                   │
│  • Client approves: "Love it!"                                         │
│                                                                          │
│  PHASE 2: Pre-Production (Week 2)                                     │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Location scouting:                                                    │
│  • Andi scouts Westin property                                         │
│  • Zenvas Location library: "Westin Nusa Dua" already exists!         │
│  │   - Frame scouts saved from previous shoot                        │
│  │   - Permit status known                                           │
│  │   - Contact: Maya Dewi (Marketing)                               │
│  │   - Notes: "Best 6-7 AM for beach, private beach accessible"     │
│  • New frame scouts added for this project                            │
│                                                                          │
│  Cast & Crew:                                                          │
│  • Talent: Wayan Sudiarta (top rated, available Feb 5-10)             │
│  │   - NDA already on file                                           │
│  │   - Contract generated from template                              │
│  │   - Special terms: "Beach scenes only"                           │
│  • Crew:                                                              │
│  │   - Drone pilot: Ketut Ramtha (A2C licensed)                     │
│  │   - Gaffer: Putu Arimbawa (in-house)                            │
│  │   - PA: Freelance (Day 1-3)                                     │
│  • All contracts in Zenvas                                            │
│                                                                          │
│  Schedule built:                                                       │
│  • Day 1: Beach + Pool scenes (Wayan + Drone)                        │
│  │   06:00-07:00  Setup                                             │
│  │   07:00-09:00  Beach scenes (golden hour)                       │
│  │   09:00-10:00  Buffer                                            │
│  │   10:00-12:00  Pool scenes                                      │
│  │   ...                                                             │
│  • Day 2: Room + Restaurant scenes                                   │
│  • Day 3: Pickups if needed                                          │
│                                                                          │
│  Production budget tracked:                                            │
│  • Talent: Rp 2,400,000 (3 days × Rp 800,000)                       │
│  • Drone: Rp 4,500,000 (3 days × Rp 1,500,000)                     │
│  • Location permit: Rp 1,500,000                                      │
│  • Crew: Rp 3,200,000                                               │
│  • TOTAL: Rp 11,600,000                                             │
│                                                                          │
│  PHASE 3: Production (Days 1-3)                                       │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Day 1: Beach + Pool                                                  │
│  • Ruda directs                                                        │
│  • Andi manages schedule                                              │
│  • All goes smooth                                                    │
│  • Footage backed up                                                  │
│                                                                          │
│  Day 2: Room + Restaurant                                             │
│  • Smooth day                                                          │
│                                                                          │
│  Day 3: Pickups                                                        │
│  • Only 1 hour needed                                                 │
│  • Under budget!                                                       │
│                                                                          │
│  PHASE 4: Post-Production (Week 3-4)                                  │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Cakra edits:                                                         │
│  • Rough cut v1 (Day 15): "First assembly"                            │
│  │   → Ruda reviews: "Pacing too slow, cut tighter"                 │
│  │   → Feedback saved in Zenvas                                      │
│                                                                          │
│  • Rough cut v2 (Day 18): "Revised based on feedback"                │
│  │   → Client review link sent via Zenvas                            │
│  │   → Westin: "Love the pacing! One change: more spa footage"     │
│                                                                          │
│  • Fine cut v3 (Day 21): "Added spa shots"                           │
│  │   → Client: "Perfect! Ready for color"                            │
│                                                                          │
│  • Color grade v4 (Day 24): "Warm tones per brief"                   │
│  │   → Client: "Beautiful! Just one revision: sunset should be       │
│  │             more golden hour, less orange"                       │
│                                                                          │
│  • Final v5 (Day 27): "Color corrected"                               │
│  │   → Client: "THIS IS IT! Approved!"                               │
│                                                                          │
│  Delivery:                                                             │
│  ✓ Final files uploaded                                                │
│  ✓ All versions saved                                                  │
│  ✓ Invoice triggered (Final Invoice sent)                              │
│                                                                          │
│  SCENE CHANGE TEST:                                                   │
│  ─────────────────────────────────────────────────────────────────────│
│  Mid-edit, Client says: "Can we add a scene of gym?"                  │
│                                                                          │
│  Zenvas detects:                                                      │
│  • New scene will need:                                               │
│  │   - 2 new frames in storyboard                                    │
│  │   - 3 new shots in shot list                                      │
│  │   - 30 min in schedule (Day 3 extended)                           │
│  │   - Talent: Wayan (if gym = him)                                   │
│  │   - Location: Westin gym (permit covers general areas)             │
│  │   - Budget: ~Rp 500,000 extra                                    │
│                                                                          │
│  Options presented:                                                   │
│  [ Add scene + schedule pickup ]                                      │
│  [ Add scene, extend shoot day ]                                       │
│  [ Decline (out of scope) ]                                           │
│                                                                          │
│  Client: "Add it, extend Day 3"                                      │
│  ✓ Schedule auto-updated                                              │
│  ✓ Wayan notified                                                     │
│  ✓ All links maintained                                               │
│                                                                          │
│  EXPECTED OUTCOME:                                                     │
│  ✓ Complex project managed effortlessly                               │
│  ✓ Andi (producer) has full visibility                                │
│  ✓ Ruda focuses on creative                                           │
│  ✓ Client happy with professional process                             │
│  ✓ Budget tracked accurately                                          │
│  ✓ Scene changes handled smartly                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario 5: DEWA-001 — Solo Creator Growth Journey

**Organization:** Dewa's Studio | **Persona:** Dewa (Solo) | **Priority:** 5️⃣

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: DEWA-001 — Ayana Labuan Bajo Collaboration                  │
│  Persona: Dewa (Solo Creator) | Organization: Dewa's Studio            │
│  Duration: 2 weeks                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  Dewa is a solo YouTube traveler, based in Bali.                       │
│  Growing audience, getting brand collaborations.                        │
│  Ruda introduced Dewa to Zenvas.                                        │
│                                                                          │
│  This is his first PROPER client project using Zenvas.                  │
│                                                                          │
│  PROJECT: Ayana Resort Labuan Bajo collaboration                        │
│  • Dewa creates content about Ayana for his YouTube                   │
│  • Ayana provides: 2 nights stay, experiences                          │
│  • Dewa's deliverable: 1 YouTube video (10-15 min) + 3 shorts         │
│  • No money exchanged (value-in-kind collaboration)                     │
│                                                                          │
│  PHASE 1: Onboarding (Day 1)                                           │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Dewa creates account in Zenvas                                        │
│  • Solo user = simple setup                                            │
│  • Creates Organization: "Dewa's Studio"                               │
│  • One Brand: "Dewa Personal"                                          │
│                                                                          │
│  Creates project: "Ayana Labuan Bajo"                                  │
│  • Type: YouTube Collaboration                                        │
│  • Client: Ayana Resort (value-in-kind partner)                        │
│                                                                          │
│  No template (solo doesn't need complex templates yet)                  │
│  Dewa creates his own simple structure:                                │
│  □ Research Ayana                                                     │
│  □ Create shot list                                                    │
│  □ Travel to Labuan Bajo                                               │
│  □ Shoot content                                                       │
│  □ Edit video                                                          │
│  □ Publish                                                             │
│                                                                          │
│  PHASE 2: Planning (Week 1)                                            │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Dewa researches Ayana:                                                │
│  • Views Ayana's social media                                          │
│  • Reads about resort amenities                                       │
│  • Creates shot list in Zenvas:                                        │
│  │   - Room tour (establish luxury)                                   │
│  │   - Beach sunset (aerial)                                          │
│  │   - Infinity pool (dramatic shots)                                  │
│  │   - Local experiences (flavor)                                      │
│  │   - Food (visual storytelling)                                     │
│  │   - Sunset cruise (special moment)                                  │
│                                                                          │
│  Travel booked:                                                        │
│  • Flights: Dewa books himself                                        │
│  • Accommodation: Ayana provides (logged in notes)                      │
│  • Gear packed: Sony A7IV, Gimbal, Drone                              │
│                                                                          │
│  PHASE 3: Production (Labuan Bajo)                                     │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Day 1: Arrival + Setup                                                │
│  • Arrive Labuan Bajo                                                  │
│  • Check into Ayana                                                   │
│  • Scout locations                                                     │
│  • Notes: "Sunset best 5:30-6:30 PM"                                  │
│                                                                          │
│  Day 2: Main Shoot                                                     │
│  • Morning: Room tour + pool                                          │
│  • Afternoon: Beach + activities                                      │
│  • Sunset: Boat cruise                                                │
│  • Evening: Light setup for night shots                                │
│                                                                          │
│  Day 3: Pickups + Departure                                           │
│  • Morning: Additional shots                                           │
│  • Notes: "Wish we had more time for sunset cruise footage"           │
│                                                                          │
│  Backed up all footage                                                 │
│  Notes in Zenvas:                                                      │
│  • "Ayana team very accommodating"                                    │
│  • "Best sunset spot: rock formations west of jetty"                  │
│  • "Need ND filter for midday pool shots"                             │
│                                                                          │
│  PHASE 4: Post-Production                                              │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Dewa edits himself:                                                  │
│  • 2 weeks editing                                                     │
│  • Using DaVinci Resolve                                              │
│  • Version 1: Rough cut                                               │
│  │   → Self-review: "Story flow needs work"                           │
│  │   → Adjusts narrative                                              │
│  │   → Re-watches Ayana footage to find better moments               │
│                                                                          │
│  • Version 2: Fine cut                                                │
│  │   → Thumbnail test                                                 │
│  │   → Color graded                                                  │
│                                                                          │
│  • Version 3: Final                                                   │
│  │   → Sound designed                                                │
│  │   → Ready for publish                                              │
│                                                                          │
│  PHASE 5: Delivery & Publish                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  • YouTube video published                                             │
│  • Shorts extracted and posted                                        │
│  • Ayana tagged                                                       │
│  • Results tracked:                                                   │
│  │   - Views: [tracked in Zenvas notes]                               │
│  │   - Engagement: "Higher than average"                             │
│                                                                          │
│  Post-project reflection:                                               │
│  • Dewa adds lessons learned:                                        │
│  │   - "Next time: request longer at sunset"                         │
│  │   - "ND filter essential for this location"                       │
│  │   - "Ayana great to work with"                                    │
│  • Saved to personal knowledge                                        │
│                                                                          │
│  BUSINESS GROWTH MOMENT:                                              │
│  ─────────────────────────────────────────────────────────────────────│
│  After Ayana video:                                                   │
│  • Another hotel contacts Dewa                                        │
│  • "Saw your Ayana video, want similar for us"                        │
│  • Dewa now has leverage: "Yes, here's my rate"                      │
│                                                                          │
│  Creates new lead in Zenvas: "NEW: [Hotel Name]"                      │
│                                                                          │
│  EXPECTED OUTCOME:                                                     │
│  ✓ Solo creator managed project effectively                           │
│  ✓ No team confusion (solo)                                           │
│  ✓ Learning accumulated for next project                              │
│  ✓ Zenvas proves useful even for simple workflow                      │
│  ✓ Ready for growth when team expands                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Growth Scenarios for Dewa

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DEWA'S GROWTH JOURNEY — Future Scenarios                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STAGE 1 (Now): SOLO OPERATION                                        │
│  ─────────────────────────────────────────────────────────────────────│
│  • 1 person (Dewa)                                                    │
│  • All tasks done by self                                             │
│  • Basic modules: Projects, Tasks, Notes                               │
│  • No team features needed                                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ZENVAS MODULES INSTALLED:                                      │   │
│  │ • Projects (basic)                                            │   │
│  │ • Tasks (simple)                                              │   │
│  │ • Notes / Knowledge (personal)                                │   │
│  │ • Chat (disabled - no team)                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  STAGE 2 (6 months later): HIRES REMOTE EDITOR                        │
│  ─────────────────────────────────────────────────────────────────────│
│  • 2 persons (Dewa + 1 remote editor)                                │
│  • Editor pays per task                                              │
│  • Need: Task assignments, Communication                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ NEW MODULES INSTALLED:                                         │   │
│  │ • Team (add editor as user)                                   │   │
│  │ • Task assignments                                            │   │
│  │ • Chat (enabled - now needed!)                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Example:                                                              │
│  • Dewa shoots new hotel collaboration                                │
│  • Assigns "Edit hotel video" to remote editor                       │
│  • Remote editor receives task, works, delivers                       │
│  • Dewa reviews, approves, publishes                                │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  STAGE 3 (1 year later): IN-HOUSE + REMOTE                           │
│  ─────────────────────────────────────────────────────────────────────│
│  • 3 persons (Dewa + 1 in-house editor + 1 remote)                  │
│  • Need: Payout tracking, Client management, Invoicing               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ NEW MODULES INSTALLED:                                         │   │
│  │ • Clients (track hotel collaborations)                        │   │
│  │ • Payouts (pay editors)                                       │   │
│  │ • Invoicing (if doing paid work)                              │   │
│  │ • Templates (standard workflow for hotel collabs)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  STAGE 4 (2 years later): MULTI-BRAND                                │
│  ─────────────────────────────────────────────────────────────────────│
│  • Dewa's Studio now similar to KreatifProduction                    │
│  • Brands: "Dewa Creates" (content), "Dewa Films" (commercial)       │
│  • Need: Full multi-brand support                                   │
│                                                                          │
│  ✓ Zenvas handles seamlessly — same architecture as KreatifProduction│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Scenario Priority & Phase Mapping

| Scenario | Priority | Focus Areas | Phase |
|----------|----------|-------------|-------|
| EPE-001 | 1️⃣ | Lead flow, templates, assignments | Phase 1 MVP |
| EPE-002 | 2️⃣ | High volume, team coordination | Phase 1 MVP |
| BALI-001 | 3️⃣ | Complex pipeline, client portal | Phase 1 |
| KP-001 | 4️⃣ | Smart relations, revision cycles | Phase 2 |
| DEWA-001 | 5️⃣ | Solo workflow, growth journey | Phase 1+ |

---

# Testing Checklist

Every Zenvas feature must pass these tests before moving to next phase:

## Phase 1 MVP Tests

```
EPE-001: Daily Lead Flow
□ Can Happy create project in < 10 minutes?
□ Are templates auto-populated?
□ Does notification reach correct person?
□ Can client profile be auto-created?

EPE-002: Peak Day
□ Can Happy handle 3 leads without panic?
□ Is team load visible at a glance?
□ Do priorities propagate correctly?
□ Are templates correctly matched to lead type?

BALI-001: Wedding Film
□ Are wedding stages correct (Pre → Prod → Post → Delivery)?
□ Can client track progress without asking?
□ Are lessons learned saved to brand?
□ Is talent/crew linked from library?

DEWA-001: Solo Creator
□ Does solo workflow work without team features?
□ Can Dewa track his own tasks?
□ Is personal knowledge accumulated?
□ Does growth scenario work (solo → team)?
```

## Phase 2 Tests

```
KP-001: Westin Commercial
□ Do scene changes cascade correctly?
□ Does schedule auto-adjust when scene deleted/added?
□ Are all documents tracked per talent (NDA, Contract)?
□ Does budget track correctly?
□ Do revision cycles work?
□ Is producer (Andi) visibility maintained?
□ Are talent documents (special terms) remembered?
□ Is location library used (Westin already scouted)?
```

## Cross-Feature Tests

```
Smart Relations
□ Scene → Storyboard link maintained?
□ Storyboard → Shot list auto-generated?
□ Shot list → Schedule linked?
□ Deleting scene shows all affected items?

Templates
□ Project templates work for EPE (Real Estate)?
□ Wedding templates work for Balistory?
□ Service templates auto-create stages + tasks?

Knowledge Engine
□ Talent profiles grow over time?
□ Location frame scouts saved and reused?
□ Lessons learned saved to brand?
□ Document reminders work (expiring NDA)?

Module System
□ Solo user (Dewa) can disable unused modules?
□ Team user (Ruda) can enable needed modules?
□ Organization vs Brand separation maintained?

Communication Module (Post-MVP)
□ Facebook Messenger messages appear in Zenvas inbox?
□ WhatsApp messages appear in Zenvas inbox?
□ Website chat creates leads automatically?
□ Messages linked to correct Lead/Project?
□ Can reply to Facebook/WhatsApp from Zenvas?
□ Integration settings organized by category?
```

---

# Success Criteria

Zenvas succeeds when:

| Metric | Target |
|--------|--------|
| Time to create project from lead | < 10 minutes |
| EPE daily volume handled | 3+ leads/day without panic |
| Client "where are we?" questions | Zero (self-service) |
| Scene change cascade | All linked items detected |
| Solo user complexity | Minimal (only needed modules) |
| Team user complexity | Scalable (all features available) |
| Dewa's growth path | Solo → Team with same platform |

---

# Notes

- These scenarios are based on real operations of KreatifProduction (Bali)
- Dewa's Studio represents the solo-creator-to-team growth path
- All brand names, client names, and specific details are fictional but realistic
- Test scenarios will be expanded as Zenvas develops new features
