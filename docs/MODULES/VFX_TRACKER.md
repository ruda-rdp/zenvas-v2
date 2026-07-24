# VFX_TRACKER.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md
- DAILIES_REVIEW.md

---

# Purpose

The VFX Tracker manages visual effects shots from onset to delivery. For Netflix productions with 200-500 VFX shots per episode, tracking is essential to avoid missed deadlines and budget overruns.

---

# The Problem It Solves

```
WITHOUT VFX TRACKER:
- "Where is that green screen shot from Episode 3?"
- "Which vendor is working on the explosion shots?"
- "Did the client approve the updated version?"
- "How much have we spent on VFX so far?"
- Spreadsheets. Chaos. Expensive mistakes.

WITH VFX TRACKER:
- One source of truth for every VFX shot
- Clear status for each shot (In Production, Review, Approved)
- Vendor assignments and deadlines
- Version history and feedback loop
- Budget tracking per shot and per vendor
```

---

# VFX Shot Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VFX SHOT LIFECYCLE                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  PLANNED   │───▶│  ON HOLD   │───▶│ EDITORIAL   │              │
│  │            │    │            │    │   HOLD      │               │
│  │ Identified │    │ Waiting for│    │ Waiting for │               │
│  │ in script, │    │ footage or │    │ editorial   │               │
│  │ not yet    │    │ other deps │    │ to lock     │               │
│  │ approved   │    │            │    │             │               │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│        │                  │                   │                        │
│        │                  │                   │                        │
│        ▼                  ▼                   ▼                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  APPROVED  │───▶│ INTERNAL   │───▶│  CLIENT    │             │
│  │            │    │ PRODUCTION │    │  REVIEW    │             │
│  │ VFX shot  │    │            │    │            │               │
│  │ approved   │    │ Vendor is  │    │ Netflix    │               │
│  │ for VFX   │    │ working on │    │ executives  │               │
│  │ production │    │ shot       │    │ reviewing   │               │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                           │                   │                        │
│                           │                   │                        │
│                           ▼                   ▼                        │
│                     ┌─────────────┐    ┌─────────────┐               │
│                     │  NEEDS     │    │  APPROVED  │               │
│                     │  REVISION  │    │            │                 │
│                     │            │    │ Final      │                │
│                     │ Client     │    │ approved   │               │
│                     │ feedback,  │    │ for        │               │
│                     │ needs redo │    │ delivery   │               │
│                     └─────────────┘    └─────────────┘               │
│                           │                   │                        │
│                           └─────────┬─────────┘                        │
│                                     ▼                                  │
│                           ┌─────────────┐                             │
│                           │ DELIVERED  │                              │
│                           │            │                              │
│                           │ Sent to    │                              │
│                           │ post, file │                              │
│                           │ archived   │                              │
│                           └─────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// VFX Project (one per production/episode)
model VFXProject {
  id              String   @id @default(cuid())
  
  // References
  episodeId      String?  // Null for feature-length
  episode        Episode? @relation(fields: [episodeId], references: [id])
  
  // Project Info
  name           String   // e.g., "Ep 3 - VFX"
  description     String?
  
  // Status
  status          VFXProjectStatus @default(ACTIVE)
  
  // Budget
  totalBudget     Float?
  spentBudget     Float    @default(0)
  
  // Vendors
  vendors         VFXVendor[]
  
  // Shots
  shots           VFXShot[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
}

enum VFXProjectStatus {
  PRE_PRODUCTION
  ACTIVE
  IN_REVIEW
  COMPLETED
  ARCHIVED
}

// VFX Vendor (multiple vendors per project)
model VFXVendor {
  id              String   @id @default(cuid())
  
  vfxProjectId   String
  vfxProject     VFXProject @relation(fields: [vfxProjectId], references: [id])
  
  // Vendor Info
  name            String   // e.g., "Framestore", "ILM"
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  
  // Contract
  contractAmount  Float?
  contractDate    DateTime?
  contractDoc     String?  // URL to signed contract
  ndaSigned       Boolean  @default(false)
  
  // Status
  status          VendorStatus @default(ACTIVE)
  
  // Shots assigned to this vendor
  shots           VFXShot[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum VendorStatus {
  NEGOTIATING
  CONTRACT_PENDING
  ACTIVE
  COMPLETED
  ON_HOLD
}

// Individual VFX Shot
model VFXShot {
  id              String   @id @default(cuid())
  
  vfxProjectId   String
  vfxProject     VFXProject @relation(fields: [vfxProjectId], references: [id])
  
  // Shot Reference
  episodeNumber   Int?
  sceneNumber     String?  // e.g., "5A"
  shotNumber      String?  // e.g., "3"
  
  // Description
  name            String   // e.g., "Warehouse Explosion"
  description     String   // Detailed description
  scriptReference String?  // Quote from script
  
  // Technical
  type            VFXType
  complexity      Int      @default(3)  // 1-5 scale
  duration        Float?   // seconds
  
  // Plate/Source reference
  plateInfo       String?  // "Camera A, Take 4"
  hasCleanPlate   Boolean  @default(false)
  hasMatchmove    Boolean  @default(false)
  
  // Status
  status          ShotStatus @default(PLANNED)
  
  // Vendor assignment
  vendorId        String?
  vendor          VFXVendor? @relation(fields: [vendorId], references: [id])
  
  // Cost tracking
  estimatedCost   Float?
  actualCost      Float?
  
  // Timeline
  dueDate         DateTime?
  deliveredDate   DateTime?
  
  // Versions
  versions        VFXVersion[]
  
  // Notes
  notes           VFXNote[]
  
  // Timeline/Frameline
  inFrame         Int?
  outFrame        Int?
  totalFrames     Int?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum VFXType {
  CGI_CHARACTER   // Full CG character
  CGI_ENVIRONMENT // CG environment/building
  COMP            // Compositing (greenscreen, etc.)
  RIG_REMOVAL     // Remove rigs/wires
  EXTENSION       // Set extension
  ENVIRONMENT_REBUILD // Rebuild environment
  MOTION_GRAPHICS // Titles, graphics
  COLOR_GRADE     // Color manipulation
  WIRE_REMOVAL    // Remove wires
  FACE_REPLACEMENT // Face swap
  WEATHER FX      // Rain, snow, wind
  EXPLOSION       // Explosions, fire
  WATER FX        // Water simulation
  CROWD           // CG crowd duplication
  DEAD            // Digital de-aging
  BEAUTY          // Beauty cleanup
  GLASS_REPLACEMENT // Replace glass/screens
  PRODUCT_PLACEMENT // Add products
  OTHER           // Other
}

enum ShotStatus {
  PLANNED         // In script, not approved
  ON_HOLD         // Waiting for something
  EDITORIAL_HOLD  // Waiting for edit lock
  APPROVED        // Approved for VFX
  ASSIGNED        // Assigned to vendor
  IN_PRODUCTION   // Vendor working
  INTERNAL_REVIEW // Vendor submitted
  CLIENT_REVIEW   // Netflix reviewing
  NEEDS_REVISION  // Needs changes
  APPROVED        // Final approved
  DELIVERED       // Sent to post
}

// VFX Version (multiple versions per shot)
model VFXVersion {
  id              String   @id @default(cuid())
  
  vfxShotId       String
  vfxShot         VFXShot @relation(fields: [vfxShotId], references: [id])
  
  // Version Info
  versionNumber   Int      // v1, v2, v3...
  versionLabel    String?  // "First pass", "Client feedback", etc.
  
  // Files
  filePath        String?  // Path to render
  frameioId       String?
  frameioUrl      String?
  
  // Review
  status          VersionStatus @default(PENDING)
  
  // Feedback
  feedback        String?
  feedbackAuthor  String?
  feedbackDate    DateTime?
  
  // Technical specs
  resolution      String?  // e.g., "4K"
  codec           String?
  frameRate       Float?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum VersionStatus {
  PENDING
  SUBMITTED
  APPROVED
  REJECTED
  REVISED
}

// VFX Notes/Comments
model VFXNote {
  id              String   @id @default(cuid())
  
  vfxShotId       String
  vfxShot         VFXShot @relation(fields: [vfxShotId], references: [id])
  
  // Author
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])
  
  // Content
  content         String
  
  // Context
  referenceFrame  Int?     // Frame number for screenshot reference
  timestamp       Float?   // Timestamp in video
  isInternal      Boolean  @default(true)  // vs client-visible
  
  // Timestamps
  createdAt       DateTime @default(now())
}

// VFX Delivery Package
model VFXDelivery {
  id              String   @id @default(cuid())
  
  vfxProjectId   String
  vfxProject     VFXProject @relation(fields: [vfxProjectId], references: [id])
  
  // Package Info
  name            String   // e.g., "Ep 3 VFX v3 Package"
  description     String?
  
  // Contents
  shots           String[]  // VFXShot IDs included
  totalShots      Int
  totalFrames     Int
  
  // Files
  fileLocations   Json     // { "shots": [...], "assets": [...] }
  
  // Status
  status          DeliveryStatus @default(PENDING)
  receivedDate    DateTime?
  
  // QC
  qcPassed        Boolean?
  qcNotes         String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  deliveredAt     DateTime?
}

enum DeliveryStatus {
  PENDING
  PREPARING
  SENT
  RECEIVED
  QC_PASSED
  QC_FAILED
  ACCEPTED
}
```

---

# API Contracts

## VFX Tracker Endpoints

### GET `/api/vfx/projects`
List all VFX projects.

```typescript
// Request
GET /api/vfx/projects?episodeId=ep_001&status=ACTIVE

// Response 200 OK
{
  "projects": [
    {
      "id": "vfx_001",
      "name": "Ep 3 - The Warehouse",
      "episodeNumber": 3,
      "status": "ACTIVE",
      "totalShots": 45,
      "shotsByStatus": {
        "approved": 30,
        "inProduction": 10,
        "clientReview": 3,
        "delivered": 2
      },
      "totalBudget": 250000,
      "spentBudget": 120000,
      "budgetPercentUsed": 48
    }
  ]
}
```

### POST `/api/vfx/projects`
Create a new VFX project.

```typescript
// Request
{
  "name": "Ep 3 - The Warehouse",
  "episodeId": "ep_001",
  "description": "Main VFX sequences for Episode 3",
  "totalBudget": 250000
}

// Response 201 Created
{
  "id": "vfx_001",
  "name": "Ep 3 - The Warehouse",
  ...
}
```

### GET `/api/vfx/projects/[id]`
Get VFX project with summary.

```typescript
// Response 200 OK
{
  "id": "vfx_001",
  "name": "Ep 3 - The Warehouse",
  "episode": { "number": 3, "title": "The Warehouse" },
  "status": "ACTIVE",
  "totalShots": 45,
  "shotsByStatus": {
    "planned": 2,
    "approved": 30,
    "inProduction": 10,
    "clientReview": 3,
    "delivered": 0
  },
  "shotsByType": {
    "CGI_ENVIRONMENT": 15,
    "EXPLOSION": 8,
    "COMP": 12,
    "OTHER": 10
  },
  "vendors": [
    { "id": "v_001", "name": "Framestore", "shotsAssigned": 30 },
    { "id": "v_002", "name": "Method Studios", "shotsAssigned": 15 }
  ],
  "totalBudget": 250000,
  "spentBudget": 120000,
  "budgetRemaining": 130000
}
```

### GET `/api/vfx/projects/[id]/shots`
Get shots for a VFX project.

```typescript
// Request
GET /api/vfx/projects/[id]/shots?status=IN_PRODUCTION&vendorId=v_001

// Response 200 OK
{
  "shots": [
    {
      "id": "shot_001",
      "name": "Warehouse Explosion",
      "sceneNumber": "5A",
      "shotNumber": "12",
      "type": "EXPLOSION",
      "complexity": 5,
      "status": "IN_PRODUCTION",
      "vendor": { "id": "v_001", "name": "Framestore" },
      "currentVersion": {
        "versionNumber": 2,
        "frameioUrl": "https://frame.io/clips/abc123"
      },
      "estimatedCost": 25000,
      "dueDate": "2026-08-15"
    }
  ],
  "pagination": { ... }
}
```

### POST `/api/vfx/projects/[id]/shots`
Add a new VFX shot.

```typescript
// Request
{
  "name": "Warehouse Explosion",
  "sceneNumber": "5A",
  "shotNumber": "12",
  "description": "Large-scale explosion destroying the warehouse set",
  "scriptReference": "We see the warehouse explode in a massive fireball",
  "type": "EXPLOSION",
  "complexity": 5,
  "duration": 4.5,
  "plateInfo": "Unit A, Take 3",
  "estimatedCost": 25000,
  "dueDate": "2026-08-15"
}

// Response 201 Created
```

### PATCH `/api/vfx/shots/[shotId]`
Update shot status or details.

```typescript
// Request
{
  "status": "IN_PRODUCTION",
  "vendorId": "v_001"
}

// Response 200 OK
```

### GET `/api/vfx/shots/[shotId]`
Get shot detail with version history.

```typescript
// Response 200 OK
{
  "id": "shot_001",
  "name": "Warehouse Explosion",
  "sceneNumber": "5A",
  "shotNumber": "12",
  "type": "EXPLOSION",
  "complexity": 5,
  "status": "CLIENT_REVIEW",
  "vendor": { "id": "v_001", "name": "Framestore" },
  "estimatedCost": 25000,
  "actualCost": 23000,
  "dueDate": "2026-08-15",
  "versions": [
    {
      "versionNumber": 1,
      "versionLabel": "First Pass",
      "status": "REJECTED",
      "feedback": "Explosion looks too small. Add more debris.",
      "feedbackAuthor": "Netflix VFX Supervisor",
      "feedbackDate": "2026-07-18",
      "frameioUrl": "https://frame.io/clips/old123",
      "createdAt": "2026-07-15"
    },
    {
      "versionNumber": 2,
      "versionLabel": "Revision 1",
      "status": "CLIENT_REVIEW",
      "frameioUrl": "https://frame.io/clips/new456",
      "createdAt": "2026-07-20"
    }
  ],
  "notes": [
    {
      "id": "note_001",
      "content": "Reference: Michael Bay's transformers explosion",
      "author": "Director",
      "createdAt": "2026-06-01"
    }
  ]
}
```

### POST `/api/vfx/shots/[shotId]/versions`
Upload a new version.

```typescript
// Request
{
  "versionNumber": 3,
  "versionLabel": "Revision 2",
  "frameioId": "file_abc123",
  "frameioUrl": "https://frame.io/clips/new789",
  "resolution": "4K",
  "codec": "EXR Sequence"
}

// Response 201 Created
```

### POST `/api/vfx/shots/[shotId]/versions/[versionId]/feedback`
Add feedback to a version.

```typescript
// Request
{
  "content": "Much better! Just needs more fire particles at the edges.",
  "status": "NEEDS_REVISION"
}

// Response 200 OK
```

### GET `/api/vfx/vendors`
List VFX vendors.

```typescript
// Response 200 OK
{
  "vendors": [
    {
      "id": "v_001",
      "name": "Framestore",
      "contactName": "Jane Smith",
      "contactEmail": "jane@framestore.com",
      "status": "ACTIVE",
      "shotsAssigned": 30,
      "shotsCompleted": 12,
      "contractAmount": 150000,
      "shotsByStatus": {
        "inProduction": 15,
        "clientReview": 3
      }
    }
  ]
}
```

### POST `/api/vfx/vendors`
Add a VFX vendor.

```typescript
// Request
{
  "vfxProjectId": "vfx_001",
  "name": "Framestore",
  "contactName": "Jane Smith",
  "contactEmail": "jane@framestore.com",
  "contractAmount": 150000
}

// Response 201 Created
```

### GET `/api/vfx/budget`
Get VFX budget summary.

```typescript
// Response 200 OK
{
  "projectId": "vfx_001",
  "totalBudget": 250000,
  "allocated": 180000,
  "spent": 120000,
  "remaining": 130000,
  "byVendor": [
    { "vendor": "Framestore", "allocated": 150000, "spent": 90000 },
    { "vendor": "Method Studios", "allocated": 100000, "spent": 30000 }
  ],
  "byShotType": [
    { "type": "EXPLOSION", "count": 8, "estimated": 200000 },
    { "type": "CGI_ENVIRONMENT", "count": 15, "estimated": 150000 }
  ]
}
```

---

# UI Components

## VFX Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VFX TRACKER                                              [+ Add Shot]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ PROJECT: Ep 3 - The Warehouse                                     │   │
│  │ Budget: $120K / $250K (48%)                    [Add Vendor]      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  SHOT STATUS OVERVIEW                                                   │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐    │
│  │ PLANNED   │ APPROVED  │ IN PROD.   │ CLIENT REV │ DELIVERED │    │
│  │    2      │    30     │    10      │     3      │     0     │    │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  VENDORS                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🏢 Framestore     │ 30 shots │ 12 done │ $90K spent │ [View]    │   │
│  │ 🏢 Method Studios │ 15 shots │ 5 done  │ $30K spent │ [View]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  SHOTS (Filter: All ▾)  [Search...]                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SHOT    │ TYPE       │ COMPLEXITY │ VENDOR   │ STATUS   │ DUE  │   │
│  │ 5A-12   │ EXPLOSION  │ ★★★★★     │ Framestore│ IN PROD  │ Aug15│   │
│  │ 5A-15   │ CGI ENV    │ ★★★☆☆     │ Framestore│ APPROVED │ Aug20│   │
│  │ 7B-3    │ COMP       │ ★★☆☆☆     │ Method    │ CLIENT   │ Aug10│   │
│  │ 8A-1    │ WIRE REM   │ ★☆☆☆☆     │ -         │ APPROVED │ Aug25│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Shot Detail Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  VFX SHOT: 5A-12 - Warehouse Explosion                                   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  SHOT INFO                    STATUS: IN PRODUCTION                      │
│  ────────────────────────    ────────────────────────────                │
│  Episode: 3                  Vendor: Framestore                         │
│  Scene: 5A                    Complexity: ★★★★★ (5/5)                   │
│  Shot: 12                    Type: EXPLOSION                           │
│  Duration: 4.5s               Due Date: Aug 15, 2026                   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  DESCRIPTION                                                             │
│  Large-scale explosion destroying the warehouse set. Camera positioned  │
│  outside looking in. Debris and fire need to be CG.                    │
│                                                                          │
│  SCRIPT REFERENCE                                                       │
│  "We see the warehouse explode in a massive fireball, glass shattering  │
│  in slow motion as flames engulf the interior."                         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  VERSION HISTORY                                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ v2 - Revision 1                            [Pending Review]     │   │
│  │ Frame.io: https://frame.io/clips/new789                        │   │
│  │ Submitted: Jul 20, 2026                                          │   │
│  │                                                                 │   │
│  │ FEEDBACK:                                                        │   │
│  │ "Much better! Just needs more fire particles at edges."        │   │
│  │ — Netflix VFX Supervisor, Jul 21                                │   │
│  │                                                                 │   │
│  │ [Add Feedback]  [Approve ✓]  [Request Revision]                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ v1 - First Pass                              [Rejected ✗]       │   │
│  │ Frame.io: https://frame.io/clips/old123                        │   │
│  │ Submitted: Jul 15, 2026                                         │   │
│  │                                                                 │   │
│  │ FEEDBACK:                                                        │   │
│  │ "Explosion looks too small. Add more debris."                   │   │
│  │ — Director, Jul 18                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  COST TRACKING                                                          │
│  Estimated: $25,000 | Actual: $23,000 | Remaining: $2,000              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  NOTES                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 👤 Director - Jun 1                                             │   │
│  │ "Reference: Michael Bay's transformers explosion"                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Cancel]  [Edit Shot]  [Mark Delivered ✓]   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Board View (Kanban)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VFX BOARD - Ep 3                                        [Filter: All ▾] │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   PLANNED   │ │  APPROVED    │ │IN PRODUCTION│ │ CLIENT REVIEW│   │
│  │      2      │ │      30      │ │     10      │ │      3       │   │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤   │
│  │             │ │              │ │              │ │              │   │
│  │ ┌──────────┐│ │ ┌──────────┐│ │ ┌──────────┐│ │ ┌──────────┐│   │
│  │ │ 5C-1     ││ │ │ 4A-10    ││ │ │ 5A-12    ││ │ │ 7B-3     ││   │
│  │ │ Wire Rmv ││ │ │ Comp     ││ │ │ Explosion││ │ │ CGI Env  ││   │
│  │ │ ★☆☆☆☆   ││ │ │ ★★☆☆☆   ││ │ │ ★★★★★   ││ │ │ ★★★★☆   ││   │
│  │ │ Internal ││ │ │ Framestore││ │ │ Framestore││ │ │ Method   ││   │
│  │ └──────────┘│ │ └──────────┘│ │ └──────────┘│ │ └──────────┘│   │
│  │             │ │              │ │              │ │              │   │
│  │ ┌──────────┐│ │ ┌──────────┐│ │ ┌──────────┐│ │ ┌──────────┐│   │
│  │ │ 5C-2     ││ │ │ 4A-11    ││ │ │ 6B-5     ││ │ │ 7B-4     ││   │
│  │ │ Wire Rmv ││ │ │ Comp     ││ │ │ Fire FX  ││ │ │ Crowd    ││   │
│  │ └──────────┘│ │ └──────────┘│ │ └──────────┘│ │ └──────────┘│   │
│  │             │ │              │ │              │ │              │   │
│  │             │ │ ┌──────────┐│ │ ┌──────────┐│ │              │   │
│  │             │ │ │ 4B-2     ││ │ │ 6B-6     ││ │              │   │
│  │             │ │ │ Extens.  ││ │ │ Comp     ││ │              │   │
│  │             │ │ └──────────┘│ │ └──────────┘│ │              │   │
│  │             │ │              │ │              │ │              │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐                                      │
│  │   APPROVED   │ │  DELIVERED   │                                      │
│  │      0       │ │      0       │                                      │
│  ├──────────────┤ ├──────────────┤                                      │
│  │              │ │              │                                      │
│  │              │ │              │                                      │
│  └──────────────┘ └──────────────┘                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] VFXProject model
- [ ] VFXVendor model
- [ ] VFXShot model
- [ ] VFXVersion model
- [ ] VFXNote model
- [ ] VFXDelivery model
- [ ] GET /api/vfx/projects endpoint
- [ ] POST /api/vfx/projects endpoint
- [ ] GET /api/vfx/projects/[id] endpoint
- [ ] GET /api/vfx/projects/[id]/shots endpoint
- [ ] POST /api/vfx/projects/[id]/shots endpoint
- [ ] GET /api/vfx/shots/[shotId] endpoint
- [ ] PATCH /api/vfx/shots/[shotId] endpoint
- [ ] POST /api/vfx/shots/[shotId]/versions endpoint
- [ ] POST /api/vfx/shots/[shotId]/versions/[versionId]/feedback endpoint
- [ ] GET /api/vfx/vendors endpoint
- [ ] GET /api/vfx/budget endpoint
- [ ] VFX Dashboard UI
- [ ] Shot List View
- [ ] Shot Detail Modal
- [ ] Board View (Kanban)
- [ ] Vendor Management UI
- [ ] Version Comparison View
- [ ] Budget Tracking UI
- [ ] Frame.io integration for review links
- [ ] Export to spreadsheet

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
