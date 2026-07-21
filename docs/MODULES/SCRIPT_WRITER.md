# SCRIPT_WRITER.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

The Script Writer module provides industry-standard screenplay formatting and management. It enables writers to create, edit, and share scripts with proper formatting, scene breakdowns, and version control.

---

# The Problem It Solves

```
WITHOUT SCRIPT WRITER:
- Writers use Final Draft ($250/year) with no collaboration
- Script changes = email attachments flying around
- "Which version did the director review?"
- Scene breakdowns need to be manually copied to spreadsheets
- No link between script and production planning

WITH SCRIPT WRITER:
- Cloud-based collaborative screenwriting
- Version history at a glance
- Automatic scene breakdowns
- Link to tasks, shot lists, scheduling
- Industry-standard Fountain format
```

---

# Screenplay Format (Fountain)

```
Fountain is the industry-standard plain-text screenwriting format.
Zenvas Script Writer uses Fountain internally for easy export/import.

┌─────────────────────────────────────────────────────────────────────────┐
│  FOUNTAIN FORMAT EXAMPLES                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TITLE: THE BIG LEAP                                                    │
│  Credit: Written by                                                    │
│  Author: Jane Screenwriter                                              │
│  Draft date: 2026-07-21                                               │
│                                                                          │
│  ==                                                                     │
│                                                                          │
│  INT. COFFEE SHOP - DAY                                                │
│                                                                          │
│  SARAH (V.O.)                                                          │
│  I never expected it to end like this.                                  │
│                                                                          │
│  We see SARAH, 30s, determined, sitting alone at a corner table.       │
│  Her coffee sits untouched.                                             │
│                                                                          │
│  EXT. CITY STREET - CONTINUOUS                                          │
│                                                                          │
│  MIKE rushes through the rain, phone pressed to his ear.               │
│                                                                          │
│  MIKE                                                                  │
│  (into phone)                                                          │
│  I know, I know. Just give me five more minutes!                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Script Project (one per episode or feature)
model ScriptProject {
  id              String   @id @default(cuid())
  
  // References
  productionId    String
  production      Production @relation(fields: [productionId], references: [id])
  
  // Info
  title          String   // e.g., "The Big Leap"
  episodeNumber  Int?     // For episodic
  
  // Content
  content        String   // Fountain format content
  
  // Version
  versionNumber   Int      @default(1)
  versionLabel    String   @default("Draft") // "Draft", "Production Draft", etc.
  
  // Status
  status         ScriptStatus @default(WRITING)
  
  // Author
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  
  // Review
  reviewStatus   ReviewStatus @default(DRAFT)
  reviewedBy    String?
  reviewedAt    DateTime?
  
  // Settings
  settings        Json     @default("{}")
  // {
  //   "font": "Courier Prime",
  //   "fontSize": 12,
  //   "lineSpacing": 1.5,
  //   "pageWidth": "us-letter"
  // }
  
  // Metadata
  estimatedPages Float    @default(0)
  wordCount      Int      @default(0)
  
  // Scenes
  scenes         ScriptScene[]
  
  // Characters
  characters     ScriptCharacter[]
  
  // Versions
  versions       ScriptVersion[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ScriptStatus {
  WRITING        // Active writing
  REVIEW         // Under review
  LOCKED         // Locked, no more changes
  ARCHIVED       // Archived
}

enum ReviewStatus {
  DRAFT
  ROUGH_CUT
  POLISHED
  APPROVED
  PRODUCTION     // Production draft
}

// Scene in script
model ScriptScene {
  id              String   @id @default(cuid())
  
  scriptProjectId String
  scriptProject   ScriptProject @relation(fields: [scriptProjectId], references: [id])
  
  // Scene number
  sceneNumber    String   // e.g., "1A", "5B"
  
  // Scene info
  heading        String   // e.g., "INT. COFFEE SHOP - DAY"
  intExt         String   // "INT" or "EXT"
  location       String   // e.g., "Coffee Shop"
  timeOfDay      String   // e.g., "DAY", "NIGHT"
  
  // Content
  content        String   // Scene content in Fountain format
  
  // Analysis
  summary        String?  // AI-generated scene summary
  pageCount      Float    @default(0)
  wordCount      Int      @default(0)
  
  // Links to production
  linkedTasks    String[]  // Task IDs
  linkedShots    String[]  // Shot IDs
  
  // Status
  status         SceneStatus @default(DRAFT)
  
  // Order
  order          Int
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SceneStatus {
  DRAFT
  REVISED
  LOCKED
  SHOOTED
}

// Character
model ScriptCharacter {
  id              String   @id @default(cuid())
  
  scriptProjectId String
  scriptProject   ScriptProject @relation(fields: [scriptProjectId], references: [id])
  
  // Character info
  name            String   // e.g., "SARAH"
  description     String?  // Character description
  actorType       String?  // "LEAD", "SUPPORTING", "DAY_PLAYER", "BACKGROUND"
  
  // Stats
  sceneCount     Int      @default(0)  // How many scenes
  lineCount      Int      @default(0)  // How many lines of dialogue
  estimatedPages Float    @default(0)
  
  // First/last appearance
  firstScene     String?  // Scene number
  lastScene      String?  // Scene number
  
  // Notes
  notes          String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Script Version
model ScriptVersion {
  id              String   @id @default(cuid())
  
  scriptProjectId String
  scriptProject   ScriptProject @relation(fields: [scriptProjectId], references: [id])
  
  // Version info
  versionNumber   Int
  versionLabel    String   // e.g., "Draft 1", "Production Draft"
  
  // Content snapshot
  content         String   // Full content at this version
  
  // Who changed
  changedBy      String
  changeNote     String?  // e.g., "Added Scene 5B", "Revised ending"
  
  // Diff from previous
  diffFromPrevious String? // JSON diff
  
  // Timestamps
  createdAt       DateTime @default(now())
}

// Script Comment
model ScriptComment {
  id              String   @id @default(cuid())
  
  scriptProjectId String
  scriptProject   ScriptProject @relation(fields: [scriptProjectId], references: [id])
  
  // Position
  sceneNumber    String?
  paragraphIndex Int?     // Which paragraph in scene
  lineNumber     Int?     // Line number
  
  // Content
  content        String
  
  // Author
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  
  // Status
  resolved       Boolean  @default(false)
  resolvedBy    String?
  resolvedAt    DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
}

// Script Review Session
model ScriptReviewSession {
  id              String   @id @default(cuid())
  
  scriptProjectId String
  scriptProject   ScriptProject @relation(fields: [scriptProjectId], references: [id])
  
  // Session info
  title          String   // e.g., "Writer's Room - Table Read"
  date           DateTime
  
  // Attendees
  attendees      String[]  // User IDs
  
  // Notes from session
  notes          String   @default("[]")
  // [{ "scene": "5A", "note": "Cut this line", "author": "Director" }]
  
  // Outcomes
  changesRequired String?  // Summary of changes needed
  
  // Timestamps
  createdAt       DateTime @default(now())
}

// Series Bible Entry
model SeriesBibleEntry {
  id              String   @id @default(cuid())
  
  productionId    String
  production      Production @relation(fields: [productionId], references: [id])
  
  // Entry info
  category        String   // "CHARACTER", "LOCATION", "WORLD", "RULE", "TIMELINE"
  
  title          String   // e.g., "Sarah Character Profile"
  
  content        String   // Markdown content
  
  // Tags
  tags           String[]
  
  // Related scripts
  relatedScripts  String[]  // ScriptProject IDs
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

# API Contracts

## Script Writer Endpoints

### GET `/api/scripts`
List all scripts.

```typescript
// Response 200 OK
{
  "scripts": [
    {
      "id": "script_001",
      "title": "The Big Leap",
      "episodeNumber": 3,
      "versionNumber": 4,
      "versionLabel": "Draft 4",
      "status": "WRITING",
      "author": { "name": "Jane Screenwriter" },
      "estimatedPages": 52,
      "sceneCount": 45,
      "characterCount": 12,
      "updatedAt": "2026-07-21T10:30:00Z"
    }
  ]
}
```

### POST `/api/scripts`
Create a new script.

```typescript
// Request
{
  "title": "The Big Leap",
  "productionId": "prod_001",
  "episodeNumber": 3,
  "authorId": "user_001"
}

