# MODULE_REGISTRY.md

**Status:** Draft v0.1 (Proposed for Phase 2+)

**Depends On:**
- APP_STORE.md
- FOUNDATION.md
- MVP_ROADMAP.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Module Registry

This document catalogs all modules available in the Zenvas App Store, organized by phase and category.

> 📚 **Detailed Module Specifications:**
> - [EPISODIC_PRODUCTION_GUIDE.md](./EPISODIC_PRODUCTION_GUIDE.md) — Netflix-scale production module needs
> - [CAST_MANAGEMENT.md](./CAST_MANAGEMENT.md) — Detailed cast & talent management spec
> - [DAILIES_REVIEW.md](./DAILIES_REVIEW.md) — Detailed dailies review workflow spec
> - [VFX_TRACKER.md](./VFX_TRACKER.md) — VFX shot tracking from onset to delivery
> - [DELIVERABLES_QC.md](./DELIVERABLES_QC.md) — Delivery requirements and QC checks
> - [SCHEDULING_CALL_SHEETS.md](./SCHEDULING_CALL_SHEETS.md) — Production scheduling and call sheets
> - [MUSIC_SOUND.md](./MUSIC_SOUND.md) — Music licensing, cue tracking, and sound post
> - [SCRIPT_WRITER.md](./SCRIPT_WRITER.md) — Screenplay writing and management
> - [STORYBOARD_CANVAS.md](./STORYBOARD_CANVAS.md) — Visual storyboarding and previz
> - [CREW_MANAGEMENT.md](./CREW_MANAGEMENT.md) — Crew database, deal memos, and payroll
> - [LOCATION_MANAGEMENT.md](./LOCATION_MANAGEMENT.md) — Location scouting and booking
> - [ANALYTICS_DASHBOARD.md](./ANALYTICS_DASHBOARD.md) — Business intelligence and reporting
> - [VIDEO_CALLS.md](./VIDEO_CALLS.md) — Video conferencing and screen sharing
> - [FILE_SHARING.md](./FILE_SHARING.md) — Centralized file storage and version control
> - [AI_SUMMARY.md](./AI_SUMMARY.md) — AI-powered meeting summaries and action items

---

# Module Categories

| Category | Icon | Description |
|----------|------|-------------|
| **CORE** | 🏠 | Always installed, cannot be uninstalled |
| **BUSINESS** | 💼 | CRM, Invoicing, Analytics, etc. |
| **PROJECT** | 📋 | Tasks, Delivery, Scheduling, etc. |
| **CREATIVE** | 🎬 | Script Writer, Storyboard, Shot List, etc. |
| **COLLABORATION** | 💬 | Chat, Video, File Sharing, etc. |
| **INTEGRATION** | 🔗 | Third-party integrations (Odoo, Frame.io, etc.) |

---

# Phase 1 Modules (Already Implemented)

These modules are the MVP foundation. They are the minimum viable product.

## CORE Modules (Always Installed)

| Module | Slug | Description | Status |
|--------|------|-------------|--------|
| Auth & Users | `auth` | User authentication, session management | ✅ Implemented |
| Organizations | `organizations` | Multi-tenant organization management | ✅ Implemented |
| Brands | `brands` | Brand management within organizations | ✅ Implemented |
| Roles & Permissions | `roles` | RBAC system (Owner, Manager, Editor) | ✅ Implemented |
| Module Manager | `module-manager` | App Store infrastructure | 🔲 Phase 2 |
| Activity Log | `activity-log` | Immutable audit trail | ✅ Implemented |

## BUSINESS OS Modules

| Module | Slug | Description | Status |
|--------|------|-------------|--------|
| CRM & Clients | `clients` | Client management, contact database | ✅ Implemented |
| Invoicing (Odoo) | `odoo-invoice` | Invoice creation via Odoo | ✅ Implemented |
| Team & Payroll | `team` | Team management, invite codes | ✅ Implemented |
| Lead Management | `leads` | Lead capture, qualification, conversion | ✅ Implemented |

## PROJECT OS Modules

