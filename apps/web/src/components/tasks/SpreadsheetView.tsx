"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { Task, TaskAssignee, TaskStatus, TaskPriority } from "@/types/task";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/types/task";
import TaskDetailPanel from "./TaskDetailPanel";

// ============================================
// Premium Task Table - Monday.com/ClickUp Style
// ============================================

interface SpreadsheetViewProps {
  tasks: Task[];
  users: TaskAssignee[];
  projectId: string;
  onRefresh: () => void;
  canManage: boolean;
}

// ============================================
// Column Configuration
// ============================================

interface Column {
  id: string;
  label: string;
  width: number;
  minWidth: number;
  editable: boolean;
  type: "text" | "status" | "priority" | "assignee" | "date" | "number" | "checkbox" | "actions";
  align: "left" | "center" | "right";
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "checkbox", label: "", width: 44, minWidth: 44, editable: false, type: "checkbox", align: "center" },
  { id: "name", label: "Task Name", width: 350, minWidth: 200, editable: true, type: "text", align: "left" },
  { id: "status", label: "Status", width: 140, minWidth: 120, editable: true, type: "status", align: "left" },
  { id: "priority", label: "Priority", width: 110, minWidth: 90, editable: true, type: "priority", align: "left" },
  { id: "assignee", label: "Assignee", width: 160, minWidth: 120, editable: true, type: "assignee", align: "left" },
  { id: "startDate", label: "Start", width: 110, minWidth: 100, editable: true, type: "date", align: "left" },
  { id: "dueDate", label: "Due", width: 110, minWidth: 100, editable: true, type: "date", align: "left" },
  { id: "duration", label: "Dur", width: 60, minWidth: 50, editable: false, type: "number", align: "center" },
  { id: "subtasks", label: "Sub", width: 60, minWidth: 50, editable: false, type: "number", align: "center" },
  { id: "actions", label: "", width: 60, minWidth: 60, editable: false, type: "actions", align: "center" },
];

// ============================================
// Helper Functions
// ============================================

// Format date for display
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Calculate duration between dates
function getDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "-";
  try {
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) return "<1d";
    if (days === 1) return "1d";
    if (days < 7) return days + "d";
    if (days < 30) return Math.floor(days / 7) + "w";
    return Math.floor(days / 30) + "mo";
  } catch {
    return "-";
  }
}

// Get subtask count
function getSubtaskCount(children: Task[]): { completed: number; total: number } {
  if (!children || children.length === 0) return { completed: 0, total: 0 };
  const completed = children.filter(c => c.status === "COMPLETE").length;
  return { completed, total: children.length };
}

// Flatten tasks with depth
interface FlattenedTask {
  task: Task;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  parentId: string | null;
}

function flattenTasks(
  tasks: Task[],
  expandedIds: Set<string>,
  depth: number = 0,
  parentId: string | null = null
): FlattenedTask[] {
  const result: FlattenedTask[] = [];
  for (const task of tasks) {
    const hasChildren = task.children && task.children.length > 0;
    result.push({ task, depth, isExpanded: expandedIds.has(task.id), hasChildren, parentId });
    if (hasChildren && expandedIds.has(task.id)) {
      result.push(...flattenTasks(task.children, expandedIds, depth + 1, task.id));
    }
  }
  return result;
}

// ============================================
// Icons
// ============================================

const ChevronRight = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Plus = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const Check = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const Search = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const X = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const GripVertical = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="6" r="1.5" fill="currentColor" />
    <circle cx="15" cy="6" r="1.5" fill="currentColor" />
    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    <circle cx="9" cy="18" r="1.5" fill="currentColor" />
    <circle cx="15" cy="18" r="1.5" fill="currentColor" />
  </svg>
);


// ============================================
// Inline Edit Components - Monday.com Style
// ============================================

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  className?: string;
}

