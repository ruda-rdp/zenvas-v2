# ZENVAS MODULES: NETFLIX EPISODIC PRODUCTION GUIDE

**Status:** Draft v0.1

**Purpose:** 
A filmmaker's guide to setting up Zenvas for a Netflix-scale episodic production.
Imagine you're opening an episodic project — what modules do you need?

**Assumptions:**
- Format: 8-episode series, ~50 min per episode
- Budget: $2-5M per episode (premium streaming quality)
- Team: 50-150 crew members
- Duration: 6-9 months total (2-3 weeks pre-pro, 4-6 months production, 2-3 months post)

---

# The Netflix Production Reality

Netflix productions have unique requirements:

```
EPISODIC PRODUCTION = COMPLEXITY AMPLIFIED
│
├── Multiple Episodes (8-10 episodes)
│   └── Each episode is its own mini-movie
│
├── Multiple Episodes (8-10 episodes)
│   └── Each episode is its own mini-movie
│
├── Multiple Seasons Planning (they want option for S2)
│   └── Must design for continuity
│
├── Studio/Streaming Approval Workflows
│   └── Netflix executives review cuts
│
├── Complex Rights Management
│   └── Music licensing, talent contracts, international distribution
│
└── High-Volume Post-Production
    └── Dailies, VFX, color, sound — massive data
```

---

# Module Categories for Netflix Production

## Phase 1 Modules (Already Built)

These are your **foundation** — always installed.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FOUNDATION MODULES (Always Installed)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🏠 Organizations & Brands                                               │
│     → Your production company as the Organization                        │
│     → "Netflix Originals" as a Brand line                              │
│                                                                          │
│  👥 Users & Roles                                                       │
│     → Executive Producer, Showrunner, Director, Producer                │
│     → Department Heads (DP, AD, Post Supervisor)                        │
│     → Editors, VFX, Sound                                               │
│                                                                          │
│  📋 Tasks                                                               │
│     → Episode breakdown, scene tracking, deliverable checklist          │
│                                                                          │
│  💬 Discuss                                                             │
│     → Department threads, episode channels, global announcements        │
│                                                                          │
│  📊 Activity Log                                                        │
│     → Immutable audit trail for compliance                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2 Modules: Essential for Netflix Production

These modules are **critical** for episodic production. Install via App Store.

### 💰 MODULE: Production Budget Tracker

```yaml
name: Budget Tracking
slug: budget-tracking
priority: CRITICAL
icon: 💰
category: BUSINESS

description: >
  Track the massive budgets of episodic production.
  Episode budgets, department budgets, contract obligations,
  and real-time spend vs. forecast.

why_essential: >
  A single Netflix episode can cost $2-5M. You NEED real-time
  budget tracking. Every department (Camera, Sound, VFX, Art)
  has its own budget. One scene overrun can cascade.

features:
  - Episode-level budget tracking
  - Department budget allocation
  - Line item management (Talent, Equipment, Locations, VFX)
  - Contract-based expenses (talent payments tied to episodes)
  - Currency management (USD primary, international shoots)
  - Cash flow forecasting
  - Purchase order workflow
  - Budget vs. actual reporting
  - Export for Netflix reporting requirements

episodic_specific:
  - Episode budget vs. season pool
  - Carry-over from S1 to S2
  - Music licensing budget (separate line)
  - Marketing deliverables budget

dependencies:
  required: [tasks]
  optional: [odoo]

routes:
  main: /budget
  settings: /settings/modules/budget-tracking
```

---

### ✍️ MODULE: Script & Screenplay Manager

```yaml
name: Script Writer
slug: script-writer
priority: CRITICAL
icon: ✍️
category: CREATIVE

description: >
  Industry-standard screenplay formatting and management.
  Episode scripts, revisions, and distribution.

why_essential: >
  Netflix scripts are living documents. Draft 1 → Draft 2 → Production
  Draft → Day-of amendments. You need version control and
  easy distribution to crew.

features:
  - Fountain screenplay format (industry standard)
  - Episode-by-episode organization
  - Revision tracking (Draft 1, 2, 3... Production Draft)
  - Scene breakdown auto-generation
  - Character tracking
  - Location extraction
  - Day-of call sheet attachments
  - PDF export (industry format)
  - Watermarked distribution to crew

episodic_specific:
  - Season bible management
  - Character consistency across episodes
  - Arc tracking (Character A: Episodes 1-4, then returns Ep 7)
  - Series bible (world-building documentation)

dependencies:
  required: [tasks]
  optional: [knowledge-engine]

routes:
  main: /scripts
  settings: /settings/modules/script-writer
```

