# Project OS - Zenvas v2

## Overview

Project OS manages projects within a Brand. Projects are flexible - they can be client-facing or internal.

## Core Concepts

### Brand = Universal Workspace

A **Brand** is the primary entity in Zenvas. It's designed to be universal:

- **For Studios/Agencies**: Serve clients with formal order flow
- **For Freelancers**: Internal projects without clients
- **For Everyone**: Project = organized work with tasks

### Projects

A **Project** is a container for stages and tasks. It's created from:
- An **Order** (client project with intake form)
- Directly (internal project without client)

```
Project
├── Stage 1 (Planning)
│   └── Task A
│   └── Task B
├── Stage 2 (Execution)
│   └── Task C
└── Stage 3 (Delivery)
    └── Task D
```

## Project Creation

### Client Project (via Order)
```
Lead → Qualified → Order Created → Project Auto-Created
```

When an order is confirmed:
1. System creates a Project
2. Explodes Service.stageTemplate into Stages & Tasks
3. Tasks assigned based on template

### Internal Project
```
Dashboard → Projects → [New Project]
```

Internal projects don't require:
- Client
- Order
- Intake form

## Task Structure

### Task Hierarchy
- **Root Task**: Top-level work item
- **Subtask**: Child of root (max 4 levels deep)

### Task Properties
```typescript
{
  name: string,
  status: OPEN | IN_PROGRESS | COMPLETE,
  category: PRE_PRODUCTION | PRODUCTION | POST_PRODUCTION,
  assigneeUserId: string | null,
  expectedDurationMinutes: number,
  payoutAmount: number | null,
  clientVisible: boolean, // Show to client?
}
```

### Client Visibility
- `clientVisible: true` → Shown on Client Portal
- `clientVisible: false` → Internal only (QC, management)

## Stage Workflow

### Default Stages
```
Planning → Execution → Delivery → Done
```

### Stage Completion
- Stage completes when all tasks complete
- Completion triggers:
  - Notification to relevant users
  - Activity log entry
  - (For client stages) Update on Client Portal

## Key Principles

1. **Universal Design**: Project works with or without client
2. **Template-Based**: Services define stage templates
3. **Task Assignment**: Tasks assigned to team members
4. **Visibility Control**: Fine-grained client visibility
5. **Progress Tracking**: Real-time stage/task status

## Future Enhancements

- [ ] Project templates (save as template)
- [ ] Duplicate project
- [ ] Project milestones
- [ ] Time tracking per task
- [ ] Gantt chart view
