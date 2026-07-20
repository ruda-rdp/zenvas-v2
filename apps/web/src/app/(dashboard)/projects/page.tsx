"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  name: string;
  description: string;
  posterUrl: string;
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
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);

  const canCreateProject = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";

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

  function openDescription(project: Project) {
    setSelectedProject(project);
    setShowDescriptionModal(true);
  }

  function openPosterSettings(project: Project) {
    setSelectedProject(project);
    setShowPosterModal(true);
  }

  function getAspectClass(aspect: string) {
    switch (aspect) {
      case "16:9": return "aspect-video";
      case "4:3": return "aspect-[4/3]";
      case "1:1": return "aspect-square";
      default: return "aspect-video";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "ON_HOLD": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getProjectName(project: Project) {
    return project.name || `${project.order.service.name} - ${project.order.client.name}`;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your creative projects</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${viewMode === "grid" ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${viewMode === "list" ? "bg-gray-200 dark:bg-gray-700" : "bg-white dark:bg-gray-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>

          {/* Create Button - Only for Owner/Manager */}
          {canCreateProject && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid View (DaVinci Resolve Style) */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Projects are created when an Order is confirmed and DP is received.
          </p>
          <Link
            href="/orders"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Orders
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View - Poster Style */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Poster */}
              <Link href={`/projects/${project.id}`} className="block">
                <div className={`relative ${getAspectClass(project.posterAspect)} bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                  {project.posterUrl ? (
                    <img 
                      src={project.posterUrl} 
                      alt={getProjectName(project)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-white text-4xl font-bold opacity-50">
                        {getProjectName(project).charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Progress overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${getProgress(project)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <Link href={`/projects/${project.id}`} className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {getProjectName(project)}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {project.order.client.name}
                    </p>
                  </Link>
                  
                  {/* 3-dot menu */}
                  <div className="relative">
                    <button 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProject(project);
                      }}
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                      <button 
                        onClick={() => openDescription(project)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        View Description
                      </button>
                      <button 
                        onClick={() => openPosterSettings(project)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Change Poster
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Status badge */}
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(project.order.status)}`}>
                  {project.order.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-4"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className={`w-32 h-20 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 ${getAspectClass(project.posterAspect)}`}>
                  {project.posterUrl ? (
                    <img src={project.posterUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-white text-xl font-bold opacity-50">{getProjectName(project).charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getProjectName(project)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.order.client.name} • {project.order.service.name}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(project.order.status)}`}>
                      {project.order.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  {/* Progress */}
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${getProgress(project)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{getProgress(project)}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && selectedProject && (
        <Modal title="Project Description" onClose={() => setShowDescriptionModal(false)}>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {getProjectName(selectedProject)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedProject.description || "No description provided."}
            </p>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                <strong>Client:</strong> {selectedProject.order.client.name}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Service:</strong> {selectedProject.order.service.name}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Brand:</strong> {selectedProject.order.brand.name}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Stages:</strong> {selectedProject.stages.length}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Poster Settings Modal */}
      {showPosterModal && selectedProject && (
        <PosterModal 
          project={selectedProject} 
          onClose={() => setShowPosterModal(false)}
          onSave={() => {
            setShowPosterModal(false);
            fetchProjects();
          }}
        />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

// Modal Component
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Poster Settings Modal
function PosterModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: () => void }) {
  const [posterUrl, setPosterUrl] = useState(project.posterUrl || "");
  const [aspect, setAspect] = useState(project.posterAspect || "16:9");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterUrl, posterAspect: aspect }),
      });
      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving poster:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Poster Settings" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poster URL</label>
          <input
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://example.com/poster.jpg"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aspect Ratio</label>
          <div className="flex gap-2">
            {["16:9", "4:3", "1:1"].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspect(ratio)}
                className={`flex-1 py-2 rounded-lg border ${
                  aspect === ratio 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600" 
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </Modal>
  );
}

// Create Project Modal - Solo mode (no order required)
function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [posterAspect, setPosterAspect] = useState("16:9");
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPosterPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          type: file.type,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosterUrl(data.url);
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      alert("Please enter a project name");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          description: description.trim() || undefined,
          posterUrl: posterUrl || undefined,
          posterAspect 
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create Project" onClose={onClose}>
      <div className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Project"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project notes..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {/* Poster Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Poster Image <span className="text-gray-400">(optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            {posterPreview || posterUrl ? (
              <div className="relative">
                <img 
                  src={posterPreview || posterUrl} 
                  alt="Poster preview" 
                  className={`mx-auto max-h-32 rounded ${getAspectClass(posterAspect)} w-auto`}
                />
                <button
                  onClick={() => { setPosterPreview(null); setPosterUrl(""); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="text-gray-500 dark:text-gray-400">
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">📷</div>
                      <span className="text-sm">Click to upload poster</span>
                    </>
                  )}
                </div>
              </label>
            )}
          </div>
        </div>
        
        {/* Poster Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Poster Aspect Ratio
          </label>
          <div className="flex gap-2">
            {["16:9", "4:3", "1:1"].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setPosterAspect(ratio)}
                className={`flex-1 py-2 rounded-lg border ${
                  posterAspect === ratio 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600" 
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        
        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={saving || !name.trim()}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Project"}
        </button>
      </div>
    </Modal>
  );
}

// Helper: Convert file to base64
function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Get aspect ratio class
function getAspectClass(aspect: string) {
  switch (aspect) {
    case "16:9": return "aspect-video";
    case "4:3": return "aspect-[4/3]";
    case "1:1": return "aspect-square";
    default: return "aspect-video";
  }
}