---

### 🎨 MODULE: Visual Storyboard & previz

```yaml
name: Storyboard Canvas
slug: storyboard-canvas
priority: HIGH
icon: 🎨
category: CREATIVE

description: >
  Visual planning with drag-and-drop storyboards.
  Directors and DP can plan shots before production.

why_essential: >
  Netflix executives want to see your vision BEFORE production.
  Storyboards help sell the show AND guide the crew.

features:
  - Frame-by-frame storyboard
  - Shot type library (Wide, Medium, Close-up, Insert, POV)
  - Camera movement annotations
  - Director's vision notes
  - Drag-and-drop sequencing
  - Link to script scenes
  - Export to PDF for Netflix presentations
  - Share link for remote stakeholders

episodic_specific:
  - Recurring shots/angles across episodes
  - Consistent visual language per director
  - Episode vs. season-level boards

dependencies:
  required: [tasks]
  optional: [script-writer]

routes:
  main: /storyboard
  settings: /settings/modules/storyboard
```

---

### 📹 MODULE: Shot List & Technical Specs

```yaml
name: Shot List
slug: shot-list
priority: CRITICAL
icon: 📹
category: PROJECT

description: >
  Detailed shot planning with technical specifications.
  Camera, lens, movement, and coverage planning.

why_essential: >
  Each episode has 200-400 setups. You need to track:
  What shots? What camera? What lens? Who is in them?
  What time of day? What's the coverage?

features:
  - Shot database per episode
  - Scene/setup numbering (Ep 1, Scene 5A, Setup 3)
  - Camera specs (Camera body, Lens, Filter, Frame Rate)
  - Movement type (Static, Dolly, Steadicam, Gimbal, Handheld)
  - Coverage tracking (Wide, OTS, CU — what you need)
  - Cast in shot
  - Equipment checklist
  - Location linkage
  - Shooting day assignment
  - Shot status (Planned, Shot, Print, Cut)
  - Reference image attachment

episodic_specific:
  - Episode coverage overview
  - Cross-episode continuity shots
  - Director's shot list per episode
  - DP's technical notes

dependencies:
  required: [tasks]
  optional: [script-writer, scheduling]

routes:
  main: /shot-list
  settings: /settings/modules/shot-list
```

---

### 📅 MODULE: Production Scheduling & Call Sheets

```yaml
name: Scheduling & Call Sheets
slug: scheduling
priority: CRITICAL
icon: 📅
category: PROJECT

description: >
  Production calendar, shoot day scheduling, and
  automated call sheet generation.

why_essential: >
  A Netflix production has 40-60 shoot days across 8 episodes.
  Every day needs a detailed call sheet. Miss a call time?
  Production delays cost $50K+ per hour.

features:
  - Calendar-based production planning
  - Episode/scenes per day breakdown
  - Page count per day (industry metric: 1 page = ~8 minutes screen time)
  - Automatic call sheet generation
  - Cast call times (talent has strict hours per contract)
  - Crew call times
  - Meal breaks (union compliance)
  - Location details
  - Weather forecast integration
  - Send to Google Calendar
  - Team notification
  - PDF call sheet export

episodic_specific:
  - Episode production order (can shoot non-linear)
  - Cast availability calendar (avoid conflicts)
  - Company moves (multiple locations in one day)
  - Holiday/union restrictions
  - Second unit scheduling

dependencies:
  required: [tasks]
  optional: [script-writer, google-calendar]

routes:
  main: /schedule
  settings: /settings/modules/scheduling
```

---

### 👥 MODULE: Cast & Talent Management

