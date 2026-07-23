"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

interface GanttTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  parentTaskId: string | null;
  startDate: string | null;
  dueDate: string | null;
  expectedDurationMinutes: number;
  assignee: { id: string; name: string } | null;
  children: GanttTask[];
}

interface Stage {
  id: string;
  name: string;
  order: number;
  tasks: GanttTask[];
}

interface GanttChartProps {
  projectId: string;
  stages: Stage[];
  onTaskUpdate?: (taskId: string, startDate: string, dueDate: string) => void;
}

export default function GanttChart({ projectId, stages, onTaskUpdate }: GanttChartProps) {
  const { data: session } = useSession();
  const canManage = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewRange, setViewRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    const end = new Date(now);
    end.setDate(end.getDate() + 60);
    return { start, end };
  });
  
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"move" | "resize-left" | "resize-right" | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalDates, setOriginalDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const DAY_WIDTH = 40; // pixels per day
  const ROW_HEIGHT = 50;

  // Calculate total days in view
  const totalDays = Math.ceil((viewRange.end.getTime() - viewRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const totalWidth = totalDays * DAY_WIDTH;

  // Generate day headers
  const generateDays = () => {
    const days = [];
    const current = new Date(viewRange.start);
    while (current <= viewRange.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Generate week labels
  const generateWeeks = () => {
    const weeks = [];
    const current = new Date(viewRange.start);
    current.setDate(current.getDate() - current.getDay()); // Start from Sunday
    
    while (current <= viewRange.end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        start: weekStart,
        end: weekEnd > viewRange.end ? viewRange.end : weekEnd,
        label: `W${Math.ceil((weekStart.getDate() + new Date(viewRange.start).getDate()) / 7)}`,
      });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  // Convert date to X position
  const dateToX = (date: Date) => {
    const diff = Math.floor((date.getTime() - viewRange.start.getTime()) / (1000 * 60 * 60 * 24));
    return diff * DAY_WIDTH;
  };

  // Convert X position to date
  const xToDate = (x: number) => {
    const days = x / DAY_WIDTH;
    const date = new Date(viewRange.start);
    date.setDate(date.getDate() + days);
    return date;
  };

  // Get task position and width
  const getTaskPosition = (task: GanttTask) => {
    let start = task.startDate ? new Date(task.startDate) : null;
    let end = task.dueDate ? new Date(task.dueDate) : null;
    
    // If no dates, use default duration
    if (!start && !end) {
      const now = new Date();
      start = now;
      end = new Date(now);
      end.setMinutes(end.getMinutes() + task.expectedDurationMinutes);
    } else if (start && !end) {
      end = new Date(start);
      end.setMinutes(end.getMinutes() + task.expectedDurationMinutes);
    } else if (!start && end) {
      start = new Date(end);
      start.setMinutes(start.getMinutes() - task.expectedDurationMinutes);
    }

    if (!start || !end) return null;

    return {
      start,
      end,
      x: dateToX(start),
      width: Math.max(dateToX(end) - dateToX(start), DAY_WIDTH), // Minimum 1 day width
    };
  };

  // Flatten tasks with their stage info
  const flattenTasks = (stages: Stage[], parentTask?: GanttTask, stageName?: string) => {
    const flatTasks: { task: GanttTask; stageName: string; depth: number }[] = [];
    
    for (const stage of stages) {
      for (const task of stage.tasks.filter(t => !t.parentTaskId)) {
        flatTasks.push({ task, stageName: stage.name, depth: 0 });
        
        // Add children (subtasks)
        const addChildren = (children: GanttTask[], depth: number) => {
          for (const child of children) {
            flatTasks.push({ task: child, stageName: stage.name, depth });
            if (child.children?.length > 0) {
              addChildren(child.children, depth + 1);
            }
          }
        };
        if (task.children?.length > 0) {
          addChildren(task.children, 1);
        }
      }
    }
    
    return flatTasks;
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, taskId: string, type: "move" | "resize-left" | "resize-right") => {
    if (!canManage) return;
    
    e.preventDefault();
    setDraggingTask(taskId);
    setDragType(type);
    setDragStartX(e.clientX);
    
    // Find task and store original dates
    const findTask = (tasks: GanttTask[]): GanttTask | null => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        if (task.children?.length > 0) {
          const found = findTask(task.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const task = findTask(stages.flatMap(s => s.tasks));
    if (task) {
      setOriginalDates({
        start: task.startDate ? new Date(task.startDate) : null,
        end: task.dueDate ? new Date(task.dueDate) : null,
      });
    }
  };

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggingTask || !dragType) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaDays = Math.round(deltaX / DAY_WIDTH);
    
    if (deltaDays === 0) return;
    
    const newStart = originalDates.start ? new Date(originalDates.start) : null;
    const newEnd = originalDates.end ? new Date(originalDates.end) : null;
    
    if (dragType === "move") {
      if (newStart) newStart.setDate(newStart.getDate() + deltaDays);
      if (newEnd) newEnd.setDate(newEnd.getDate() + deltaDays);
    } else if (dragType === "resize-right") {
      if (newEnd) newEnd.setDate(newEnd.getDate() + deltaDays);
    } else if (dragType === "resize-left") {
      if (newStart) newStart.setDate(newStart.getDate() + deltaDays);
    }
    
    // Call update callback
    if (onTaskUpdate && newStart && newEnd) {
      onTaskUpdate(draggingTask, newStart.toISOString(), newEnd.toISOString());
    }
    
    setDragStartX(e.clientX);
    if (newStart) setOriginalDates(prev => ({ ...prev, start: newStart }));
    if (newEnd) setOriginalDates(prev => ({ ...prev, end: newEnd }));
  }, [draggingTask, dragType, dragStartX, originalDates, onTaskUpdate]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggingTask(null);
    setDragType(null);
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (draggingTask) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [draggingTask, handleDragMove, handleDragEnd]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-500";
      case "HIGH": return "bg-orange-500";
      case "MEDIUM": return "bg-blue-500";
      case "LOW": return "bg-gray-400";
      default: return "bg-blue-500";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETE": return "bg-green-500";
      case "IN_PROGRESS": return "bg-blue-500";
      case "OPEN": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  const flatTasks = flattenTasks(stages);
  const days = generateDays();
  const weeks = generateWeeks();
  const today = new Date();
  const todayX = dateToX(today);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">Timeline View</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewRange(prev => ({
              start: new Date(prev.start.getTime() - 7 * 24 * 60 * 60 * 1000),
              end: new Date(prev.end.getTime() - 7 * 24 * 60 * 60 * 1000)
            }))}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Prev
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setViewRange({
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
              });
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
          <button
            onClick={() => setViewRange(prev => ({
              start: new Date(prev.start.getTime() + 7 * 24 * 60 * 60 * 1000),
              end: new Date(prev.end.getTime() + 7 * 24 * 60 * 60 * 1000)
            }))}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Task List (left side) */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
          {/* Week headers */}
          <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="h-6 border-b border-gray-200 dark:border-gray-700 px-2 flex items-center">
              <span className="text-xs text-gray-500">Timeline</span>
            </div>
          </div>
          
          {/* Task rows */}
          <div ref={containerRef}>
            {flatTasks.map(({ task, stageName, depth }, index) => (
              <div
                key={task.id}
                className="h-[50px] border-b border-gray-100 dark:border-gray-700 px-2 flex items-center"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {depth > 0 && (
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  )}
                  <div className={`w-2 h-2 rounded-full ${task.children?.length > 0 ? "bg-blue-400" : "bg-gray-300"}`} />
                  <span className={`text-sm truncate ${depth === 0 ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                    {task.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gantt Timeline (right side) */}
        <div className="flex-1 overflow-x-auto">
          {/* Day headers */}
          <div className="h-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            {/* Week row */}
            <div className="h-6 border-b border-gray-200 dark:border-gray-700 relative" style={{ width: totalWidth }}>
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  style={{
                    left: dateToX(week.start),
                    width: (dateToX(week.end) - dateToX(week.start) + DAY_WIDTH) + "px"
                  }}
                >
                  <span className="text-xs text-gray-500 font-medium">
                    {week.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
            {/* Day row */}
            <div className="h-6 relative" style={{ width: totalWidth }}>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={`absolute top-0 bottom-0 border-l flex items-center justify-center ${
                    day.toDateString() === today.toDateString()
                      ? "bg-blue-100 dark:bg-blue-900"
                      : day.getDay() === 0 || day.getDay() === 6
                      ? "bg-gray-100 dark:bg-gray-800"
                      : ""
                  }`}
                  style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                >
                  <span className={`text-[10px] ${
                    day.toDateString() === today.toDateString()
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : day.getDay() === 0 || day.getDay() === 6
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}>
                    {day.getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task bars */}
          <div className="relative" style={{ width: totalWidth }}>
            {/* Today line */}
            {todayX >= 0 && todayX <= totalWidth && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                style={{ left: todayX }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            )}

            {/* Task rows */}
            {flatTasks.map(({ task, depth }, index) => {
              const pos = getTaskPosition(task);
              if (!pos) return null;

              return (
                <div
                  key={task.id}
                  className="h-[50px] border-b border-gray-100 dark:border-gray-700 relative"
                >
                  {/* Task bar */}
                  <div
                    className={`absolute top-2 h-8 rounded cursor-pointer transition-all ${
                      draggingTask === task.id ? "opacity-80 z-30" : "z-10"
                    } ${getPriorityColor(task.priority)}`}
                    style={{
                      left: pos.x,
                      width: pos.width,
                      opacity: task.status === "COMPLETE" ? 0.5 : 1,
                    }}
                    onMouseDown={(e) => handleDragStart(e, task.id, "move")}
                  >
                    {/* Resize handles */}
                    {canManage && (
                      <>
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, task.id, "resize-left");
                          }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, task.id, "resize-right");
                          }}
                        />
                      </>
                    )}
                    
                    {/* Task label */}
                    <div className="px-2 h-full flex items-center overflow-hidden">
                      <span className="text-white text-xs font-medium truncate drop-shadow">
                        {task.name}
                      </span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div
                    className={`absolute top-2 right-1 w-2 h-2 rounded-full ${getStatusColor(task.status)} border border-white`}
                    style={{ zIndex: 11 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Priority:</span>
          <span className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-gray-600">Urgent</span>
          <span className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-gray-600">High</span>
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-600">Medium</span>
          <span className="w-3 h-3 rounded bg-gray-400" />
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Today:</span>
          <span className="w-3 h-3 rounded-full bg-red-500" />
        </div>
        {canManage && (
          <span className="text-xs text-gray-400 italic ml-auto">
            Drag tasks to reschedule
          </span>
        )}
      </div>
    </div>
  );
}