function InlineTextEdit({ value, onSave, onCancel, autoFocus = true }: InlineEditProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [value, autoFocus]);

  const handleBlur = () => {
    onSave(localValue.trim() || value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setLocalValue(value);
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full h-7 px-2 text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

interface InlineSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
  onCancel: () => void;
}

function InlineSelect({ value, options, onSave, onCancel }: InlineSelectProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [value]);

  const handleBlur = () => {
    onSave(selectRef.current?.value || value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <select
      ref={selectRef}
      defaultValue={value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onChange={(e) => onSave(e.target.value)}
      className="w-full h-7 px-1 text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      onClick={(e) => e.stopPropagation()}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

interface InlineDateEditProps {
  value: string | null;
  onSave: (value: string | null) => void;
  onCancel: () => void;
}

function InlineDateEdit({ value, onSave, onCancel }: InlineDateEditProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  }, []);

  const dateValue = value ? value.split("T")[0] : "";

  const handleBlur = () => {
    const val = inputRef.current?.value;
    onSave(val || null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="date"
      defaultValue={dateValue}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full h-7 px-2 text-xs bg-white dark:bg-gray-800 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

interface StatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
}

function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${config.bgColor} ${config.textColor} ${onClick ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
    >
      {config.label}
    </button>
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
  onClick?: () => void;
}

function PriorityBadge({ priority, onClick }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${config.bgColor} ${config.textColor} ${onClick ? "hover:scale-105 cursor-pointer" : "cursor-default"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </button>
  );
}


// ============================================
// Main SpreadsheetView Component
// ============================================

export default function SpreadsheetView({
  tasks,
  users,
  projectId,
  onRefresh,
  canManage,
}: SpreadsheetViewProps) {
  // ============================================
  // State
  // ============================================

  const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingCell, setEditingCell] = useState<{ taskId: string; columnId: string } | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [addingSubtask, setAddingSubtask] = useState<string | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================
  // Computed Values
  // ============================================

  const flattenedTasks = useMemo(() => flattenTasks(tasks, expandedTasks), [tasks, expandedTasks]);

  const filteredTasks = useMemo(() => {
    return flattenedTasks.filter((ft) => {
      if (searchQuery && !ft.task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "ALL" && ft.task.status !== statusFilter) return false;
      return true;
    });
  }, [flattenedTasks, searchQuery, statusFilter]);

  // ============================================
  // Column Resizing
  // ============================================

  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(columnId);
    setResizeStartX(e.clientX);
    setResizeStartWidth(currentWidth);
  }, []);

  useEffect(() => {
    if (!resizingCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(columns.find(c => c.id === resizingCol)?.minWidth || 50, resizeStartWidth + diff);
      setColumns(prev => prev.map(col =>
        col.id === resizingCol ? { ...col, width: newWidth } : col
      ));
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingCol, resizeStartX, resizeStartWidth, columns]);

  // ============================================
  // Actions
  // ============================================

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Record<string, unknown>) => {
    try {
      await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      onRefresh();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [onRefresh]);

  const cycleStatus = useCallback(async (taskId: string, current: TaskStatus) => {
    const next: TaskStatus = current === "OPEN" ? "IN_PROGRESS" : current === "IN_PROGRESS" ? "COMPLETE" : "OPEN";
    await updateTask(taskId, { status: next });
  }, [updateTask]);

  const cyclePriority = useCallback(async (taskId: string, current: TaskPriority) => {
    const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const next = priorities[(priorities.indexOf(current) + 1) % priorities.length];
    await updateTask(taskId, { priority: next });
  }, [updateTask]);

  const addTask = useCallback(async () => {
    if (!newTaskName.trim()) return;
    try {
      await fetch("/api/projects/" + projectId + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTaskName.trim() }),
      });
      setNewTaskName("");
      setAddingTask(false);
      onRefresh();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  }, [newTaskName, projectId, onRefresh]);

  const addSubtask = useCallback(async (parentId: string) => {
    if (!newSubtaskName.trim()) return;
    try {
      await fetch("/api/tasks/" + parentId + "/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubtaskName.trim() }),
      });
      setNewSubtaskName("");
      setAddingSubtask(null);
      setExpandedTasks(prev => new Set([...prev, parentId]));
      onRefresh();
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  }, [newSubtaskName, onRefresh]);

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !editingCell && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (editingCell) setEditingCell(null);
        if (searchQuery) {
          setSearchQuery("");
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCell, searchQuery]);


  // ============================================
  // Render Cell Content
  // ============================================

  const renderCell = (ft: FlattenedTask, column: Column) => {
    const task = ft.task;
    const isEditing = editingCell?.taskId === task.id && editingCell?.columnId === column.id;
    const indentPadding = ft.depth * 20;

    // Checkbox
    if (column.id === "checkbox") {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); cycleStatus(task.id, task.status); }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.status === "COMPLETE" ? STATUS_CONFIG[task.status].bgColor + " " + STATUS_CONFIG[task.status].textColor : "border-gray-300 dark:border-gray-500 hover:border-blue-400"}`}
        >
          {task.status === "COMPLETE" && <Check />}
        </button>
      );
    }

    // Task Name
    if (column.id === "name") {
      if (isEditing && canManage) {
        return (
          <InlineTextEdit
            value={task.name}
            onSave={(value) => { if (value !== task.name) updateTask(task.id, { name: value }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      return (
        <div className="flex items-center gap-2">
          {ft.hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(task.id); }}
              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {ft.isExpanded ? <ChevronDown /> : <ChevronRight />}
            </button>
          )}
          {!ft.hasChildren && <div className="w-5" />}
          <span
            onClick={() => setSelectedTask(task)}
            onDoubleClick={() => canManage && setEditingCell({ taskId: task.id, columnId: "name" })}
            className={`flex-1 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${task.status === "COMPLETE" ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}
          >
            {task.name}
          </span>
        </div>
      );
    }

    // Status
    if (column.id === "status") {
      if (isEditing && canManage) {
        return (
          <InlineSelect
            value={task.status}
            options={[
              { value: "OPEN", label: "To Do" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "COMPLETE", label: "Done" },
            ]}
            onSave={(value) => { updateTask(task.id, { status: value }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      return (
        <div onClick={(e) => { e.stopPropagation(); if (canManage) cycleStatus(task.id, task.status); }}>
          <StatusBadge status={task.status} onClick={canManage ? () => cycleStatus(task.id, task.status) : undefined} />
        </div>
      );
    }

    // Priority
    if (column.id === "priority") {
      if (isEditing && canManage) {
        return (
          <InlineSelect
            value={task.priority}
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
              { value: "URGENT", label: "Urgent" },
            ]}
            onSave={(value) => { updateTask(task.id, { priority: value }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      return (
        <div onClick={(e) => { e.stopPropagation(); if (canManage) cyclePriority(task.id, task.priority); }}>
          <PriorityBadge priority={task.priority} onClick={canManage ? () => cyclePriority(task.id, task.priority) : undefined} />
        </div>
      );
    }

    // Assignee
    if (column.id === "assignee") {
      if (isEditing && canManage) {
        return (
          <InlineSelect
            value={task.assigneeUserId || ""}
            options={[
              { value: "", label: "Unassigned" },
              ...users.map(u => ({ value: u.id, label: u.name })),
            ]}
            onSave={(value) => { updateTask(task.id, { assigneeUserId: value || null }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      if (task.assignee) {
        return (
          <button
            onClick={(e) => { e.stopPropagation(); if (canManage) setEditingCell({ taskId: task.id, columnId: "assignee" }); }}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{task.assignee.name.split(" ")[0]}</span>
          </button>
        );
      }
      return (
        <button
          onClick={(e) => { e.stopPropagation(); if (canManage) setEditingCell({ taskId: task.id, columnId: "assignee" }); }}
          className="text-sm text-gray-400 hover:text-blue-500 transition-colors"
        >
          + Assign
        </button>
      );
    }

    // Start Date
    if (column.id === "startDate") {
      if (isEditing && canManage) {
        return (
          <InlineDateEdit
            value={task.startDate}
            onSave={(value) => { updateTask(task.id, { startDate: value }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      return (
        <button
          onClick={(e) => { e.stopPropagation(); if (canManage) setEditingCell({ taskId: task.id, columnId: "startDate" }); }}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
        >
          {task.startDate ? formatDate(task.startDate) : <span className="text-gray-300">-</span>}
        </button>
      );
    }

    // Due Date
    if (column.id === "dueDate") {
      if (isEditing && canManage) {
        return (
          <InlineDateEdit
            value={task.dueDate}
            onSave={(value) => { updateTask(task.id, { dueDate: value }); setEditingCell(null); }}
            onCancel={() => setEditingCell(null)}
          />
        );
      }
      return (
        <button
          onClick={(e) => { e.stopPropagation(); if (canManage) setEditingCell({ taskId: task.id, columnId: "dueDate" }); }}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
        >
          {task.dueDate ? formatDate(task.dueDate) : <span className="text-gray-300">-</span>}
        </button>
      );
    }

    // Duration
    if (column.id === "duration") {
      const dur = getDuration(task.startDate, task.dueDate);
      return <span className="text-xs text-gray-500">{dur}</span>;
    }

    // Subtasks
    if (column.id === "subtasks") {
      const { completed, total } = getSubtaskCount(task.children);
      if (total === 0) return <span className="text-xs text-gray-300">-</span>;
      return (
        <button
          onClick={() => toggleExpand(task.id)}
          className="text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors"
        >
          {completed}/{total}
        </button>
      );
    }

    // Actions
    if (column.id === "actions") {
      return (
        <div className="flex items-center justify-center gap-1">
          {canManage && (
            <button
              onClick={(e) => { e.stopPropagation(); setAddingSubtask(task.id); }}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Add subtask"
            >
              <Plus />
            </button>
          )}
        </div>
      );
    }

    return null;
  };


  // ============================================
  // Render JSX
  // ============================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Toolbar */}
      <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(["ALL", "OPEN", "IN_PROGRESS", "COMPLETE"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {status === "ALL" ? "All" : status === "OPEN" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Done"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" ref={containerRef}>
        {/* Header */}
        <div className="flex bg-gray-100/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 select-none">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex-shrink-0 flex items-center group"
              style={{ width: col.width }}
            >
              <div className="flex-1 px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {col.label}
              </div>
              {/* Resize Handle */}
              {col.id !== "checkbox" && col.id !== "actions" && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, col.id, col.width)}
                  className="absolute right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ width: 4 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((ft) => (
              <div
                key={ft.task.id}
                className={`flex items-center hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors ${ft.task.status === "COMPLETE" ? "opacity-60" : ""} ${editingCell?.taskId === ft.task.id ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
              >
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex-shrink-0 px-1"
                    style={{ width: col.width }}
                  >
                    {col.id === "checkbox" && (
                      <div className="pl-2" style={{ paddingLeft: ft.depth * 20 + 8 }}>
                        {renderCell(ft, col)}
                      </div>
                    )}
                    {col.id !== "checkbox" && (
                      <div className="py-2 pr-2">
                        {renderCell(ft, col)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">No tasks found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchQuery ? "Try a different search" : "Create your first task below"}
              </p>
            </div>
          )}

          {/* Add Task Row */}
          {addingTask && (
            <div className="flex items-center bg-blue-50/50 dark:bg-blue-900/20 border-t-2 border-blue-500">
              <div className="flex-shrink-0" style={{ width: 44 }}>
                <div className="pl-2 py-2">
                  <div className="w-5 h-5 border-2 border-blue-500 rounded" />
                </div>
              </div>
              <div style={{ width: 350 }}>
                <div className="px-2 py-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask();
                      if (e.key === "Escape") { setAddingTask(false); setNewTaskName(""); }
                    }}
                    placeholder="Task name..."
                    autoFocus
                    className="w-full h-8 px-3 text-sm bg-white dark:bg-gray-800 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
              </div>
              <div style={{ width: 140 }}>
                <div className="px-2 py-2">
                  <StatusBadge status="OPEN" />
                </div>
              </div>
              <div style={{ width: 460 }}>
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    onClick={addTask}
                    disabled={!newTaskName.trim()}
                    className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingTask(false); setNewTaskName(""); }}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Subtask Row */}
          {addingSubtask && (
            <div className="flex items-center bg-purple-50/50 dark:bg-purple-900/20">
              <div className="flex-shrink-0" style={{ width: 44 }}>
                <div className="pl-2 py-2">
                  <div className="w-5 h-5 border-2 border-purple-400 rounded opacity-50" />
                </div>
              </div>
              <div style={{ width: 350 }}>
                <div className="px-2 py-2">
                  <input
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSubtask(addingSubtask);
                      if (e.key === "Escape") { setAddingSubtask(null); setNewSubtaskName(""); }
                    }}
                    placeholder="Subtask name..."
                    autoFocus
                    className="w-full h-8 px-3 text-sm bg-white dark:bg-gray-800 border border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  />
                </div>
              </div>
              <div style={{ width: 620 }}>
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    onClick={() => addSubtask(addingSubtask)}
                    disabled={!newSubtaskName.trim()}
                    className="px-4 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingSubtask(null); setNewSubtaskName(""); }}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setAddingTask(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">/</kbd> to search
          </span>
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onRefresh={onRefresh}
          canManage={canManage}
        />
      )}
    </div>
  );
}