| Module | Slug | Description | Status |
|--------|------|-------------|--------|
| Tasks | `tasks` | Stage/Task/Subtask hierarchy | ✅ Implemented |
| Delivery | `delivery` | Review links, approval flow | ✅ Implemented |

## COLLABORATION Modules

| Module | Slug | Description | Status |
|--------|------|-------------|--------|
| Chat/Discuss | `discuss` | Per-project threads, global access | ✅ Implemented |
| Activity Log | `activity-log` | Immutable timeline | ✅ Implemented |
| Notifications | `notifications` | In-app notification system | ✅ Implemented |

## INTEGRATION Modules

| Module | Slug | Description | Status |
|--------|------|-------------|--------|
| Odoo Integration | `odoo` | CRM & Invoice sync via XML-RPC | ✅ Implemented |
| Google Drive | `google-drive` | File upload integration | ✅ Implemented |

---

# Phase 2 Modules (Post-MVP)

These modules will be available in the App Store after Phase 1 MVP is stable.

## BUSINESS OS Modules

### Budget Tracking 💰

```yaml
name: Budget Tracking
slug: budget-tracking
category: BUSINESS
icon: 💰
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Track production costs, manage line items, and monitor budget 
  utilization across projects. Perfect for agencies managing 
  multiple clients and complex productions.

features:
  - Real-time budget tracking per project
  - Line item management (crew, equipment, locations)
  - Scene change impact analysis
  - Multi-currency support
  - Budget vs. actual reporting
  - Export to PDF/Excel

dependencies:
  required: [tasks]
  optional: []

permissions:
  - VIEW_BUDGET
  - MANAGE_BUDGET
  - EXPORT_BUDGET

routes:
  main: /budget
  settings: /settings/modules/budget-tracking

useCases:
  - KP-001 (Westin Commercial): Scene change cost tracking
  - BALI-001 (Wedding): Budget monitoring for multi-day shoots

documentation: docs/MODULES/BUDGET_TRACKING.md
```

### Cast & Talent Management 👥

```yaml
name: Cast & Talent Management
slug: cast-management
category: BUSINESS
icon: 👥
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Track cast members, contracts, availability, and payments.
  From lead actors to day players. Critical for episodic and feature productions.

features:
  - Cast database with headshots
  - Contract tracking (per-episode, guaranteed, day rate)
  - Shooting day tracking
  - Payment scheduling and triggers
  - Availability calendar
  - Scene breakdown by cast
  - Call sheet integration
  - Union compliance (SAG-AFTRA)

dependencies:
  required: [tasks, organizations]
  optional: [scheduling, budget-tracking]

routes:
  main: /cast
  settings: /settings/modules/cast-management

useCases:
  - Netflix episodic: Complex talent deals with backend
  - Feature film: Union compliance and payment tracking
  - Commercial: Quick cast hire and payment

documentation: docs/MODULES/CAST_MANAGEMENT.md
```

### Crew Management 🏢

```yaml
name: Crew Management
slug: crew-management
category: BUSINESS
icon: 🏢
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Department heads, crew lists, deal memos, and payroll coordination.
  The backbone of production operations.

features:
  - Department organization (Camera, Sound, Art, Wardrobe, etc.)
  - Crew database with rates
  - Deal memo tracking
  - Timecard submission
  - Hiring workflow
  - Expense tracking
  - Safety training records
  - Union compliance (IATSE, DGA)

dependencies:
  required: [tasks, organizations]
  optional: [budget-tracking, scheduling]

routes:
  main: /crew
  settings: /settings/modules/crew-management

useCases:
  - Large productions with 50-150 crew
  - Multi-department coordination
  - Union compliance tracking
```

### Analytics Dashboard 📊

```yaml
name: Analytics Dashboard
slug: analytics-dashboard
category: BUSINESS
icon: 📊
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Business intelligence dashboard with metrics on revenue,
  project performance, team productivity, and client retention.

features:
  - Revenue analytics (by service, client, period)
  - Project completion rates
  - Team productivity metrics
  - Lead conversion funnel
  - Client lifetime value
  - Custom date ranges
  - Export capabilities

dependencies:
  required: [clients, tasks]
  optional: []

permissions:
  - VIEW_ANALYTICS
  - EXPORT_ANALYTICS

routes:
  main: /analytics
  settings: /settings/analytics

useCases:
  - Monthly performance review for Owners
  - Revenue forecasting
  - Team performance review

documentation: docs/MODULES/ANALYTICS_DASHBOARD.md
```

