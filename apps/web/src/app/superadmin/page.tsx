"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Edit, Trash2,
  Users, Building2, Layers, FolderKanban,
  X, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Eye,
  Shield
} from "lucide-react";

// Types
interface Stats {
  organizations: number;
  users: number;
  brands: number;
  projects: number;
  tasks: number;
  orders: number;
  leads: number;
  trends: {
    newOrgsLast30Days: number;
    newUsersLast30Days: number;
    newProjectsLast30Days: number;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  apps: string[];
  createdAt: string;
  _count: { brands: number; users: number };
  brands?: Brand[];
  users?: User[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  logoUrl: string | null;
  domain: string | null;
  freeSubdomain: string | null;
  hasClientPortal: boolean;
  createdAt: string;
  organization?: { id: string; name: string };
  _count?: { projects: number; clients: number; orders: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employmentType: string;
  createdAt: string;
  isActive: boolean;
  organization?: { id: string; name: string };
  _count?: { tasks: number; leads: number };
}

interface AuditLog {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Modal Component
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Confirm Dialog
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDanger = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded-lg ${isDanger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

// Stats Card Component
function StatCard({ label, value, trend, icon: Icon, color }: {
  label: string;
  value: number;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(trend)}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

// Role Badge
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PRODUCER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    EDITOR: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role] || styles.EDITOR}`}>
      {role}
    </span>
  );
}

// Pagination Controls
function Pagination({ pagination, onPageChange }: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "organizations" | "users" | "brands" | "audit">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  // Modal states
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showOrgDetailModal, setShowOrgDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: "org" | "user" | "brand"; id: string; name: string } | null>(null);

  // Create form states
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgPlan, setNewOrgPlan] = useState("starter");

  const isSuperAdmin = session?.user?.email?.toLowerCase() === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.toLowerCase();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data.stats);
    } catch {
      console.error("Failed to fetch stats");
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await fetch("/api/superadmin/hierarchy");
      if (!res.ok) throw new Error("Failed to fetch organizations");
      const data = await res.json();
      setOrganizations(data.organizations || []);
    } catch {
      console.error("Failed to fetch organizations");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);
      if (orgFilter) params.set("organizationId", orgFilter);
      params.set("page", pagination.page.toString());

      const res = await fetch(`/api/superadmin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      console.error("Failed to fetch users");
    }
  }, [searchQuery, roleFilter, orgFilter, pagination.page]);

  const fetchBrands = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (orgFilter) params.set("organizationId", orgFilter);
      params.set("page", pagination.page.toString());

