# Premium Task Manager - Improvement Plan

## Context
Jacob (Hollywood film producer) is migrating from Celtx/Monday.com to manage his film projects. Current Tasks feature is basic - needs to be upgraded to premium task manager level (Linear/Notion-like).

## Current State Analysis

### Files Involved
- `apps/web/src/components/tasks/TasksManagerView.tsx` - Alternative view
- `apps/web/src/components/tasks/TaskManager.tsx` - Main container
- `apps/web/src/components/tasks/SpreadsheetView.tsx` - Best current implementation
- `apps/web/src/components/tasks/TaskDetailPanel.tsx` - Slide-over panel
- `apps/web/src/app/api/tasks/[id]/route.ts` - Task CRUD API
- `apps/web/src/app/api/projects/[id]/tasks/route.ts` - Project tasks API

### Tech Stack
- Next.js 16.2.10 + React 19
- Tailwind CSS v4 (no UI library)
- Lucide React icons
- Prisma + PostgreSQL
- No TanStack Table yet

### Task Data Model
```typescript
interface Task {
  id: string;
  parentTaskId: string | null;  // Hierarchy
  name: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETE";
  category: "PRE_PRODUCTION" | "PRODUCTION" | "POST_PRODUCTION" | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assigneeUserId: string | null;
  assignee: { id: string; name: string } | null;
  dueDate: string | null;
  startDate: string | null;
  description: string | null;
  expectedDurationMinutes: number;
  tags: string[];
  children: Task[];  // Subtasks
  payoutAmount: string | null;
  payout: { id: string; amount: string; status: string } | null;
}
```

---

## Phase 1: Core Table + Inline Editing (This PR)

### Goals
Transform SpreadsheetView into a premium Linear/Notion-style table with excellent inline editing UX.

### 1. Install TanStack Table

```bash
cd apps/web
npm install @tanstack/react-table
```

### 2. Create Shared Task Types

**New file: `apps/web/src/types/task.ts`**
```typescript
// Shared task interface across all components
export interface Task {
  id: string;
  parentTaskId: string | null;
  name: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: "PRE_PRODUCTION" | "PRODUCTION" | "POST_PRODUCTION" | null;
  assigneeUserId: string | null;
  assignee: { id: string; name: string } | null;
  dueDate: string | null;
  startDate: string | null;
  description: string | null;
  expectedDurationMinutes: number;
  tags: string[];
  children: Task[];
  payoutAmount: string | null;
  payout: { id: string; amount: string; status: string } | null;
  order: number;
  stageId: string;
  stageName?: string;
}

export interface TaskUser {
  id: string;
  name: string;
}

export interface TaskColumn {
  id: string;
  label: string;
  accessor: keyof Task;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
}
```

### 3. Build Premium SpreadsheetView with TanStack Table

**File: `apps/web/src/components/tasks/SpreadsheetView.tsx`**

Key improvements:

#### A. Column Management
```typescript
// Default columns
const COLUMNS: TaskColumn[] = [
  { id: "expand", label: "", width: 40 },
  { id: "checkbox", label: "", width: 40 },
  { id: "name", label: "Task Name", accessor: "name", minWidth: 250, sortable: true },
  { id: "status", label: "Status", width: 120, sortable: true, filterable: true },
  { id: "priority", label: "Priority", width: 100, sortable: true },
  { id: "assignee", label: "Assignee", width: 150, sortable: true },
  { id: "startDate", label: "Start", width: 110, sortable: true },
  { id: "dueDate", label: "Due", width: 110, sortable: true },
  { id: "duration", label: "Duration", width: 80 },
  { id: "subtasks", label: "Subs", width: 60 },
  { id: "actions", label: "", width: 60 },
];

// Column visibility toggle dropdown
// Resizable columns with drag handles
// Column reordering (future phase)
```

#### B. Inline Editing Cells
```typescript
// Cell states
type CellState =
  | { mode: "display" }
  | { mode: "editing"; columnId: string; taskId: string };

// Editing components per column type
const EditingCell = {
  name: (task, onSave) => <InlineTextInput value={task.name} onSave={onSave} />,
  status: (task, onSave) => <StatusDropdown value={task.status} onSave={onSave} />,
  priority: (task, onSave) => <PriorityDropdown value={task.priority} onSave={onSave} />,
  assignee: (task, users, onSave) => <AssigneeDropdown value={task.assigneeUserId} users={users} onSave={onSave} />,
  startDate: (task, onSave) => <DatePicker value={task.startDate} onSave={onSave} />,
  dueDate: (task, onSave) => <DatePicker value={task.dueDate} onSave={onSave} />,
};
```

#### C. Row Selection & Bulk Actions
```typescript
// Multi-select with shift+click
// Bulk action bar appears when rows selected
// Actions: Change status, Assign, Delete, Add tag
```

