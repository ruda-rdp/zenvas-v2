"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Stats {
  organizations: number;
  users: number;
  brands: number;
  projects: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  createdAt: string;
  _count: { projects: number };
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  brands: Brand[];
  users: User[];
  _count: { brands: number; users: number };
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "organizations" | "users" | "brands">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  const isSuperAdmin = session?.user?.email?.toLowerCase() === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.toLowerCase();

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
      fetchData();
    }
  }, [status, isSuperAdmin, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/superadmin/hierarchy");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setStats(data.stats);
      setOrganizations(data.organizations || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("/api/superadmin/users");
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const fetchAllBrands = async () => {
    try {
      const res = await fetch("/api/superadmin/brands");
      const data = await res.json();
      setAllBrands(data.brands || []);
    } catch (err) {
      console.error("Failed to fetch brands");
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchAllUsers();
    if (activeTab === "brands") fetchAllBrands();
  }, [activeTab]);

  const toggleOrg = (orgId: string) => {
    const newSet = new Set(expandedOrgs);
    if (newSet.has(orgId)) {
      newSet.delete(orgId);
    } else {
      newSet.add(orgId);
    }
    setExpandedOrgs(newSet);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/superadmin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        fetchAllUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/superadmin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchData();
        fetchAllUsers();
        setShowUserModal(false);
      }
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm("Are you sure? This will delete ALL data for this organization!")) return;
    try {
      const res = await fetch(`/api/superadmin/organizations/${orgId}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete organization");
      }
    } catch (err) {
      alert("Failed to delete organization");
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
        <div className="text-red-500 text-xl mb-2">⚠️ Access Denied</div>
        <p className="text-gray-600">{error || "You do not have super admin access."}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔐</span>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
        </div>
        <p className="text-gray-600">Full platform management and monitoring.</p>
        <div className="mt-2 text-sm text-green-600">Logged in as: {session?.user?.email}</div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.organizations}</div>
            <div className="text-gray-600 text-sm">Organizations</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.users}</div>
            <div className="text-gray-600 text-sm">Users</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-purple-600">{stats.brands}</div>
            <div className="text-gray-600 text-sm">Brands</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-orange-600">{stats.projects}</div>
            <div className="text-gray-600 text-sm">Projects</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "overview" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"}`}>Hierarchy</button>
        <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"}`}>Users</button>
        <button onClick={() => setActiveTab("brands")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "brands" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"}`}>Brands</button>
      </div>

      {/* Hierarchy View */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-xl shadow border overflow-hidden">
              {/* Org Header */}
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleOrg(org.id)} className="text-gray-500 hover:text-gray-700">
                    {expandedOrgs.has(org.id) ? "▼" : "▶"}
                  </button>
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <div className="text-sm text-gray-500">
                      {org._count.brands} brands · {org._count.users} users
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-gray-400">{new Date(org.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => handleDeleteOrg(org.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm">Delete</button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedOrgs.has(org.id) && (
                <div className="p-4 space-y-6">
                  {/* Brands Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">🏷️ Brands</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {org.brands.length === 0 ? (
                        <p className="text-gray-400 text-sm">No brands</p>
                      ) : (
                        org.brands.map((brand) => (
                          <div key={brand.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded" style={{ backgroundColor: brand.primaryColor || "#2563EB" }} />
                            <div>
                              <div className="font-medium">{brand.name}</div>
                              <div className="text-xs text-gray-500">{brand._count.projects} projects</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Users Section */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">👥 Users</h4>
                    <div className="space-y-2">
                      {org.users.length === 0 ? (
                        <p className="text-gray-400 text-sm">No users</p>
                      ) : (
                        org.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                                {user.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === "OWNER" ? "bg-purple-100 text-purple-700" :
                                user.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                                user.role === "PRODUCER" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>{user.role}</span>
                              <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm">Edit</button>
                              <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm">Delete</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {organizations.length === 0 && (
            <div className="text-center py-12 text-gray-500">No organizations yet</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow border p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-gray-600">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === "OWNER" ? "bg-purple-100 text-purple-700" :
                      user.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                      user.role === "PRODUCER" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>{user.role}</span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm">Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === "brands" && (
        <div className="bg-white rounded-xl shadow border p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Brand</th>
                <th className="pb-3">Color</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {allBrands.map((brand) => (
                <tr key={brand.id} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: brand.primaryColor || "#2563EB" }} />
                      <span className="font-medium">{brand.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{brand.primaryColor || "#2563EB"}</td>
                  <td className="py-3 text-sm text-gray-500">{new Date(brand.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Edit User: {selectedUser.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="PRODUCER">Producer</option>
                  <option value="EDITOR">Editor</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
