# DAILIES_REVIEW.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

Dailies (also called Rushes) are the raw footage shot each day. The Dailies Review module enables the director, DP, and showrunner to review footage the next morning, make notes, and catch issues early.

---

# The Problem It Solves

```
WITHOUT DAILIES REVIEW:
- Editor receives footage with no context
- Director forgets what worked until it's too late
- DP can't review color/exposure notes
- Problems discovered in edit bay = expensive reshoots
- Footage scattered across drives, Dropbox, Frame.io...

WITH DAILIES REVIEW:
- Centralized, organized footage delivery
- Next-morning review workflow
- Timestamped notes per take
- Problems caught while still on location
- Seamless edit integration
```

---

# Dailies Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DAILIES WORKFLOW                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRODUCTION DAY                                                          │
│  ├── Camera rolls throughout the day                                    │
│  ├── Sound mixer records separately                                     │
│  └── Data Wrangler backs up continuously                                │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  END OF DAY                                                              │
│  ├── Camera department: Copy cards, verify checksums                    │
│  ├── Sound department: Sync sound to picture (if not baked in)         │
│  ├── Data Wrangler: Transcode proxies, upload to Frame.io               │
│  └── DIT: Apply preliminary color LUT (optional)                       │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  NEXT MORNING                                                           │
│  ├── Dailies available in Zenvas                                        │
│  ├── Director/DP/Showrunner review                                      │
│  │   ├── Watch takes                                                    │
│  │   ├── Mark picks (prints)                                            │
│  │   ├── Add timestamped notes                                          │
│  │   └── Flag problems (focus, exposure, sound)                         │
│  └── Department review (Sound, VFX Supervisor)                         │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  EDIT BAY                                                                │
│  ├── Editor receives organized footage with marks                      │
│  ├── Good takes marked, bad takes marked                                 │
│  └── Notes guide editorial decisions                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Daily Export (one per shoot day per episode)
model DailyExport {
  id              String   @id @default(cuid())
  
  // References
  episodeId       String
  episode         Episode  @relation(fields: [episodeId], references: [id])
  
  // Date & Info
  shootDate       DateTime
  exportDate      DateTime @default(now())
  
  // Status
  status          DailyStatus @default(UPLOADING)
  
  // Frame.io integration
  frameioProjectId String?
  frameioFolderId  String?
  
  // Metadata
  totalClips      Int      @default(0)
  totalDuration   Float    @default(0)  // in seconds
  totalSize       Float    @default(0)  // in GB
  resolution      String   @default("4K")
  codec           String?
  
  // Review status
  reviewedBy      String?  // User IDs
  reviewedAt     DateTime?
  reviewNotes    String?
  
  // Call sheet reference
  callSheetId    String?
  
  // Clips
  clips           DailyClip[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DailyStatus {
  UPLOADING
  PROCESSING
  READY
  REVIEWING
  REVIEWED
  ARCHIVED
}

// Individual Clip in Dailies
model DailyClip {
  id              String   @id @default(cuid())
  
  dailyExportId   String
  dailyExport     DailyExport @relation(fields: [dailyExportId], references: [id])
  
  // Clip Info
  filename        String
  filePath        String
  
  // Frame.io reference
  frameioId       String?
  frameioUrl      String?
  
  // Technical
  duration        Float    // seconds
  resolution      String
  frameRate       Float
  codec           String?
  camera          String?  // e.g., "ARRI Alexa Mini LF"
  lens            String?  // e.g., "Cooke S7/i 50mm T2"
  iso             Int?
  whiteBalance    String?
  shutterAngle    Float?
  
  // Scene Info (from production)
  sceneNumber     String?  // e.g., "5A"
  shotNumber      String?  // e.g., "3"
  takeNumber      Int      @default(1)
  
  // Location & Time
  location        String?  // e.g., "Warehouse - Int"
  timeOfDay       String?  // "Day", "Night", "Magic Hour"
  
  // Review Status
  status          ClipStatus @default(PENDING)
  
  // Marks (for editor)
  isPrint         Boolean  @default(false)  // Good take
  isFavorite      Boolean  @default(false)
  isRejected      Boolean  @default(false)
  
  // Notes
  notes           DailyNote[]
  
  // Sound sync
  hasSyncSound    Boolean  @default(true)
  soundRoll       String?  // Sound roll reference
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ClipStatus {
  PENDING
  REVIEWED
  PRINT
  FAVORITE
  REJECTED
  IN_EDIT
}

// Daily Note (timestamped comment)
model DailyNote {
  id              String   @id @default(cuid())
  
  dailyClipId     String
  dailyClip       DailyClip @relation(fields: [dailyClipId], references: [id])
  
  // Author
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])
  
  // Note Content
  content         String
  
  // Timestamp (for video sync)
  timestamp       Float?   // seconds into clip
  
  // Category
  category        NoteCategory @default(GENERAL)
  
  // Resolution
  resolved        Boolean  @default(false)
  resolvedBy     String?
  resolvedAt     DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
}

enum NoteCategory {
  GENERAL
  CAMERA
  SOUND
  LIGHTING
  ACTING
  VFX
  COLOR
  SAFETY
  QUESTION
}

// Daily Review Session
model DailyReviewSession {
  id              String   @id @default(cuid())
  
  dailyExportId   String
  dailyExport     DailyExport @relation(fields: [dailyExportId], references: [id])
  
  // Session Info
  date            DateTime
  attendees       String[]  // User IDs
  
  // Summary
  totalReviewed   Int      @default(0)
  printsMarked    Int      @default(0)
  rejectsMarked   Int      @default(0)
  notesAdded      Int      @default(0)
  
  // Approval
  directorApproved Boolean @default(false)
  directorApprovedAt DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  completedAt     DateTime?
}

// Director's Screening List (what to watch)
model ScreeningList {
  id              String   @id @default(cuid())
  
  dailyExportId   String
  dailyExport     DailyExport @relation(fields: [dailyExportId], references: [id])
  
  // Who it's for
  forRole         ScreeningForRole
  
  // Priority ordering (screening sequence)
  items           ScreeningItem[]
  
  // Status
  status          ScreeningStatus @default(PENDING)
  completedAt     DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
}

enum ScreeningForRole {
  DIRECTOR
  DP
  SHOWRUNNER
  EDITOR
  VFX_SUPERVISOR
  SOUND_SUPERVISOR
}

enum ScreeningStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model ScreeningItem {
  id              String   @id @default(cuid())
  
  screeningListId String
  screeningList   ScreeningList @relation(fields: [screeningListId], references: [id])
  
  // Reference to clip
  dailyClipId     String
  dailyClip       DailyClip @relation(fields: [dailyClipId], references: [id])
  
  // Priority (order to watch)
  order           Int
  
  // Status
  status          ScreeningItemStatus @default(PENDING)
  watchedAt       DateTime?
  notes           String?
  
  // Timestamps
  createdAt       DateTime @default(now())
}

enum ScreeningItemStatus {
  PENDING
  WATCHED
  FLAGGED
}
```

---

# API Contracts

## Dailies Endpoints

### GET `/api/dailies`
List daily exports.

```typescript
// Request
GET /api/dailies?episodeId=ep_001&status=READY

// Response 200 OK
{
  "dailies": [
    {
      "id": "daily_001",
      "episodeId": "ep_001",
      "shootDate": "2026-07-20",
      "status": "REVIEWED",
      "totalClips": 45,
      "totalDuration": 7200, // 2 hours
      "reviewedAt": "2026-07-21T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

### GET `/api/dailies/[id]`
Get daily export with clips.

```typescript
// Response 200 OK
{
  "id": "daily_001",
  "episode": {
    "id": "ep_001",
    "number": 3,
    "title": "The Breakthrough"
  },
  "shootDate": "2026-07-20",
  "status": "REVIEWED",
  "totalClips": 45,
  "totalDuration": 7200,
  "resolution": "4K",
  "codec": "ProRes 4444",
  "reviewedAt": "2026-07-21T10:30:00Z",
  "clips": [
    {
      "id": "clip_001",
      "filename": "A001_C001_0720_001.mov",
      "sceneNumber": "5A",
      "shotNumber": "3",
      "takeNumber": 1,
      "duration": 45.2,
      "camera": "ARRI Alexa Mini LF",
      "lens": "Cooke S7/i 50mm T2",
      "status": "PRINT",
      "frameioUrl": "https://frame.io/clips/abc123",
      "thumbnail": "https://...",
      "notes": [
        {
          "author": "Director",
          "content": "Perfect take. Use this.",
          "timestamp": null,
          "category": "GENERAL"
        }
      ]
    }
    // ... more clips
  ],
  "stats": {
    "totalClips": 45,
    "pendingReview": 5,
    "prints": 12,
    "rejects": 8,
    "favorites": 3
  }
}
```

### GET `/api/dailies/[id]/clips`
Get clips for a daily export.

```typescript
// Request
GET /api/dailies/[id]/clips?scene=5A&status=PRINT

// Response 200 OK
{
  "clips": [
    {
      "id": "clip_001",
      "filename": "A001_C001_0720_001.mov",
      "sceneNumber": "5A",
      "shotNumber": "3",
      "takeNumber": 1,
      "status": "PRINT",
      "duration": 45.2,
      "frameioUrl": "https://...",
      "thumbnail": "https://..."
    }
  ]
}
```

### PATCH `/api/dailies/clips/[clipId]`
Update clip status (mark as print, favorite, reject).

```typescript
// Request
{
  "status": "PRINT",
  "isPrint": true,
  "notes": [
    { "content": "Perfect take. Use this.", "category": "GENERAL" }
  ]
}

// Response 200 OK
{
  "success": true,
  "clip": { ... }
}
```

### POST `/api/dailies/clips/[clipId]/notes`
Add a note to a clip.

```typescript
// Request
{
  "content": "Focus looks soft at the end of the take",
  "timestamp": 35.5, // seconds
  "category": "CAMERA"
}

// Response 201 Created
{
  "id": "note_001",
  "content": "Focus looks soft at the end of the take",
  "timestamp": 35.5,
  "category": "CAMERA",
  "author": { "id": "user_001", "name": "John Director" },
  "createdAt": "2026-07-21T10:35:00Z"
}
```

### GET `/api/dailies/[id]/screening-list`
Get screening list for a role.

```typescript
// Request
GET /api/dailies/[id]/screening-list?forRole=DIRECTOR

// Response 200 OK
{
  "id": "screening_001",
  "dailyExportId": "daily_001",
  "forRole": "DIRECTOR",
  "status": "IN_PROGRESS",
  "items": [
    {
      "id": "item_001",
      "order": 1,
      "clip": {
        "id": "clip_001",
        "sceneNumber": "5A",
        "shotNumber": "3",
        "takeNumber": 1,
        "duration": 45.2,
        "status": "PRINT"
      },
      "status": "WATCHED"
    },
    {
      "id": "item_002",
      "order": 2,
      "clip": {
        "id": "clip_002",
        "sceneNumber": "5A",
        "shotNumber": "3",
        "takeNumber": 2,
        "duration": 48.1,
        "status": "PRINT"
      },
      "status": "FLAGGED",
      "notes": "Check exposure"
    }
  ]
}
```

### POST `/api/dailies/[id]/approve`
Director approves the daily export.

```typescript
// Response 200 OK
{
  "success": true,
  "approvedAt": "2026-07-21T11:00:00Z"
}
```

### GET `/api/dailies/frameio/webhook`
Webhook endpoint for Frame.io notifications.

```typescript
// Frame.io webhook payload
{
  "event": "file.uploaded",
  "project_id": "proj_123",
  "file": {
    "id": "file_abc",
    "name": "A001_C001_0720_001.mov",
    "url": "https://frame.io/clips/abc123"
  }
}
```

---

# UI Components

## Dailies Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DAILIES REVIEW                                         [Upload] [Sync] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ EP 3 - "The Breakthrough"                                        │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  DATE       │ CLIPS │ DURATION │ STATUS    │ REVIEWER │ APPROVED │   │
│  │  ─────────────────────────────────────────────────────────────  │   │
│  │  Jul 20     │  45   │  2h 00m  │ REVIEWED  │ Director │   ✓      │   │
│  │  Jul 19     │  38   │  1h 45m  │ REVIEWED  │ Director │   ✓      │   │
│  │  Jul 18     │  52   │  2h 15m  │ READY     │    -     │   -      │   │
│  │  Jul 17     │  41   │  1h 55m  │ UPLOADING │    -     │   -      │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  TODAY'S DAILIES (Jul 20)                                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    🎬 Video Player                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                                                         │    │   │
│  │  │                   [4K Footage Playing]                   │    │   │
│  │  │                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  Clip: A001_C001_0720_001   Scene: 5A   Shot: 3   Take: 1      │   │
│  │  Duration: 0:45   Camera: Alexa Mini LF   Lens: 50mm T2        │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ ★ PRINT  ♡ FAVORITE  ✗ REJECT  ✏️ ADD NOTE            │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  NOTES:                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ 👤 Director - 2:30 into clip                             │   │   │
│  │  │ "Focus looks soft around the 35 second mark"            │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  [◀ Prev] [▶ Play] [Next ▶]     Clip 12 of 45                 │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Clip Thumbnail Grid

```
┌─────────────────────────────────────────────────────────────────────────┐
│  JUL 20 DAILIES - 45 clips                         [Filter: All ▾]      │
│  Scene: All  |  Status: All  |  Sort: Scene/Take                       │
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ ★      │ │        │ │        │ │ ✗      │ │        │ │        │   │
│  │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│   │
│  │ 5A-3-1 │ │ 5A-3-2 │ │ 5A-3-3 │ │ 5A-3-4 │ │ 5A-4-1 │ │ 5A-4-2 │   │
│  │ 0:45   │ │ 0:48   │ │ 0:42   │ │ 0:44   │ │ 0:35   │ │ 0:38   │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │        │ │        │ │ ★      │ │        │ │        │ │        │   │
│  │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│ │ [thumb]│   │
│  │ 5A-4-3 │ │ 5A-5-1 │ │ 5A-5-2 │ │ 5A-6-1 │ │ 5A-6-2 │ │ 5A-6-3 │   │
│  │ 0:41   │ │ 0:52   │ │ 0:49   │ │ 0:38   │ │ 0:44   │ │ 0:40   │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                                          │
│  LEGEND: ★ Print  ♡ Favorite  ✗ Reject  ⏳ Pending                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scene Breakdown View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE 5A - BREAKDOWN                                                   │
│  Int. Warehouse - Night                                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ SHOT 3 - Close-up on Detective Carter                           │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ Takes: 5  |  Prints: 2  |  Rejects: 1                            │   │
│  │                                                                   │   │
│  │ ✓ Take 1 - PRINT - "Perfect expression" - Director              │   │
│  │   Take 2 - Good expression, slight blink                        │   │
│  │ ✓ Take 3 - PRINT - "Better timing" - Director                   │   │
│  │   Take 4 - REJECT - Camera bump                                  │   │
│  │   Take 5 - Camera error, no recording                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ SHOT 4 - Medium shot both detectives                            │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ Takes: 4  |  Prints: 1  |  Rejects: 0                            │   │
│  │                                                                   │   │
│  │   Take 1 - Good coverage                                         │   │
│  │ ✓ Take 2 - PRINT - "Use this" - Director                         │   │
│  │   Take 3 - Audio pop                                             │   │
│  │   Take 4 - Slightly out of focus                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Watermarked Review (for Netflix)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔒 CONFIDENTIAL - FOR AUTHORIZED REVIEW ONLY                           │
│  WaterMark: REVIEWER_001 | Date: 2026-07-21 | Project: Netflix Original  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                 │   │
│  │                   [WATERMARKED FOOTAGE]                        │   │
│  │                                                                 │   │
│  │  REVIEWER_001                                     10:35:22       │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [◀ Prev] [▶ Play] [Next ▶]                        [Add Note ✏️]        │
│                                                                          │
│  REVIEWER: John Netflix (Netflix Executive)                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Integration Points

## Frame.io Integration

```typescript
// lib/frameio-dailies.ts

interface Frame.ioDailiesIntegration {
  // Upload workflow
  uploadClip(clip: DailyClip): Promise<FrameIOUploadResult>;
  getProjectId(episodeId: string): string;
  
  // Sync workflow
  syncProject(projectId: string): Promise<FrameIOFile[]>;
  createFolderStructure(daily: DailyExport): Promise<string>;
  
  // Webhook handling
  handleUploadComplete(webhook: FrameIOWebhook): Promise<void>;
}

// Webhook events we listen for:
// - file.uploaded
// - file.deleted
// - comment.created
```

## Editor Integration

```typescript
// Export for Editor

interface DailiesExport {
  episodeId: string;
  shootDate: string;
  clips: {
    filename: string;
    scene: string;
    shot: string;
    take: number;
    status: 'PRINT' | 'REJECT' | 'PENDING';
    notes: { author: string; content: string; timestamp?: number }[];
    frameioUrl: string;
    thumbnailUrl: string;
  }[];
  printsOnly: boolean; // Filter to only print takes
}
```

---

# Implementation Checklist

- [ ] DailyExport model
- [ ] DailyClip model
- [ ] DailyNote model
- [ ] DailyReviewSession model
- [ ] ScreeningList & ScreeningItem models
- [ ] GET /api/dailies endpoint
- [ ] GET /api/dailies/[id] endpoint
- [ ] GET /api/dailies/[id]/clips endpoint
- [ ] PATCH /api/dailies/clips/[clipId] endpoint
- [ ] POST /api/dailies/clips/[clipId]/notes endpoint
- [ ] GET /api/dailies/[id]/screening-list endpoint
- [ ] POST /api/dailies/[id]/approve endpoint
- [ ] Frame.io webhook handler
- [ ] Frame.io upload integration
- [ ] Dailies Dashboard UI
- [ ] Video Player component
- [ ] Clip Thumbnail Grid
- [ ] Scene Breakdown View
- [ ] Watermarked Review Player
- [ ] Screening List Generator
- [ ] Export for Editor integration

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