// Response 201 Created
```

### GET `/api/scripts/[id]`
Get script with content.

```typescript
// Response 200 OK
{
  "id": "script_001",
  "title": "The Big Leap",
  "episodeNumber": 3,
  "versionNumber": 4,
  "versionLabel": "Draft 4",
  "content": "TITLE: The Big Leap\n...\nINT. COFFEE SHOP - DAY\n\nSARAH...",
  "status": "WRITING",
  "estimatedPages": 52,
  "wordCount": 12500,
  "scenes": [
    {
      "id": "scene_001",
      "sceneNumber": "1A",
      "heading": "INT. COFFEE SHOP - DAY",
      "intExt": "INT",
      "location": "Coffee Shop",
      "timeOfDay": "DAY",
      "pageCount": 1.5,
      "summary": "Sarah sits alone, contemplating her decision..."
    }
  ],
  "characters": [
    {
      "name": "SARAH",
      "actorType": "LEAD",
      "sceneCount": 30,
      "lineCount": 150
    }
  ]
}
```

### PATCH `/api/scripts/[id]`
Update script content.

```typescript
// Request
{
  "content": "TITLE: The Big Leap\n\nINT. COFFEE SHOP - DAY\n\n...",
  "versionLabel": "Draft 4",
  "changeNote": "Revised Scene 5A dialogue"
}

