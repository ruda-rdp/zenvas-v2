# Project OS - Zenvas v2

## Overview

Project OS manages the execution of creative work after an Order is confirmed. It's the operational layer that handles tasks, timelines, and delivery.

## Project Structure

```
Project
├── Stages (e.g., Pre-Production, Production, Post-Production)
│   └── Tasks (e.g., Download files, Edit video, Export)
└── Deliverables
```

## DaVinci Resolve Style UI

Projects page uses a media-style layout inspired by DaVinci Resolve:

```
┌─────────────────────────────────────────────────────────────────┐
│  Projects                              [+ New Project] [Filter ▼] │
├─────────────────────────────────────────────────────────────────┤
│  [All] [In Progress] [Completed] [On Hold]                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ [Poster] │  │ [Poster] │  │ [Poster] │  │ [Poster] │     │
│  │          │  │          │  │          │  │          │     │
│  │ Project A│  │ Project B│  │ Project C│  │ Project D│     │
│  │ Client   │  │ Client   │  │ Client   │  │ Client   │     │
│  │ ████░░ 60%│  │ ████████ 100%│  │ ██░░░░ 20%│  │ ░░░░░░ 0%│     │
│  │    ⋮     │  │    ⋮     │  │    ⋮     │  │    ⋮     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 3-Dot Menu Options:
- **View Description** - Shows full project details
- **Change Poster** - Update poster image and aspect ratio
- **Project Settings** - Configure project options
- **Delete Project** - Remove project (with confirmation)

### Poster Settings:
- **URL Input** - Link to poster image
- **Aspect Ratios**: 16:9, 4:3, 1:1

### View Modes:
1. **Grid View** - Poster-style thumbnails
2. **List View** - Compact rows with thumbnails

## Project Lifecycle

```
Order Confirmed → Project Created → In Progress → Completed/Delivered
                                      ↓
                                   On Hold
```

## Roles & Permissions

| Action | Owner | Manager | Producer | Editor |
|--------|-------|---------|----------|--------|
| Create Project | ✅ | ✅ | ❌ | ❌ |
| View Project | ✅ | ✅ | ✅ | Own only |
| Edit Project | ✅ | ✅ | ❌ | ❌ |
| Manage Tasks | ✅ | ✅ | ✅ | Own only |
| Change Poster | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ | ❌ |

## Project Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | String | Project display name |
| description | Text | Project details |
| posterUrl | URL | Thumbnail image |
| posterAspect | Enum | 16:9, 4:3, 1:1 |
| status | Enum | ACTIVE, ON_HOLD, COMPLETED |
| brandId | UUID | Associated brand |
| orderId | UUID | Source order |

## Stage Types

Projects use service-defined templates:

### Standard Service Template:
```
Planning → Execution → Delivery → Review
```

### Custom Templates:
Services can define custom stage templates with specific tasks.

## Task Management

Tasks are the smallest unit of work:

```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE";
  assigneeUserId?: string;
  expectedDurationMinutes: number;
  visibility: "PUBLIC" | "INTERNAL";
  payoutAmount?: number; // Confidential to non-Editors
}
```

### Editor Restrictions:
- Editors can only see/view assigned tasks
- Editors cannot see payoutAmount
- Editors can only update their own tasks' status

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects` | POST | Create project |
| `/api/projects/[id]` | GET | Get project detail |
| `/api/projects/[id]` | PATCH | Update project |
| `/api/projects/[id]` | DELETE | Delete project |
| `/api/tasks/[id]` | GET | Get task detail |
| `/api/tasks/[id]` | PATCH | Update task |

## Future Enhancements

- [ ] Drag-drop task reordering
- [ ] Gantt chart timeline view
- [ ] Time tracking per task
- [ ] File attachments
- [ ] Comments/annotations
- [ ] Version history
- [ ] Template library
