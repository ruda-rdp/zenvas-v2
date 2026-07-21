"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePresence } from "@/components/PresenceProvider";

interface Brand { id: string; name: string; }
interface User {
  id: string; name: string; email: string; phone: string | null;
  role: string; employmentType: string; isActive: boolean;
  emailVerified: boolean; forcePasswordChange: boolean;
  lastLoginAt: string | null; lastActiveAt: string | null;
  brandAccess: { brandId: string }[]; createdAt: string;
}
interface InviteCode {
  id: string; code: string; role: string; invitedName: string | null;
  invitedEmail: string | null; expiresAt: string | null;
  createdAt: string; isExpired: boolean; fullLink: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const { presence } = usePresence();
  const [users, setUsers] = useState<User[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("EDITOR");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", role: "EDITOR", employmentType: "FREELANCE", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState<{name: string; tempPassword: string} | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isOwner = session?.user?.role === "OWNER";

  useEffect(() => { fetchTeamData(); }, []);

  async function fetchTeamData() {
    setLoading(true);
    try {
      const [usersRes, brandsRes, invitesRes] = await Promise.all([
        fetch("/api/team"),
        fetch("/api/settings/organization"),
        isOwner ? fetch("/api/team/invite") : Promise.resolve({ ok: false, json: async () => ({ inviteCodes: [] }) }),
      ]);
      if (usersRes.ok) setUsers((await usersRes.json()).users || []);
      if (brandsRes.ok) setBrands((await brandsRes.json()).organization?.brands || []);
      if (invitesRes.ok) setInvites((await invitesRes.json()).inviteCodes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createUserDirect() {
    if (!newUser.name || !newUser.email) return;
    setCreating(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUser.name, email: newUser.email, phone: newUser.phone || undefined, role: newUser.role, employmentType: newUser.employmentType, password: newUser.password || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.temporaryPassword) setCreatedUser({ name: newUser.name, tempPassword: data.temporaryPassword });
        else { alert(`User "${newUser.name}" created!`); resetForm(); fetchTeamData(); }
      } else alert((await res.json()).error);
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  }

  function resetForm() {
    setShowAddModal(false); setCreatedUser(null);
    setNewUser({ name: "", email: "", phone: "", role: "EDITOR", employmentType: "FREELANCE", password: "" });
    fetchTeamData();
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    const res = await fetch(`/api/team/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !currentStatus }) });
    if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
  }

  async function changeUserRole(userId: string, newRole: string) {
    const res = await fetch(`/api/team/${userId}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
    if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function toggleBrandAccess(userId: string, brandId: string, hasAccess: boolean) {
    const res = await fetch(`/api/team/${userId}/brands`, { method: hasAccess ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brandId }) });
    if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, brandAccess: hasAccess ? u.brandAccess.filter(a => a.brandId !== brandId) : [...u.brandAccess, { brandId }] } : u));
  }