#### D. Improved Visual Hierarchy
```typescript
// Row height based on depth
// Indentation for subtasks
// Expand/collapse with chevron
// Connection lines between parent-child
// Hover states with row highlight
```

#### E. Quick Filters Bar
```typescript
// Status pills: [All] [To Do] [In Progress] [Done]
// Priority pills: [All] [🔴] [🟠] [🟡] [🟢]
// My tasks / Unassigned toggle
// Search inline with / key shortcut
```

### 4. Add Keyboard Shortcuts

```typescript
// / - Focus search
// Escape - Close editing / Clear selection
// Enter - Open task detail
// e - Start editing selected cell
// Space - Toggle status
// Delete - Delete selected (with confirmation)
// Ctrl+A - Select all visible
// Shift+Click - Range select
```

### 5. Better Status/Priority Indicators

```typescript
// Status badges with icons
const STATUS_CONFIG = {
  OPEN: { label: "To Do", bg: "bg-gray-100", text: "text-gray-700", icon: Circle },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-500", text: "text-white", icon: Loader2 },
  COMPLETE: { label: "Done", bg: "bg-green-500", text: "text-white", icon: Check },
};

// Priority with color dots
const PRIORITY_CONFIG = {
  LOW: { label: "Low", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  MEDIUM: { label: "Medium", bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  HIGH: { label: "High", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  URGENT: { label: "Urgent", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};
```

### 6. Better Empty State

```typescript
// Friendly empty state
// + Add your first task button
// Quick-add input directly visible
```

---

## Implementation Details

### File Changes

1. **Create: `apps/web/src/types/task.ts`**
   - Shared Task interface
   - TaskColumn configuration
   - Status/Priority helpers

2. **Update: `apps/web/src/components/tasks/SpreadsheetView.tsx`**
   - Integrate TanStack Table
   - Full inline editing with proper cell components
   - Column resizing
   - Column visibility toggle
   - Row selection with bulk actions
   - Keyboard shortcuts
   - Better visual design

3. **Update: `apps/web/src/components/tasks/TaskManager.tsx`**
   - Import shared types
   - Clean up unused code
   - Improve toolbar UI

4. **Update: `apps/web/src/components/tasks/TaskDetailPanel.tsx`**
   - Use shared types
   - Consistent styling

### Component Structure

```
SpreadsheetView/
├── Header (column definitions + resize handles)
├── QuickFilters (status pills, priority pills)
├── SearchBar (with keyboard shortcut hint)
├── Table
│   ├── Column Headers (sortable, resizable, hideable)
│   └── Rows
│       ├── Row (expandable, selectable)
│       │   ├── Expand/Checkbox Cell
│       │   ├── Name Cell (inline edit)
│       │   ├── Status Cell (inline dropdown)
│       │   ├── Priority Cell (inline dropdown)
│       │   ├── Assignee Cell (inline dropdown)
│       │   ├── Start Date Cell (date picker)
│       │   ├── Due Date Cell (date picker)
│       │   ├── Duration Cell (calculated)
│       │   ├── Subtasks Cell
│       │   └── Actions Cell
│       ├── Child Rows (indented)
│       └── Add Subtask Row (inline)
├── BulkActionBar (appears when selection > 0)
└── Footer (task count, pagination if needed)
```

### API Integration

All inline edits call existing API endpoints:
- PATCH `/api/tasks/[id]` - Update any field
- POST `/api/tasks/[id]/subtasks` - Add subtask
- DELETE `/api/tasks/[id]` - Delete task

Auto-save on blur with optimistic UI updates.

---

## Success Criteria

1. ✅ Table renders with all columns
2. ✅ Columns are resizable (drag handle)
3. ✅ Columns can be sorted (click header)
4. ✅ Column visibility can be toggled
5. ✅ All cells support inline editing
6. ✅ Status changes save immediately
7. ✅ Priority changes save immediately
8. ✅ Assignee changes save immediately
9. ✅ Date fields have proper date picker
10. ✅ Subtasks expand/collapse
11. ✅ Row selection with bulk actions
12. ✅ Keyboard shortcuts work
13. ✅ Dark mode support
14. ✅ Responsive on tablet+

---

## Future Phases (Out of Scope)

### Phase 2: Enhanced Features
- Drag-drop row reordering
- Saved custom views
- Grouping by field
- Swimlanes in board view
- Dependencies between tasks

### Phase 3: Film Production Specific
- Scene/task linking
- Shot numbering
- Cast/crew integration
- Timeline view with scenes
- Version tracking

---

## Dependencies
- `@tanstack/react-table` - Table state management
- `lucide-react` - Icons (already installed)
- `date-fns` - Date formatting (optional, use native Intl)

## No External Dependencies Needed
- Use native HTML `<table>` styled with Tailwind
- Native `<input type="date">` for date picking
- Native `<select>` styled for dropdowns
- Native `contentEditable` for text editing (optional)