### Payment Gateway Integration 💳

```yaml
name: Payment Gateway
slug: payment-gateway
category: BUSINESS
icon: 💳
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Accept online payments via PayPal, LemonSqueezy, or Creem.
  Automatic payment confirmation and invoice generation.

features:
  - Multi-gateway support (PayPal, LemonSqueezy, Creem)
  - Automatic payment confirmation
  - Invoice generation on payment
  - Subscription management
  - Refund handling
  - Webhook integration

dependencies:
  required: [odoo-invoice]
  optional: []

permissions:
  - MANAGE_PAYMENTS
  - VIEW_PAYMENTS

routes:
  main: /payments
  settings: /settings/payments

documentation: docs/ADR/ADR-0004-payment-gateway.md
```

## PROJECT OS Modules

### Dailies Review 🎞️

```yaml
name: Dailies Review
slug: dailies
category: PROJECT
icon: 🎞️
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Daily footage review, sync, and approval workflow.
  The first look at yesterday's work. Critical for Netflix/streaming productions.

features:
  - Frame.io integration for footage upload
  - Daily sync from set cameras
  - Proxy generation for quick review
  - Scene/shot/take marking
  - Print/Favorite/Reject workflow
  - Timestamped notes per take
  - Screening list generation per role
  - Watermarked playback for executives
  - Director approval workflow
  - Mobile review (on set)

dependencies:
  required: [tasks]
  optional: [frameio, file-sharing]

routes:
  main: /dailies
  settings: /settings/modules/dailies

useCases:
  - Netflix episodic: Daily executive review
  - Feature film: Director's morning screening
  - Commercial: Quick client approval

documentation: docs/MODULES/DAILIES_REVIEW.md
```

### VFX & Post Production Tracker 🎨

```yaml
name: VFX Tracker
slug: vfx-tracker
category: PROJECT
icon: 🎨
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Track visual effects shots from onset to delivery.
  Shot lists, vendor assignments, status tracking.

features:
  - VFX shot database with complexity ratings
  - Shot status tracking (Editorial → In Production → Review → Approved)
  - Vendor assignment and management
  - Version tracking (v1, v2, v3...)
  - Frame.io/-review link integration
  - Cost per shot tracking
  - Netflix QC integration
  - Delivery tracking

dependencies:
  required: [tasks, dailies]
  optional: [frameio, budget-tracking]

routes:
  main: /vfx
  settings: /settings/modules/vfx-tracker

useCases:
  - Netflix episodic: 200-500 VFX shots per episode
  - Feature film: Heavy VFX with multiple vendors
  - Commercial: Quick turnaround VFX

documentation: docs/MODULES/VFX_TRACKER.md
```

### Deliverables & QC 📦

```yaml
name: Deliverables
slug: deliverables
category: PROJECT
icon: 📦
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Netflix delivery requirements, QC checks, and final file assembly.
  The last step before the show goes live.

features:
  - Episode delivery checklist
  - Technical specs check (resolution, codec, color space)
  - Audio loudness verification (LUFS)
  - Subtitle/caption verification
  - Artwork requirements
  - Rejection/fix workflow
  - Delivery tracking
  - Archive packaging

dependencies:
  required: [tasks, dailies]
  optional: [vfx-tracker, music-sound, file-sharing]

routes:
  main: /deliverables
  settings: /settings/modules/deliverables

documentation: docs/MODULES/DELIVERABLES_QC.md
```

### Script Writer ✍️

