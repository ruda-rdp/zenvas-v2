"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employmentType: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Active tab
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences">("profile");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, ...data.user } : null);
        // Update session
        await update({ name: data.user.name });
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
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
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      
      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
          {message.text}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "profile" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "password" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "preferences" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
        >
          Preferences
        </button>
      </div>
      
      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || "")}`}>
                {user?.role}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {user?.role}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment</label>
                <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {user?.employmentType === "FREELANCE" ? "Freelance" : "In-house"}
                </p>
              </div>
            </div>
            
            {user?.organization && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {user.organization.name}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member Since</label>
              <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "-"}
              </p>
            </div>
            
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
      
      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={changePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      )}
      
      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
              </div>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`relative w-14 h-8 rounded-full transition-colors ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${theme === "dark" ? "left-7" : "left-1"}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates</p>
              </div>
              <button className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors">
                <span className="absolute top-1 w-6 h-6 rounded-full bg-white transition-transform left-1" />
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
