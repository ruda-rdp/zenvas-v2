"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    orgName: "",
    brandName: "",
    brandColor: "#2563EB",
    hasClientPortal: false, // Solo Creator mode by default
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleSubmit = async () => {
    if (!formData.orgName || !formData.brandName) {
      setError("Please fill in organization and brand name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: formData.orgName,
          brandName: formData.brandName,
          primaryColor: formData.brandColor,
          hasClientPortal: formData.hasClientPortal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Setup failed");
      }

      // Redirect based on mode
      const data = await res.json();
      if (data.mode === "growing") {
        router.push("/dashboard");
      } else {
        router.push("/projects");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-8 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎬</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Zenvas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let&apos;s set up your workspace in a few steps
            </p>
          </div>

          <div className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({
                  ...formData,
                  orgName: e.target.value,
                  // Auto-fill brand name if empty
                  brandName: formData.brandName || e.target.value,
                })}
                placeholder="Jacob Org"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your organization or studio name
              </p>
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand / Project Name *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Jacob Film"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: formData.brandColor }}
                >
                  {formData.brandName ? formData.brandName.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your brand or content type (e.g., "Jacob Film", "Dewa Personal")
              </p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Client Portal Option */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasClientPortal}
                    onChange={(e) => setFormData({ ...formData, hasClientPortal: e.target.checked })}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Enable Client Portal
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formData.hasClientPortal
                        ? "Clients can track project progress and view invoices. Free subdomain provided."
                        : "Start with Solo Creator mode. You can enable this later when you have clients."}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Info Box for Solo Mode */}
            {!formData.hasClientPortal && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Solo Creator Mode
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      Perfect for managing your own projects, scripts, storyboards, and tasks.
                      No client portal, no invoicing — just focus on creating.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!formData.orgName || !formData.brandName || loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? "Setting up..." : "Create Workspace"}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
            All settings can be changed later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
