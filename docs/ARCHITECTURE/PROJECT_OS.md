# Project OS - Zenvas v2

## Overview

**Per Zenvas Philosophy**: Projects are the heart of the system. No client or order required to start.

Project OS manages creative work — from a simple vlog edit to a feature film production.

## Core Principle

> **Projects are for creators first. Orders/Clients are optional layers added when you grow.**

## Project Structure

```
Project
├── Brand (always required - your identity)
├── Name & Description (display info)
├── Poster (visual thumbnail)
├── Stages (phases)
│   └── Tasks (work items)
└── (Optional) Order (when client work begins)
```

## No-Order Project Flow

```
Create Brand → Create Project → Add Tasks → Work
```

This is the **core Zenvas flow** for solo creators and internal projects.

## With Order Flow (When You Grow)

```
Project → Link to Order → Track Client Work
```

Orders become relevant when external clients are involved.

## DaVinci Resolve Style UI

Projects page uses media-style layout:

```
┌─────────────────────────────────────────────────────────────────┐
│  Projects                              [+ New Project] [Filter ▼] │
├─────────────────────────────────────────────────────────────────┤
│  [All] [Active] [Completed] [On Hold]                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ [Poster] │  │ [Poster] │  │ [Poster] │  │ [Poster] │     │
│  │          │  │          │  │          │  │          │     │
│  │ Beach    │  │ Product  │  │ Wedding  │  │ Corporate│     │
│  │ Trip     │  │ Launch   │  │ Film     │  │ Video   │     │
│  │ ████░░ 60%│  │ ████████ 100%│  │ ██░░░ 20%│  │ ░░░░░░ 0%│  │
│  │    ⋮     │  │    ⋮     │  │    ⋮     │  │    ⋮     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 3-Dot Menu:
- View Description
- Change Poster
- Project Settings
- Delete Project

### View Modes:
1. **Grid** - Poster thumbnails (default)
2. **List** - Compact rows

## Project Lifecycle

```
New → Active → On Hold → Completed
          ↓
        (Link to Order when client work)
```

## Scale Examples

| Project Type | Complexity | Stages | Tasks |
|-------------|-----------|--------|-------|
| Vlog Edit | Simple | 3 | 5-10 |
| YouTube Series | Medium | 4-6 | 15-30 |
| Client Commercial | Medium | 5-8 | 20-50 |
| Feature Film | Complex | 10+ | 100+ |

## Roles & Project Access

| Action | Owner | Manager | Producer | Editor |
|--------|-------|---------|----------|--------|
| Create Project | ✅ | ✅ | ✅ | ❌ |
| View Project | ✅ | ✅ | ✅ | Own only |
| Edit Project | ✅ | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ |
| Change Poster | ✅ | ✅ | ✅ | ❌ |

## Project Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String | Yes | Project display name |
| description | Text | No | Project details |
| posterUrl | URL | No | Thumbnail image |
| posterAspect | Enum | Yes | 16:9, 4:3, 1:1 |
| orderId | UUID | No | Linked Order (optional) |

## Project Stages (4-Stage Architecture)

Inspired by DaVinci Resolve's page-based workflow, each Project has 4 main stages:

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Tabs (DaVinci Resolve Style)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Overview] [Pre-Production] [Production] [Delivery]            │
│     ↑                                                             │
│  Tab navigation per production stage - like DaVinci Resolve      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Stage Overview

| Stage | Description | Typical Duration | Apps Available |
|-------|-------------|-----------------|---------------|
| **Overview** | Project dashboard & summary | Always | Dashboard, Stats, Activity |
| **Pre-Production** | Planning & creative prep | Weeks-Months | Scriptwriter, Storyboard, Canvas, Cadrage, Shotlist |
| **Production** | Shooting & on-set | Days-Weeks | Call Sheets, Shot Logger, Daily Reports |
| **Delivery** | Client review & final | Days | Review Links, Deliverables, Invoicing |

### Pre-Production Apps (Focus for Jacob)

```
PRE-PRODUCTION APPS:
├── 📝 Scriptwriter   - Screenplay writing (Celtx-level complexity)
├── 🎨 Storyboard     - Visual planning, auto-detects scenes from script
├── 🟨 Canvas        - Milanote-like freeform board
├── 🎬 Cadrage       - Shot composition tool
└── 📋 Shotlist      - Production breakdown
```

### Production Apps (Later)

```
PRODUCTION APPS:
├── 📅 Call Sheets    - Daily schedule distribution
├── 📹 Shot Logger    - Scene/take logging on set
└── 📊 Daily Reports  - Progress tracking
```

### Delivery Apps (Later)

```
DELIVERY APPS:
├── 🔗 Review Links   - Client video review
├── 📦 Deliverables  - Format specs & tracking
└── 📮 Festival      - Submission tracker
```

### Stage Template Defaults

**Simple Project:**
```
To Do → In Progress → Done
```

**Client Project:**
```
Pre-Production → Production → Post-Production → Delivery
```

**Film Production:**
```
Development → Pre-Production → Production → Post-Production → Marketing → Delivery
```

## Task Management

Tasks are the smallest work unit:

```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETE";
  assigneeUserId?: string;
  expectedDurationMinutes: number;
  payoutAmount?: number; // Confidential
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List projects |
| `/api/projects` | POST | Create project |
| `/api/projects/[id]` | GET | Get detail |
| `/api/projects/[id]` | PATCH | Update |
| `/api/projects/[id]` | DELETE | Delete |

## Future Enhancements

- [ ] Drag-drop task reordering
- [ ] Gantt chart timeline
- [ ] Time tracking
- [ ] File attachments
- [ ] Version history
- [ ] Template library
- [ ] Project templates