```yaml
name: Script Writer
slug: script-writer
category: CREATIVE
icon: ✍️
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  AI-assisted script writing tool for video production.
  Write, edit, and format scripts with scene breakdowns.

features:
  - Scene-by-scene script editor
  - Character management
  - Dialogue formatting
  - Scene location tracking
  - Shot type suggestions
  - Export to PDF (industry standard format)
  - Link to Tasks (script approval workflow)

standalonePotential: medium
canGrowInto: Standalone script writing app

dependencies:
  required: [tasks]
  optional: []

routes:
  main: /scripts
  settings: /settings/modules/script-writer

useCases:
  - BALI-001 (Wedding): Ceremony script
  - KP-001 (Commercial): Voiceover script

documentation: docs/MODULES/SCRIPT_WRITER.md
```

### Storyboard Canvas 🎨

```yaml
name: Storyboard Canvas
slug: storyboard-canvas
category: CREATIVE
icon: 🎨
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Visual storyboarding tool for planning shots and sequences.
  Drag-and-drop interface for arranging frames.

features:
  - Visual frame editor
  - Drag-and-drop sequencing
  - Character/location consistency tracking
  - Shot type annotations
  - Camera movement notes
  - Export to PDF
  - Link to Script Writer

standalonePotential: medium
canGrowInto: Standalone storyboarding tool

dependencies:
  required: [tasks]
  optional: [script-writer]

routes:
  main: /storyboard
  settings: /settings/modules/storyboard

useCases:
  - Pre-production planning
  - Client presentation
  - Director's vision documentation

documentation: docs/MODULES/STORYBOARD_CANVAS.md
```

### Shot List 📹

```yaml
name: Shot List
slug: shot-list
category: PROJECT
icon: 📹
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Create detailed shot lists for production days.
  Track shot status, equipment needs, and locations.

features:
  - Shot database per project
  - Shot type library (Wide, Medium, Close-up, etc.)
  - Equipment checklist
  - Location management
  - Shooting day assignment
  - Shot status tracking (Planned, Shot, Cut)
  - Export to call sheet format

standalonePotential: small

dependencies:
  required: [tasks]
  optional: []

routes:
  main: /shot-list
  settings: /settings/modules/shot-list
```

### Scheduling & Call Sheets 📅

```yaml
name: Scheduling & Call Sheets
slug: scheduling
category: PROJECT
icon: 📅
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Production calendar, shoot day scheduling, and automated call sheet generation.
  The backbone of production operations.

features:
  - Calendar-based production planning
  - Episode/scenes per day breakdown
  - Page count per day tracking
  - Automatic call sheet generation
  - Cast call times with contract compliance
  - Crew call times
  - Meal break tracking (union compliance)
  - Weather forecast integration
  - Google Calendar sync
  - Production report generation

dependencies:
  required: [tasks]
  optional: [google-calendar, cast-management]

routes:
  main: /schedule
  settings: /settings/modules/scheduling

useCases:
  - Netflix episodic: 40-60 shoot days across 8 episodes
  - Feature film: Complex scheduling with company moves
  - Commercial: Quick turnaround scheduling

documentation: docs/MODULES/SCHEDULING_CALL_SHEETS.md
```

### Location Management 🎬

```yaml
name: Location Management
slug: locations
category: PROJECT
icon: 🎬
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Scout, book, and manage production locations.
  From initial scout to breakdown to permit.

features:
  - Location database with photos/videos
  - Address and map integration
  - Scout scheduling
  - Booking confirmation
  - Permit tracking
  - Insurance documentation
  - Location fees and deposits
  - Location brief for crew
  - Sound report management

dependencies:
  required: [tasks]
  optional: [scheduling, budget-tracking]

routes:
  main: /locations
  settings: /settings/modules/locations

useCases:
  - Episodic: Multiple locations across episodes
  - Feature: Location scouting for script
  - Commercial: Quick location turnaround
```

### Music & Sound Management 🎵

```yaml
name: Music & Sound
slug: music-sound
category: PROJECT
icon: 🎵
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Music licensing, soundtrack management, and sound post coordination.
  From temp scores to final mix delivery.

features:
  - Music cue database per episode/scene
  - License tracking (sync, master, territory)
  - Composer coordination
  - Sound design tracking
  - Mix delivery specs (Atmos, 5.1, Stereo)
  - Music cue sheets (ASCAP/BMI reporting)

dependencies:
  required: [tasks]
  optional: [file-sharing]

routes:
  main: /music
  settings: /settings/modules/music-sound

useCases:
  - Netflix: Complex music rights management
  - Feature: Composer deliverables tracking
  - Commercial: Licensed music clearance

documentation: docs/MODULES/MUSIC_SOUND.md
```

