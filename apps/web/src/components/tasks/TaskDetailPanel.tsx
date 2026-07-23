"use client";

import { useState } from "react";

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

interface TaskDetailPanelProps {
  task: Task;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
  onRefresh: () => void;
  canManage: boolean;
}

export default function TaskDetailPanel({
  task,
  users,
  onClose,
  onRefresh,
  canManage,
}: TaskDetailPanelProps) {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeUserId || "");
  const [dueDate, setDueDate] = useState(task.dueDate?.split("T")[0] || "");
  const [startDate, setStartDate] = useState(task.startDate?.split("T")[0] || "");
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [saving, setSaving] = useState(false);

  const children = task.children || [];
  const completedSubtasks = children.filter(c => c.status === "COMPLETE").length;

  // Auto-save on change
  const autoSave = async (updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      onRefresh();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  // Add subtask
  const addSubtask = async () => {
    if (!newSubtaskName.trim()) return;
    await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubtaskName.trim() }),
    });
    setNewSubtaskName("");
    onRefresh();
  };

  // Toggle subtask status
  const toggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const next = currentStatus === "COMPLETE" ? "OPEN" : "COMPLETE";
    await fetch(`/api/tasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    onRefresh();
  };

  // Delete subtask
  const deleteSubtask = async (subtaskId: string) => {
    if (!confirm("Delete this subtask?")) return;
    await fetch(`/api/tasks/${subtaskId}`, { method: "DELETE" });
    onRefresh();
  };

  // Delete task
  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
            {saving && <span className="text-xs text-blue-500">Saving...</span>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Task Name */}
          <div>
            {canManage ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name !== task.name && autoSave({ name })}
                className="w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
              />
            ) : (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.name}</h3>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); autoSave({ status: e.target.value }); }}
                disabled={!canManage}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
              >
                <option value="OPEN">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); autoSave({ priority: e.target.value }); }}
                disabled={!canManage}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => { setAssigneeId(e.target.value); autoSave({ assigneeUserId: e.target.value || null }); }}
              disabled={!canManage}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={() => autoSave({ startDate: startDate || null })}
                disabled={!canManage}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={() => autoSave({ dueDate: dueDate || null })}
                disabled={!canManage}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => description !== (task.description || "") && autoSave({ description })}
              rows={3}
              disabled={!canManage}
              placeholder="Add a description..."
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none bg-white dark:bg-gray-700"
            />
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">
                Subtasks ({completedSubtasks}/{children.length})
              </label>
              {children.length > 0 && (
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(completedSubtasks / children.length) * 100}%` }} />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {children.map((child) => (
                <div key={child.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group">
                  <button
                    onClick={() => toggleSubtask(child.id, child.status)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      child.status === "COMPLETE" ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                    }`}
                  >
                    {child.status === "COMPLETE" && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${child.status === "COMPLETE" ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                    {child.name}
                  </span>
                  {canManage && (
                    <button
                      onClick={() => deleteSubtask(child.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700"
                      title="Delete subtask"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add subtask */}
              {canManage && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addSubtask(); }}
                    placeholder="Add subtask..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700"
                  />
                  <button onClick={addSubtask} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          {canManage && (
            <button
              onClick={deleteTask}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
            >
              Delete task
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