```yaml
name: Cast Management
slug: cast-management
priority: CRITICAL
icon: 👥
category: BUSINESS

description: >
  Track cast members, contracts, availability, and payments.
  From lead actors to day players.

why_essential: >
  Netflix productions have complex talent deals:
  Per-episode fee, guaranteed episodes, pilot vs. series,
  backend participation. Miss a contract clause? Lawsuit.

features:
  - Cast database (Photo, Name, Role, Contact)
  - Contract tracking
    - Per-episode fee
    - Guaranteed episodes
    - Option for additional episodes
    - Buyout clauses
    - Backend/success fees
  - Availability calendar
  - Shooting schedule conflict detection
  - Call times tracking
  - Wig/wardrobe fitting schedules
  - Rehearsal scheduling
  - Per-diem tracking
  - Payment schedule (triggered by shooting days)
  - NDA management

episodic_specific:
  - Character arc tracking (Which episodes?)
  - Recurring vs. day players
  - Cameo management
  - Stunt coordinator integration
  - Intimacy coordinator (modern productions)

dependencies:
  required: [tasks, organizations]
  optional: [scheduling, budget-tracking]

routes:
  main: /cast
  settings: /settings/modules/cast-management
```

---

### 🏢 MODULE: Crew Management

```yaml
name: Crew Management
slug: crew-management
priority: HIGH
icon: 🏢
category: BUSINESS

description: >
  Department heads, crew lists, deal memos, and payroll coordination.
  The backbone of production operations.

why_essential: >
  50-150 crew members across 8 episodes.
  Every department has 5-15 people. Hiring, firing,
  paying — it all flows through here.

features:
  - Department organization (Camera, Sound, Art, Wardrobe, Makeup, VFX, Post)
  - Crew database (Photo, Name, Role, Contact, Rate)
  - Deal memo tracking
    - Day rate vs. weekly vs. flat fee
    - Overtime rules
    - Kit rental
    - Travel/accommodation
  - Hiring workflow (Request → Approval → Offer → Onboard)
  - Timecard submission
  - Expense tracking
  - Payroll integration
  - Emergency contact database
  - Safety training records

episodic_specific:
  - Department continuity across episodes
  - Union compliance (SAG-AFTRA, DGA, IATSE)
  - Travel coordination (location shoots)
  - Housing/accommodation management
  - COVID/protocol compliance (historical but module supports it)

dependencies:
  required: [tasks, organizations]
  optional: [budget-tracking, scheduling]

routes:
  main: /crew
  settings: /settings/modules/crew-management
```

---

### 🎬 MODULE: Location Management

```yaml
name: Location Management
slug: locations
priority: HIGH
icon: 🎬
category: PROJECT

description: >
  Scout, book, and manage production locations.
  From initial scout to breakdown to permit.

why_essential: >
  Finding the perfect location is half the battle.
  Then you need permits, parking, power, access times —
  Location Manager's bible in Zenvas.

features:
  - Location database
    - Photos, videos
    - Address with map
    - Contact information
    - Access details (gate codes, parking)
  - Scout scheduling
  - Location availability calendar
  - Booking confirmation
  - Permit tracking
  - Insurance documentation
  - Location fees
    - Rental fee
    - Insurance deposit
    - Parking fees
    - Power/generator costs
  - Location brief for crew (access, parking, contacts)
  - Scene breakdown by location
  - Location shooting schedule

episodic_specific:
  - Recce (reconnaissance) scheduling
  - Location permits (city, county, federal)
  - Hold notices (legal protection)
  - Sound report management
  - Neighbors notification
  - Weather backup planning

dependencies:
  required: [tasks]
  optional: [scheduling, budget-tracking]

routes:
  main: /locations
  settings: /settings/modules/locations
```

---

### 📁 MODULE: File & Asset Management