### Knowledge Engine 🧠

```yaml
name: Knowledge Engine
slug: knowledge-engine
category: PROJECT
icon: 🧠
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Internal knowledge base for creative teams. Store, search,
  and surface institutional knowledge.

features:
  - Knowledge entry creation
  - Tagging and categorization
  - Full-text search
  - AI-powered surfacing (contextual suggestions)
  - Link to Projects/Services/Templates
  - Version history

dependencies:
  required: [tasks]
  optional: []

standalonePotential: large
canGrowInto: Standalone knowledge management platform

routes:
  main: /knowledge
  settings: /settings/knowledge
```

## COLLABORATION Modules

### Communication Hub 💬

```yaml
name: Communication Hub
slug: communication
category: COLLABORATION
icon: 💬
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Unified inbox connecting email, Facebook Messenger, WhatsApp,
  and website chat into one dashboard.

features:
  - Facebook Messenger integration
  - WhatsApp Business integration
  - Website chat widget (embeddable)
  - Unified inbox
  - Auto-create leads from conversations
  - Auto-reply bot with keyword triggers
  - Message templates
  - Conversation history

dependencies:
  required: [leads, discuss]
  optional: []

routes:
  main: /inbox
  settings: /settings/communication

documentation: docs/MODULES/COMMUNICATION_MODULE.md
```

### Video Calls 📹
category: PROJECT
icon: 📅
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Production scheduling with calendar view and automated
  call sheet generation for crew.

features:
  - Calendar-based scheduling
  - Shoot day planning
  - Crew assignment
  - Equipment booking
  - Auto-generate call sheets
  - Send to Google Calendar
  - Location management
  - Weather integration

standalonePotential: medium

dependencies:
  required: [tasks]
  optional: [google-calendar, shot-list]

routes:
  main: /schedule
  settings: /settings/modules/scheduling
```

### Knowledge Engine 🧠

```yaml
name: Knowledge Engine
slug: knowledge-engine
category: PROJECT
icon: 🧠
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Internal knowledge base for creative teams. Store, search,
  and surface institutional knowledge.

features:
  - Knowledge entry creation
  - Tagging and categorization
  - Full-text search
  - AI-powered surfacing (contextual suggestions)
  - Link to Projects/Services/Templates
  - Version history

dependencies:
  required: [tasks]
  optional: []

standalonePotential: large
canGrowInto: Standalone knowledge management platform

routes:
  main: /knowledge
  settings: /settings/knowledge
```

### Video Calls 📹

```yaml
name: Video Calls
slug: video-calls
category: COLLABORATION
icon: 📹
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Built-in video conferencing for client calls and team meetings.
  Screen sharing, recording, and calendar integration.

features:
  - HD video calls
  - Screen sharing
  - Call recording
  - Calendar integration
  - Meeting notes
  - Client link generation

dependencies:
  required: []
  optional: [google-calendar]

routes:
  main: /meetings
  settings: /settings/video-calls

note: Consider integration with third-party (Zoom, Google Meet) before building

documentation: docs/MODULES/VIDEO_CALLS.md
```

### File Sharing 📁

```yaml
name: File Sharing
slug: file-sharing
category: COLLABORATION
icon: 📁
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Centralized file storage with version control, sharing,
  and approval workflows.

features:
  - File upload and organization
  - Version history
  - Share links with expiration
  - Approval workflow for deliverables
  - Integration with Google Drive
  - Storage quotas per organization

dependencies:
  required: [tasks]
  optional: [google-drive]

routes:
  main: /files
  settings: /settings/file-sharing

documentation: docs/MODULES/FILE_SHARING.md
```

### AI Summary 🤖

```yaml
name: AI Summary
slug: ai-summary
category: COLLABORATION
icon: 🤖
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  AI-powered meeting summaries and action item extraction.
  Automatically generate recaps from discussions.

