"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
    };
    brand: {
      name: string;
    };
  } | null;
  brand: {
    id: string;
    name: string;
  } | null;
  stages: Array<{
    id: string;
    name: string;
    tasks: Array<{
      id: string;
      status: string;
    }>;
  }>;
}

type FilterTab = "all" | "in_progress" | "on_track" | "at_risk" | "on_hold";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const canCreateProject = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, activeTab, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(projectId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProjects();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  function filterProjects() {
    let filtered = [...projects];

    if (activeTab !== "all") {
      filtered = filtered.filter((p) => {
        const progress = getProgress(p);
        const status = p.order?.status || "IN_PROGRESS";
        switch (activeTab) {
          case "in_progress":
            return status === "IN_PROGRESS";
          case "on_track":
            return progress >= 50 && status !== "ON_HOLD";
          case "at_risk":
            return progress < 30 && status !== "COMPLETED";
          case "on_hold":
            return status === "ON_HOLD";
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const name = getProjectName(p).toLowerCase();
        const client = p.order?.client.name.toLowerCase() || "";
        return name.includes(query) || client.includes(query);
      });
    }

    setFilteredProjects(filtered);
  }

  function getProgress(project: Project) {
    const totalTasks = project.stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
    const completedTasks = project.stages.reduce(
      (sum, stage) => sum + stage.tasks.filter((t) => t.status === "COMPLETE").length,
      0
    );
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }

  function getTotalTasks(project: Project) {
    return project.stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
  }

  function getProjectName(project: Project) {
    if (project.name) return project.name;
    if (project.order) return `${project.order.service.name} - ${project.order.client.name}`;
    return "Untitled Project";
  }

  function getStatusBadge(project: Project) {
    const progress = getProgress(project);
    const status = project.order?.status || "IN_PROGRESS";

    if (status === "ON_HOLD") {
      return { label: "On Hold", class: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
    }
    if (status === "COMPLETED") {
      return { label: "Completed", class: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" };
    }
    if (progress < 30 && progress > 0) {
      return { label: "At Risk", class: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
    }
    if (progress >= 50) {
      return { label: "On Track", class: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    }
    return { label: "In Progress", class: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" };
  }

  function getProgressColor(progress: number) {
    if (progress < 30) return "bg-red-500";
    if (progress < 50) return "bg-orange-500";
    return "bg-blue-500";
  }

  function getStats() {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.order?.status === "IN_PROGRESS").length;
    const onTrack = projects.filter((p) => {
      const progress = getProgress(p);
      return progress >= 50 && p.order?.status !== "ON_HOLD";
    }).length;
    const atRisk = projects.filter((p) => {
      const progress = getProgress(p);
      return progress < 30 && progress > 0 && p.order?.status !== "COMPLETED";
    }).length;
    return { total, inProgress, onTrack, atRisk };
  }

  const stats = getStats();

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "in_progress", label: "In Progress", count: stats.inProgress },
    { id: "on_track", label: "On Track", count: stats.onTrack },
    { id: "at_risk", label: "At Risk", count: stats.atRisk },
    { id: "on_hold", label: "On Hold", count: projects.filter((p) => p.order?.status === "ON_HOLD").length },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your creative projects</p>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">In Progress</div>
          <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">On Track</div>
          <div className="text-3xl font-bold text-green-600">{stats.onTrack}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">At Risk</div>
          <div className="text-3xl font-bold text-red-600">{stats.atRisk}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex justify-between items-center">
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid View - Card Style */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery ? "Try adjusting your search or filters." : "Start your creative journey by creating your first project."}
            </p>
            {canCreateProject && !searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {filteredProjects.map((project) => {
              const statusBadge = getStatusBadge(project);
              const progress = getProgress(project);
              
              return (
                <div
                  key={project.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Poster/Thumbnail - Landscape */}
                  <Link href={`/projects/${project.id}`} className="block">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                      {project.posterUrl ? (
                        <img src={project.posterUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-white text-4xl font-bold opacity-50">
                            {getProjectName(project).charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Progress Bar at Bottom of Poster */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600">
                        <div
                          className={`h-full ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {/* Status Badge Overlay */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/projects/${project.id}`} className="block">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate hover:text-blue-600 dark:hover:text-blue-400">
                            {getProjectName(project)}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {project.order?.client.name || project.brand?.name || ""}
                        </p>
                      </div>
                      
                      {/* Actions Menu */}
                      <div className="relative" ref={showActionsMenu === project.id ? actionsMenuRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsMenu(showActionsMenu === project.id ? null : project.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2-.9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                          </svg>
                        </button>
                        
                        {showActionsMenu === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Open
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setShowDescriptionModal(true);
                                setShowActionsMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button 
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this project?")) {
                                  deleteProject(project.id);
                                }
                                setShowActionsMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{project.stages.length} stages</span>
                      <span>•</span>
                      <span>{getTotalTasks(project)} tasks</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}

      {/* Description Modal */}
      {showDescriptionModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDescriptionModal(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h2>
              <button onClick={() => setShowDescriptionModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-xl">{getProjectName(selectedProject)}</h3>
                <span className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedProject).class}`}>
                  {getStatusBadge(selectedProject).label}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedProject.description || "No description provided."}
              </p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Stages</span>
                  <span className="text-sm text-gray-900 dark:text-white">{selectedProject.stages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tasks</span>
                  <span className="text-sm text-gray-900 dark:text-white">{getTotalTasks(selectedProject)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm text-gray-900 dark:text-white">{getProgress(selectedProject)}%</span>
                </div>
                {selectedProject.order && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Client</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedProject.order.client.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Service</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedProject.order.service.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Project Modal
function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [posterAspect, setPosterAspect] = useState("16:9");
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, filename: file.name, type: file.type }),
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
          posterAspect,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Poster Image <span className="text-gray-400">(optional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {posterPreview || posterUrl ? (
                <div className="relative inline-block">
                  <img src={posterPreview || posterUrl} alt="Preview" className="h-24 rounded mx-auto" />
                  <button
                    onClick={() => { setPosterPreview(null); setPosterUrl(""); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  <div className="text-gray-500 dark:text-gray-400">
                    {uploading ? <span>Uploading...</span> : <><div className="text-2xl mb-1">📷</div><span className="text-sm">Click to upload</span></>}
                  </div>
                </label>
              )}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