      const res = await fetch(`/api/superadmin/brands?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch brands");
      const data = await res.json();
      setBrands(data.brands || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      console.error("Failed to fetch brands");
    }
  }, [searchQuery, orgFilter, pagination.page]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/superadmin/audit?page=${pagination.page}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      const data = await res.json();
      setAuditLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      console.error("Failed to fetch audit logs");
    }
  }, [pagination.page]);

  // Initial data fetch
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && !isSuperAdmin) {
      setError("Access denied. You are not a super admin.");
      setLoading(false);
      return;
    }

    if (status === "authenticated" && isSuperAdmin) {
      setLoading(false);
      fetchStats();
      fetchOrganizations();
    }
  }, [status, isSuperAdmin, router, fetchStats, fetchOrganizations]);

  // Tab-specific data fetch
  useEffect(() => {
    if (!loading) {
      if (activeTab === "users") fetchUsers();
      if (activeTab === "brands") fetchBrands();
      if (activeTab === "audit") fetchAuditLogs();
    }
  }, [activeTab, loading, fetchUsers, fetchBrands, fetchAuditLogs]);

  // CRUD Handlers
  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      const res = await fetch("/api/superadmin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName, plan: newOrgPlan }),
      });
      if (res.ok) {
        setShowCreateOrgModal(false);
        setNewOrgName("");
        fetchOrganizations();
        fetchStats();
      }
    } catch {
      alert("Failed to create organization");
    }
  };

  const handleUpdateOrg = async () => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/superadmin/organizations/${selectedOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedOrg.name,
          plan: selectedOrg.plan,
          apps: selectedOrg.apps
        }),
      });
      if (res.ok) {
        setSelectedOrg(null);
        fetchOrganizations();
        fetchStats();
      }
    } catch {
      alert("Failed to update organization");
    }
  };

  const handleDelete = async (type: "org" | "user" | "brand", id: string) => {
    const endpoint = type === "org"
      ? `/api/superadmin/organizations/${id}`
      : type === "user"
        ? `/api/superadmin/users/${id}`
        : `/api/superadmin/brands/${id}`;

    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteConfirm(null);
        if (type === "org") fetchOrganizations();
        if (type === "user") fetchUsers();
        if (type === "brand") fetchBrands();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedUser.role,
          organizationId: selectedUser.organization?.id,
          isActive: selectedUser.isActive,
        }),
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchUsers();
      }
    } catch {
      alert("Failed to update user");
    }
  };

  const handleUpdateBrand = async () => {
    if (!selectedBrand) return;
    try {
      const res = await fetch(`/api/superadmin/brands/${selectedBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedBrand.name,
          primaryColor: selectedBrand.primaryColor,
          hasClientPortal: selectedBrand.hasClientPortal,
        }),
      });
      if (res.ok) {
        setSelectedBrand(null);
        fetchBrands();
      }
    } catch {
      alert("Failed to update brand");
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <div className="text-red-500 text-xl mb-2">Access Denied</div>
        <p className="text-gray-600">{error || "You do not have super admin access."}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Panel</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Full platform management and monitoring</p>
          </div>
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-medium text-blue-600">{session?.user?.email}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Organizations" value={stats.organizations} trend={stats.trends.newOrgsLast30Days} icon={Building2} color="bg-blue-100 text-blue-600" />
          <StatCard label="Users" value={stats.users} trend={stats.trends.newUsersLast30Days} icon={Users} color="bg-green-100 text-green-600" />
          <StatCard label="Brands" value={stats.brands} icon={Layers} color="bg-purple-100 text-purple-600" />
          <StatCard label="Projects" value={stats.projects} trend={stats.trends.newProjectsLast30Days} icon={FolderKanban} color="bg-orange-100 text-orange-600" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {(["overview", "organizations", "users", "brands", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPagination(p => ({ ...p, page: 1 })); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar for list tabs */}
      {(activeTab === "users" || activeTab === "brands") && (
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {activeTab === "users" && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="PRODUCER">Producer</option>
              <option value="EDITOR">Editor</option>
            </select>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organizations Overview</h2>
            <button
              onClick={() => setShowCreateOrgModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Organization
            </button>
          </div>

          <div className="grid gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 flex justify-between items-start border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{org.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{org.plan}</span>
                      <span>{org._count.users} users</span>
                      <span>{org._count.brands} brands</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedOrg(org); setShowOrgDetailModal(true); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm({ type: "org", id: org.id, name: org.name })} className="p-2 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {organizations.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No organizations yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Organization</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Joined</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                          {user.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.organization?.name || "-"}</td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm({ type: "user", id: user.id, name: user.name || user.email })} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => setPagination(p => ({ ...p, page }))} />
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === "brands" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Brand</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Organization</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Color</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Projects</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: brand.primaryColor }} />
                        <span className="font-medium text-gray-900 dark:text-white">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{brand.organization?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{brand.primaryColor}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{brand._count?.projects || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(brand.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedBrand(brand); setShowBrandModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm({ type: "brand", id: brand.id, name: brand.name })} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => setPagination(p => ({ ...p, page }))} />
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Action</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Entity</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">{log.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.entityType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{log.user?.name || "System"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(page) => setPagination(p => ({ ...p, page }))} />
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal isOpen={showCreateOrgModal} onClose={() => setShowCreateOrgModal(false)} title="Create Organization" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g., Acme Corp"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
            <select
              value={newOrgPlan}
              onChange={(e) => setNewOrgPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => setShowCreateOrgModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button onClick={handleCreateOrg} disabled={!newOrgName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* User Edit Modal */}
      <Modal isOpen={showUserModal && !!selectedUser} onClose={() => { setShowUserModal(false); setSelectedUser(null); }} title="Edit User" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-medium">
                {selectedUser.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</div>
                <div className="text-sm text-gray-500">{selectedUser.email}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="OWNER">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="PRODUCER">Producer</option>
                <option value="EDITOR">Editor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
              <select
                value={selectedUser.organization?.id || ""}
                onChange={(e) => setSelectedUser({ ...selectedUser, organization: { id: e.target.value, name: "" } })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={selectedUser.isActive}
                onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setShowUserModal(false); setSelectedUser(null); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Brand Edit Modal */}
      <Modal isOpen={showBrandModal && !!selectedBrand} onClose={() => { setShowBrandModal(false); setSelectedBrand(null); }} title="Edit Brand" size="sm">
        {selectedBrand && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={selectedBrand.name}
                onChange={(e) => setSelectedBrand({ ...selectedBrand, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBrand.primaryColor}
                  onChange={(e) => setSelectedBrand({ ...selectedBrand, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={selectedBrand.primaryColor}
                  onChange={(e) => setSelectedBrand({ ...selectedBrand, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasClientPortal"
                checked={selectedBrand.hasClientPortal}
                onChange={(e) => setSelectedBrand({ ...selectedBrand, hasClientPortal: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="hasClientPortal" className="text-sm text-gray-700 dark:text-gray-300">Has Client Portal</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setShowBrandModal(false); setSelectedBrand(null); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button onClick={handleUpdateBrand} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal isOpen={true} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete" size="sm">
          <div className="text-center py-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to delete this {showDeleteConfirm.type}?
            </p>
            <p className="font-medium text-gray-900 dark:text-white">{showDeleteConfirm.name}</p>
            <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button onClick={() => handleDelete(showDeleteConfirm.type, showDeleteConfirm.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}