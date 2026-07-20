"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Brand {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employmentType: string;
  brandAccess: { brandId: string }[];
}

interface NewUserForm {
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState("EDITOR");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({ name: "", email: "", role: "EDITOR" });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = session?.user?.role === "OWNER";

  useEffect(() => {
    fetchTeamData();
  }, []);

  async function fetchTeamData() {
    setLoading(true);
    try {
      const [usersRes, brandsRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/settings/organization"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.organization?.brands || []);
      }
    } catch (err) {
      console.error("Error fetching team data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createUser() {
    if (!newUser.name || !newUser.email) return;
    setCreating(true);
    try {
      // Generate invite code for the user
      const inviteRes = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newUser.role, count: 1 }),
      });

      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        const code = inviteData.inviteCodes[0];
        
        // TODO: Send email with invite link
        // For now, show the invite code
        alert(`User created! Invite code: ${code.code}\n\nShare this link: /register?code=${code.code}`);
        
        setShowAddModal(false);
        setNewUser({ name: "", email: "", role: "EDITOR" });
        fetchTeamData();
      }
    } catch (err) {
      console.error("Error creating user:", err);
    } finally {
      setCreating(false);
    }
  }

  async function generateInviteCodes() {
    setGenerating(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, count: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        setInviteCodes(data.inviteCodes);
      }
    } catch (err) {
      console.error("Error generating invite codes:", err);
    } finally {
      setGenerating(false);
    }
  }

  async function changeUserRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/team/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
        }
      }
    } catch (err) {
      console.error("Error changing role:", err);
    }
  }

  async function toggleBrandAccess(userId: string, brandId: string, hasAccess: boolean) {
    try {
      const res = await fetch(`/api/team/${userId}/brands`, {
        method: hasAccess ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            if (hasAccess) {
              return { ...u, brandAccess: u.brandAccess.filter(a => a.brandId !== brandId) };
            } else {
              return { ...u, brandAccess: [...u.brandAccess, { brandId }] };
            }
          }
          return u;
        }));
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => {
            if (!prev) return null;
            if (hasAccess) {
              return { ...prev, brandAccess: prev.brandAccess.filter(a => a.brandId !== brandId) };
            } else {
              return { ...prev, brandAccess: [...prev.brandAccess, { brandId }] };
            }
          });
        }
      }
    } catch (err) {
      console.error("Error toggling brand access:", err);
    }
  }

  async function saveUserProfile() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Role change
      const roleRes = await fetch(`/api/team/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedUser.role }),
      });

      if (roleRes.ok) {
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  function openProfile(user: User) {
    setSelectedUser({ ...user });
    setShowProfileModal(true);
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "OWNER": return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
      case "MANAGER": return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "PRODUCER": return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team members</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Generate Invite Link
            </button>
          </div>
        )}
      </div>

      {/* Team Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                {brands.length > 0 && brands.map(brand => (
                  <th key={brand.id} className="text-center px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">
                    {brand.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => openProfile(user)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{user.email}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {isOwner && user.role !== "OWNER" ? (
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getRoleBadgeColor(user.role)}`}
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="MANAGER">Manager</option>
                        <option value="PRODUCER">Producer</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>
                  {brands.length > 0 && brands.map(brand => {
                    const hasAccess = user.brandAccess.some(a => a.brandId === brand.id);
                    return (
                      <td key={brand.id} className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={(e) => toggleBrandAccess(user.id, brand.id, hasAccess)}
                          disabled={!isOwner || user.role === "OWNER"}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {brands.length > 0 && (
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span>Role badges:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor("OWNER")}`}>Owner</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor("MANAGER")}`}>Manager</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor("PRODUCER")}`}>Producer</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor("EDITOR")}`}>Editor</span>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <Modal title="Add Team Member" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="EDITOR">Editor</option>
                <option value="MANAGER">Manager</option>
                <option value="PRODUCER">Producer</option>
              </select>
            </div>
            <button
              onClick={createUser}
              disabled={creating || !newUser.name || !newUser.email}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create & Send Invite"}
            </button>
          </div>
        </Modal>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <Modal title="User Profile" onClose={() => setShowProfileModal(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                disabled={selectedUser.role === "OWNER" || !isOwner}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="EDITOR">Editor</option>
                <option value="MANAGER">Manager</option>
                <option value="PRODUCER">Producer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
              <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {selectedUser.employmentType === "FREELANCE" ? "Freelance" : "In-house"}
              </p>
            </div>

            {brands.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Access</label>
                <div className="space-y-2">
                  {brands.map(brand => {
                    const hasAccess = selectedUser.brandAccess.some(a => a.brandId === brand.id);
                    return (
                      <label key={brand.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={() => toggleBrandAccess(selectedUser.id, brand.id, hasAccess)}
                          disabled={selectedUser.role === "OWNER" || !isOwner}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600"
                        />
                        <span className="text-gray-900 dark:text-white">{brand.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={saveUserProfile}
              disabled={saving || selectedUser.role === "OWNER"}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <Modal title="Generate Invite Link" onClose={() => { setShowInviteModal(false); setInviteCodes([]); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role for this invite</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="EDITOR">Editor</option>
                <option value="MANAGER">Manager</option>
                <option value="PRODUCER">Producer</option>
              </select>
            </div>

            {inviteCodes.length > 0 ? (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invite Link:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-gray-900 dark:text-white break-all">
                    /register?code={inviteCodes[0].code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/register?code=${inviteCodes[0].code}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={generateInviteCodes}
                disabled={generating}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate Invite Link"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Simple Modal Component
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
