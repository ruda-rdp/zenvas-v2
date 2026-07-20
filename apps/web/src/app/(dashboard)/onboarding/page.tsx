"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    brandName: "",
    brandDomain: "",
    brandColor: "#2563EB",
  });

  const handleSubmit = async () => {
    if (!formData.brandName || !formData.brandDomain) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formData.brandName,
          brandDomain: formData.brandDomain,
          primaryColor: formData.brandColor,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Setup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-8 border border-gray-200 dark:border-gray-700">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-2 rounded ${step >= 1 ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Your Workspace</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Give your workspace a name and domain. Everything else can be configured later.
            </p>

            <div className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="EPE Studio"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This is your company/workspace name
                </p>
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subdomain *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.brandDomain}
                    onChange={(e) => setFormData({ ...formData, brandDomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="studio"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 border-r-0 rounded-l-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span className="px-4 py-3 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    .yourdomain.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For client portal (optional, can be configured later)
                </p>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!formData.brandName || !formData.brandDomain || loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {loading ? "Setting up..." : "Get Started"}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
              You can change all these settings later in Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
