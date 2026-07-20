# TEST-SCENARIO-PITCH — PT Pupuk Kaltim Company Profile Pitch

**Status:** ACTIVE PROJECT (Pitching Phase)

**Purpose:** Test scenario for a creative pitch project — pre-sales workflow, creative asset development, and pitch presentation preparation.

---

# Project Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PITCH PROJECT: PT PUPUK KALTIM COMPANY PROFILE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CLIENT: PT Pupuk Kalimantan Timur (BUMN)                              │
│  VALUE: Rp 500 juta - 1 Milyar (estimated)                           │
│  DEADLINE: Pitch presentation in 3 weeks                              │
│  BRAND: KreatifProduction                                              │
│  TEAM: Ruda (Creative Director), Andi (Producer), Cakra (Editor)     │
│                                                                          │
│  WHAT WE'RE PITCHING:                                                  │
│  Company profile video 5-7 minutes                                   │
│  Including:                                                            │
│  • Company overview & history                                        │
│  • Operations & facilities (plant, port, plantations)               │
│  • Products & markets                                                │
│  • Sustainability & CSR                                             │
│  • Vision & mission                                                 │
│                                                                          │
│  WHY THIS MATTERS:                                                    │
│  • Largest fertilizer company in Indonesia                           │
│  • First major corporate client for KreatifProduction                │
│  • Could open doors to other BUMN clients                           │
│  • High visibility project with full production needed if won        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Pitch vs Order — What's Different?

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PITCH PROJECT vs SERVICE ORDER — Key Differences                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SERVICE ORDER (Normal Flow)                                           │
│  ├── Client inquiry → Lead → Order → Project → Delivery → Payout     │
│  ├── Confirmed revenue from start                                      │
│  ├── Full production starts after contract signed                      │
│  └── Payment for work done                                            │
│                                                                          │
│  PITCH PROJECT (This Scenario)                                         │
│  ├── Pitch invitation → Pitch Project → Pitch Presentation            │
│  │   → Win (Order created) or Lose (no revenue)                       │
│  ├── Investment in creative assets BEFORE payment                      │
│  ├── Risk: time + creative effort may not pay off                     │
│  └── Winning = entry to a large confirmed project                      │
│                                                                          │
│  ZENVAS IMPLICATION:                                                   │
│  • Need a "Pitch" project type (not just "Service Order")            │
│  • Pitch assets (AV Script, Moodboard, Deck) are investments        │
│  • Pitch tracking: hours spent, assets created                        │
│  • Pitch-to-Order conversion: winning creates a real Order            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Zenvas Data Model Extension: Pitch Project