```yaml
name: File Sharing
slug: file-sharing
priority: CRITICAL
icon: 📁
category: COLLABORATION

description: >
  Centralized storage for production files.
  Scripts, storyboards, dailies, assets.

why_essential: >
  A single Netflix episode generates 10-50TB of footage.
  Plus VFX assets, audio files, graphics. You need
  organized, accessible, version-controlled storage.

features:
  - Cloud storage (integrated with existing: Frame.io, Google Drive)
  - Folder structure per episode
    - /Production
      - /Scripts
      - /Storyboards
      - /Shot Lists
    - /Cameras (Dailies)
    - /VFX
    - /Sound
    - /Music
    - /Graphics
    - /Deliverables
  - Version control
  - Permission-based access (department-specific)
  - Share links with expiration
  - Download tracking
  - Storage quotas
  - Quick preview (thumbnails, low-res)

episodic_specific:
  - Frame.io integration for dailies
  - Avid/Adobe project linking
  - Watermarked previews for Netflix
  - Delivery package assembly
  - Archival storage (S3 Glacier for Netflix requirements)

dependencies:
  required: [tasks]
  optional: [frameio, google-drive]

routes:
  main: /files
  settings: /settings/modules/file-sharing
```

---

### 🎞️ MODULE: Dailies & Review

```yaml
name: Dailies Review
slug: dailies
priority: CRITICAL
icon: 🎞️
category: PROJECT

description: >
  Daily footage review, sync, and approval workflow.
  The first look at yesterday's work.

why_essential: >
  "Dailies" is sacred. The director, DP, and showrunner
  review every day's footage. Problems caught early
  can be fixed. Problems on delivery = expensive.

features:
  - Frame.io integration for footage upload
  - Daily sync from set cameras
  - Proxy generation for quick review
  - Scene/shot marking
  - Notes per take
  - Approve/Flag/Retake workflow
  - Share with key stakeholders
  - Watermarked playback
  - Mobile review (on set)
  - Next-day director's screening list

episodic_specific:
  - Episode-organized dailies
  - Director's circle (confidential reviews)
  - Netflix executive access (with watermarks)
  - Cross-department review (DP, Sound, VFX)
  - Color notes (for post)
  - Music/sound notes

dependencies:
  required: [tasks]
  optional: [frameio, file-sharing]

routes:
  main: /dailies
  settings: /settings/modules/dailies
```

---

### 🎨 MODULE: VFX & Post Production Tracker

```yaml
name: VFX Tracker
slug: vfx-tracker
priority: HIGH
icon: 🎨
category: PROJECT

description: >
  Track visual effects shots from onset to delivery.
  Shot lists, vendor assignments, status tracking.

why_essential: >
  Netflix productions are VFX-heavy. A single episode
  can have 200-500 VFX shots. Tracking them all
  across vendors is a full-time job.

features:
  - VFX shot database
    - Episode/Scene/Shot
    - Description
    - Complexity (1-5 scale)
    - Type (CGI, Comp, Rig removal, etc.)
  - Shot status tracking
    - Editorial hold
    - In production
    - Internal review
    - Client review
    - Approved
    - Delivered
  - Vendor assignment
  - Version tracking (v1, v2, v3...)
  - Review links (Frame.io, Dropbox)
  - Notes/feedback
  - Delivery tracking
  - Budget per shot/vendor

episodic_specific:
  - Episode-level VFX breakdown
  - Vendor management (multiple VFX houses)
  - Shot cost tracking
  - Netflix QC requirements
  - IMAX/Atmos delivery specs

dependencies:
  required: [tasks, dailies]
  optional: [frameio, budget-tracking]

routes:
  main: /vfx
  settings: /settings/modules/vfx-tracker
```

---

### 🎵 MODULE: Music & Sound Management

```yaml
name: Music & Sound
slug: music-sound
priority: HIGH
icon: 🎵
category: PROJECT

description: >
  Music licensing, soundtrack management, and sound post coordination.
  From temp scores to final mix delivery.

why_essential: >
  Music rights are complex. Temp music for editing, licensed tracks
  for final, composer deliverables, music cues per scene.
  Miss a sync license? Netflix won't deliver.

features:
  - Music cue database
    - Episode/Scene
    - Type (Original, Licensed, Source)
    - Rights needed
  - License tracking
    - Sync rights
    - Master rights
    - Territory restrictions
    - Term/expiration
  - Composer coordination
    - Episode assignments
    - Delivery specs
    - Review workflow
  - Sound design tracking
  - Mix delivery specs (Atmos, 5.1, Stereo)
  - Music cue sheets (ASCAP/BMI reporting)

episodic_specific:
  - Series music bible
  - Composer deal tracking
  - Music supervisor integration
  - Netflix music delivery specs
  - Festival premiere restrictions

dependencies:
  required: [tasks]
  optional: [file-sharing]

routes:
  main: /music
  settings: /settings/modules/music-sound
```

