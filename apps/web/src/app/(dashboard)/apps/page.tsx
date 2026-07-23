/**
 * App Store - Package & App Installation
 * Shows real apps with implementation status, descriptions, and dependencies
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
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { PACKAGES, type Package as PackageType } from "@/lib/packages";
import { getApp, getAppsByPackage, type App } from "@/lib/apps";

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface AppDetail {
  app: App;
  isInstalled: boolean;
  isPartOfInstalledPackage: boolean;
}

interface PackageDetail {
  package: PackageType;
  isInstalled: boolean;
  apps: AppDetail[];
  coreAppsInstalled: number;
  optionalAppsInstalled: number;
}

// ─────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function getDependencyNames(depIds: string[]): string[] {
  return depIds.map(id => {
    const app = getApp(id);
    return app?.name || id;
  });
}

// ─────────────────────────────────────────────────────────────────
// APP CARD COMPONENT
// ─────────────────────────────────────────────────────────────────

function AppCard({ appDetail }: { appDetail: AppDetail }) {
  const { app, isInstalled, isPartOfInstalledPackage } = appDetail;
  const [expanded, setExpanded] = useState(false);

  const dependencies = getDependencyNames(app.dependencies);
  const showComingSoon = !app.isImplemented;
  const canInstall = !showComingSoon && !isInstalled;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border transition-all ${
      showComingSoon
        ? "border-gray-200 dark:border-gray-700 opacity-75"
        : isInstalled
        ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
        : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            showComingSoon
              ? "bg-gray-100 dark:bg-gray-700"
              : isInstalled
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-indigo-100 dark:bg-indigo-900/30"
          }`}>
            {app.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {app.name}
              </h4>
              {showComingSoon && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex-shrink-0">
                  Coming Soon
                </span>
              )}
              {isInstalled && !showComingSoon && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex-shrink-0">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {app.description}
            </p>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Dependencies Warning */}
        {dependencies.length > 0 && !isInstalled && !showComingSoon && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Requires: {dependencies.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          {/* Long Description */}
          {app.longDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {app.longDescription}
            </p>
          )}

          {/* Features */}
          {app.features && app.features.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Features
              </h5>
              <ul className="space-y-1">
                {app.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies Detail */}
          {dependencies.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>Installing this package will also install: {dependencies.join(", ")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PACKAGE SECTION COMPONENT
// ─────────────────────────────────────────────────────────────────

function PackageSection({ packageDetail }: { packageDetail: PackageDetail }) {
  const { package: pkg, isInstalled, apps, coreAppsInstalled, optionalAppsInstalled } = packageDetail;

  const implementedApps = apps.filter(a => a.app.isImplemented);
  const comingSoonApps = apps.filter(a => !a.app.isImplemented);

  return (
    <div className="mb-8">
      {/* Package Header */}
      <div className={`rounded-xl border p-6 mb-4 ${
        isInstalled
          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}>
        <div className="flex items-start gap-4">
          {/* Package Icon */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
            isInstalled
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
          }`}>
            {pkg.icon}
          </div>

          {/* Package Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {pkg.name}
              </h2>
              {isInstalled && (
                <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-full">
                  Installed
                </span>
              )}
              {pkg.isCore && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  Core Package
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {pkg.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{pkg.coreApps.length}</span> core apps
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">{pkg.optionalApps.length}</span> optional apps
              </span>
              {isInstalled && (
                <>
                  <span className="text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4 inline mr-1" />
                    {coreAppsInstalled} core active
                  </span>
                  {optionalAppsInstalled > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4 inline mr-1" />
                      {optionalAppsInstalled} optional active
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Learn More Link */}
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Learn more
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {implementedApps.map(({ app, isInstalled: isAppInstalled, isPartOfInstalledPackage }) => (
          <AppCard
            key={app.id}
            appDetail={{
              app,
              isInstalled: isAppInstalled || isPartOfInstalledPackage,
              isPartOfInstalledPackage,
            }}
          />
        ))}
      </div>

      {/* Coming Soon Section */}
      {comingSoonApps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Coming Soon
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({comingSoonApps.length} apps in development)
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {comingSoonApps.map(({ app, isInstalled: isAppInstalled, isPartOfInstalledPackage }) => (
              <AppCard
                key={app.id}
                appDetail={{
                  app,
                  isInstalled: isAppInstalled || isPartOfInstalledPackage,
                  isPartOfInstalledPackage,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────

export default function AppStorePage() {
  const { data: session, status } = useSession();
  const [packages, setPackages] = useState<PackageDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/apps");
      if (res.ok) {
        const data = await res.json();
        const installedPackages = data.packages || [];
        const installedApps = data.apps || [];

        // Build package details with app information
        const packageDetails: PackageDetail[] = PACKAGES.map(pkg => {
          const pkgApps = getAppsByPackage(pkg.id);
          const isInstalled = installedPackages.includes(pkg.id);

          const appsWithStatus = pkgApps.map(app => ({
            app,
            isInstalled: installedApps.includes(app.id),
            isPartOfInstalledPackage: isInstalled && pkg.coreApps.includes(app.id),
          }));

          const coreAppsInstalled = appsWithStatus.filter(
            a => a.app.isCore && (a.isInstalled || a.isPartOfInstalledPackage)
          ).length;
          const optionalAppsInstalled = appsWithStatus.filter(
            a => !a.app.isCore && a.isInstalled
          ).length;

          return {
            package: pkg,
            isInstalled,
            apps: appsWithStatus,
            coreAppsInstalled,
            optionalAppsInstalled,
          };
        });

        setPackages(packageDetails);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Restricted</h2>
        <p className="text-gray-500 dark:text-gray-400">Only workspace owners can manage apps</p>
      </div>
    );
  }

  const corePackages = packages.filter(p => p.package.isCore);
  const optionalPackages = packages.filter(p => !p.package.isCore);

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
              Extend your workspace with production tools
            </p>
          </div>
        </div>
      </div>

      {/* Core Packages */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          Core Packages
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (Automatically installed with every workspace)
          </span>
        </h2>
        {corePackages.map(pkgDetail => (
          <PackageSection key={pkgDetail.package.id} packageDetail={pkgDetail} />
        ))}
      </div>

      {/* Optional Packages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Available Packages
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (Install to add more features)
          </span>
        </h2>
        {optionalPackages.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No additional packages available at the moment.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Check back soon for new features!
            </p>
          </div>
        ) : (
          optionalPackages.map(pkgDetail => (
            <PackageSection key={pkgDetail.package.id} packageDetail={pkgDetail} />
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How it works
        </h3>
        <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-1">
          <li>• <strong>Core packages</strong> are automatically installed and cannot be removed</li>
          <li>• Apps marked <strong>"Coming Soon"</strong> are in development and not yet available</li>
          <li>• Installing a package may automatically enable required dependencies</li>
          <li>• Your data is always preserved, even when uninstalling apps</li>
        </ul>
      </div>
    </div>
  );
}