```typescript
// New: PitchProject (extends Project concept)
interface PitchProject {
  id: string;
  brandId: string;
  
  // Pitch info
  projectName: string;              // "PT Pupuk Kaltim Company Profile"
  clientName: string;               // "PT Pupuk Kalimantan Timur"
  clientType: 'BUMN' | 'PRIVATE' | 'STARTUP' | 'INDIVIDUAL';
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Pitch value
  estimatedValue?: number;           // Rp 500 juta - 1 Milyar
  probability?: number;              // 10-90% chance estimate
  
  // Pipeline status
  type: 'PITCH';                   // vs 'SERVICE_ORDER' or 'AI_CONTENT'
  status: PitchStatus;
  
  // What we're pitching
  deliverables: string[];           // ["Company Profile Video 5-7 min", etc.]
  brief?: string;                   // Client's brief if provided
  
  // Pitch timeline
  pitchDate?: Date;
  decisionDate?: Date;
  
  // Pitch assets (creative work done for pitch)
  assets: PitchAsset[];
  
  // Investment tracking
  estimatedHoursInvested: number;
  actualHoursInvested?: number;
  estimatedCost?: number;            // Cost of pitch effort
  
  // If won → creates Order
  linkedOrderId?: string;
  
  // Notes
  notes: string;
  
  // Metadata
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum PitchStatus {
  BRIEF_RECEIVED = 'brief_received',
  RESEARCHING = 'researching',
  CREATIVE_DEVELOPMENT = 'creative_development',
  PITCH_READY = 'pitch_ready',
  PRESENTED = 'presented',
  WON = 'won',                     // → Order created
  LOST = 'lost',                   // → Archive
  ON_HOLD = 'on_hold'             // → Wait for decision
}

interface PitchAsset {
  id: string;
  pitchId: string;
  
  // Asset type
  type: PitchAssetType;
  name: string;
  description?: string;
  
  // File reference
  fileUrl?: string;                // Google Drive/Canva/etc link
  thumbnailUrl?: string;
  
  // Version
  version: number;                  // v1, v2, v3...
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PRESENTED';
  
  // Collaboration
  createdBy: string;               // User ID
  lastEditedBy?: string;
  
  // For tracking
  estimatedHours: number;          // Time to create
  actualHours?: number;
  
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum PitchAssetType {
  RESEARCH_DOCUMENT = 'research_document',   // Client research, competitors
  MOODBOARD = 'moodboard',                  // Visual direction
  AUDIO_VISUAL_SCRIPT = 'audio_visual_script', // AV Script (shot list + narration)
  PITCH_DECK = 'pitch_deck',                // PowerPoint/Canva presentation
  STORYBOARD = 'storyboard',                // Frame-by-frame visual
  REFERENCE_VIDEO = 'reference_video',       // Sample work, style references
  BUDGET_PROPOSAL = 'budget_proposal',      // Pricing breakdown
  TIMELINE_PLAN = 'timeline_plan',          // Production timeline
  TEAM_INTRO = 'team_intro',                // Portfolio of team
  CASE_STUDIES = 'case_studies',            // Similar work done before
}
```

---