---

### 📦 MODULE: Deliverables & QC

```yaml
name: Deliverables
slug: deliverables
priority: CRITICAL
icon: 📦
category: PROJECT

description: >
  Netflix delivery requirements, QC checks, and final file assembly.
  The last step before the show goes live.

why_essential: >
  Netflix has STRICT delivery specifications. Miss a codec?
  Wrong color space? Missing subtitles? Rejected.
  A rejected delivery delays the premiere.

features:
  - Episode delivery checklist
    - Video files (Multiple specs: Netflix, iTunes, etc.)
    - Audio files (Atmos, 5.1, Stereo, M&E)
    - Subtitles (Multiple languages)
    - Closed captions
    - Descriptive audio
    - Artwork (Poster, thumbnail, hero)
    - Marketing materials
  - Quality Control (QC)
    - Technical specs check
    - Frame rate/resolution
    - Color space
    - Audio levels
    - Loudness (LUFS)
    - Closed caption verification
  - Delivery status tracking
  - Rejection/fix workflow
  - Delivery confirmation
  - Archive packaging

episodic_specific:
  - Netflix delivery specifications (very detailed)
  - Apple TV+, Amazon, Disney+ specs
  - Festival delivery (Sundance, Toronto, etc.)
  - International versions (dubbing, subtitles)

dependencies:
  required: [tasks, dailies]
  optional: [vfx-tracker, music-sound, file-sharing]

routes:
  main: /deliverables
  settings: /settings/modules/deliverables
```

---

### 💬 MODULE: Communication Hub

```yaml
name: Communication Hub
slug: communication
priority: HIGH
icon: 💬
category: COLLABORATION

description: >
  Unified communication for production teams.
  Department channels, announcements, external client comms.

why_essential: >
  50-150 people need to be on the same page.
  Department channels, production updates, emergency alerts.
  This replaces a dozen WhatsApp groups.

features:
  - Production-wide channels
    - Announcements (Producer only can post)
    - Production Updates (Daily newsletter)
    - Safety Alerts
  - Department channels
    - Camera
    - Sound
    - Art
    - Wardrobe
    - Makeup
    - VFX
    - Post
  - Episode channels
    - Ep 1 Production
    - Ep 2 Prep
  - Direct messages
  - File sharing in chat
  - @mentions and notifications
  - External communication (Email, WhatsApp)
  - Client communication (Netflix liaisons)

episodic_specific:
  - NDA-confidential channels
  - Streaming platform compliance comms
  - Execs-only channels (sensitive discussions)
  - On-set quick comms (critical)

dependencies:
  required: [discuss]
  optional: [whatsapp-integration]

routes:
  main: /inbox
  settings: /settings/modules/communication
```

---

# Module Setup Checklist for Netflix Production

## Phase 1: Foundation (Always Installed)

```
[ ] Organizations & Brands
    → Create Organization: "Your Production Company"
    → Create Brand: "Netflix Originals"
    
[ ] Users & Roles
    → Executive Producer (Owner)
    → Showrunner (Manager)
    → Line Producer (Manager)
    → Production Coordinator (Producer)
    → Department Heads (as needed)
```

## Phase 2: Essential Modules

