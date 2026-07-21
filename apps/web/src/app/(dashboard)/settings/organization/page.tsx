"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  apps: string[];
  createdAt: string;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    hasClientPortal: boolean;
    freeSubdomain: string | null;
  }>;
}

export default function OrganizationSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "success" as "success" | "error", text: "" });
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "plan" | "apps">("details");

  // Inline fetch in useEffect to avoid hoisting issues
  useEffect(() => {
    let ignore = false;

    async function loadOrganization() {
      try {
        const res = await fetch("/api/settings/organization");
        if (res.ok && !ignore) {
          const data = await res.json();
          setOrganization(data.organization);
          setName(data.organization?.name || "");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching organization:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrganization();
    return () => { ignore = true; };
  }, []);

  async function saveOrganization() {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Organization name is required" });
      return;
    }

    setSaving(true);
    setMessage({ type: "success", text: "" });

    try {
      const res = await fetch("/api/settings/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrganization(data.organization);
        setMessage({ type: "success", text: "Organization updated successfully" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const planLabels: Record<string, { label: string; description: string }> = {
    solo: { label: "Solo Creator", description: "Personal projects, no client portal" },
    growing: { label: "Growing", description: "Has clients, invoicing enabled" },
    agency: { label: "Agency", description: "Multi-brand, full features" },
  };

  const availableApps = [
    { id: "project-os", name: "Project OS", icon: "📁", description: "Projects, Tasks, Scripts, Storyboards", required: true },
    { id: "human-capital-os", name: "Human Capital OS", icon: "👥", description: "Team, Board, Payout, Wallet", required: true },
    { id: "business-os", name: "Business OS", icon: "💼", description: "Clients, Orders, Invoices", required: false },
    { id: "lead-management", name: "Lead Management", icon: "🎯", description: "Lead capture and qualification", required: false },
    { id: "odoo-sync", name: "Odoo Sync", icon: "🔄", description: "Sync with Odoo accounting", required: false },
  ];

  const installedApps = organization?.apps || [];
  const isAppInstalled = (appId: string) => installedApps.includes(appId);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/settings" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Organization</h1>
        <p className="text-gray-600 mt-1">Manage your workspace settings</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 px-1 text-sm font-medium ${
              activeTab === "details"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`pb-3 px-1 text-sm font-medium ${
              activeTab === "plan"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Plan
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`pb-3 px-1 text-sm font-medium ${
              activeTab === "apps"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Apps
          </button>
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-4">Workspace Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="My Organization"
              />
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Organization ID</label>
              <code className="text-xs text-gray-600">{organization?.id || "—"}</code>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Slug</label>
              <code className="text-xs text-gray-600">{organization?.slug || "—"}</code>
            </div>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
              <span className="text-sm">
                {organization?.createdAt
                  ? new Date(organization.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <button
              onClick={saveOrganization}
              disabled={saving || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === "plan" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-4">Your Plan</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="font-medium text-blue-900">
                {planLabels[organization?.plan || "solo"]?.label || "Solo"} Plan
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {planLabels[organization?.plan || "solo"]?.description}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Plan changes and billing coming soon. For now, the plan is set automatically based on your installed apps.
          </p>
        </div>
      )}

      {/* Apps Tab */}
      {activeTab === "apps" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-4">Installed Apps</h2>
          <div className="space-y-3">
            {availableApps.map((app) => {
              const installed = isAppInstalled(app.id);
              return (
                <div
                  key={app.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    installed
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{app.name}</span>
                        {app.required && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            Core
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{app.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {installed ? (
                      <span className="text-green-600 text-sm font-medium">Installed</span>
                    ) : app.required ? (
                      <span className="text-gray-400 text-sm">Required</span>
                    ) : (
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">
                        Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Note: Installing/uninstalling apps is a simplified flow. Full App Store coming soon.
          </p>
        </div>
      )}

      {/* Brands */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Brands</h2>
          <Link
            href="/settings/brands"
            className="text-sm text-blue-600 hover:underline"
          >
            Manage Brands →
          </Link>
        </div>
        {organization?.brands && organization.brands.length > 0 ? (
          <div className="space-y-2">
            {organization.brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{brand.name}</div>
                  <div className="text-xs text-gray-500">
                    /{brand.slug}
                    {brand.hasClientPortal && (
                      <span className="ml-2 text-green-600">• Client Portal Active</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No brands yet</p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow border border-red-200 p-6 mt-6">
        <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-3">
          Deleting your organization will remove all data. This action cannot be undone.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-50 cursor-not-allowed text-sm"
        >
          Delete Organization
        </button>
      </div>
    </div>
  );
}