# Test Scenario: PITCH-001 — Full Pitch Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: PITCH-001 — PT Pupuk Kaltim Company Profile Pitch          │
│  Brand: KreatifProduction | Team: Ruda, Andi, Cakra | Priority: 🔴    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONTEXT                                                                │
│  ─────────────────────────────────────────────────────────────────────│
│  KreatifProduction received pitch invitation from PT Pupuk Kaltim.     │
│  They want a company profile video. Pitch deadline: 3 weeks.           │
│                                                                          │
│  This is a PITCH — we're investing creative effort to win a project.   │
│  Not guaranteed. Risk: time + creative work may not pay off.            │
│                                                                          │
│  Team decides: This is worth the investment. High potential value.    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEEK 1: RESEARCH & CREATIVE DIRECTION (Days 1-7)                    │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 1-2: Project Setup & Research                                    │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Andi creates PITCH project in Zenvas:                                │
│  • Name: "Pitch: PT Pupuk Kaltim Company Profile"                     │
│  • Client: PT Pupuk Kalimantan Timur                                  │
│  • Type: PITCH (not Service Order)                                    │
│  • Status: BRIEF_RECEIVED                                            │
│  • Pitch Date: [3 weeks from now]                                     │
│  • Estimated Value: Rp 750,000,000                                  │
│  • Probability: 30% (conservative estimate)                           │
│                                                                          │
│  System auto-creates pitch structure:                                  │
│  □ Research & Direction                                               │
│  □ Creative Development                                               │
│  □ Pitch Materials                                                   │
│  □ Presentation                                                      │
│                                                                          │
│  Research tasks created:                                              │
│  □ Study PT Pupuk Kaltim website + annual report                      │
│  □ Analyze competitors (PT Petrokimia, PT Pusri profiles)           │
│  □ Understand fertilizer industry & market position                   │
│  □ Identify key messages & unique selling points                      │
│  □ Gather reference videos (best company profiles globally)          │
│                                                                          │
│  Ruda works on research:                                              │
│  Key findings:                                                       │
│  • Largest urea producer in Indonesia (60% market share)             │
│  • Operations in Bontang, East Kalimantan                            │
│  • Exports to 20+ countries                                         │
│  • Strong sustainability initiatives (GoGreen program)               │
│  • Modern, high-tech operations                                      │
│                                                                          │
│  Notes saved to Zenvas:                                               │
│  "Client is proud of their technology & export scale.                 │
│  But competitors also have scale. Our angle:                         │
│  Human stories of the people behind the plants."                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 3-4: Moodboard & Visual Direction                              │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Ruda creates MOOBOARD in Zenvas:                                    │
│                                                                          │
│  Visual themes explored:                                              │
│                                                                          │
│  Option A: "INDUSTRIAL GRANDEUR"                                      │
│  • Massive aerial shots of plant facilities                          │
│  • Dramatic lighting, scale emphasis                                 │
│  • Cinematic, serious tone                                          │
│  • References: Apple corporate, Porsche productions                 │
│                                                                          │
│  Option B: "HUMAN CENTRIC"                                           │
│  • Workers as heroes, personal stories                              │
│  • Warm human moments, faces, hands                                  │
│  • Technology as enabler, not hero                                   │
│  • References: National Geographic docs, charity films              │
│                                                                          │
│  Option C: "FUTURE FORWARD"                                          │
│  • Dynamic, energetic, modern                                        │
│  • Bold graphics, fast cuts, tech aesthetics                        │
│  • Appeals to younger stakeholders                                   │
│  • References: Tesla presentations, startup videos                   │
│                                                                          │
│  Moodboard created in Canva, linked to Zenvas:                       │
│  • 15-20 reference images                                          │
│  • Color palette extracted                                          │
│  • Typography samples                                               │
│  • Music style references                                           │
│                                                                          │
│  Decision: Option B (Human Centric) resonates most with PT Pupuk    │
│  management style based on initial communications.                   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 5-7: Audio Visual Script Development                            │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Ruda creates AV SCRIPT in Zenvas:                                   │
│                                                                          │
│  Structure:                                                          │
│  1. OPENING (0:00-0:30)                                             │
│     - Hook: "Indonesia feeds the world..."                          │
│     - Visual: Dawn over plantation, workers arriving                 │
│                                                                          │
│  2. COMPANY OVERVIEW (0:30-1:30)                                    │
│     - Scale & history                                               │
│     - Visual: Archives, founding photos, growth timeline            │
│                                                                          │
│  3. OPERATIONS (1:30-3:30)                                         │
│     - Plant & facilities                                            │
│     - Visual: Drone footage, process flows, workers in action       │
│                                                                          │
│  4. PRODUCTS & MARKETS (3:30-4:30)                                  │
│     - What they make & where it goes                               │
│     - Visual: Product close-ups, export visuals, map animation      │
│                                                                          │
│  5. PEOPLE & CULTURE (4:30-5:30)                                    │
│     - Sustainability & CSR                                          │
│     - Visual: Community programs, environmental initiatives          │
│                                                                          │
│  6. CLOSING (5:30-6:00)                                             │
│     - Vision & mission                                              │
│     - Visual: Hero shot, call to action                             │
│                                                                          │
│  AV Script saved to Zenvas:                                          │
│  • Shot list with timestamps                                       │
│  • Narration script (for voice over)                               │
│  • Music suggestions                                               │
│  • Sound design notes                                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEEK 2: STORYBOARD & PITCH DECK (Days 8-14)                        │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 8-10: Storyboard Development                                   │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Ruda creates STORYBOARD in Zenvas:                                  │
│                                                                          │
│  Key frames illustrated:                                              │
│                                                                          │
│  FRAME 1: Opening Dawn                                              │
│  - Visual: Aerial of plantation at golden hour                      │
│  - Text: "Indonesia feeds the world"                                │
│                                                                          │
│  FRAME 2: History Timeline                                          │
│  - Visual: Archival photos montage                                 │
│  - Text: Year labels appear                                        │
│                                                                          │
│  FRAME 3: Plant Aerial                                             │
│  - Visual: Massive Bontang plant drone shot                        │
│  - Text: "60% of Indonesia's fertilizer"                          │
│                                                                          │
│  ... (20 key frames total for key moments)                          │
│                                                                          │
│  Cakra creates supporting graphics:                                  │
│  • Map animation (Indonesia + export countries)                     │
│  • Infographic animations (production stats)                        │
│  • Transition designs                                             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 11-12: Pitch Deck Creation                                    │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Andi creates PITCH DECK in Zenvas:                                  │
│                                                                          │
│  Deck structure (15 slides):                                         │
│                                                                          │
│  SLIDE 1: Cover                                                    │
│  - PT Pupuk Kaltim logo + "Company Profile Video Proposal"         │
│                                                                          │
│  SLIDE 2: About KreatifProduction                                   │
│  - 30-second intro video                                           │
│  - Key stats: 50+ projects, 5 years experience                     │
│                                                                          │
│  SLIDE 3: Understanding PT Pupuk Kaltim                            │
│  - Our research insights                                          │
│  - Key messages we identified                                     │
│                                                                          │
│  SLIDE 4: Our Creative Direction                                   │
│  - Moodboard presentation                                         │
│  - Why "Human Centric" works for them                              │
│                                                                          │
│  SLIDE 5-12: Visual Storyboard                                     │
│  - Key frames from our AV Script                                   │
│  - Narration excerpts                                             │
│                                                                          │
│  SLIDE 13: Production Plan                                         │
│  - Timeline (8 weeks from green light)                             │
│  - Team (who does what)                                           │
│                                                                          │
│  SLIDE 14: Investment                                               │
│  - Budget breakdown                                               │
│  - Payment schedule                                               │
│                                                                          │
│  SLIDE 15: Thank You + Contact                                     │
│  - Team contacts                                                │
│  - Next steps                                                   │
│                                                                          │
│  Deck created in Canva, linked to Zenvas:                         │
│  - Version 1: First draft                                       │
│  - Version 2: Ruda's feedback incorporated                      │
│  - Version 3: Final for presentation                             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 13-14: Rehearsal & Refinement                               │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Team reviews pitch together:                                       │
│                                                                          │
│  Andi presents to Ruda:                                            │
│  - "Flow is good, but we need stronger opening hook"              │
│  - "The storyboard explains well, but add more emotion"           │
│                                                                          │
│  Updates made:                                                     │
│  - New opening narration written                                   │
│  - 2 additional storyboard frames added (human emotion shots)     │
│  - Better transition between sections                             │
│                                                                          │
│  Final rehearsal:                                                 │
│  - Presentation timed: 25 minutes (target: 20-30 min)           │
│  - Q&A prepared: 10 questions anticipated                        │
│                                                                          │
│  Pitch materials finalized:                                       │
│  ✓ Moodboard: Version 2 approved                                 │
│  ✓ AV Script: Complete with narration                            │
│  ✓ Storyboard: 25 frames                                         │
│  ✓ Pitch Deck: Version 3                                         │
│  ✓ Budget Proposal: Rp 750,000,000                              │
│  ✓ Timeline Plan: 8 weeks production                            │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEEK 3: PITCH PRESENTATION (Days 15-21)                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 15-18: Final Preparations                                     │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Presentation logistics:                                            │
│  - Venue: PT Pupuk Kaltim HQ, Jakarta                            │
│  - Equipment: Bring own laptop, adapter, backup USB               │
│  - Attendees: Marketing Director, Corporate Secretary, GM        │
│                                                                          │
│  Backup plan:                                                     │
│  - Cloud version of deck (if tech fails)                         │
│  - Printed storyboard (if projector fails)                        │
│  - PDF version ready                                             │
│                                                                          │
│  Travel arranged:                                                 │
│  - Ruda + Andi fly to Jakarta                                    │
│  - Hotel booked near office                                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 19: PITCH DAY                                                 │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Morning: Travel to Jakarta                                       │
│                                                                          │
│  2 PM: Arrive at PT Pupuk Kaltim                                 │
│                                                                          │
│  2:30 PM: Pitch begins                                           │
│                                                                          │
│  Ruda opens:                                                      │
│  "Terima kasih atas undangannya. Kami sangat antusias..."         │
│                                                                          │
│  Presentation flow:                                               │
│  1. KreatifProduction introduction (5 min)                         │
│  2. Our understanding of PT Pupuk Kaltim (5 min)                 │
│  3. Creative direction & moodboard (5 min)                       │
│  4. Visual storyboard walkthrough (10 min)                        │
│  5. Production plan (3 min)                                      │
│  6. Investment & timeline (2 min)                                │
│  TOTAL: 30 minutes                                               │
│                                                                          │
│  Q&A Session (30 minutes):                                       │
│  - "How will you handle access to restricted areas?"             │
│  - "What's your approach to worker interviews?"                    │
│  - "Timeline seems tight, can you guarantee quality?"           │
│  - "Do you have experience with industrial clients?"              │
│                                                                          │
│  Response highlights:                                             │
│  - We have contacts in similar industries                       │
│  - Worker participation is voluntary, we have interview guide   │
│  - 8 weeks is realistic with proper planning                    │
│  - We'll visit plant beforehand for scouting                    │
│                                                                          │
│  3:30 PM: Pitch concludes                                        │
│                                                                          │
│  Feedback from client:                                           │
│  - "Impressed with the human-centric angle"                     │
│  - "Storyboard is very compelling"                              │
│  - "Would like to see more of your corporate work"             │
│  - "We'll decide within 2 weeks"                               │
│                                                                          │
│  Status updated in Zenvas: PRESENTED                             │
│                                                                          │
│  Notes added:                                                    │
│  - "Client seems positive. Key differentiator: our story focus" │
│  - "Need to follow up with corporate portfolio"                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 20-21: Post-Pitch Follow-up                                │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Follow-up actions:                                              │
│  - Andi sends thank you email with summary deck                 │
│  - Ruda sends additional corporate work samples                │
│  - Happy follows up with marketing director                    │
│                                                                          │
│  Portfolio updated:                                             │
│  - Add PT Pupuk Kaltim to our target client list             │
│  - Document pitch lessons for future pitches                  │
│                                                                          │
│  Waiting for decision...                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  WEEK 4: DECISION                                                │
│  ─────────────────────────────────────────────────────────────────────│
│                                                                          │
│  DAY 28: Decision received!                                      │
│                                                                          │
│  Email from PT Pupuk Kaltim:                                     │
│  "Selamat! Kami memutuskan untuk melanjutkan dengan              │
│  KreatifProduction..."                                           │
│                                                                          │
│  PROJECT WON!                                                     │
│                                                                          │
│  Andi updates Zenvas:                                            │
│  • Status: WON                                                  │
│  • Probability updated: 100%                                     │
│  • Linked Order created: "PT Pupuk Kaltim Company Profile"     │
│                                                                          │
│  Pitch → Order conversion:                                       │
│  - Order value: Rp 720,000,000 (negotiated from Rp 750M)       │
│  - DP payment: 30% = Rp 216,000,000                           │
│  - Project created with full production workflow                │
│                                                                          │
│  Lessons learned added to Knowledge Engine:                      │
│  - "Human-centric angle works for traditional industries"       │
│  - "Always bring printed storyboard as backup"                 │
│  - "Prepare detailed Q&A for industrial clients"                │
│  - "Follow up with portfolio after pitch"                      │
│                                                                          │
│  EXPECTED OUTCOME:                                             │
│  ✓ Pitch project tracked from start to finish                 │
│  ✓ All creative assets organized and versioned                │
│  ✓ Team collaboration visible                                  │
│  ✓ Pitch investment documented                                 │
│  ✓ Successful conversion to Order                              │
│  ✓ Knowledge captured for future pitches                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Pitch Project Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PITCH DASHBOARD — KreatifProduction                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ACTIVE PITCHES: 1                                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 🔴 PT Pupuk Kaltim — Company Profile                             │  │
│  │     Value: Rp 750M  │  Status: PRESENTED  │  Decision: 2 weeks│  │
│  │                                                                      │  │
│  │  Pitch Assets:                                                   │  │
│  │  ✓ Research Document    v1    [View]                             │  │
│  │  ✓ Moodboard           v2    [View]                             │  │
│  │  ✓ AV Script           v1    [View]                             │  │
│  │  ✓ Storyboard          v1    [View]                             │  │
│  │  ✓ Pitch Deck          v3    [View]                             │  │
│  │  ✓ Budget Proposal     v1    [View]                             │  │
│  │  ✓ Timeline Plan       v1    [View]                             │  │
│  │                                                                      │  │
│  │  Investment:                                                     │  │
│  │  Hours: 45 hours  │  Cost estimate: Rp 4,500,000               │  │
│  │                                                                      │  │
│  │  Team: Ruda (Lead), Andi (Producer), Cakra (Editor)           │  │
│  │                                                                      │  │
│  │  [View Full Project]  [Edit Status]  [Add Asset]                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  PITCH PIPELINE:                                                       │
│                                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐           │
│  │ BRIEF    │RESEARCH  │CREATIVE  │ PITCH    │PRESENTED │           │
│  │ RECEIVED │          │          │ READY    │          │           │
│  │   (2)    │   (1)    │   (1)    │   (1)    │   (3)    │           │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘           │
│                                                                          │
│  CLOSED:                                                               │
│  • Won: 2 (Total value: Rp 1.2B)                                     │
│  • Lost: 4                                                           │
│                                                                          │
│  Win Rate: 33%                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Zenvas Module Requirements for Pitch Projects

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PITCH PROJECT — Module Requirements                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  NEEDED IN ZENVAS:                                                     │
│  ├── Pitch project type (vs Service Order)                            │
│  ├── Pitch asset management (versioning, collaboration)                │
│  ├── Research & moodboard space                                       │
│  ├── AV Script template                                               │
│  ├── Storyboard integration                                           │
│  ├── Pitch deck hosting (links to Canva/Google Slides)                │
│  ├── Timeline planning for pitch itself                               │
│  ├── Investment tracking (hours, cost)                                │
│  ├── Pitch dashboard (pipeline view)                                  │
│  ├── Pitch-to-Order conversion workflow                                │
│  └── Pitch analytics (win rate, avg value)                           │
│                                                                          │
│  CAN REUSE EXISTING:                                                  │
│  ├── ✅ Project OS (for structure)                                    │
│  ├── ✅ Knowledge Engine (for research, case studies)                  │
│  ├── ✅ Team & Roles (for collaboration)                              │
│  ├── ✅ Mission Control (for dashboard)                                │
│  └── ✅ Client management (for prospect tracking)                      │
│                                                                          │
│  INTEGRATION NEEDED:                                                  │
│  ├── Canva (pitch deck)                                              │
│  ├── Google Slides (alternative)                                      │
│  ├── Miro/Figma (moodboard collaboration)                            │
│  └── Google Drive (asset storage)                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Test Scenario Priority