```
[ ] Budget Tracking 💰
    → Set up season budget ($20M)
    → Break down per episode ($2.5M each)
    → Department allocations
    → Contract-based expenses
    
[ ] Script Writer ✍️
    → Import series bible
    → Set up episode structure
    → Enable revision tracking
    
[ ] Storyboard Canvas 🎨
    → Link to scripts
    → Set up episode boards
    → Share with DP and Director
    
[ ] Shot List 📹
    → Episode breakdown
    → Camera specs
    → Scene coverage planning
    
[ ] Scheduling 📅
    → 60-day production calendar
    → Call sheet template
    → Cast availability integration
    
[ ] Cast Management 👥
    → Import cast list
    → Contract tracking
    → Payment schedules
    
[ ] Crew Management 🏢
    → Department structure
    → Deal memos
    → Timecard system
    
[ ] Location Management 🎬
    → Scout database
    → Booking confirmations
    → Permit tracking
    
[ ] File Sharing 📁
    → Frame.io integration
    → Folder structure (Episodes)
    → Permission groups
    
[ ] Dailies Review 🎞️
    → Frame.io connection
    → Review workflow
    → Director's screening setup
    
[ ] VFX Tracker 🎨
    → Shot database
    → Vendor assignments
    → Delivery tracking
    
[ ] Music & Sound 🎵
    → Cue database
    → License tracking
    → Composer coordination
    
[ ] Deliverables 📦
    → Netflix specs loaded
    → QC checklist
    → Delivery calendar
    
[ ] Communication Hub 💬
    → Department channels
    → Episode channels
    → Announcements setup
```

---

# Netflix-Specific Module Customizations

## Module: Client Portal

```yaml
name: Netflix Client Portal
slug: netflix-portal
type: CUSTOMIZATION
priority: CRITICAL

description: >
  A specialized Client Portal for Netflix executives
  to review cuts, approve deliverables, and communicate.

features:
  - Secure, watermarked video playback
  - Episode cut review (with timestamp comments)
  - Approval workflow (Director → Showrunner → Netflix)
  - Delivery notification
  - Financial reporting (optional: Netflix doesn't always want this visible)
  - Deadline tracking (delivery dates, premiere dates)

access_levels:
  - Netflix Executive: Read-only cuts, approve
  - Netflix Post Supervisor: Read + comments
  - Production: Full access

security:
  - NDA-confidential
  - No download (streaming only)
  - Watermarked with viewer ID
  - Access logging
```

---

# The Netflix Production Timeline in Zenvas

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EPISODIC PRODUCTION TIMELINE                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRE-PRODUCTION (8-12 weeks)                                             │
│  ├── Develop Series Bible                                                │
│  ├── Write All Scripts (Writers Room)                                   │
│  ├── Cast Lead Roles                                                    │
│  ├── Hire Key Department Heads                                          │
│  ├── Location Scouting                                                  │
│  ├── Budget Finalization                                                │
│  ├── Storyboard & previz                                               │
│  └── Production Design                                                  │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│  PRODUCTION (16-24 weeks)                                               │
│  ├── Table Reads                                                        │
│  ├── Block Rehearsals                                                   │
│  ├── Shoot Days (40-60 per episode, shot out of order)                 │
│  │   ├── Daily Dailies Review                                           │
│  │   ├── Weekly Producer's Screening                                    │
│  │   └── Ongoing VFX Ingest                                            │
│  └── End of Production (Last拍摄 day)                                   │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│  POST-PRODUCTION (16-24 weeks)                                          │
│  ├── Assembly & Editing                                                 │
│  │   ├── Director's Cut                                                 │
│  │   ├── Producer's Cut                                                 │
│  │   └── Network Cut (Netflix Review)                                   │
│  ├── VFX (Running throughout production)                                 │
│  ├── Sound (Design, Mix, Music)                                        │
│  ├── Color Correction                                                   │
│  ├── Netflix QC                                                        │
│  └── Deliverables                                                       │
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│  DELIVERY & RELEASE                                                     │
│  ├── Netflix Delivery (2-3 weeks before premiere)                      │
│  ├── Premiere                                                           │
│  └── Post-Delivery Support                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Module Dependency Map for Netflix

