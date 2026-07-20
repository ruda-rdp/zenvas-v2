"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Project {
  id: string;
  createdAt: string;
  order: {
    id: string;
    status: string;
    client: {
      name: string;
    };
    service: {
      name: string;
    };
    brand: {
      name: string;
    };
  };
  stages: Array<{
    id: string;
    name: string;
    tasks: Array<{
      id: string;
      status: string;
    }>;
  }>;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  async function fetchProjects() {
    setLoading(true);
    try {
      const url = filter === "all" 
        ? "/api/projects" 
        : `/api/projects?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  function getProgress(project: Project) {
    const totalTasks = project.stages.reduce(
      (sum, stage) => sum + stage.tasks.length, 
      0
    );
    const completedTasks = project.stages.reduce(
      (sum, stage) => sum + stage.tasks.filter(t => t.status === "COMPLETE").length, 
      0
    );
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  function getCurrentStage(project: Project) {
    for (const stage of project.stages) {
      const hasIncomplete = stage.tasks.some(t => t.status !== "COMPLETE");
      if (hasIncomplete) return stage.name;
    }
    return project.stages[project.stages.length - 1]?.name || "Unknown";
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your creative projects</p>
        </div>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Projects</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">
            Projects are created when an Order is confirmed and DP is received.
          </p>
          <Link
            href="/orders"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Orders
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.order.service.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {project.order.client.name} • {project.order.brand.name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  project.order.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-800"
                    : project.order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {project.order.status.replace("_", " ")}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    Stage: {getCurrentStage(project)}
                  </span>
                  <span className="font-medium">{getProgress(project)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getProgress(project)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-500">
                <span>{project.stages.length} stages</span>
                <span>•</span>
                <span>
                  {project.stages.reduce((sum, s) => sum + s.tasks.length, 0)} tasks
                </span>
                <span>•</span>
                <span>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
