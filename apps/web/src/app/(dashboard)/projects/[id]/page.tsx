"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Task {
  id: string;
  name: string;
  status: string;
  category: string | null;
  assignee: { id: string; name: string } | null;
  payoutAmount: number | null;
  expectedDurationMinutes: number;
  startedAt: string | null;
  completedAt: string | null;
  clientVisible: boolean;
  children: Task[];
}

interface Stage {
  id: string;
  name: string;
  order: number;
  tasks: Task[];
}

interface Project {
  id: string;
  createdAt: string;
  order: {
    id: string;
    status: string;
    client: { name: string };
    service: { name: string; price: number };
    brand: { name: string };
  };
  stages: Stage[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  async function fetchProject() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        fetchProject(); // Refresh
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  function getProgress(stage: Stage) {
    if (stage.tasks.length === 0) return 0;
    const completed = stage.tasks.filter(t => t.status === "COMPLETE").length;
    return Math.round((completed / stage.tasks.length) * 100);
  }

  function getOverallProgress() {
    if (!project) return 0;
    const totalTasks = project.stages.reduce((sum, s) => sum + s.tasks.length, 0);
    if (totalTasks === 0) return 0;
    const completedTasks = project.stages.reduce(
      (sum, s) => sum + s.tasks.filter(t => t.status === "COMPLETE").length, 0
    );
    return Math.round((completedTasks / totalTasks) * 100);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Project not found</h2>
        <Link href="/projects" className="text-blue-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Back to Projects
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.order.service.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {project.order.client.name} • {project.order.brand.name}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            project.order.status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {project.order.status.replace("_", " ")}
          </span>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold">{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {project.stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{stage.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {stage.tasks.filter(t => t.status === "COMPLETE").length}/{stage.tasks.length} tasks
                  </span>
                  <span className="text-sm font-medium">{getProgress(stage)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${getProgress(stage)}%` }}
                />
              </div>
            </div>

            <div className="divide-y">
              {stage.tasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <button
                    onClick={() => {
                      const newStatus = task.status === "COMPLETE" ? "OPEN" : "COMPLETE";
                      updateTaskStatus(task.id, newStatus);
                    }}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === "COMPLETE"
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {task.status === "COMPLETE" && "✓"}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${task.status === "COMPLETE" ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {task.name}
                      </span>
                      {!task.clientVisible && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      {task.assignee && (
                        <span>👤 {task.assignee.name}</span>
                      )}
                      <span>⏱️ {task.expectedDurationMinutes} min</span>
                      {task.category && (
                        <span className="capitalize">{task.category.replace("_", " ")}</span>
                      )}
                    </div>
                  </div>

                  {task.children.length > 0 && (
                    <div className="ml-8 space-y-2 mt-2">
                      {task.children.map((child) => (
                        <div key={child.id} className="flex items-center gap-3 text-sm">
                          <div className={`w-4 h-4 rounded border ${child.status === "COMPLETE" ? "bg-green-500 border-green-500" : "border-gray-300"}`} />
                          <span className={child.status === "COMPLETE" ? "line-through text-gray-400" : ""}>
                            {child.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
