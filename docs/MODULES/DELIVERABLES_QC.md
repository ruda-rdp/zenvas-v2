# DELIVERABLES_QC.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

The Deliverables module manages the final step of post-production: ensuring all technical specifications are met before delivery to Netflix (or any streaming platform). Miss a codec? Wrong color space? Missing subtitles? The delivery gets rejected. This module prevents that.

---

# The Problem It Solves

```
WITHOUT DELIVERABLES MODULE:
- "Did we include the M&E track?"
- "What's the color space for the Netflix delivery?"
- "We forgot the Spanish subtitles!"
- "The codec is wrong — rejected!"
- "Where do we send the 4K file?"
- Panic. Expensive re-renders. Delayed premiere.

WITH DELIVERABLES MODULE:
- Checklist of EVERYTHING needed
- Automated technical checks
- Clear submission workflow
- Confirmation of receipt
- Tracking of multiple platform versions
```

---

# Deliverables Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NETFLIX DELIVERY PACKAGE                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  EPISODE X DELIVERABLES                                                  │
│  ├── VIDEO FILES                                                         │
│  │   ├── Master (4K ProRes)                                             │
│  │   ├── Netflix Spec (IMF/Interop)                                      │
│  │   ├── Streaming (H.264 for approval)                                  │
│  │   └── HDR/Dolby Vision (if applicable)                               │
│  │                                                                       │
│  ├── AUDIO FILES                                                         │
│  │   ├── 5.1 Mix                                                         │
│  │   ├── Stereo Mix                                                       │
│  │   ├── ATMOS (if applicable)                                           │
│  │   └── M&E (Music & Effects - for dubbing)                            │
│  │                                                                       │
│  ├── SUBTITLES & CAPTIONS                                                │
│  │   ├── English CC                                                       │
│  │   ├── English SDH                                                      │
│  │   ├── [Other languages - varies by platform]                         │
│  │   └── Descriptive Audio (AD)                                         │
│  │                                                                       │
│  ├── GRAPHICS & ARTWORK                                                  │
│  │   ├── Episode Thumbnail (1920x1080)                                  │
│  │   ├── Hero Artwork (3000x2000 for platform)                           │
│  │   └── Episode Synopsis (for platform metadata)                        │
│  │                                                                       │
│  └── METADATA                                                            │
│      ├── Music Cue Sheet (ASCAP/BMI)                                     │
│      ├── End Credits (timecoded)                                         │
│      ├── Episode Title / Season / Episode Number                        │
│      └── Production Credits                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Delivery Project (one per episode/season)
model DeliveryProject {
  id              String   @id @default(cuid())
  
  // References
  episodeId      String?  // Null for season-level
  episode        Episode? @relation(fields: [episodeId], references: [id])
  
  // Info
  name           String   // e.g., "Ep 3 Delivery"
  season         Int?
  episodeNumber  Int?
  
  // Platform
  platform       DeliveryPlatform @default(NETFLIX)
  
  // Status
  status         DeliveryStatus @default(DRAFT)
  
  // Timeline
  dueDate        DateTime
  submittedAt    DateTime?
  approvedAt     DateTime?
  
  // Items
  items          DeliveryItem[]
  
  // Version
  deliveryVersion Int      @default(1)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DeliveryPlatform {
  NETFLIX
  APPLE_TV
  AMAZON_PRIME
  DISNEY_PLUS
  HBO_MAX
  PARAMOUNT_PLUS
  HULU
  THEATRICAL
  FESTIVAL
  OTHER
}

enum DeliveryStatus {
  DRAFT           // Building delivery
  READY_TO_SEND   // All checks passed
  SUBMITTED       // Sent to platform
  RECEIVED        // Platform received
  QC_IN_PROGRESS  // Platform QCing
  QC_FAILED       // Rejected
  NEEDS_REVISION  // Changes needed
  APPROVED        // Accepted
  ARCHIVED        // Archived
}

// Individual Delivery Item
model DeliveryItem {
  id              String   @id @default(cuid())
  
  deliveryProjectId String
  deliveryProject   DeliveryProject @relation(fields: [deliveryProjectId], references: [id])
  
  // Item Info
  type            ItemType
  name            String   // e.g., "4K Master"
  description     String?
  
  // File Info
  filePath        String?  // Path to file
  fileSize        Float?   // in GB
  fileFormat      String?  // e.g., "ProRes 4444"
  
  // Frame.io reference
  frameioId       String?
  frameioUrl      String?
  
  // QC Status
  status          ItemStatus @default(PENDING)
  qcChecks        QCResult?
  
  // Notes
  notes           String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  uploadedAt      DateTime?
}

enum ItemType {
  // Video
  VIDEO_MASTER_4K
  VIDEO_NETFLIX_SPEC
  VIDEO_STREAMING_APPROVAL
  VIDEO_HDR_DOLBY
  VIDEO_HDR_HDR10
  VIDEO_ATMOS
  
  // Audio
  AUDIO_51_MIX
  AUDIO_STEREO_MIX
  AUDIO_ATMOS_MIX
  AUDIO_ME_MUSIC_EFFECTS
  AUDIO_DOLBY_DIGITAL
  AUDIO_DTS
  
  // Subtitles
  SUBTITLE_ENGLISH_CC
  SUBTITLE_ENGLISH_SDH
  SUBTITLE_SPANISH
  SUBTITLE_FRENCH
  SUBTITLE_GERMAN
  SUBTITLE_ITALIAN
  SUBTITLE_PORTUGUESE
  SUBTITLE_JAPANESE
  SUBTITLE_CHINESE
  SUBTITLE_KOREAN
  SUBTITLE_OTHER
  
  // Descriptive Audio
  DESCRIPTIVE_AUDIO
  
  // Graphics
  GRAPHICS_THUMBNAIL
  GRAPHICS_HERO_ART
  GRAPHICS_SEASON_ART
  GRAPHICS_EPISODE_STILL
  
  // Metadata
  METADATA_MUSIC_CUE_SHEET
  METADATA_END_CREDITS
  METADATA_PRODUCTION_CREDITS
  METADATA_TITLE_METADATA
}

enum ItemStatus {
  PENDING         // Not started
  PREPARING       // Being prepared
  READY           // Ready, not uploaded
  UPLOADING       // Currently uploading
  UPLOADED        // Uploaded to platform
  QC_PENDING      // Waiting for QC
  QC_PASSED       // Passed QC
  QC_FAILED       // Failed QC
  REJECTED        // Rejected by platform
}

// QC Check Results
model QCResult {
  id              String   @id @default(cuid())
  
  deliveryItemId  String   @unique
  deliveryItem     DeliveryItem @relation(fields: [deliveryItemId], references: [id])
  
  // Technical Specs
  resolution      String?  // e.g., "3840x2160"
  resolutionPass  Boolean?
  
  frameRate       Float?   // e.g., 23.976
  frameRatePass   Boolean?
  
  codec           String?  // e.g., "ProRes 4444"
  codecPass       Boolean?
  
  colorSpace      String?  // e.g., "Rec. 709", "Rec. 2020"
  colorSpacePass  Boolean?
  
  bitDepth        Int?     // e.g., 10, 12
  bitDepthPass    Boolean?
  
  audioChannels   String?  // e.g., "5.1", "Stereo"
  audioChannelsPass Boolean?
  
  audioSampleRate Float?   // e.g., 48000
  audioSampleRatePass Boolean?
  
  // Loudness (for audio)
  integratedLoudness Float? // LUFS
  loudnessPass      Boolean?
  
  truePeak        Float?
  truePeakPass    Boolean?
  
  // File specs
  fileSize        Float?   // GB
  duration        Float?   // seconds
  durationMatch   Boolean?
  
  // Overall
  overallPass     Boolean
  
  // Details
  details         Json?    // Detailed breakdown
  
  // Timestamps
  checkedAt       DateTime @default(now())
}

// QC Specification (template for platforms)
model QCSpec {
  id              String   @id @default(cuid())
  
  name            String   // e.g., "Netflix 4K Master"
  platform        DeliveryPlatform
  
  // Video specs
  resolutionRequired String?  // e.g., "3840x2160"
  frameRateRequired  Float?
  codecRequired      String?
  colorSpaceRequired String?
  bitDepthRequired   Int?
  
  // Audio specs
  audioFormatRequired String?
  loudnessStandard   String?  // e.g., "-14 LUFS"
  truePeakMax        Float?
  
  // General
  fileFormatRequirements Json?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Delivery Submission Log
model DeliverySubmission {
  id              String   @id @default(cuid())
  
  deliveryProjectId String
  deliveryProject   DeliveryProject @relation(fields: [deliveryProjectId], references: [id])
  
  // Submission Info
  version         Int
  submittedAt     DateTime
  
  // Files submitted
  filesSubmitted  Json     // List of file IDs
  
  // Platform response
  platformRef     String?  // Platform's reference number
  platformNotes   String?
  
  // Status
  status          SubmissionStatus @default(SUBMITTED)
  
  // Timestamps
  receivedAt      DateTime?
  resolvedAt      DateTime?
}

enum SubmissionStatus {
  SUBMITTED
  RECEIVED
  IN_REVIEW
  APPROVED
  REJECTED
  NEEDS_REVISION
}

// Issue/Change Request
model DeliveryIssue {
  id              String   @id @default(cuid())
  
  deliveryProjectId String
  deliveryProject   DeliveryProject @relation(fields: [deliveryProjectId], references: [id])
  
  // Issue Info
  type            IssueType
  severity        IssueSeverity @default(MEDIUM)
  description     String
  
  // Item reference
  deliveryItemId  String?
  
  // Resolution
  status          IssueStatus @default(OPEN)
  resolution      String?
  resolvedBy      String?
  resolvedAt      DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum IssueType {
  TECHNICAL_ERROR   // Wrong codec, resolution, etc.
  MISSING_ITEM      // Forgot to include something
  QUALITY_ISSUE     // Quality doesn't meet spec
  CONTENT_ISSUE     // Wrong content, timing off
  SUBTITLE_ERROR    // Subtitle issues
  AUDIO_ISSUE       // Audio issues
  ARTWORK_ISSUE     // Graphics issues
  OTHER
}

enum IssueSeverity {
  CRITICAL         // Delivery rejected
  HIGH             // Must fix before approval
  MEDIUM           // Should fix
  LOW              // Optional to fix
}

enum IssueStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  WONTFIX          // Won't fix, accepted as-is
}
```

---

# API Contracts

## Deliverables Endpoints

### GET `/api/deliveries`
List all delivery projects.

```typescript
// Response 200 OK
{
  "deliveries": [
    {
      "id": "del_001",
      "name": "Ep 3 - The Warehouse",
      "episodeNumber": 3,
      "platform": "NETFLIX",
      "status": "READY_TO_SEND",
      "dueDate": "2026-08-30",
      "progress": {
        "total": 25,
        "uploaded": 20,
        "qcPassed": 18,
        "qcFailed": 2
      }
    }
  ]
}
```

### POST `/api/deliveries`
Create a new delivery project.

```typescript
// Request
{
  "name": "Ep 3 Delivery",
  "episodeId": "ep_003",
  "platform": "NETFLIX",
  "dueDate": "2026-08-30"
}

// Response 201 Created
```

### GET `/api/deliveries/[id]`
Get delivery project with all items.

```typescript
// Response 200 OK
{
  "id": "del_001",
  "name": "Ep 3 - The Warehouse",
  "platform": "NETFLIX",
  "status": "READY_TO_SEND",
  "dueDate": "2026-08-30",
  "deliveryVersion": 2,
  "items": {
    "video": [
      {
        "id": "item_001",
        "type": "VIDEO_MASTER_4K",
        "name": "4K ProRes Master",
        "status": "QC_PASSED",
        "qc": { "overallPass": true, ... }
      }
    ],
    "audio": [...],
    "subtitles": [...],
    "graphics": [...],
    "metadata": [...]
  },
  "summary": {
    "totalItems": 25,
    "completed": 23,
    "qcPassed": 18,
    "qcFailed": 2,
    "pending": 2
  }
}
```

### GET `/api/deliveries/[id]/items`
Get all items for a delivery.

```typescript
// Request
GET /api/deliveries/[id]/items?type=video&status=QC_PASSED

// Response 200 OK
{
  "items": [...]
}
```

### POST `/api/deliveries/[id]/items`
Add a delivery item.

```typescript
// Request
{
  "type": "VIDEO_MASTER_4K",
  "name": "4K ProRes Master",
  "description": "Primary 4K delivery master"
}

// Response 201 Created
```

### POST `/api/deliveries/items/[itemId]/qc`
Run QC check on an item.

```typescript
// Request
// (QC is run automatically when file is uploaded)

{
  "resolution": "3840x2160",
  "frameRate": 23.976,
  "codec": "ProRes 4444",
  "colorSpace": "Rec. 709",
  "bitDepth": 12,
  "fileSize": 450.5,
  "duration": 2880.5,
  "audioChannels": "5.1",
  "integratedLoudness": -14.2,
  "truePeak": -1.5
}

// Response 200 OK
{
  "id": "qc_001",
  "overallPass": true,
  "checks": {
    "resolution": { "value": "3840x2160", "expected": "3840x2160", "pass": true },
    "frameRate": { "value": 23.976, "expected": 23.976, "pass": true },
    "codec": { "value": "ProRes 4444", "expected": "ProRes 4444", "pass": true },
    ...
  }
}
```

### GET `/api/deliveries/[id]/qc-summary`
Get overall QC summary.

```typescript
// Response 200 OK
{
  "deliveryId": "del_001",
  "platform": "NETFLIX",
  "overallStatus": "READY_TO_SEND",
  "passed": 18,
  "failed": 2,
  "pending": 5,
  "criticalIssues": [
    {
      "item": "Spanish Subtitles",
      "issue": "Resolution 1920x1080 — Netflix requires 1920x1080 for subtitles",
      "severity": "HIGH"
    }
  ],
  "canSubmit": true,
  "warnings": [
    "Hero artwork missing season number"
  ]
}
```

### POST `/api/deliveries/[id]/submit`
Submit delivery to platform.

```typescript
// Response 200 OK
{
  "success": true,
  "submissionId": "sub_001",
  "submittedAt": "2026-08-28T10:30:00Z",
  "platformRef": "NFLX-2026-0828-001",
  "nextSteps": [
    "Netflix will review within 5 business days",
    "You will receive QC report via email"
  ]
}
```

### GET `/api/deliveries/[id]/issues`
Get issues for a delivery.

```typescript
// Response 200 OK
{
  "issues": [
    {
      "id": "issue_001",
      "type": "SUBTITLE_ERROR",
      "severity": "HIGH",
      "description": "Spanish subtitles duration doesn't match video",
      "status": "OPEN",
      "createdAt": "2026-08-29T10:00:00Z"
    }
  ]
}
```

---

# Netflix Technical Specifications

```typescript
// Netflix Delivery Specs (Reference)

const NETFLIX_SPECS = {
  video: {
    resolution: "3840x2160 (4K) or 1920x1080 (HD)",
    frameRate: "23.976 fps",
    codec: "JPEG 2000 or ProRes 4444 (IMF)",
    colorSpace: "P3 D65",
    bitDepth: "10-bit minimum",
    hdr: "Dolby Vision or HDR10"
  },
  audio: {
    format: "PCM 24-bit or Dolby E",
    channels: "5.1 surround + Stereo",
    loudness: "-14 LUFS integrated",
    truePeak: "-2 dBTP",
    atmos: "Dolby Atmos (if applicable)"
  },
  subtitles: {
    format: "SRT or STL",
    resolution: "Match video resolution",
    frameRate: "Match video frame rate"
  }
};
```

---

# UI Components

## Deliverables Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DELIVERABLES                                          [+ New Delivery]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ UPCOMING DEADLINES                                                 │   │
│  ├──────────────────────────────────────────────────────────────────┤   │
│  │ ⚠️ Ep 3 - Netflix         Due: Aug 30     5 days left    [View]  │   │
│  │ ⚠️ Ep 4 - Netflix         Due: Sep 6      12 days left   [View]  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ALL DELIVERIES                                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ EP 3 - NETFLIX                                       ✓ Ready    │   │
│  │ Due: Aug 30 │ 23/25 items │ 18 passed QC │ 2 issues     [Open]  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ EP 4 - NETFLIX                                       ⏳ Draft   │   │
│  │ Due: Sep 6  │ 10/25 items │ 0 passed QC  │ 0 issues     [Open]  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ EP 2 - NETFLIX                                       ✓ Approved│   │
│  │ Submitted: Aug 15 │ Approved: Aug 20                [Archive]   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Delivery Detail View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Deliveries                                                   │
│                                                                          │
│  EP 3 DELIVERY - NETFLIX                           Status: Ready ✓     │
│  Due: Aug 30, 2026                                                      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  PROGRESS                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ████████████████████████████████████████░░░░░ 23/25 items     │   │
│  │ ████████████████████████████░░░░░░░░░░░░░░░░░ 18/25 QC Passed │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TABS: [Overview] [Video] [Audio] [Subtitles] [Graphics] [Metadata]   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ VIDEO DELIVERABLES                                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │ ✓ 4K ProRes Master                Ready      QC: ✓ Passed      │   │
│  │ ✓ Netflix IMF Package              Ready      QC: ✓ Passed      │   │
│  │ ✓ Streaming Approval Copy          Ready      QC: ✓ Passed      │   │
│  │ ○ HDR Dolby Vision Master         Preparing  QC: Pending        │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ AUDIO DELIVERABLES                                              │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │ ✓ 5.1 Surround Mix              Ready      QC: ✓ Passed      ✓   │   │
│  │ ✓ Stereo Mix                    Ready      QC: ✓ Passed      ✓   │   │
│  │ ✓ Dolby Atmos Mix               Ready      QC: ✓ Passed      ✓   │   │
│  │ ✓ M&E (Music & Effects)         Ready      QC: ✓ Passed      ✓   │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SUBTITLES & CAPTIONS                                            │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │ ✓ English CC                    Ready      QC: ✓ Passed          │   │
│  │ ✓ English SDH                   Ready      QC: ✓ Passed          │   │
│  │ ✗ Spanish Subtitles             Ready      QC: ✗ FAILED    [Fix] │   │
│  │ ○ French Subtitles              Pending    QC: Pending           │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ISSUES (2)                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ HIGH - Spanish Subtitles resolution incorrect                  │   │
│  │ ⚠️ LOW - Hero artwork missing season number                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Submit Delivery]                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## QC Check Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  QC CHECK: 4K ProRes Master                                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ✓ OVERALL: PASSED                                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  VIDEO SPECS                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Resolution    3840x2160    Required: 3840x2160       ✓ PASS     │   │
│  │ Frame Rate    23.976 fps    Required: 23.976 fps     ✓ PASS     │   │
│  │ Codec         ProRes 4444   Required: ProRes 4444    ✓ PASS     │   │
│  │ Color Space   Rec. 709      Required: Rec. 709        ✓ PASS     │   │
│  │ Bit Depth     12-bit        Required: 10-bit min     ✓ PASS     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  AUDIO SPECS                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Channels      5.1            Required: 5.1             ✓ PASS   │   │
│  │ Sample Rate   48kHz          Required: 48kHz           ✓ PASS   │   │
│  │ Loudness      -14.2 LUFS     Required: -14 LUFS        ✓ PASS   │   │
│  │ True Peak     -1.5 dBTP      Required: -2 dBTP max    ✓ PASS   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  FILE SPECS                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ File Size     450.5 GB                                         │   │
│  │ Duration      48:00:30                                        │   │
│  │ Format        QuickTime                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Close]  [Download Report]                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] DeliveryProject model
- [ ] DeliveryItem model
- [ ] QCResult model
- [ ] QCSpec model
- [ ] DeliverySubmission model
- [ ] DeliveryIssue model
- [ ] Platform specifications (Netflix, Apple TV, Amazon, etc.)
- [ ] GET /api/deliveries endpoint
- [ ] POST /api/deliveries endpoint
- [ ] GET /api/deliveries/[id] endpoint
- [ ] GET /api/deliveries/[id]/items endpoint
- [ ] POST /api/deliveries/[id]/items endpoint
- [ ] POST /api/deliveries/items/[itemId]/qc endpoint
- [ ] GET /api/deliveries/[id]/qc-summary endpoint
- [ ] POST /api/deliveries/[id]/submit endpoint
- [ ] GET /api/deliveries/[id]/issues endpoint
- [ ] Deliverables Dashboard UI
- [ ] Delivery Detail View
- [ ] Item List by Category
- [ ] QC Check Modal
- [ ] Issue Tracking UI
- [ ] Platform Spec Templates
- [ ] File Upload with QC automation
- [ ] Export QC Report
- [ ] Submission Log
- [ ] Email Notifications

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
