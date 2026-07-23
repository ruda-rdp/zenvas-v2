"use client";

import { useState, useRef, useEffect } from "react";
import TaskDetailPanel from "./TaskDetailPanel";

interface Task {
  id: string;
  parentTaskId: string | null;
  name: string;
  status: string;
  priority: string;
  assigneeUserId: string | null;
  assignee: { id: string; name: string } | null;
  dueDate: string | null;
  startDate: string | null;
  description: string | null;
  expectedDurationMinutes: number;
  children: Task[];
}

interface SpreadsheetViewProps {
  tasks: Task[];
  users: Array<{ id: string; name: string }>;
  projectId: string;
  onRefresh: () => void;
  canManage: boolean;
}

export default function SpreadsheetView({
  tasks,
  users,
  projectId,
  onRefresh,
  canManage,
}: SpreadsheetViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingCell, setEditingCell] = useState<{ taskId: string; colId: string; value: string } | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [addingSubtask, setAddingSubtask] = useState<string | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [timelineEdit, setTimelineEdit] = useState<{ taskId: string; start: string; end: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Toggle expand
  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Save edit
  const saveEdit = async (taskId: string, colId: string, value: string) => {
    const update: Record<string, unknown> = {};
    if (colId === "name") update.name = value;
    if (colId === "status") update.status = value;
    if (colId === "priority") update.priority = value;
    if (colId === "assignee") update.assigneeUserId = value || null;
    
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    setEditingCell(null);
    onRefresh();
  };

  // Toggle status
  const toggleStatus = async (taskId: string, current: string) => {
    const next = current === "OPEN" ? "IN_PROGRESS" : current === "IN_PROGRESS" ? "COMPLETE" : "OPEN";
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    onRefresh();
  };

  // Cycle priority
  const cyclePriority = async (taskId: string, current: string) => {
    const next = current === "LOW" ? "MEDIUM" : current === "MEDIUM" ? "HIGH" : current === "HIGH" ? "URGENT" : "LOW";
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: next }),
    });
    onRefresh();
  };

  // Save timeline
  const saveTimeline = async () => {
    if (!timelineEdit) return;
    await fetch(`/api/tasks/${timelineEdit.taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: timelineEdit.start || null, dueDate: timelineEdit.end || null }),
    });
    setTimelineEdit(null);
    onRefresh();
  };

  // Add task
  const addTask = async () => {
    if (!newTaskName.trim()) return;
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTaskName.trim() }),
    });
    setNewTaskName("");
    setAddingTask(false);
    onRefresh();
  };

  // Add subtask
  const addSubtask = async (parentId: string) => {
    if (!newSubtaskName.trim()) return;
    await fetch(`/api/tasks/${parentId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubtaskName.trim() }),
    });
    setNewSubtaskName("");
    setAddingSubtask(null);
    onRefresh();
  };

  // Delete subtask
  const deleteSubtask = async (subtaskId: string) => {
    if (!confirm("Delete this subtask?")) return;
    await fetch(`/api/tasks/${subtaskId}`, { method: "DELETE" });
    onRefresh();
  };

  // Get status info
  const getStatus = (s: string) => {
    if (s === "OPEN") return { text: "To Do", bg: "bg-gray-100 text-gray-600" };
    if (s === "IN_PROGRESS") return { text: "In Progress", bg: "bg-blue-500 text-white" };
    return { text: "Done", bg: "bg-green-500 text-white" };
  };

  // Get priority info
  const getPriority = (p: string) => {
    if (p === "LOW") return { text: "Low", bg: "bg-green-100 text-green-700", dot: "bg-green-500" };
    if (p === "MEDIUM") return { text: "Medium", bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" };
    if (p === "HIGH") return { text: "High", bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500" };
    return { text: "Urgent", bg: "bg-red-100 text-red-700", dot: "bg-red-500" };
  };

  // Calculate duration
  const getDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) return "< 1 day";
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  // Render row
  const renderRow = (task: Task, depth: number = 0) => {
    const children = task.children || [];
    const isExpanded = expandedTasks.has(task.id);
    const status = getStatus(task.status);
    const priority = getPriority(task.priority);
    const duration = getDuration(task.startDate, task.dueDate);
    const indent = 8 + depth * 20;

    return (
      <div key={task.id}>
        {/* Row */}
        <div className={`flex items-center border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${depth > 0 ? "bg-gray-50/30 dark:bg-gray-900/30" : ""}`}>
          {/* Expand */}
          <div className="w-8 flex-shrink-0" style={{ paddingLeft: indent }}>
            <button onClick={() => toggleExpand(task.id)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600">
              <span className={`text-[10px] transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
            </button>
          </div>

          {/* Checkbox */}
          <div className="w-8 flex-shrink-0">
            <button onClick={() => toggleStatus(task.id, task.status)}
              className={`w-4 h-4 rounded border flex items-center justify-center ${status.bg}`}>
              {task.status === "COMPLETE" && <span className="text-white text-[8px]">✓</span>}
            </button>
          </div>

          {/* Task Name */}
          <div className="flex-1 min-w-0 px-2 py-2 cursor-pointer" onClick={() => setSelectedTask(task)}>
            <span className="text-sm text-gray-900 dark:text-white truncate block">{task.name}</span>
          </div>

          {/* Status */}
          <div className="w-24 flex-shrink-0 px-2 py-2">
            {editingCell?.taskId === task.id && editingCell?.colId === "status" ? (
              <select value={editingCell.value} onChange={(e) => saveEdit(task.id, "status", e.target.value)}
                onBlur={() => setEditingCell(null)} className="w-full h-6 px-1 text-xs border border-blue-500 rounded bg-white" autoFocus>
                <option value="OPEN">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETE">Done</option>
              </select>
            ) : (
              <button onClick={() => canManage && setEditingCell({ taskId: task.id, colId: "status", value: task.status })}
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                {status.text}
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="w-20 flex-shrink-0 px-2 py-2">
            <button onClick={() => canManage && cyclePriority(task.id, task.priority)}
              className={`px-2 py-1 rounded text-xs font-medium ${priority.bg}`}>
              {priority.text}
            </button>
          </div>

          {/* Assignee */}
          <div className="w-28 flex-shrink-0 px-2 py-2">
            {task.assignee ? (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {task.assignee.name.charAt(0)}
                </div>
                <span className="text-xs truncate">{task.assignee.name.split(" ")[0]}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>

          {/* Timeline */}
          <div className="w-36 flex-shrink-0 px-2 py-2">
            {timelineEdit?.taskId === task.id ? (
              <div className="flex gap-1 items-center">
                <input type="date" value={timelineEdit.start} onChange={(e) => setTimelineEdit({ ...timelineEdit, start: e.target.value })}
                  className="h-6 px-1 text-xs border rounded w-28" />
                <span className="text-gray-400">→</span>
                <input type="date" value={timelineEdit.end} onChange={(e) => setTimelineEdit({ ...timelineEdit, end: e.target.value })}
                  className="h-6 px-1 text-xs border rounded w-28" />
                <button onClick={saveTimeline} className="px-1 h-5 bg-blue-500 text-white rounded text-[10px]">✓</button>
                <button onClick={() => setTimelineEdit(null)} className="text-gray-400 text-[10px]">✕</button>
              </div>
            ) : (
              <button onClick={() => setTimelineEdit({ taskId: task.id, start: task.startDate?.split("T")[0] || "", end: task.dueDate?.split("T")[0] || "" })}
                className="text-xs text-gray-500 hover:text-blue-600">
                {task.startDate && task.dueDate ? (
                  <span>{new Date(task.startDate).toLocaleDateString("en", { month: "short", day: "numeric" })} → {new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                ) : (
                  <span className="text-blue-500">+ Add dates</span>
                )}
              </button>
            )}
          </div>

          {/* Duration */}
          <div className="w-20 flex-shrink-0 px-2 py-2 text-xs text-gray-500">
            {duration || "—"}
          </div>

          {/* Subtasks */}
          <div className="w-16 flex-shrink-0 px-2 py-2 text-xs text-gray-500">
            {children.length > 0 ? (
              <span>{children.filter(c => c.status === "COMPLETE").length}/{children.length}</span>
            ) : "—"}
          </div>
        </div>

        {/* Subtasks */}
        {isExpanded && children.map(child => renderRow(child, depth + 1))}

        {/* Add subtask */}
        {isExpanded && canManage && (
          <div className="flex items-center bg-blue-50/30 dark:bg-blue-900/10" style={{ paddingLeft: indent + 24 }}>
            {addingSubtask === task.id ? (
              <div className="flex items-center gap-2 py-1 px-2 w-full">
                <input type="text" value={newSubtaskName} onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addSubtask(task.id); if (e.key === "Escape") { setAddingSubtask(null); setNewSubtaskName(""); }}}
                  placeholder="Subtask name..." className="flex-1 h-6 px-2 text-xs border border-blue-300 rounded" autoFocus />
                <button onClick={() => addSubtask(task.id)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Add</button>
                <button onClick={() => { setAddingSubtask(null); setNewSubtaskName(""); }} className="text-gray-400 text-xs">✕</button>
              </div>
            ) : (
              <button onClick={() => setAddingSubtask(task.id)} className="py-1 px-2 text-xs text-blue-600 font-medium">+ Add subtask</button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Monday.com Style Table */}
      <div className="overflow-x-auto" ref={tableRef}>
        {/* Header */}
        <div className="flex bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 flex-shrink-0 px-2 py-2" />
          <div className="w-8 flex-shrink-0 px-2 py-2" />
          <div className="flex-1 min-w-[200px] px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Task Name</div>
          <div className="w-24 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Status</div>
          <div className="w-20 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Priority</div>
          <div className="w-28 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Assignee</div>
          <div className="w-36 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Timeline</div>
          <div className="w-20 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Duration</div>
          <div className="w-16 flex-shrink-0 px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Subs</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.length > 0 ? tasks.map(task => renderRow(task)) : (
            <div className="py-12 text-center text-gray-400">No tasks yet. Click "+ Add task" below.</div>
          )}

          {/* Add Task */}
          {addingTask && (
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/20">
              <div className="w-8 flex-shrink-0 px-2 py-2" />
              <div className="w-8 flex-shrink-0 px-2 py-2" />
              <div className="flex-1 min-w-[200px] px-2 py-2">
                <input ref={inputRef} type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setAddingTask(false); setNewTaskName(""); }}}
                  placeholder="New task name..." className="w-full h-8 px-3 text-sm border border-blue-300 rounded" autoFocus />
              </div>
              <div className="w-24 flex-shrink-0 px-2 py-2" />
              <div className="w-20 flex-shrink-0 px-2 py-2" />
              <div className="w-28 flex-shrink-0 px-2 py-2" />
              <div className="w-36 flex-shrink-0 px-2 py-2" />
              <div className="w-20 flex-shrink-0 px-2 py-2" />
              <div className="w-16 flex-shrink-0 px-2 py-2" />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => setAddingTask(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
          + Add task
        </button>
        <span className="text-xs text-gray-400">{tasks.length} tasks</span>
      </div>

      {/* Hint */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-400">💡 Click task name to open details • Click ▶ to expand • Click timeline to add dates</p>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onRefresh={() => { onRefresh(); }}
          canManage={canManage}
        />
      )}
    </div>
  );
}
