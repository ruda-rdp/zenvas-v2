# MUSIC_SOUND.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

Music & Sound management handles everything audio: from tracking music cues in the script, to licensing songs, to coordinating with composers, to final delivery specs. Netflix has strict requirements for music cue sheets and delivery formats.

---

# The Problem It Solves

```
WITHOUT MUSIC/SOUND MODULE:
- "Did we clear the rights for that song in Scene 5?"
- "What cue is the composer working on?"
- "We need the M&E track for the Spanish dubbing..."
- "Where's the Atmos mix for Episode 3?"
- Rights issues. Delayed deliveries. Expensive fixes.

WITH MUSIC/SOUND MODULE:
- Every music cue documented and tracked
- Rights status at a glance
- Composer coordination streamlined
- Delivery specs built-in
```

---

# Music Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MUSIC & SOUND WORKFLOW                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRE-PRODUCTION                                                          │
│  ├── Script analysis: Identify all music cues                            │
│  ├── Categorize: Original, Licensed, Source                              │
│  ├── Budget allocation for licensed music                                │
│  └── Composer engagement (if original score)                             │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  PRODUCTION (Music)                                                     │
│  ├── Temp music placed in rough cut                                      │
│  ├── Composer begins scoring                                             │
│  ├── Licensed songs: Negotiate sync rights                               │
│  └── Track licensing status                                             │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  POST-PRODUCTION                                                         │
│  ├── Replace temp with final score                                       │
│  ├── Finalize licensed song list                                         │
│  ├── Music supervisor approval                                          │
│  ├── Create music cue sheets                                            │
│  └── Deliver to Netflix with delivery                                   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  SOUND POST                                                              │
│  ├── Sound design integration                                           │
│  ├── Sound effects library management                                    │
│  ├── Mix sessions (5.1, Stereo, Atmos)                                  │
│  ├── Quality control                                                    │
│  └── Final audio delivery                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Music Project (one per episode/season)
model MusicProject {
  id              String   @id @default(cuid())
  
  // References
  episodeId      String?
  episode        Episode? @relation(fields: [episodeId], references: [id])
  
  // Info
  name           String
  description     String?
  
  // Status
  status         MusicProjectStatus @default(ACTIVE)
  
  // Composer
  composerId     String?
  composer       Composer? @relation(fields: [composerId], references: [id])
  
  // Music Supervisor
  supervisorId   String?
  supervisor     MusicSupervisor? @relation(fields: [supervisorId], references: [id])
  
  // Budget
  totalBudget    Float?
  spentBudget    Float    @default(0)
  
  // Cues
  cues           MusicCue[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum MusicProjectStatus {
  PRE_PRODUCTION
  ACTIVE
  REVIEW
  APPROVED
  DELIVERED
}

// Music Cue (individual piece of music)
model MusicCue {
  id              String   @id @default(cuid())
  
  musicProjectId String
  musicProject   MusicProject @relation(fields: [musicProjectId], references: [id])
  
  // Cue Info
  cueNumber      String   // e.g., "MUS-001"
  title          String   // e.g., "Opening Theme"
  
  // Script reference
  episodeNumber  Int?
  sceneNumber    String?  // e.g., "5A"
  timestampIn    Float?   // Start time in episode
  timestampOut   Float?   // End time
  
  // Duration
  duration       Float?   // in seconds
  
  // Type
  type           MusicCueType
  
  // Description
  description    String   // What happens musically
  sceneContext   String?  // What's happening in the scene
  
  // Status
  status         CueStatus @default(DRAFT)
  
  // Source info (varies by type)
  source         MusicSource?
  
  // Composer info
  composerNotes  String?
  composerStatus CueComposerStatus?
  
  // Rights
  rightsStatus   RightsStatus @default(PENDING)
  rightsNotes    String?
  
  // Delivery
  deliveryStatus DeliveryStatus @default(PENDING)
  
  // File
  audioFile      String?  // Path to final audio
  frameioId      String?
  frameioUrl     String?
  
  // Cue sheet reference
  cueSheetEntry  CueSheetEntry?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum MusicCueType {
  ORIGINAL       // Composed specifically for the show
  LICENSED       // Existing song with licensed rights
  SOURCE         // Diegetic music (on-screen source, e.g., radio)
  TEMP           // Temporary placeholder (replaced later)
  SILENCE        // No music (intentional)
}

enum CueStatus {
  DRAFT          // Not yet finalized
  APPROVED       // Approved by supervisor
  IN_PRODUCTION  // Being worked on
  REVIEW         // Under review
  FINAL          // Final, approved
  DELIVERED      // Sent to post
}

enum CueComposerStatus {
  NOT_STARTED
  SKETCHING
  IN_PROGRESS
  REVIEW
  REVISIONS
  FINAL
}

enum RightsStatus {
  PENDING        // Rights not yet secured
  IN_NEGOTIATION // Negotiating with rights holder
  SECURED        // Rights obtained
  DENIED         // Rights denied, need alternative
  EXPIRED        // Rights expired
  N_A            // Not applicable (e.g., original score)
}

enum DeliveryStatus {
  PENDING
  DELIVERED
  REJECTED
}

// Music Source (for licensed songs)
model MusicSource {
  id              String   @id @default(cuid())
  
  cueId          String   @unique
  cue            MusicCue @relation(fields: [cueId], references: [id])
  
  // Song Info
  songTitle      String
  artistName     String
  albumName      String?
  recordLabel    String?
  
  // Original recording
  releaseYear    Int?
  isrc           String?  // International Standard Recording Code
  
  // Usage
  usageType      UsageType // SYNC, MASTER, BOTH
  
  // Rights holders
  publisher      String?
  publisherContact String?
  publisherEmail String?
  
  publishingRights MusicPublishingRights?
  
  // Licensing
  licensingCompany String?
  licensingContact String?
  licensingEmail   String?
  
  // Cost
  syncFee        Float?   // Sync rights fee
  masterFee      Float?   // Master use fee
  totalCost      Float?
  currency       String   @default("USD")
  
  // Negotiation
  negotiationStatus NegotiationStatus @default(NOT_STARTED)
  counterOffer   Float?
  finalAgreed    Float?
  
  // Contract
  contractSent   DateTime?
  contractSigned DateTime?
  contractDoc   String?  // URL to signed contract
  
  // Territory
  territory      String?  // "Worldwide", "US Only", etc.
  term           String?  // "In perpetuity", "5 years", etc.
  
  // Restrictions
  restrictions   String?  // Any usage restrictions
  
  // Notes
  notes          String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum UsageType {
  SYNC_ONLY      // Sync rights only (re-record allowed)
  MASTER_ONLY    // Master use only (sync via other means)
  BOTH           // Both sync and master needed
}

model MusicPublishingRights {
  id              String   @id @default(cuid())
  
  musicSourceId  String
  musicSource    MusicSource @relation(fields: [musicSourceId], references: [id])
  
  // Publisher info
  publisherName  String
  pro            String?  // PRO: ASCAP, BMI, SESAC, etc.
  ipi            String?  // IPI/CAE number
  
  // Share
  sharePercent   Float?   // e.g., 50 for 50%
  
  // Contact
  contactName    String?
  contactEmail   String?
  
  // Status
  status         RightsStatus @default(PENDING)
  
  // Notes
  notes          String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum NegotiationStatus {
  NOT_STARTED
  IN_PROGRESS
  COUNTER_OFFER
  AGREED
  SIGNED
  DENIED
}

// Composer
model Composer {
  id              String   @id @default(cuid())
  
  name            String
  email           String?
  phone           String?
  
  // Company
  company         String?
  
  // Deal info
  dealType       ComposerDealType?
  dealAmount     Float?
  dealNotes      String?
  
  // Episodes assigned
  projects       MusicProject[]
  
  // Deliveries
  deliveries     ComposerDelivery[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ComposerDealType {
  FLAT_FEE
  PER_EPISODE
  PER_MINUTE
  BACKEND
}

// Music Supervisor
model MusicSupervisor {
  id              String   @id @default(cuid())
  
  name            String
  company         String?
  email           String?
  phone           String?
  
  projects       MusicProject[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Composer Delivery
model ComposerDelivery {
  id              String   @id @default(cuid())
  
  composerId     String
  composer       Composer @relation(fields: [composerId], references: [id])
  
  // Episode
  episodeId      String?
  
  // Delivery Info
  title          String   // e.g., "Ep 3 - Complete Score"
  version        Int      @default(1)
  versionLabel   String?  // e.g., "Final"
  
  // Files
  stems          Json?    // { "strings": "url", "horns": "url" }
  fullMix        String?  // Full mix audio file
  frameioUrl     String?
  
  // Status
  status         DeliveryStatus @default(PENDING)
  
  // Feedback
  feedback       String?
  feedbackDate   DateTime?
  
  // Timestamps
  submittedAt    DateTime @default(now())
  approvedAt     DateTime?
}

enum DeliveryStatus {
  PENDING
  SUBMITTED
  REVIEW
  APPROVED
  REVISIONS_REQUESTED
  FINAL
}

// Music Cue Sheet Entry (for final delivery)
model CueSheetEntry {
  id              String   @id @default(cuid())
  
  cueId          String   @unique
  cue            MusicCue @relation(fields: [cueId], references: [id])
  
  // Cue sheet fields (ASCAP/BMI format)
  cueNumber      String   // Sequential number
  episodeNumber  Int
  sceneNumber    String?
  
  // Timing
  timeCodeIn     String?  // e.g., "01:02:15:00"
  timeCodeOut    String?  // e.g., "01:03:45:00"
  duration       Float    // in seconds
  
  // Music info
  title          String
  composer       String?
  publisher      String?
  pro            String?  // ASCAP, BMI, SESAC
  iswc           String?  // ISWC code
  
  // For licensed songs
  artist         String?
  album          String?
  recordLabel    String?
  
  // Usage
  usageType      String   // "BACKGROUND", "FEATURED", "SOURCE"
  
  // Rights
  territory      String?
  term           String?
  fee             Float?
  
  // Notes
  notes          String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Sound Design Project
model SoundProject {
  id              String   @id @default(cuid())
  
  episodeId      String
  episode        Episode @relation(fields: [episodeId], references: [id])
  
  // Status
  status         SoundProjectStatus @default(ACTIVE)
  
  // Sound Designer
  soundDesignerId String?
  
  // Deliveries
  mixes          SoundMix[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SoundProjectStatus {
  ACTIVE
  IN_MIX
  REVIEW
  DELIVERED
}

model SoundMix {
  id              String   @id @default(cuid())
  
  soundProjectId String
  soundProject   SoundProject @relation(fields: [soundProjectId], references: [id])
  
  // Mix type
  type           MixType
  
  // Format
  format         String   // e.g., "5.1", "Stereo", "Dolby Atmos"
  
  // File
  filePath       String?
  frameioUrl     String?
  
  // Specs
  sampleRate     Int?     // e.g., 48000
  bitDepth       Int?     // e.g., 24
  codec          String?  // e.g., "WAV", "PCM"
  
  // Status
  status         MixStatus @default(PENDING)
  
  // QC
  qcPassed       Boolean?
  qcNotes        String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  deliveredAt     DateTime?
}

enum MixType {
  ROUGH_MIX
  PRODUCTION_MIX
  TEMPORARY_MIX
  FINAL_MIX
  MUSIC_AND_EFFECTS  // M&E for dubbing
}

enum MixStatus {
  PENDING
  IN_PROGRESS
  REVIEW
  APPROVED
  DELIVERED
}
```

---

# API Contracts

## Music & Sound Endpoints

### GET `/api/music/projects`
List all music projects.

```typescript
// Response 200 OK
{
  "projects": [
    {
      "id": "music_001",
      "name": "Ep 3 - Music",
      "episodeNumber": 3,
      "status": "ACTIVE",
      "composer": { "name": "John Composer" },
      "cueCount": 25,
      "cuesByStatus": {
        "final": 15,
        "inProduction": 5,
        "draft": 5
      },
      "budget": { "total": 50000, "spent": 35000 }
    }
  ]
}
```

### GET `/api/music/projects/[id]`
Get music project with cues.

```typescript
// Response 200 OK
{
  "id": "music_001",
  "name": "Ep 3 - Music",
  "status": "ACTIVE",
  "composer": { "id": "comp_001", "name": "John Composer" },
  "supervisor": { "id": "sup_001", "name": "Jane Supervisor" },
  "cues": [
    {
      "id": "cue_001",
      "cueNumber": "MUS-001",
      "title": "Opening Theme",
      "type": "ORIGINAL",
      "status": "FINAL",
      "duration": 90,
      "composerStatus": "FINAL",
      "rightsStatus": "N_A",
      "deliveryStatus": "DELIVERED"
    },
    {
      "id": "cue_002",
      "cueNumber": "MUS-002",
      "title": "Club Scene",
      "type": "LICENSED",
      "songTitle": "Hot Stuff",
      "artistName": "Donna Summer",
      "status": "REVIEW",
      "rightsStatus": "SECURED",
      "syncFee": 25000,
      "masterFee": 15000,
      "contractDoc": "https://..."
    }
  ],
  "summary": {
    "totalCues": 25,
    "original": 15,
    "licensed": 8,
    "source": 2,
    "final": 15,
    "pending": 10,
    "budget": { "total": 50000, "spent": 35000 }
  }
}
```

### POST `/api/music/cues`
Add a music cue.

```typescript
// Request
{
  "musicProjectId": "music_001",
  "cueNumber": "MUS-003",
  "title": "Emotional Reveal",
  "type": "ORIGINAL",
  "episodeNumber": 3,
  "sceneNumber": "7A",
  "timestampIn": 1234.5,
  "timestampOut": 1267.8,
  "duration": 33.3,
  "description": "Tender orchestral piece revealing the truth"
}

// Response 201 Created
```

### GET `/api/music/cues/[cueId]`
Get cue detail.

```typescript
// Response 200 OK
{
  "id": "cue_002",
  "cueNumber": "MUS-002",
  "title": "Club Scene",
  "type": "LICENSED",
  "status": "REVIEW",
  "source": {
    "songTitle": "Hot Stuff",
    "artistName": "Donna Summer",
    "recordLabel": "Casablanca Records",
    "syncFee": 25000,
    "masterFee": 15000,
    "totalCost": 40000,
    "negotiationStatus": "SIGNED",
    "contractDoc": "https://...",
    "territory": "Worldwide",
    "term": "In perpetuity"
  }
}
```

### POST `/api/music/cues/[cueId]/rights
Update rights status for a licensed cue.

```typescript
// Request
{
  "negotiationStatus": "AGREED",
  "finalAgreed": 40000,
  "contractSent": "2026-07-15T10:00:00Z"
}

// Response 200 OK
```

### GET `/api/music/cue-sheet/[episodeId]`
Generate music cue sheet for delivery.

```typescript
// Response 200 OK
{
  "episodeId": "ep_003",
  "episodeNumber": 3,
  "showTitle": "The Series",
  "producedBy": "Production Company Name",
  "cueSheetDate": "2026-08-15",
  "entries": [
    {
      "cueNumber": 1,
      "sceneNumber": "1A",
      "timeCodeIn": "00:01:30:00",
      "timeCodeOut": "00:02:45:00",
      "duration": 75,
      "title": "Opening Theme",
      "composer": "John Composer",
      "publisher": "Music Publishing Co.",
      "pro": "ASCAP",
      "usageType": "BACKGROUND",
      "iswc": "T-123.456.789-0"
    },
    {
      "cueNumber": 2,
      "sceneNumber": "5A",
      "timeCodeIn": "00:12:15:00",
      "timeCodeOut": "00:15:00:00",
      "duration": 165,
      "title": "Hot Stuff",
      "artist": "Donna Summer",
      "album": "Hot Stuff",
      "recordLabel": "Casablanca Records",
      "usageType": "FEATURED",
      "syncFee": 25000,
      "masterFee": 15000,
      "publisher": "Rights Worldwide Inc.",
      "pro": "BMI",
      "territory": "Worldwide"
    }
    // ... more entries
  ],
  "summary": {
    "totalCues": 25,
    "totalOriginal": 15,
    "totalLicensed": 8,
    "totalSource": 2,
    "totalLicensedFees": 125000
  }
}
```

### GET `/api/sound/projects/[episodeId]`
Get sound project for episode.

```typescript
// Response 200 OK
{
  "id": "sound_001",
  "episodeId": "ep_003",
  "status": "IN_MIX",
  "soundDesigner": { "name": "Sound Designer" },
  "mixes": [
    {
      "id": "mix_001",
      "type": "FINAL_MIX",
      "format": "5.1",
      "status": "DELIVERED",
      "qcPassed": true
    },
    {
      "id": "mix_002",
      "type": "FINAL_MIX",
      "format": "Dolby Atmos",
      "status": "REVIEW",
      "qcPassed": null
    },
    {
      "id": "mix_003",
      "type": "MUSIC_AND_EFFECTS",
      "format": "5.1",
      "status": "PENDING",
      "qcPassed": null
    }
  ]
}
```

### POST `/api/sound/mixes/[mixId]/deliver
Mark mix as delivered.

```typescript
// Response 200 OK
{
  "success": true,
  "deliveredAt": "2026-08-15T14:00:00Z"
}
```

---

# UI Components

## Music Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MUSIC & SOUND                                          [+ Add Cue]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EP 3 - MUSIC                                    Budget: $35K / $50K     │
│                                                                          │
│  PROGRESS                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ████████████████████████████████░░░░░░░░░░ 15/25 cues Final   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  COMPOSER: John Composer                                                │
│  SUPERVISOR: Jane Supervisor                                            │
│                                                                          │
│  CUE STATUS                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┐                           │
│  │ DRAFT    │ IN PROD  │ REVIEW   │ FINAL    │                           │
│  │    5     │    5     │    3     │   12     │                           │
│  └──────────┴──────────┴──────────┴──────────┘                           │
│                                                                          │
│  RIGHTS STATUS                                                           │
│  ┌──────────┬──────────┬──────────┬──────────┐                           │
│  │ PENDING  │NEGOTIATING│ SECURED │ EXPIRED  │                           │
│  │    3     │    2     │    3     │    0     │                           │
│  └──────────┴──────────┴──────────┴──────────┘                           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  CUES (Filter: All ▾)  [Search...]                                     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ #    │ TITLE          │ TYPE      │ STATUS  │ RIGHTS    │ COST │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ 001  │ Opening Theme  │ Original  │ ✓ Final │ N/A      │ -    │   │
│  │ 002  │ Club Scene     │ Licensed  │ Review  │ ● Negotiating│ $40K│  │
│  │ 003  │ Emotional Reveal│ Original  │ In Prod │ N/A      │ -    │   │
│  │ 004  │ Car Chase      │ Original  │ Draft   │ N/A      │ -    │   │
│  │ 005  │ Radio on TV   │ Source    │ Final   │ ✓ Secured│ -    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Cue Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  CUE: MUS-002 - Club Scene                                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  BASIC INFO                    STATUS: REVIEW                            │
│  ────────────────────────      ──────────────────────────                 │
│  Episode: 3                     Composer: ✓ Final                       │
│  Scene: 5A                      Rights: ● In Negotiation                │
│  Duration: 45.3s               Delivery: Pending                        │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  MUSIC DETAILS                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Title:    Hot Stuff                                              │   │
│  │ Artist:   Donna Summer                                           │   │
│  │ Album:    Hot Stuff (1979)                                       │   │
│  │ Label:    Casablanca Records                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  RIGHTS STATUS                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ● NEGOTIATION IN PROGRESS                                        │   │
│  │                                                                  │   │
│  │ Sync Fee:     $25,000    ✓ Negotiated                           │   │
│  │ Master Fee:   $15,000    ✓ Negotiated                           │   │
│  │ Total:        $40,000                                           │   │
│  │                                                                  │   │
│  │ Territory:    Worldwide                                           │   │
│  │ Term:         In perpetuity                                       │   │
│  │                                                                  │   │
│  │ Publisher:    Rights Worldwide Inc.                             │   │
│  │ Contact:      Jane Rights (jane@rightsworldwide.com)            │   │
│  │                                                                  │   │
│  │ Contract: ✓ Sent (Jul 15)                                        │   │
│  │          ○ Awaiting signature                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  NOTES                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Temp track placed from original 1979 version.                    │   │
│  │ Need to use master recording.                                    │   │
│  │ Jane confirmed they can clear by Aug 1.                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Cancel]  [Save]  [Mark Rights Secured ✓]   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Music Cue Sheet Preview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MUSIC CUE SHEET                                                        │
│  Episode 3 - "The Warehouse"                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Produced by: Production Company Inc.                                    │
│  Music Supervisor: Jane Supervisor                                       │
│  Date: August 15, 2026                                                   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  │ # │ SCENE │ START    │ END      │ DUR   │ TITLE              │ ... │
│  ════════════════════════════════════════════════════════════════════    │
│  │ 1 │ 1A    │ 00:01:30 │ 00:02:45 │ 1:15  │ Opening Theme      │ ... │
│  │ 2 │ 3B    │ 00:08:20 │ 00:10:00 │ 1:40  │ Tension Build      │ ... │
│  │ 3 │ 5A    │ 00:12:15 │ 00:15:00 │ 2:45  │ Hot Stuff          │ ... │
│  │   │       │          │          │       │ Donna Summer       │ ... │
│  │   │       │          │          │       │ Casablanca Records │ ... │
│  │ 4 │ 7A    │ 00:18:30 │ 00:20:15 │ 1:45  │ Emotional Reveal   │ ... │
│  │ 5 │ 8C    │ 00:22:00 │ 00:23:00 │ 1:00  │ Radio on TV        │ ... │
│  │   │       │          │          │       │ (Source)           │ ... │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  SUMMARY                                                                │
│  Total Cues: 25                                                         │
│  Original Score: 15 cues                                                 │
│  Licensed Songs: 8 cues                                                 │
│  Source Music: 2 cues                                                    │
│                                                                          │
│  Licensed Music Fees: $125,000                                           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  [Download CSV] [Download PDF] [Send to ASCAP/BMI]                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] MusicProject model
- [ ] MusicCue model
- [ ] MusicSource model
- [ ] MusicPublishingRights model
- [ ] Composer model
- [ ] MusicSupervisor model
- [ ] ComposerDelivery model
- [ ] CueSheetEntry model
- [ ] SoundProject model
- [ ] SoundMix model
- [ ] GET /api/music/projects endpoint
- [ ] GET /api/music/projects/[id] endpoint
- [ ] POST /api/music/cues endpoint
- [ ] GET /api/music/cues/[cueId] endpoint
- [ ] POST /api/music/cues/[cueId]/rights endpoint
- [ ] GET /api/music/cue-sheet/[episodeId] endpoint
- [ ] GET /api/sound/projects/[episodeId] endpoint
- [ ] POST /api/sound/mixes/[mixId]/deliver endpoint
- [ ] Music Dashboard UI
- [ ] Cue List View
- [ ] Cue Detail Modal
- [ ] Rights Tracking UI
- [ ] Composer Coordination UI
- [ ] Cue Sheet Generator
- [ ] Cue Sheet Export (CSV, PDF)
- [ ] Sound Mix Tracking UI
- [ ] Audio Delivery Specs
- [ ] ASCAP/BMI Export
- [ ] Frame.io Integration for Audio

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