| Scenario | Status | Focus Areas | Module Needed |
|----------|---------|-------------|---------------|
| PITCH-001 | ✅ Ready | Full pitch workflow, asset management | Pitch Projects (new type) |
| PITCH-002 | 📋 Planned | Multi-round pitch, client feedback | Pitch Projects |
| PITCH-003 | 📋 Planned | Lost pitch, lessons learned | Pitch Projects |

---

# Open Questions

1. **Should pitch work be paid?** Some clients pay for pitches; most don't. How should Zenvas handle both?
2. **Pitch investment tracking:** Should we track time spent per team member for accurate costing?
3. **Pitch probability:** Should probability affect Mission Control or Board visibility?
4. **Multi-round pitches:** How to handle pitch revisions after client feedback?

---

# Integration with Other Scenarios

```
PITCH → ORDER FLOW:

PITCH-001 (PT Pupuk Kaltim)
    ↓ [WIN]
PT Pupuk Kaltim Company Profile [ORDER]
    ↓ [CONFIRMED]
PT Pupuk Kaltim Production [PROJECT]
    ├── (Follows BALI-001 style complex project)
    ├── Budget Tracking needed (Large production)
    └── Smart Relations needed (Full storyboard)
```

---

# Lessons Learned Template

After pitch (win or lose), add to Knowledge Engine:

```typescript
interface PitchLesson {
  pitchId: string;
  clientName: string;
  result: 'WON' | 'LOST';
  
  // What worked
  strengths: string[];
  
  // What didn't work  
  weaknesses: string[];
  
  // Client feedback
  clientFeedback?: string;
  
  // Key takeaways
  keyLearnings: string[];
  
  // Recommendations for future
  recommendations: string[];
  
  addedBy: string;
  createdAt: DateTime;
}
```
