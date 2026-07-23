# APP_REGISTRY.md - Zenvas Apps Registry

**Status:** Draft
**Date:** 2026-07-23

---

## Overview

Zenvas uses an **Odoo-style app architecture** where:
- **Paket** = Bundle of related apps (Project OS, Human Capital OS, Business OS)
- **Apps** = Individual tools within a paket
- Each app is a **standalone product** with deep functionality
- Apps share data through **Shared Data Models**

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: ZENVAS CORE (Lean & Clean)                           │
│  - Auth, Organization, Brand, Projects/Stages/Tasks             │
│  - Does NOT know about Scriptwriter, Storyboard, etc.          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
         ┌─────────────────────────────────────────────┐
         │  LAYER 2: SHARED DATA MODELS (Cross-App)   │
         │  - Scenes, Characters, Locations            │
         │  - Projects, Tasks, Deliverables            │
         │  - Shots, Takes, Setups                   │
         └─────────────────────────────────────────────┘
                              ↕
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  SCRIPTWRITER  │  │   STORYBOARD   │  │   CADRAGE     │
│                │  │                │  │               │
│  As complex as │←→│  Knows scenes  │←→│  Shot comp.   │
│  Celtx/Final   │  │  from script  │  │               │
│  Draft         │  │               │  │               │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## App Development Principles

1. **Each App is a Full Product**
   - Scriptwriter = as complex as Final Draft / Celtx
   - Not a "feature", but a complete tool

2. **Apps are Independent**
   - Can be developed, updated, removed separately
   - Each has its own UI, state, logic

3. **Smart Integration**
   - Storyboard auto-detects scenes from Scriptwriter
   - Cadrage pulls characters from script
   - Shotlist connects to Scene breakdown

4. **Core Stays Clean**
   - Core doesn't know about app internals
   - Apps hook into shared data layer

---

## Project OS Apps

### Pre-Production Apps (Current Focus)

#### 📝 Scriptwriter

**Purpose:** Professional screenplay writing tool

**Features:**
- Scene/Act breakdown
- Character management
- Dialogue editor
- Export to PDF/Fountain
- Collaboration support

**Complexity:** Celtx/Final Draft level

**Integration Points:**
- Outputs: Scenes, Characters, Locations
- Inputs: None (starts fresh or from idea)

```typescript
// Shared models used
interface ScriptProject {
  id: string;
  projectId: string;  // Links to Zenvas Project
  scenes: Scene[];
  characters: Character[];
  locations: Location[];
}
```

---

#### 🎨 Storyboard

**Purpose:** Visual planning with scene detection

**Features:**
- Canvas drawing per scene
- Panel management
- Camera angle notation
- Animation timing
- PDF export

**Complexity:** Dedicated storyboard software level

**Integration Points:**
- Inputs: Scenes from Scriptwriter
- Outputs: Storyboard panels linked to scenes

```typescript
interface StoryboardPanel {
  id: string;
  sceneId: string;  // Links to Scriptwriter scene
  sequence: number;
  imageUrl: string;
  cameraAngle: string;
  duration: number;  // Estimated seconds
}
```

---

#### 🟨 Canvas

**Purpose:** Milanote-like freeform board

**Features:**
- Freeform card placement
- Image/text/link cards
- Grouping & sections
- Multiple canvases per project

**Integration Points:**
- Standalone tool, can reference any content

---

#### 🎬 Cadrage

**Purpose:** Shot composition tool

**Features:**
- Frame templates (aspect ratios)
- Shot type library
- Character positioning
- Lens simulation
- Export as image

**Integration Points:**
- Inputs: Characters from Scriptwriter
- Outputs: Shot compositions

---

#### 📋 Shotlist

**Purpose:** Production breakdown

**Features:**
- Scene-by-scene breakdown
- Setup details
- Equipment notes
- Location requirements
- Cast requirements
- Day/night indicators

**Integration Points:**
- Inputs: Scenes from Scriptwriter
- Outputs: Shots linked to scenes

---

### Production Apps (Later Phase)

#### 📅 Call Sheets

**Purpose:** Daily schedule distribution

**Features:**
- Auto-generate from shotlist
- Cast/crew call times
- Weather info
- Location map
- PDF generation
- Distribution to team

#### 📹 Shot Logger

**Purpose:** On-set scene/take logging

**Features:**
- Quick take logging
- Good/bad/repeat marks
- Notes per take
- Sync to Dailies later

---

### Post-Production Apps (Later Phase)

#### 📊 Timeline Notes

**Purpose:** Editorial notes management

**Features:**
- Timecode-based notes
- Department filtering
- Status tracking
- Export to Avid/Pr

#### 🎨 VFX Tracker

**Purpose:** Visual effects tracking

**Features:**
- VFX shot list
- Shot status
- Vendor management
- Budget tracking

---

### Delivery Apps (Later Phase)

#### 🔗 Review Links

**Purpose:** Client video review

**Features:**
- Generate shareable links
- Timestamp comments
- Approval workflow
- Version tracking

#### 📦 Deliverables

**Purpose:** Format specs & tracking

**Features:**
- Format templates (Netflix, YouTube, etc.)
- Spec checklist
- Delivery tracking

#### 📮 Festival Tracker

**Purpose:** Film festival submission

**Features:**
- Festival database
- Deadline tracking
- Submission status
- Fee tracking

---

## Human Capital OS Apps

#### 👥 Team

**Purpose:** Team management (already built)

**Apps within:**
- User management
- Role assignment
- Brand permissions

#### ⏰ Attendance

**Purpose:** Clock in/out

**Features:**
- GPS tracking
- Break management
- Overtime calculation

#### 💰 Payroll

**Purpose:** Salary calculation

**Features:**
- Rate management
- Timesheet integration
- Bank transfer export

#### 📊 Appraisals

**Purpose:** Performance review

**Features:**
- Review templates
- Rating system
- Feedback history

---

## Business OS Apps

#### 🏢 Client Portal

**Purpose:** Client-facing interface

**Features:**
- Project visibility
- File sharing
- Communication

#### 📄 Invoicing

**Purpose:** Create & send invoices

**Features:**
- Invoice templates
- Payment tracking
- Odoo sync

#### 📈 Lead Management

**Purpose:** Sales pipeline

**Features:**
- Pipeline stages
- Deal tracking
- Quote generation

---

## Implementation Checklist

### Phase 1: Pre-Production Apps

- [ ] Scriptwriter - Full spec & data model
- [ ] Storyboard - Full spec & data model
- [ ] Canvas - Full spec & data model
- [ ] Cadrage - Full spec & data model
- [ ] Shotlist - Full spec & data model

### Phase 2: Production Apps

- [ ] Call Sheets
- [ ] Shot Logger

### Phase 3: Post & Delivery

- [ ] Timeline Notes
- [ ] VFX Tracker
- [ ] Review Links
- [ ] Deliverables
- [ ] Festival Tracker

---

## Document History

- v0.1 (2026-07-23): Initial draft with app registry