features:
  - Meeting transcription (future)
  - AI-generated summaries
  - Action item extraction
  - Task creation from discussion
  - Send summary to client

dependencies:
  required: [discuss, video-calls]
  optional: []

routes:
  main: /ai-summary
  settings: /settings/ai-summary

documentation: docs/MODULES/AI_SUMMARY.md
```

## INTEGRATION Modules

### Frame.io Integration 🎬

```yaml
name: Frame.io Integration
slug: frameio
category: INTEGRATION
icon: 🎬
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Sync deliveries with Frame.io for professional review
  and approval workflows.

features:
  - Upload to Frame.io directly from Zenvas
  - Pull review comments back
  - Sync approval status
  - Frame.io project linking

dependencies:
  required: [delivery]
  optional: []

routes:
  main: /integrations/frameio
  settings: /settings/integrations/frameio
```

### Vimeo/YouTube Integration 📺

```yaml
name: Vimeo/YouTube Integration
slug: video-hosting
category: INTEGRATION
icon: 📺
version: 1.0.0
status: COMING_SOON
developer: Zenvas

description: >
  Direct upload to Vimeo and YouTube with privacy controls
  and thumbnail management.

features:
  - Direct upload to Vimeo
  - Direct upload to YouTube
  - Privacy settings
  - Thumbnail selection
  - Auto-generate link for client

dependencies:
  required: [delivery]
  optional: []

routes:
  main: /integrations/video-hosting
  settings: /settings/integrations/video-hosting
```

### Google Calendar Integration 📆

```yaml
name: Google Calendar Integration
slug: google-calendar
category: INTEGRATION
icon: 📆
version: 1.0.0
status: AVAILABLE
developer: Zenvas

description: >
  Sync Zenvas schedules with Google Calendar for
  seamless calendar management.

features:
  - Two-way sync with Google Calendar
  - Create events from shoot days
  - Reminder notifications
  - Team calendar view

dependencies:
  required: [scheduling]
  optional: []

routes:
  main: /integrations/google-calendar
  settings: /settings/integrations/google-calendar
```

---

# Phase 3 Modules (Future)

## CREATIVE OS Modules

### Free-Form Canvas (Milanote-style) 🎯

```yaml
name: Free-Form Canvas
slug: freeform-canvas
category: CREATIVE
icon: 🎯
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  Visual canvas for brainstorming, mood boards, and creative planning.
  Drag-and-drop cards, images, text, and links.

standalonePotential: large
canGrowInto: Milanote killer

note: This could grow into a standalone product
```

### Content Series Manager 🎥

```yaml
name: Content Series Manager
slug: content-series
category: CREATIVE
icon: 🎥
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  Manage ongoing content series with recurring episodes,
  themes, and release schedules.

standalonePotential: medium

note: Internal media production use case (Drama Studio)
```

### Character Library 🧑

```yaml
name: Character Library
slug: character-library
category: CREATIVE
icon: 🧑
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  AI character asset management for consistent characters
  across productions.

note: AI Content OS module for Drama Studio
```

### AI Asset Library 🖼️

```yaml
name: AI Asset Library
slug: ai-assets
category: CREATIVE
icon: 🖼️
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  Centralized storage for AI-generated assets including
  backgrounds, props, and LoRA models.

note: AI Content OS module for Drama Studio
```

## BUSINESS OS Modules

### Marketing Automation 📣

```yaml
name: Marketing Automation
slug: marketing
category: BUSINESS
icon: 📣
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  Email campaigns, social media scheduling, and lead nurturing
  automation.

features:
  - Email campaign builder
  - Social media scheduling
  - Lead scoring
  - Automated follow-ups
  - Landing page builder

standalonePotential: medium
```

### Social Media Manager 📱

```yaml
name: Social Media Manager
slug: social-media
category: BUSINESS
icon: 📱
version: 2.0.0
status: PLANNED
developer: Zenvas

description: >
  Manage social media presence across platforms with
  content calendar and analytics.

features:
  - Multi-platform posting
  - Content calendar
  - Engagement tracking
  - Hashtag suggestions