// Response 200 OK
```

### GET `/api/scripts/[id]/scenes`
Get scenes breakdown.

```typescript
// Response 200 OK
{
  "scriptId": "script_001",
  "scenes": [
    {
      "id": "scene_001",
      "sceneNumber": "1A",
      "heading": "INT. COFFEE SHOP - DAY",
      "intExt": "INT",
      "location": "Coffee Shop",
      "timeOfDay": "DAY",
      "pageCount": 1.5,
      "wordCount": 450,
      "characters": ["SARAH"],
      "summary": "Sarah sits alone...",
      "status": "DRAFT"
    }
  ],
  "summary": {
    "totalScenes": 45,
    "interiorScenes": 30,
    "exteriorScenes": 15,
    "dayScenes": 35,
    "nightScenes": 10,
    "totalPages": 52
  }
}
```

### GET `/api/scripts/[id]/characters`
Get character breakdown.

```typescript
// Response 200 OK
{
  "scriptId": "script_001",
  "characters": [
    {
      "name": "SARAH",
      "description": "30s, determined, former corporate lawyer turned activist",
      "actorType": "LEAD",
      "sceneCount": 30,
      "lineCount": 150,
      "pageCount": 15,
      "firstScene": "1A",
      "lastScene": "45B"
    }
  ],
  "summary": {
    "totalCharacters": 12,
    "leads": 2,
    "supporting": 5,
    "dayPlayers": 5
  }
}
```

### GET `/api/scripts/[id]/versions`
Get version history.

```typescript
// Response 200 OK
{
  "versions": [
    {
      "versionNumber": 4,
      "versionLabel": "Draft 4",
      "changedBy": "Jane Screenwriter",
      "changeNote": "Revised Scene 5A dialogue",
      "createdAt": "2026-07-21T10:30:00Z"
    },
    {
      "versionNumber": 3,
      "versionLabel": "Draft 3",
      "changedBy": "Jane Screenwriter",
      "changeNote": "Added Scene 8A",
      "createdAt": "2026-07-20T15:00:00Z"
    }
  ]
}
```

### GET `/api/scripts/[id]/export`
Export script in various formats.

```typescript
// Request
GET /api/scripts/[id]/export?format=pdf
GET /api/scripts/[id]/export?format=fountain
GET /api/scripts/[id]/export?format=pdf-proof

// Response: File download
```

### POST `/api/scripts/[id]/lock`
Lock script for production.

```typescript
// Request
{
  "versionLabel": "Production Draft",
  "notifyTeam": true
}