```
                    ┌──────────────────────────────────────────────────┐
                    │              FOUNDATION MODULES                  │
                    │  (Organizations, Auth, Tasks, Discuss, Activity) │
                    └──────────────────────┬─────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
     ┌─────────────────┐          ┌─────────────────┐        ┌─────────────────┐
     │   BUDGET 💰     │          │   SCHEDULING 📅   │       │   FILE SHARING 📁│
     │ (Episode Pool) │          │  (Call Sheets)   │        │   (Dailies)      │
     └────────┬────────┘          └────────┬─────────┘        └────────┬─────────┘
              │                            │                            │
              │            ┌───────────────┼───────────────┐            │
              │            │               │               │            │
              ▼            ▼               ▼               ▼            ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │   CAST 👥       │  │  SHOT LIST 📹    │  │  LOCATIONS 🎬   │  │  DAILIES 🎞️     │
     │ (Contracts)     │  │  (Coverage)      │  │  (Permits)      │  │  (Review)       │
     └─────────────────┘  └────────┬────────┘  └─────────────────┘  └────────┬────────┘
                                   │                                        │
                                   │                                        ▼
                                   ▼                               ┌─────────────────┐
                          ┌─────────────────┐                       │   VFX 🎨        │
                          │  STORYBOARD 🎨  │                       │   (Shots)       │
                          │  (previz)       │                       └────────┬────────┘
                          └────────┬────────┘                                │
                                   │                                        ▼
                                   ▼                               ┌─────────────────┐
                          ┌─────────────────┐                       │   MUSIC 🎵       │
                          │   SCRIPT ✍️     │                       │   (Cues)        │
                          │   (Screenplay)  │                       └────────┬────────┘
                          └────────┬────────┘                                │
                                   │                                        ▼
                                   │                               ┌─────────────────┐
                                   │                               │  DELIVERABLES 📦 │
                                   │                               │  (QC & Delivery)│
                                   │                               └────────┬────────┘
                                   │                                        │
                                   ▼                                        ▼
                          ┌─────────────────┐                       ┌─────────────────┐
                          │   CREW 🏢       │                       │   NETFLIX PORTAL│
                          │   (Deal Memos)  │                       │   (Client View) │
                          └─────────────────┘                       └─────────────────┘
```

---

# Quick Start: 5 Modules to Start With

If you're just opening a Netflix project and want to start simple:

## Week 1-2: Foundation Setup

```
1. Scripts ✍️ (Most important — everything starts here)
   → Import series bible
   → Set up episode structure
   
2. Budget 💰 (Know your numbers)
   → Set up episode budgets
   → Track against plan
   
3. Scheduling 📅 (Plan the shoot)
   → Map out production timeline
   → Set call sheet template
   
4. Cast 👥 (Your talent is your product)
   → Import cast list
   → Set up contracts
   
5. Communication 💬 (Keep everyone aligned)
   → Set up department channels
   → Announcements channel
```

## Week 3-4: Pre-Production Ramp Up

```
→ Add Storyboard (visualize episodes)
→ Add Shot List (break down scenes)
→ Add Locations (scout and book)
→ Add Crew (hire department heads)
→ Add File Sharing (set up Frame.io)
```

## Month 2+: Production Ready

```
→ Add Dailies Review
→ Add VFX Tracker
→ Add Music & Sound
→ Add Deliverables
→ Add Netflix Portal
```

---

# Module ROI for Netflix Production

| Module | Cost Without | Zenvas Value |
|--------|-------------|--------------|
| Budget Tracking | Excel spreadsheets, $5K/year consultancy | Real-time, automated, error-proof |
| Scripts | Final Draft licenses | Cloud sync, version control, collaboration |
| Scheduling | Movie Magic, manual | Auto call sheets, calendar sync |
| Dailies Review | Frame.io alone | Integrated with production workflow |
| VFX Tracker | Spreadsheets, $20K/year VFX supervisor time | Track 500+ shots automatically |
| Deliverables | Checklist in Word | Automated QC, Netflix specs built-in |
| Communication | WhatsApp groups, email chaos | Unified, searchable, compliant |

---

# Next Steps

1. **Start with 5 Core Modules** → Scripts, Budget, Scheduling, Cast, Communication
2. **Add Pre-Production Modules** → Storyboard, Shot List, Locations, Crew
3. **Add Production Modules** → Dailies, File Sharing
4. **Add Post-Production Modules** → VFX, Music, Deliverables
5. **Add Client Portal** → Netflix-specific customization

---

**Document History:**
- v0.1 (2026-07-21): Initial draft — Netflix episodic production module guide