```

## PROJECT OS Modules

### Creative Departments 🏢

```yaml
name: Creative Departments
slug: creative-departments
category: PROJECT
icon: 🏢
version: 3.0.0
status: PLANNED
developer: Zenvas

description: >
  Organize crew by department (Camera, Sound, Art, etc.)
  with department-specific workflows.

note: Hollywood-scale productions (TEST-SCENARIO-HOLLYWOOD.md)
```

### Crew Management 👥

```yaml
name: Crew Management
slug: crew-management
category: PROJECT
icon: 👥
version: 4.0.0
status: PLANNED
developer: Zenvas

description: >
  Full crew management including call sheets, deal memos,
  and union compliance.

note: Production-grade crew management
```

---

# Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MODULE DEPENDENCY GRAPH                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CORE (Always Installed)                                                │
│  ├── auth                                                                │
│  ├── organizations                                                       │
│  ├── brands                                                             │
│  ├── roles                                                              │
│  ├── module-manager ──────────────────────┐                            │
│  └── activity-log                           │                            │
│                                              │                            │
│  BUSINESS OS                                 │                            │
│  ├── clients ───────────────────────┐       │                            │
│  │   └── analytics ────────────────┤       │                            │
│  ├── leads ─────────────────┐       │       │                            │
│  │   └── communication ─────┤       │       │                            │
│  ├── team                   │       │       │                            │
│  ├── odoo-invoice ─────────┤───────┼───────┘                            │
│  │   └── payment-gateway ──┘       │                                    │
│  └── (marketing)                    │                                    │
│                                      │                                    │
│  PROJECT OS                          │                                    │
│  ├── tasks ───────────────────────────────────────────────┐              │
│  │   ├── budget-tracking ────────┐                       │              │
│  │   ├── script-writer ──────────┤                       │              │
│  │   │   └── storyboard ─────────┤                       │              │
│  │   ├── shot-list ──────────────┤                       │              │
│  │   │   └── scheduling ─────────┤                       │              │
│  │   ├── knowledge-engine ───────┤                       │              │
│  │   └── delivery ──────────────┤                       │              │
│  │       ├── frameio ────────────┤                       │              │
│  │       └── video-hosting ──────┤                       │              │
│  └── (creative-departments)     │                       │              │
│                                  │                       │              │
│  COLLABORATION                   │                       │              │
│  ├── discuss ────────────────────┤                       │              │
│  │   └── ai-summary ──────────────┤                       │              │
│  ├── video-calls ────────────────┤                       │              │
│  ├── file-sharing ───────────────┘                       │              │
│  └── (communication) ────────────────────────────────────┘              │
│                                                                          │
│  INTEGRATIONS                                                         │
│  ├── odoo (standalone)                                                 │
│  ├── google-drive (standalone)                                          │
│  ├── google-calendar ──▶ scheduling                                    │
│  ├── frameio ──────────▶ delivery                                       │
│  └── video-hosting ────▶ delivery                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Module Install Order (Recommended)

When implementing Phase 2 modules, install in this order for clean dependency resolution:

1. **Module Manager** (infrastructure)
2. **Tasks** (already installed, verify)
3. **Budget Tracking** (depends on Tasks)
4. **Analytics Dashboard** (depends on Tasks, Clients)
5. **Knowledge Engine** (depends on Tasks)
6. **Script Writer** (depends on Tasks)
7. **Storyboard Canvas** (depends on Tasks, Script Writer)
8. **Shot List** (depends on Tasks)
9. **Scheduling** (depends on Tasks, Google Calendar)
10. **Communication Hub** (depends on Leads, Discuss)
11. **AI Summary** (depends on Discuss, Video Calls)
12. **Payment Gateway** (depends on Odoo Invoice)

---

# Community Modules (Phase 3+)

Future: Third-party developers can publish modules.

| Module | Developer | Status |
|--------|-----------|--------|
| QuickBooks Integration | Community | Planned |
| Slack Integration | Community | Planned |
| Custom CRM Import | Community | Planned |

---

**Document History:**
- v0.1 (2026-07-21): Initial draft based on FOUNDATION.md module categories