// Response 200 OK
```

### GET `/api/scripts/[id]/scene-breakdown`
Get scene breakdown for production.

```typescript
// Response 200 OK
{
  "scriptId": "script_001",
  "title": "The Big Leap - Episode 3",
  "breakdown": [
    {
      "sceneNumber": "1A",
      "heading": "INT. COFFEE SHOP - DAY",
      "location": "Coffee Shop",
      "intExt": "INT",
      "timeOfDay": "DAY",
      "pageCount": 1.5,
      "characters": [
        { "name": "SARAH", "type": "LEAD", "lines": 8 },
        { "name": "BARISTA", "type": "DAY_PLAYER", "lines": 2 }
      ],
      "props": ["Coffee cup", "Newspaper"],
      "stunts": [],
      "special": []
    }
  ]
}
```

### GET `/api/series-bible`
Get series bible entries.

```typescript
// Response 200 OK
{
  "entries": [
    {
      "id": "entry_001",
      "category": "CHARACTER",
      "title": "Sarah Character Profile",
      "tags": ["main-character", "act-1"],
      "updatedAt": "2026-07-15"
    }
  ]
}
```

---

# UI Components

## Script Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCRIPT WRITER - Ep 3: The Big Leap                    [Draft 4]  [⋮] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ [B] [I] [Title] [Action] [Character] [Dialogue] [Parenthetical] │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────┬────────────┐   │
│  │                                                     │            │   │
│  │  TITLE: THE BIG LEAP                                │  SCENES    │   │
│  │  Credit: Written by                                 │            │   │
│  │  Author: Jane Screenwriter                         │  ┌──────┐  │   │
│  │  Draft date: 2026-07-21                            │  │ 1A   │  │   │
│  │                                                     │  │ 1B   │  │   │
│  │  ==                                                 │  │ 2A   │  │   │
│  │                                                     │  │ 2B   │  │   │
│  │  INT. COFFEE SHOP - DAY                            │  │ 3A   │  │   │
│  │                                                     │  │ ...  │  │   │
│  │  We see SARAH, 30s, sitting alone at a corner      │  └──────┘  │   │
│  │  table. Her coffee sits untouched.                 │            │   │
│  │                                                     │  CHARACTERS│   │
│  │  SARAH (V.O.)                                      │            │   │
│  │  I never expected it to end like this.             │  SARAH ★   │   │
│  │                                                     │  MIKE      │   │
│  │  We hear her voice, not her thoughts.               │  BARISTA   │   │
│  │                                                     │            │   │
│  │  SARAH                                             │            │   │
│  │  (sighing)                                        │            │   │
│  │  Another day, another impossible choice.            │            │   │
│  │                                                     │            │   │
│  │  The BARISTA approaches with a warm smile.         │            │   │
│  │                                                     │            │   │
│  │  BARISTA                                          │            │   │
│  │  Refill?                                          │            │   │
│  │                                                     │            │   │
│  └────────────────────────────────────────────────────┴────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  Page 1 of 52  │  Scene 1A │  Words: 125 │  [Save] [Lock] [Export]  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scene List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCENE BREAKDOWN - Ep 3                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Filter: [All ▾] [INT/EXT ▾] [Location ▾] [Character ▾]             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ #  │ HEADING              │ PAGES │ CHARS   │ LOCATIONS  │ NOTES │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ 1A │ INT. COFFEE SHOP    │  1.5  │ SARAH   │ Coffee Shop│ 2     │   │
│  │ 1B │ EXT. STREET         │  0.75 │ SARAH   │ Street     │       │   │
│  │ 2A │ INT. OFFICE         │  2.0  │ SARAH,MIKE│ Office   │ 5     │   │
│  │ 2B │ INT. OFFICE CONT'D  │  1.5  │ SARAH,MIKE│ Office   │       │   │
│  │ 3A │ INT. COURTROOM      │  3.0  │ SARAH,MIKE│ Courtroom │ 12    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  SUMMARY                                                                 │
│  Total Scenes: 45  │  Total Pages: 52  │  Total Words: 12,500         │
│  INT: 30 (67%)    │  EXT: 15 (33%)   │  Characters: 12              │
│                                                                          │
│  [Export to PDF]  [Export to CSV]  [Send to Production]                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Version Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│  VERSION COMPARISON                                                     │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │  Draft 3           │  │  Draft 4 (Current)  │                      │
│  │  Jul 20, 3:00 PM   │  │  Jul 21, 10:30 AM  │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  - Old line                                                       │   │
│  │  + New line (highlighted green)                                   │   │
│  │    Unchanged line                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  CHANGES IN THIS VERSION:                                               │
│  • Scene 5A: Revised Sarah's dialogue (3 changes)                       │
│  • Scene 5B: Added new beat before the climax                          │
│  • Scene 6A: Cut Mike's monologue (reduced by 30%)                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] ScriptProject model
- [ ] ScriptScene model
- [ ] ScriptCharacter model
- [ ] ScriptVersion model
- [ ] ScriptComment model
- [ ] ScriptReviewSession model
- [ ] SeriesBibleEntry model
- [ ] GET /api/scripts endpoint
- [ ] POST /api/scripts endpoint
- [ ] GET /api/scripts/[id] endpoint
- [ ] PATCH /api/scripts/[id] endpoint
- [ ] GET /api/scripts/[id]/scenes endpoint
- [ ] GET /api/scripts/[id]/characters endpoint
- [ ] GET /api/scripts/[id]/versions endpoint
- [ ] GET /api/scripts/[id]/export endpoint
- [ ] POST /api/scripts/[id]/lock endpoint
- [ ] GET /api/scripts/[id]/scene-breakdown endpoint
- [ ] GET /api/series-bible endpoint
- [ ] Script Editor UI (text editor with formatting)
- [ ] Scene List View
- [ ] Character List View
- [ ] Version History View
- [ ] Version Comparison View
- [ ] Export to PDF (Fountain → PDF)
- [ ] Export to Fountain format
- [ ] Scene Breakdown Export
- [ ] Collaborative editing (CRDT)
- [ ] Comment/annotation system
- [ ] Series Bible UI
- [ ] AI scene analysis (summary generation)

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
