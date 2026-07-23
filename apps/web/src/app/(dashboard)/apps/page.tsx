/**
 * App Store - Package & App Installation
 * Odoo-style app marketplace with package support
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Check,
  Lock,
  Package,
  Sparkles,
  Building2,
  Users,
  Briefcase,
  Film,
  FileText,
  Palette,
  Zap,
  DollarSign,
  BarChart3,
  MapPin,
  Music,
  Calendar,
  MessageSquare,
  Video,
  FolderOpen,
  Puzzle,
  Clock,
  ClipboardList,
} from "lucide-react";
import { PACKAGES, type Package as PackageType } from "@/lib/packages";
import { getApp } from "@/lib/apps";

// Icon mapping for apps
const iconMap: Record<string, React.ReactNode> = {
  "clients": <Building2 className="w-8 h-8" />,
  "leads": <FileText className="w-8 h-8" />,
  "orders": <ClipboardList className="w-8 h-8" />,
  "invoices": <DollarSign className="w-8 h-8" />,
  "scriptwriter": <FileText className="w-8 h-8" />,
  "storyboard": <Palette className="w-8 h-8" />,
  "shotlist": <Film className="w-8 h-8" />,
  "scheduling": <Calendar className="w-8 h-8" />,
  "locations": <MapPin className="w-8 h-8" />,
  "dailies": <Video className="w-8 h-8" />,
  "vfx-tracker": <Sparkles className="w-8 h-8" />,
  "deliverables": <FolderOpen className="w-8 h-8" />,
  "music-sound": <Music className="w-8 h-8" />,
  "team": <Users className="w-8 h-8" />,
  "payouts": <DollarSign className="w-8 h-8" />,
  "attendance": <Clock className="w-8 h-8" />,
  "payroll": <DollarSign className="w-8 h-8" />,
  "recruitment": <Briefcase className="w-8 h-8" />,
  "analytics": <BarChart3 className="w-8 h-8" />,
  "branding-kit": <Palette className="w-8 h-8" />,
  "client-portal": <Building2 className="w-8 h-8" />,
  "odoo-sync": <Zap className="w-8 h-8" />,
  "projects": <FolderOpen className="w-8 h-8" />,
  "stages": <FolderOpen className="w-8 h-8" />,
  "tasks": <Check className="w-8 h-8" />,
  "board": <Check className="w-8 h-8" />,
};

// Package icons
const packageIconMap: Record<string, React.ReactNode> = {
  "project-os": <Film className="w-10 h-10" />,
  "human-capital-os": <Users className="w-10 h-10" />,
  "business-os": <Building2 className="w-10 h-10" />,
};

interface PackageCardProps {
  pkg: PackageType;
  isInstalled: boolean;
  installedApps: string[];
  onInstall: (packageId: string, optionalApps: string[]) => void;
  onUninstall: (packageId: string) => void;
  isUpdating: boolean;
}

function PackageCard({
  pkg,
  isInstalled,
  installedApps,
  onInstall,
  onUninstall,
  isUpdating
}: PackageCardProps) {
  const [selectedOptionalApps, setSelectedOptionalApps] = useState<string[]>(pkg.optionalApps);
  const [showDetails, setShowDetails] = useState(false);

  const toggleOptionalApp = (appId: string) => {
    setSelectedOptionalApps(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const getAppName = (appId: string) => {
    const app = getApp(appId);
    return app?.name || appId;
  };

  const getAppDescription = (appId: string) => {
    const app = getApp(appId);
    return app?.description || "";
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
      isInstalled
        ? "border-green-500/50 shadow-green-100 dark:shadow-green-900/20 shadow-lg"
        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            isInstalled
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
          }`}>
            {packageIconMap[pkg.id] || <Package className="w-10 h-10" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {pkg.name}
              </h3>
              {isInstalled && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Installed
                </span>
              )}
              {pkg.isCore && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  Core
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pkg.description}
            </p>
            <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${
              pkg.tier === "starter"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : pkg.tier === "growing"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
            }`}>
              {pkg.tier.charAt(0).toUpperCase() + pkg.tier.slice(1)} Tier
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Core Apps */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Core Apps (auto-installed)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 ml-6">
            {pkg.coreApps.map(appId => (
              <span
                key={appId}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-lg flex items-center gap-1.5"
              >
                {iconMap[appId] || <Package className="w-4 h-4" />}
                {getAppName(appId)}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Apps */}
        {pkg.optionalApps.length > 0 && (
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2"
            >
              <span>Optional Apps ({pkg.optionalApps.length})</span>
              <svg
                className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDetails && (
              <div className="space-y-2 mt-2 ml-6">
                {pkg.optionalApps.map(appId => {
                  const app = getApp(appId);
                  const isSelected = selectedOptionalApps.includes(appId);
                  const isInstalled = installedApps.includes(appId);

                  return (
                    <div
                      key={appId}
                      className={`p-3 rounded-lg border transition-colors ${
                        isInstalled
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isInstalled
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                          }`}>
                            {iconMap[appId] || <Package className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getAppName(appId)}
                            </p>
                            {app?.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {app.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isInstalled ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Active
                            </span>
                          ) : isSelected ? (
                            <button
                              onClick={() => toggleOptionalApp(appId)}
                              className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                            >
                              Selected
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleOptionalApp(appId)}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isInstalled ? (
                <span>{installedApps.filter(id => pkg.coreApps.includes(id) || pkg.optionalApps.includes(id)).length} apps active</span>
              ) : (
                <span>Will install {pkg.coreApps.length + selectedOptionalApps.length} apps</span>
              )}
            </div>
            {isInstalled ? (
              pkg.isCore ? (
                <span className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                  Core Package
                </span>
              ) : (
                <button
                  onClick={() => onUninstall(pkg.id)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Uninstalling..." : "Uninstall"}
                </button>
              )
            ) : (
              <button
                onClick={() => onInstall(pkg.id, selectedOptionalApps)}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Install Package
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppStorePage() {
  const { data: session, status } = useSession();
  const [installedState, setInstalledState] = useState<{
    packages: string[];
    apps: string[];
  }>({ packages: [], apps: [] });
  const [loading, setLoading] = useState(true);
  const [updatingPackage, setUpdatingPackage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchInstalledState();
  }, []);

  const fetchInstalledState = async () => {
    try {
      const res = await fetch("/api/apps");
      if (res.ok) {
        const data = await res.json();
        setInstalledState({
          packages: data.packages || [],
          apps: data.apps || [],
        });
      }
    } catch (error) {
      console.error("Error fetching installed state:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (packageId: string, optionalApps: string[]) => {
    setUpdatingPackage(packageId);
    setMessage(null);

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, optionalApps }),
      });

      if (res.ok) {
        const data = await res.json();
        setInstalledState({
          packages: data.packages,
          apps: data.apps,
        });
        const pkg = PACKAGES.find(p => p.id === packageId);
        setMessage({ type: "success", text: `${pkg?.name || packageId} installed successfully!` });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.message || "Failed to install package" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to install package" });
    } finally {
      setUpdatingPackage(null);
    }
  };

  const handleUninstall = async (packageId: string) => {
    if (!confirm("Are you sure you want to uninstall this package? All associated apps will be removed.")) {
      return;
    }

    setUpdatingPackage(packageId);
    setMessage(null);

    try {
      const res = await fetch("/api/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      if (res.ok) {
        const data = await res.json();
        setInstalledState({
          packages: data.packages,
          apps: data.apps,
        });
        const pkg = PACKAGES.find(p => p.id === packageId);
        setMessage({ type: "success", text: `${pkg?.name || packageId} uninstalled successfully!` });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.message || "Failed to uninstall package" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to uninstall package" });
    } finally {
      setUpdatingPackage(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-gray-500 dark:text-gray-400">Only workspace owners can manage apps</p>
      </div>
    );
  }

  const corePackages = PACKAGES.filter(p => p.isCore);
  const optionalPackages = PACKAGES.filter(p => !p.isCore);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Store</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Extend your workspace with packages and apps
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* Core Packages */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          Core Packages
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Always installed)</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {corePackages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isInstalled={installedState.packages.includes(pkg.id)}
              installedApps={installedState.apps}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              isUpdating={updatingPackage === pkg.id}
            />
          ))}
        </div>
      </div>

      {/* Optional Packages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Available Packages
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Install to add more features)</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {optionalPackages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isInstalled={installedState.packages.includes(pkg.id)}
              installedApps={installedState.apps}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              isUpdating={updatingPackage === pkg.id}
            />
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          How it works
        </h3>
        <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-1">
          <li>• <strong>Core packages</strong> are automatically installed and cannot be removed</li>
          <li>• <strong>Optional packages</strong> can be installed to add business or advanced features</li>
          <li>• When installing a package, <strong>core apps</strong> are automatically included</li>
          <li>• You can choose which <strong>optional apps</strong> to enable</li>
          <li>• Uninstalling a package removes all associated apps (data is preserved)</li>
        </ul>
      </div>
    </div>
  );
}