  async function removeUser() {
    if (!userToDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/team/${userToDelete.id}`, { method: "DELETE" });
    if (res.ok) { setUsers(prev => prev.filter(u => u.id !== userToDelete.id)); setShowDeleteConfirm(false); setUserToDelete(null); }
    else alert((await res.json()).error);
    setDeleting(false);
  }

  async function cancelInvite(inviteId: string) {
    if (!confirm("Cancel this invite?")) return;
    const res = await fetch(`/api/team/invite?id=${inviteId}`, { method: "DELETE" });
    if (res.ok) setInvites(prev => prev.filter(i => i.id !== inviteId));
  }

  function copyToClipboard(text: string) { navigator.clipboard.writeText(text); alert("Copied!"); }

  function getRoleBadgeColor(role: string) {
    return role === "OWNER" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
      : role === "MANAGER" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
      : role === "PRODUCER" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
  }

  function getPresenceColor(userId: string) {
    const status = presence[userId];
    return status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-500" : "bg-gray-400";
  }

  function getPresenceLabel(userId: string) {
    const status = presence[userId];
    return status === "online" ? "Online" : status === "away" ? "Away" : "Offline";
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function formatInviteDate(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
  }

  const filteredUsers = users.filter(u => {
    const search = searchQuery.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && u.isActive) || (statusFilter === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const stats = { total: users.length, active: users.filter(u => u.isActive).length, inactive: users.filter(u => !u.isActive).length, owners: users.filter(u => u.role === "OWNER").length, managers: users.filter(u => u.role === "MANAGER").length, producers: users.filter(u => u.role === "PRODUCER").length, editors: users.filter(u => u.role === "EDITOR").length };
  const pendingInvites = invites.filter(i => !i.isExpired);

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Team</h1><p className="text-gray-600 mt-1">Manage your team members</p></div>
        {isOwner && <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Member</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Online", value: users.filter(u => presence[u.id] === "online").length, color: "text-green-600" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Inactive", value: stats.inactive, color: "text-gray-400" },
          { label: "Owners", value: stats.owners, color: "text-purple-600" },
          { label: "Managers", value: stats.managers, color: "text-blue-600" },
          { label: "Editors", value: stats.editors, color: "text-gray-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pending Invites */}
      {isOwner && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Pending Invites</h2>
              {pendingInvites.length > 0 && <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">{pendingInvites.length}</span>}
            </div>
            <button onClick={() => setShowInviteModal(true)} className="text-sm text-blue-600">+ Generate</button>
          </div>
          {pendingInvites.length > 0 ? (
            <div className="divide-y">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                      {invite.invitedName ? invite.invitedName.charAt(0).toUpperCase() : invite.role.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{invite.invitedName || "Unknown"} {invite.invitedEmail && <span className="text-gray-500 text-sm">({invite.invitedEmail})</span>}</div>
                      <div className="text-xs text-gray-500 flex gap-2"><span className={getRoleBadgeColor(invite.role) + " px-2 py-0.5 rounded"}>{invite.role}</span><span>Sent {formatInviteDate(invite.createdAt)}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(`${window.location.origin}/register?code=${invite.code}`)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">Copy Link</button>
                    <button onClick={() => cancelInvite(invite.id)} className="px-3 py-1.5 text-sm text-red-600 rounded-lg">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-6 text-center text-gray-500">No pending invites</div>}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 mb-6 flex gap-4">
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-gray-700">
          <option value="all">All Roles</option><option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="PRODUCER">Producer</option><option value="EDITOR">Editor</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg dark:bg-gray-700">
          <option value="all">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <span className="text-gray-500 self-center">{filteredUsers.length} members</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b text-left text-sm text-gray-500">
            <th className="px-4 py-3">Member</th><th className="px-4 py-3">Presence</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Role</th>
            {brands.map(b => <th key={b.id} className="px-4 py-3 text-center">{b.name}</th>)}
            <th className="px-4 py-3">Last Active</th>{isOwner && <th className="px-4 py-3 text-right">Actions</th>}
          </tr></thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!user.isActive ? "opacity-60" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getPresenceColor(user.id)}`}></span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600"}`}>{getPresenceLabel(user.id)}</span></td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                  {user.forcePasswordChange && <span className="ml-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Reset</span>}
                </td>
                <td className="px-4 py-3">
                  {isOwner && user.role !== "OWNER" ? (
                    <select value={user.role} onChange={e => changeUserRole(user.id, e.target.value)} className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(user.role)}`}>
                      <option value="EDITOR">Editor</option><option value="MANAGER">Manager</option><option value="PRODUCER">Producer</option>
                    </select>
                  ) : <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(user.role)}`}>{user.role}</span>}
                </td>
                {brands.map(brand => {
                  const hasAccess = user.brandAccess.some(a => a.brandId === brand.id);
                  return <td key={brand.id} className="px-4 py-3 text-center">
                    <input type="checkbox" checked={hasAccess} onChange={() => toggleBrandAccess(user.id, brand.id, hasAccess)} disabled={!isOwner || user.role === "OWNER"} className="w-4 h-4" />
                  </td>;
                })}
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.lastActiveAt || user.createdAt)}</td>
                {isOwner && <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {user.role !== "OWNER" && user.id !== session?.user?.id && (
                      <>
                        <button onClick={() => toggleUserStatus(user.id, user.isActive)} className={`px-3 py-1.5 text-sm rounded-lg ${user.isActive ? "text-orange-600" : "text-green-600"}`}>{user.isActive ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true); }} className="px-3 py-1.5 text-sm text-red-600 rounded-lg">Remove</button>
                      </>
                    )}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="p-12 text-center text-gray-500">{users.length === 0 ? "No team members yet" : "No matches"}</div>}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !createdUser && setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{createdUser ? "User Created!" : "Add Team Member"}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6">
              {createdUser ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2 mb-2">✓ Created!</div>
                    <p className="text-sm text-green-700 dark:text-green-400">Share credentials with <strong>{createdUser.name}</strong></p>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Temporary Password</label>
                    <div className="flex gap-2">
                      <input type="text" value={createdUser.tempPassword} readOnly className="flex-1 px-4 py-2 border rounded-lg font-mono" />
                      <button onClick={() => copyToClipboard(createdUser.tempPassword)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Copy</button>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">⚠️ User must change password on first login</p>
                  </div>
                  <button onClick={resetForm} className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Done</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div><label className="block text-sm mb-1">Full Name *</label><input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" placeholder="John Doe" /></div>
                  <div><label className="block text-sm mb-1">Email *</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" placeholder="john@example.com" /></div>
                  <div><label className="block text-sm mb-1">Phone</label><input type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" placeholder="+62..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm mb-1">Role</label><select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"><option value="EDITOR">Editor</option><option value="MANAGER">Manager</option><option value="PRODUCER">Producer</option></select></div>
                    <div><label className="block text-sm mb-1">Type</label><select value={newUser.employmentType} onChange={e => setNewUser({...newUser, employmentType: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"><option value="FREELANCE">Freelance</option><option value="INHOUSE">In-house</option></select></div>
                  </div>
                  <div><label className="block text-sm mb-1">Password <span className="text-gray-400">(optional)</span></label><input type={showPassword ? "text" : "password"} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" placeholder="Auto-generated if empty" /><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> <span className="text-sm">Show</span></label></div>
                  <button onClick={createUserDirect} disabled={creating || !newUser.name || !newUser.email} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{creating ? "Creating..." : "Create User"}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Generate Invite</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm mb-1">Role</label><select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"><option value="EDITOR">Editor</option><option value="MANAGER">Manager</option><option value="PRODUCER">Producer</option></select></div>
              <button onClick={async () => {
                setGenerating(true);
                const res = await fetch("/api/team/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: selectedRole, count: 1, expiresInDays: 7 }) });
                if (res.ok) { const d = await res.json(); copyToClipboard(`${window.location.origin}/register?code=${d.inviteCodes[0].code}`); fetchTeamData(); }
                setGenerating(false);
              }} disabled={generating} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{generating ? "..." : "Generate & Copy Link"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-red-600">Remove User?</h2>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="font-semibold">{userToDelete.name}</div>
                <div className="text-sm text-gray-500">{userToDelete.email}</div>
              </div>
              <p className="text-sm text-gray-600"><strong>Warning:</strong> This cannot be undone. Tasks and leads will be unassigned.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Cancel</button>
                <button onClick={removeUser} disabled={deleting} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{deleting ? "..." : "Remove"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
