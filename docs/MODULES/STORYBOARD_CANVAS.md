# STORYBOARD_CANVAS.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

The Storyboard Canvas is a visual planning tool for creating frame-by-frame storyboards. Directors and DPs can plan shots before production, and storyboards serve as visual references for the entire crew.

---

# The Problem It Solves

```
WITHOUT STORYBOARD CANVAS:
- Directors plan shots in their head
- "What was that shot angle we discussed?"
- Storyboard artists work from vague descriptions
- No visual reference for the crew
- Netflix executives can't see the vision early

WITH STORYBOARD CANVAS:
- Visual shot planning with drag-and-drop
- Frame-by-frame sequencing
- Shot annotations (lens, movement, notes)
- Easy sharing with crew and executives
- Links to script and scenes
```

---

# Storyboard Concept

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STORYBOARD: Episode 3, Scene 5A                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐         │
│  │       │   │       │   │       │   │       │   │       │         │
│  │ Frame │   │ Frame │   │ Frame │   │ Frame │   │ Frame │         │
│  │   1   │──▶│   2   │──▶│   3   │──▶│   4   │──▶│   5   │         │
│  │       │   │       │   │       │   │       │   │       │         │
│  └───────┘   └───────┘   └───────┘   └───────┘   └───────┘         │
│                                                                          │
│  FRAME 1: Wide establishing shot                                       │
│  FRAME 2: Medium tracking shot                                         │
│  FRAME 3: Close-up on action                                          │
│  FRAME 4: Reaction shot                                               │
│  FRAME 5: Wide exit shot                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Storyboard Project
model StoryboardProject {
  id              String   @id @default(cuid())
  
  // References
  productionId    String
  production      Production @relation(fields: [productionId], references: [id])
  
  // Info
  title          String   // e.g., "Ep 3 - The Warehouse"
  episodeNumber  Int?
  
  // Status
  status         StoryboardStatus @default(DRAFT)
  
  // Author
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  
  // Sequences
  sequences      StoryboardSequence[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum StoryboardStatus {
  DRAFT
  REVIEW
  APPROVED
  ARCHIVED
}

// Storyboard Sequence (collection of frames for a scene)
model StoryboardSequence {
  id              String   @id @default(cuid())
  
  storyboardProjectId String
  storyboardProject   StoryboardProject @relation(fields: [storyboardProjectId], references: [id])
  
  // Info
  title          String   // e.g., "Scene 5A - Warehouse Fight"
  sceneNumber    String?  // Link to script
  episodeNumber  Int?
  
  // Status
  status         SequenceStatus @default(DRAFT)
  
  // Duration estimate
  estimatedDuration Float?  // in seconds
  
  // Frames
  frames         StoryboardFrame[]
  
  // Order
  order          Int
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SequenceStatus {
  DRAFT
  REVIEW
  APPROVED
}

// Individual Frame
model StoryboardFrame {
  id              String   @id @default(cuid())
  
  sequenceId     String
  sequence       StoryboardSequence @relation(fields: [sequenceId], references: [id])
  
  // Frame info
  frameNumber    Int
  
  // Visual content
  imageUrl      String?  // Uploaded image
  drawingData    String?  // Canvas drawing data (JSON)
  referenceUrl  String?  // Reference image URL
  
  // Shot type
  shotType      ShotType
  
  // Technical specs
  camera        String?  // e.g., "ARRI Alexa Mini LF"
  lens          String?  // e.g., "50mm T2"
  cameraMove    String?  // "Static", "Dolly In", "Tracking", etc.
  
  // Content description
  description   String?  // What's happening in the frame
  action        String?  // Main action
  dialogue     String?  // Dialogue or V.O.
  
  // Timing
  duration      Float?   // Estimated duration in seconds
  timestamp     Float?   // Timestamp in scene
  
  // Audio notes
  audioNotes   String?  // Sound effects, music cues
  
  // Lighting notes
  lightingNotes String?  // "Day exterior", "Motivated interior"
  
  // Status
  status        FrameStatus @default(DRAFT)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ShotType {
  EXTREME_WIDE   // EWS
  VERY_WIDE     // VWS
  WIDE          // WS
  MEDIUM_WIDE   // MWS
  MEDIUM        // MS
  MEDIUM_CLOSE  // MCS
  CLOSE_UP     // CU
  EXTREME_CLOSE // ECU
  TWO_SHOT     // 2S
  OVER_THE_SHOULDER // OTS
  POINT_OF_VIEW // POV
  INSERT        // Insert
  ESTABLISHING  // Est
  CUTAWAY      // Cutaway
  REACTION     // Reaction
  OTHER
}

enum FrameStatus {
  DRAFT
  SKETCHED
  FINAL
  APPROVED
}

// Character/Movement Annotation
model FrameAnnotation {
  id              String   @id @default(cuid())
  
  storyboardFrameId String
  storyboardFrame   StoryboardFrame @relation(fields: [storyboardFrameId], references: [id])
  
  // Annotation type
  type           AnnotationType
  
  // Content
  content        String
  
  // Position (for visual annotations)
  positionX      Float?   // 0-100 percentage
  positionY      Float?   // 0-100 percentage
  
  // Color
  color          String?  // e.g., "#FF0000"
  
  // Timestamps
  createdAt       DateTime @default(now())
}

enum AnnotationType {
  ARROW           // Direction of movement
  CHARACTER       // Character marker
  CAMERA          // Camera position
  ACTION          // Action zone
  NOTE            // Text note
  HIGHLIGHT       // Highlight area
}

// Camera Movement Library
model CameraMovement {
  id              String   @id @default(cuid())
  
  name            String   // e.g., "Dolly In"
  description     String?
  icon           String?  // Icon representation
  
  // Preset for storyboard
  defaultDuration Float?   // Default duration in seconds
}
```

---

# API Contracts

## Storyboard Endpoints

### GET `/api/storyboards`
List all storyboards.

```typescript
// Response 200 OK
{
  "storyboards": [
    {
      "id": "story_001",
      "title": "Ep 3 - The Warehouse",
      "episodeNumber": 3,
      "status": "DRAFT",
      "author": { "name": "Director" },
      "sequenceCount": 8,
      "frameCount": 45,
      "progress": 60,
      "updatedAt": "2026-07-21T10:30:00Z"
    }
  ]
}
```

### POST `/api/storyboards`
Create a new storyboard.

```typescript
// Request
{
  "title": "Ep 3 - The Warehouse",
  "productionId": "prod_001",
  "episodeNumber": 3,
  "authorId": "user_001"
}

// Response 201 Created
```

### GET `/api/storyboards/[id]`
Get storyboard with sequences.

```typescript
// Response 200 OK
{
  "id": "story_001",
  "title": "Ep 3 - The Warehouse",
  "status": "DRAFT",
  "sequences": [
    {
      "id": "seq_001",
      "title": "Scene 5A - Warehouse Fight",
      "sceneNumber": "5A",
      "estimatedDuration": 45,
      "frameCount": 5,
      "status": "APPROVED",
      "frames": [
        {
          "id": "frame_001",
          "frameNumber": 1,
          "shotType": "WIDE",
          "imageUrl": "https://...",
          "description": "Wide shot of warehouse exterior",
          "cameraMove": "Static",
          "duration": 5
        }
      ]
    }
  ]
}
```

### POST `/api/storyboards/[id]/sequences`
Add a new sequence.

```typescript
// Request
{
  "title": "Scene 5A - Warehouse Fight",
  "sceneNumber": "5A",
  "episodeNumber": 3
}

// Response 201 Created
```

### POST `/api/storyboards/[id]/frames`
Add a frame to a sequence.

```typescript
// Request
{
  "sequenceId": "seq_001",
  "frameNumber": 1,
  "shotType": "WIDE",
  "imageUrl": "https://...",
  "description": "Wide shot of warehouse exterior",
  "cameraMove": "Static",
  "duration": 5
}

// Response 201 Created
```

### PATCH `/api/storyboards/frames/[frameId]`
Update a frame.

```typescript
// Request
{
  "shotType": "MEDIUM",
  "description": "Updated description",
  "cameraMove": "Tracking Right",
  "duration": 8
}

// Response 200 OK
```

### POST `/api/storyboards/frames/[frameId]/drawing`
Save drawing data.

```typescript
// Request
{
  "drawingData": "..." // JSON canvas data
}

// Response 200 OK
```

### GET `/api/storyboards/[id]/export`
Export storyboard.

```typescript
// Request
GET /api/storyboards/[id]/export?format=pdf
GET /api/storyboards/[id]/export?format=images
GET /api/storyboards/[id]/export?format=video-preview

// Response: File download or ZIP
```

### POST `/api/storyboards/[id]/share`
Share storyboard.

```typescript
// Request
{
  "recipients": ["director@studio.com", "dp@studio.com"],
  "includeWatermark": true,
  "expirationDays": 30
}

// Response 200 OK
{
  "success": true,
  "shareLinks": [
    { "email": "director@studio.com", "sent": true }
  ]
}
```

---

# UI Components

## Storyboard Canvas

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STORYBOARD: Ep 3 - Scene 5A                              [Share] [PDF]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Sequence: Scene 5A - Warehouse Fight    [Add Frame] [Settings] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ TOOLBAR                                                          │   │
│  │ [Select] [Pan] [Draw] [Text] [Arrow] [Camera] [Character]     │   │
│  │ Shot Types: [WS] [MS] [CU] [OTS] [POV] [Insert]               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────┬────────────┐   │
│  │                                                     │            │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐        │ PROPERTIES │   │
│  │  │         │   │         │   │         │        │            │   │
│  │  │  Frame  │──▶│  Frame  │──▶│  Frame  │        │ Shot: WS   │   │
│  │  │    1    │   │    2    │   │    3    │        │ Camera: ALEX│   │
│  │  │         │   │         │   │         │        │ Lens: 50mm  │   │
│  │  │  [img]  │   │  [img]  │   │  [img]  │        │ Movement:   │   │
│  │  │         │   │         │   │         │        │  Tracking R │   │
│  │  └─────────┘   └─────────┘   └─────────┘        │ Duration:5s │   │
│  │                                                     │            │   │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─       │ Description │   │
│  │                                                     │ [text...]   │   │
│  │  ┌─────────┐   ┌─────────┐   ┌─────────┐        │            │   │
│  │  │         │   │         │   │         │        │            │   │
│  │  │  Frame  │──▶│  Frame  │──▶│  Frame  │        │            │   │
│  │  │    4    │   │    5    │   │    6    │        │            │   │
│  │  │         │   │         │   │         │        │            │   │
│  │  │  [img]  │   │  [img]  │   │  [img]  │        │            │   │
│  │  │         │   │         │   │         │        │            │   │
│  │  └─────────┘   └─────────┘   └─────────┘        │            │   │
│  │                                                     │            │   │
│  │  [+ Add Frame]                                      │            │   │
│  │                                                     │            │   │
│  └────────────────────────────────────────────────────┴────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  TIMELINE: [▶ Play Preview] [5s] [Frame 3 of 6] [Zoom: 100%]        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Frame Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FRAME 3 EDITOR                                                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │                      [Canvas / Upload Area]                      │   │
│  │                                                                   │   │
│  │                      ┌────────────────┐                            │   │
│  │                      │  Draw Area    │                            │   │
│  │                      │                │                            │   │
│  │                      │    [Draw]     │                            │   │
│  │                      │                │                            │   │
│  │                      └────────────────┘                            │   │
│  │                                                                   │   │
│  │  [Upload Image] [Use Reference] [Clear]                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  SHOT TYPE                                                              │
│  [WS] [MWS] [MS] [MCS] [CU] [ECU] [OTS] [POV] [Insert] [Other]      │
│                                                                          │
│  CAMERA SPECS                                                           │
│  Camera: [ARRI Alexa Mini LF ▾]  Lens: [50mm ▾]                       │
│                                                                          │
│  MOVEMENT                                                               │
│  [Static] [Pan L] [Pan R] [Tilt Up] [Tilt Down] [Dolly In] [Dolly Out]│
│  [Track L] [Track R] [Crane Up] [Crane Down] [Handheld] [Steadicam]   │
│                                                                          │
│  DESCRIPTION                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Sarah enters from right, stops at center.                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  AUDIO NOTES                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Tension music builds. Footsteps on concrete.                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Cancel]  [Apply]                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Frame Thumbnail Strip

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FRAME STRIP: Scene 5A - Warehouse Fight                              │
│                                                                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │ │  6  │ │  7  │ │  8  │   │
│  │ WS  │ │ MS  │ │ CU  │ │ WS  │ │ OTS │ │ CU  │ │ MCU │ │ WS  │   │
│  │  5s │ │  3s │ │  2s │ │  4s │ │  3s │ │  2s │ │  3s │ │  5s │   │
│  │     │ │     │ │ ★   │ │     │ │     │ │     │ │     │ │     │   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  TOTAL: 8 frames │ ESTIMATED: 27s │ STATUS: 6/8 approved             │
│                                                                          │
│  LEGEND: ★ Selected │ ✓ Approved │ ⏳ Pending                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] StoryboardProject model
- [ ] StoryboardSequence model
- [ ] StoryboardFrame model
- [ ] FrameAnnotation model
- [ ] CameraMovement model
- [ ] GET /api/storyboards endpoint
- [ ] POST /api/storyboards endpoint
- [ ] GET /api/storyboards/[id] endpoint
- [ ] POST /api/storyboards/[id]/sequences endpoint
- [ ] POST /api/storyboards/[id]/frames endpoint
- [ ] PATCH /api/storyboards/frames/[frameId] endpoint
- [ ] POST /api/storyboards/frames/[frameId]/drawing endpoint
- [ ] GET /api/storyboards/[id]/export endpoint
- [ ] POST /api/storyboards/[id]/share endpoint
- [ ] Storyboard Canvas UI (drag-and-drop)
- [ ] Frame Editor with drawing tools
- [ ] Frame Thumbnail Strip
- [ ] Shot Type Selector
- [ ] Camera Movement Annotations
- [ ] Character/Movement Markers
- [ ] Image Upload (drag & drop)
- [ ] Reference Image Lookup
- [ ] Export to PDF (printable storyboard)
- [ ] Export to Images (ZIP)
- [ ] Video Preview Generation
- [ ] Sharing with Watermark
- [ ] Collaboration (real-time)
- [ ] Link to Script Scenes
- [ ] Link to Shot Lists

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
