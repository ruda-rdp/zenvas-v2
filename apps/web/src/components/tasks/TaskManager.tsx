"use client";

import { useState } from "react";
import SpreadsheetView from "./SpreadsheetView";

interface Task {
  id: string;
  parentTaskId: string | null;
  name: string;
  status: string;
  category: string | null;
  priority: string;
  assigneeUserId: string | null;
  payoutAmount: string | null;
  expectedDurationMinutes: number;
  isFromTemplate: boolean;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  tags: string[];
  assignee: { id: string; name: string } | null;
  children: Task[];
}

interface TaskManagerProps {
  tasks: Task[];
  users: Array<{ id: string; name: string }>;
  projectId: string;
  onRefresh: () => void;
  canManage: boolean;
  isEditor: boolean;
}

type ViewType = "spreadsheet" | "board" | "gantt" | "calendar";

export default function TaskManager({
  tasks,
  users,
  projectId,
  onRefresh,
  canManage,
  isEditor,
}: TaskManagerProps) {
  const [view, setView] = useState<ViewType>("spreadsheet");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (task.parentTaskId) return false;
    if (search && !task.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "ALL" && task.status !== filterStatus) return false;
    if (filterAssignee !== "ALL" && task.assigneeUserId !== filterAssignee) return false;
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tasks ({filteredTasks.length})
        </h2>
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: "spreadsheet", icon: "📊", label: "Spreadsheet" },
              { key: "board", icon: "📋", label: "Board" },
              { key: "gantt", icon: "📈", label: "Timeline" },
              { key: "calendar", icon: "📅", label: "Calendar" },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key as ViewType)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  view === v.key ? "bg-white dark:bg-gray-700 shadow" : ""
                }`}
                title={v.label}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="ALL">All Status</option>
          <option value="OPEN">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETE">Done</option>
        </select>

        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="ALL">All Assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="ALL">All Priority</option>
          <option value="URGENT">🔴 Urgent</option>
          <option value="HIGH">🟠 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>
      </div>

      {/* Views */}
      {view === "spreadsheet" && (
        <SpreadsheetView
          tasks={filteredTasks}
          users={users}
          projectId={projectId}
          onRefresh={onRefresh}
          canManage={canManage}
        />
      )}
      {view === "board" && (
        <BoardView tasks={filteredTasks} />
      )}
      {view === "gantt" && (
        <GanttView tasks={filteredTasks} />
      )}
      {view === "calendar" && (
        <CalendarView tasks={filteredTasks} />
      )}
    </div>
  );
}

// ============================================
// BOARD VIEW - Simple Kanban
// ============================================
function BoardView({ tasks }: { tasks: Task[] }) {
  const columns = [
    { status: "OPEN", label: "To Do", color: "gray" },
    { status: "IN_PROGRESS", label: "In Progress", color: "blue" },
    { status: "COMPLETE", label: "Done", color: "green" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${col.color}-500`} />
                <h3 className="font-medium text-gray-900 dark:text-white">{col.label}</h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {colTasks.map((task) => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <p className={`text-sm font-medium text-gray-900 dark:text-white ${task.status === "COMPLETE" ? "line-through opacity-60" : ""}`}>
                    {task.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.priority === "URGENT" ? "bg-red-100 text-red-700" :
                      task.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                      task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {task.priority === "LOW" ? "🟢" : task.priority === "MEDIUM" ? "🟡" : task.priority === "HIGH" ? "🟠" : "🔴"}
                    </span>
                    {task.assignee && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">
                        {task.assignee.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// GANTT VIEW - Simple Timeline
// ============================================
function GanttView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i - 7);
    return d;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Timeline - Next 2 Weeks</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="w-48 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Task</div>
            {days.map((day, i) => (
              <div key={i} className={`flex-1 px-1 py-2 text-center text-xs ${
                day.toDateString() === today.toDateString() ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" : "text-gray-500"
              }`}>
                <div className="font-medium">{day.getDate()}</div>
                <div className="text-[10px]">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
              </div>
            ))}
          </div>
          {tasks.slice(0, 10).map((task) => (
            <div key={task.id} className="flex items-center border-b border-gray-100 dark:border-gray-800">
              <div className="w-48 px-4 py-3 text-sm text-gray-900 dark:text-white truncate">{task.name}</div>
              {days.map((day, i) => {
                const hasDate = task.startDate || task.dueDate;
                const dayStr = day.toISOString().split("T")[0];
                const isInRange = hasDate && (
                  (task.startDate && dayStr >= task.startDate) || (task.dueDate && dayStr <= task.dueDate)
                );
                return (
                  <div key={i} className={`flex-1 h-10 border-l border-gray-100 dark:border-gray-800 ${day.toDateString() === today.toDateString() ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}>
                    {isInRange && (
                      <div className={`h-6 mx-1 mt-2 rounded ${
                        task.status === "COMPLETE" ? "bg-green-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-gray-300 dark:bg-gray-600"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="p-8 text-center text-gray-500">No tasks with dates</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CALENDAR VIEW
// ============================================
function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = today.toISOString().split("T")[0];

  const tasksByDay: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const dayStr = task.dueDate.split("T")[0];
      if (!tasksByDay[dayStr]) tasksByDay[dayStr] = [];
      tasksByDay[dayStr].push(task);
    }
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>
        ))}
        {days.map((day, i) => {
          const dayStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
          const dayTasks = dayStr ? tasksByDay[dayStr] || [] : [];
          const isToday = dayStr === todayStr;
          return (
            <div key={i} className={`min-h-[80px] border border-gray-100 dark:border-gray-700 rounded-lg p-2 ${
              isToday ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500" : ""
            }`}>
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>{day}</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${
                        task.status === "COMPLETE" ? "bg-green-100 text-green-700 line-through" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {task.name}
                      </div>
                    ))}
                    {dayTasks.length > 3 && <div className="text-[10px] text-gray-500">+{dayTasks.length - 3} more</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
