"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import ChatWidget from "@/components/chat/ChatWidget";

// Dynamic import for GanttChart to avoid SSR issues
const GanttChart = dynamic(() => import("@/components/gantt/GanttChart"), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Loading timeline...</div>
    </div>
  ),
});

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
  assignee: {
    id: string;
    name: string;
  } | null;
  children: Task[];
  payout: {
    id: string;
    amount: string;
    status: string;
  } | null;
}

interface Stage {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  posterUrl: string | null;
  posterAspect: string;
  createdAt: string;
  order: {
    id: string;
    status: string;
    client: {
      name: string;
    };
    service: {
      name: string;
      price: string;
    };
    brand: {
      name: string;
    };
  } | null;
  stages: Stage[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "preproduction" | "production" | "delivery">("overview");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const canManage = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";
  const isEditor = session?.user?.role === "EDITOR";

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${resolvedParams.id}`);
      if (!res.ok) {
        throw new Error("Project not found");
      }
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users?.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name })) || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchProject();
    if (canManage) {
      fetchUsers();
    }
  }, [resolvedParams.id, canManage, fetchProject, fetchUsers]);

  async function assignTask(taskId: string, userId: string, payoutAmount?: number) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, payoutAmount }),
      });
      if (res.ok) {
        setShowAssignModal(false);
        setSelectedTask(null);
        fetchProject();
      }
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  }

  async function completeTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  }

  async function addSubtask(parentTaskId: string, name: string, expectedDurationMinutes: number) {
    try {
      const res = await fetch(`/api/tasks/${parentTaskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, expectedDurationMinutes }),
      });
      if (res.ok) {
        setShowAddSubtaskModal(false);
        setEditingTask(null);
        fetchProject();
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  }

  function countTasksWithSubtasks(tasks: Task[]): { total: number; completed: number } {
    let total = 0;
    let completed = 0;

    function countTask(task: Task) {
      // Only count leaf tasks (tasks without children that are subtasks themselves)
      // For root tasks with children, count the children instead
      if (task.children.length === 0) {
        total++;
        if (task.status === "COMPLETE") completed++;
      } else {
        // For parent tasks, count all leaf descendants
        task.children.forEach(countTask);
      }
    }

    tasks.forEach(countTask);
    return { total, completed };
  }

  function getProgress() {
    if (!project) return 0;

    // Count all leaf tasks (including subtasks) across all stages
    let total = 0;
    let completed = 0;

    project.stages.forEach(stage => {
      const { total: stageTotal, completed: stageCompleted } = countTasksWithSubtasks(stage.tasks);
      total += stageTotal;
      completed += stageCompleted;
    });

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  function getStageProgress(stage: Stage) {
    const { total, completed } = countTasksWithSubtasks(stage.tasks);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "OPEN": return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "COMPLETE": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  function getCategoryBadge(category: string | null) {
    switch (category) {
      case "PRE_PRODUCTION": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "PRODUCTION": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "POST_PRODUCTION": return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <Link href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Projects
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/projects" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Projects
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              {project.order && (
                <>
                  <span>{project.order.client.name}</span>
                  <span>•</span>
                  <span>{project.order.service.name}</span>
                  {session?.user?.role !== "EDITOR" && (
                    <>
                      <span>•</span>
                      <span className="font-medium">Rp {parseFloat(project.order.service.price).toLocaleString()}</span>
                    </>
                  )}
                </>
              )}
              {!project.order && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs">
                  Project
                </span>
              )}
            </div>
          </div>
          
          {/* Progress */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{getProgress()}%</div>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - DaVinci Resolve Style */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("preproduction")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "preproduction"
                ? "border-purple-600 text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            🎬 Pre-Production
          </button>
          <button
            onClick={() => setActiveTab("production")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "production"
                ? "border-orange-600 text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            🎥 Production
          </button>
          <button
            onClick={() => setActiveTab("delivery")}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "delivery"
                ? "border-green-600 text-green-600 bg-green-50 dark:bg-green-900/20"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            📦 Delivery
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        /* Overview Dashboard */
        <ProjectOverviewDashboard project={project} />
      ) : activeTab === "preproduction" ? (
        /* Pre-Production - Tasks + Apps */
        <ProductionStageView
          project={project}
          stage="PRE_PRODUCTION"
          apps={["scriptwriter", "storyboard", "canvas", "cadrage", "shotlist"]}
          tasks={project.stages.flatMap(s => s.tasks).filter(t => !t.parentTaskId)}
          isEditor={isEditor}
          canManage={canManage}
          onViewDetails={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          onAssign={(task) => { setSelectedTask(task); setShowAssignModal(true); }}
          onComplete={completeTask}
          onAddSubtask={(task) => { setEditingTask(task); setShowAddSubtaskModal(true); }}
          getStatusBadge={getStatusBadge}
          getCategoryBadge={getCategoryBadge}
        />
      ) : activeTab === "production" ? (
        /* Production - Tasks + Apps */
        <ProductionStageView
          project={project}
          stage="PRODUCTION"
          apps={["callsheets", "shotlogger"]}
          tasks={project.stages.flatMap(s => s.tasks).filter(t => !t.parentTaskId)}
          isEditor={isEditor}
          canManage={canManage}
          onViewDetails={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          onAssign={(task) => { setSelectedTask(task); setShowAssignModal(true); }}
          onComplete={completeTask}
          onAddSubtask={(task) => { setEditingTask(task); setShowAddSubtaskModal(true); }}
          getStatusBadge={getStatusBadge}
          getCategoryBadge={getCategoryBadge}
        />
      ) : activeTab === "delivery" ? (
        /* Delivery - Tasks + Apps */
        <ProductionStageView
          project={project}
          stage="POST_PRODUCTION"
          apps={["reviewlinks", "deliverables"]}
          tasks={project.stages.flatMap(s => s.tasks).filter(t => !t.parentTaskId)}
          isEditor={isEditor}
          canManage={canManage}
          onViewDetails={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          onAssign={(task) => { setSelectedTask(task); setShowAssignModal(true); }}
          onComplete={completeTask}
          onAddSubtask={(task) => { setEditingTask(task); setShowAddSubtaskModal(true); }}
          getStatusBadge={getStatusBadge}
          getCategoryBadge={getCategoryBadge}
        />
      ) : null}

      {/* Chat Widget for collaboration */}
      <ChatWidget projectId={project.id} />

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
          canManage={canManage}
          isEditor={isEditor}
          onAssign={() => { setShowTaskModal(false); setShowAssignModal(true); }}
          onComplete={() => { completeTask(selectedTask.id); setShowTaskModal(false); }}
          onAddSubtask={() => { setShowTaskModal(false); setShowAddSubtaskModal(true); }}
          getStatusBadge={getStatusBadge}
          getCategoryBadge={getCategoryBadge}
        />
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedTask && (
        <AssignTaskModal
          task={selectedTask}
          users={users}
          onClose={() => { setShowAssignModal(false); setSelectedTask(null); }}
          onAssign={assignTask}
        />
      )}

      {/* Add Subtask Modal */}
      {showAddSubtaskModal && editingTask && (
        <AddSubtaskModal
          parentTask={editingTask}
          onClose={() => { setShowAddSubtaskModal(false); setEditingTask(null); }}
          onAdd={addSubtask}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  isEditor,
  canManage,
  onViewDetails,
  onAssign,
  onComplete,
  onAddSubtask,
  getStatusBadge,
  getCategoryBadge,
}: {
  task: Task;
  isEditor: boolean;
  canManage: boolean;
  onViewDetails: () => void;
  onAssign: () => void;
  onComplete: () => void;
  onAddSubtask: () => void;
  getStatusBadge: (s: string) => string;
  getCategoryBadge: (c: string | null) => string;
}) {
  return (
    <div 
      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white text-sm">{task.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusBadge(task.status)}`}>
              {task.status.replace("_", " ")}
            </span>
            {task.category && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${getCategoryBadge(task.category)}`}>
                {task.category.replace("_", " ")}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            {task.assignee ? (
              <span>👤 {task.assignee.name}</span>
            ) : (
              <span className="text-orange-500">Unassigned</span>
            )}
            <span>⏱️ {task.expectedDurationMinutes}m</span>
            {task.children.length > 0 && (
              <span>📋 {task.children.length} subtask{task.children.length > 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {isEditor && task.assigneeUserId && task.status !== "COMPLETE" && (
            <button
              onClick={onComplete}
              className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
              title="Complete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          
          {canManage && !task.assignee && (
            <button
              onClick={onAssign}
              className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
              title="Assign task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
          
          {canManage && (
            <button
              onClick={onAddSubtask}
              className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Add subtask"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Subtasks preview */}
      {task.children.length > 0 && (
        <div className="mt-2 pl-4 border-l-2 border-gray-300 dark:border-gray-600 space-y-1">
          {task.children.slice(0, 3).map((child) => (
            <div key={child.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className={child.status === "COMPLETE" ? "line-through" : ""}>{child.name}</span>
              <span className={`px-1 py-0.5 rounded ${getStatusBadge(child.status)}`}>
                {child.status === "COMPLETE" ? "✓" : "○"}
              </span>
            </div>
          ))}
          {task.children.length > 3 && (
            <div className="text-xs text-gray-400">+{task.children.length - 3} more</div>
          )}
        </div>
      )}
    </div>
  );
}

// Task Details Modal
function TaskDetailsModal({
  task,
  onClose,
  canManage,
  isEditor,
  onAssign,
  onComplete,
  onAddSubtask,
  getStatusBadge,
  getCategoryBadge,
}: {
  task: Task;
  onClose: () => void;
  canManage: boolean;
  isEditor: boolean;
  onAssign: () => void;
  onComplete: () => void;
  onAddSubtask: () => void;
  getStatusBadge: (s: string) => string;
  getCategoryBadge: (c: string | null) => string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-xl">{task.name}</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-sm ${getStatusBadge(task.status)}`}>
                  {task.status.replace("_", " ")}
                </span>
                {task.category && (
                  <span className={`px-2 py-1 rounded text-sm ${getCategoryBadge(task.category)}`}>
                    {task.category.replace("_", " ")}
                  </span>
                )}
                <span className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {task.expectedDurationMinutes}m
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Assignee</label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {task.assignee?.name || "Unassigned"}
                </p>
              </div>
              {task.payoutAmount && !isEditor && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Payout</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    Rp {parseFloat(task.payoutAmount).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            {task.children.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Subtasks ({task.children.length})
                  </label>
                  {canManage && (
                    <button
                      onClick={onAddSubtask}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {task.children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        child.status === "COMPLETE" 
                          ? "bg-green-500 text-white" 
                          : "border border-gray-300 dark:border-gray-600"
                      }`}>
                        {child.status === "COMPLETE" ? "✓" : ""}
                      </span>
                      <span className={`flex-1 text-sm ${child.status === "COMPLETE" ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                        {child.name}
                      </span>
                      <span className="text-xs text-gray-400">{child.expectedDurationMinutes}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          {canManage && !task.assignee && (
            <button
              onClick={onAssign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign
            </button>
          )}
          {canManage && task.children.length === 0 && (
            <button
              onClick={onAddSubtask}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Add Subtask
            </button>
          )}
          {isEditor && task.assigneeUserId && task.status !== "COMPLETE" && (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Assign Task Modal
function AssignTaskModal({
  task,
  users,
  onClose,
  onAssign,
}: {
  task: Task;
  users: Array<{ id: string; name: string }>;
  onClose: () => void;
  onAssign: (taskId: string, userId: string, payoutAmount?: number) => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assign <strong>{task.name}</strong> to a team member.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Member
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select team member...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payout Amount (Rp)
            </label>
            <input
              type="number"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedUserId) {
                onAssign(task.id, selectedUserId, payoutAmount ? parseFloat(payoutAmount) : undefined);
              }
            }}
            disabled={!selectedUserId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Subtask Modal
function AddSubtaskModal({
  parentTask,
  onClose,
  onAdd,
}: {
  parentTask: Task;
  onClose: () => void;
  onAdd: (parentTaskId: string, name: string, expectedDurationMinutes: number) => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("60");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Subtask</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add a subtask to <strong>{parentTask.name}</strong>
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Review first draft"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expected Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim() && parseInt(duration) > 0) {
                onAdd(parentTask.id, name.trim(), parseInt(duration));
              }
            }}
            disabled={!name.trim() || parseInt(duration) <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add Subtask
          </button>
        </div>
      </div>
    </div>
  );
}

// Project Overview Dashboard Component
function ProjectOverviewDashboard({ project }: { project: Project }) {
  // Calculate stats
  const totalTasks = project.stages.reduce((acc, stage) => acc + stage.tasks.filter(t => !t.parentTaskId).length, 0);
  const completedTasks = project.stages.reduce((acc, stage) => acc + stage.tasks.filter(t => !t.parentTaskId && t.status === "COMPLETE").length, 0);
  const totalDuration = project.stages.reduce((acc, stage) => 
    acc + stage.tasks.reduce((tAcc, t) => tAcc + (t.parentTaskId ? 0 : t.expectedDurationMinutes), 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {project.stages.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stage Progress</h3>
        <div className="space-y-4">
          {project.stages.map((stage) => {
            const stageTotal = stage.tasks.filter(t => !t.parentTaskId).length;
            const stageCompleted = stage.tasks.filter(t => !t.parentTaskId && t.status === "COMPLETE").length;
            const stageProgress = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;
            
            return (
              <div key={stage.id} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600 dark:text-gray-400 truncate">{stage.name}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-500 dark:text-gray-400 text-right">
                  {stageProgress}%
                </div>
              </div>
            );
          })}
          {project.stages.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-center py-4">No stages yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium">Scriptwriter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Storyboard</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium">Shotlist</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Production Stage View Component
function ProductionStageView({
  project,
  stage,
  apps,
  tasks,
  isEditor,
  canManage,
  onViewDetails,
  onAssign,
  onComplete,
  onAddSubtask,
  getStatusBadge,
  getCategoryBadge,
}: {
  project: Project;
  stage: string;
  apps: string[];
  tasks: Task[];
  isEditor: boolean;
  canManage: boolean;
  onViewDetails: (task: Task) => void;
  onAssign: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onAddSubtask: (task: Task) => void;
  getStatusBadge: (status: string) => string;
  getCategoryBadge: (category: string | null) => string;
}) {
  const stageTasks = tasks.filter(t => t.category === stage || (!t.category && stage === "PRE_PRODUCTION"));
  
  // App definitions
  const appInfo: Record<string, { name: string; icon: string; color: string }> = {
    scriptwriter: { name: "Scriptwriter", icon: "📝", color: "purple" },
    storyboard: { name: "Storyboard", icon: "🎨", color: "orange" },
    canvas: { name: "Canvas", icon: "🟨", color: "blue" },
    cadrage: { name: "Cadrage", icon: "🎬", color: "cyan" },
    shotlist: { name: "Shotlist", icon: "📋", color: "green" },
    callsheets: { name: "Call Sheets", icon: "📅", color: "yellow" },
    shotlogger: { name: "Shot Logger", icon: "📹", color: "pink" },
    reviewlinks: { name: "Review Links", icon: "🔗", color: "indigo" },
    deliverables: { name: "Deliverables", icon: "📦", color: "emerald" },
  };

  return (
    <div className="space-y-6">
      {/* Apps Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {stage === "PRE_PRODUCTION" ? "Pre-Production Apps" : 
           stage === "PRODUCTION" ? "Production Apps" : "Delivery Apps"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {apps.map((app) => {
            const info = appInfo[app] || { name: app, icon: "📱", color: "gray" };
            return (
              <button
                key={app}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <span className="text-2xl">{info.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{info.name}</span>
                <span className="text-[10px] text-gray-400">Coming soon</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
        {stageTasks.length > 0 ? (
          <div className="space-y-2">
            {stageTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isEditor={isEditor}
                canManage={canManage}
                onViewDetails={() => onViewDetails(task)}
                onAssign={() => onAssign(task)}
                onComplete={() => onComplete(task.id)}
                onAddSubtask={() => onAddSubtask(task)}
                getStatusBadge={getStatusBadge}
                getCategoryBadge={getCategoryBadge}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No tasks for this stage</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tasks will appear here based on their category</p>
          </div>
        )}
      </div>
    </div>
  );
}
