import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds } from "@/lib/authorize";
import { getStaleTaskCounts } from "@/lib/stale-detection";
import {
  getOrganizationApps,
  getOrderStats,
  getLeadStats,
} from "@/lib/app-checks";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const orgId = session.user.organizationId;

  // Get installed packages and apps
  const { packages: installedPackages, apps: installedApps } = await getOrganizationApps(orgId);

  // Check if Business OS is installed
  const hasBusinessOS = installedPackages.includes("business-os");

  // Get accessible brand IDs based on user role
  const accessibleBrandIds = await getAccessibleBrandIds();

  // Fetch stats in parallel, with conditional fetching for business features
  const [activeProjects, teamMembers, orderStats, leadStats, staleTaskCounts] = await Promise.all([
    // Active Projects: Projects with IN_PROGRESS orders from accessible brands
    prisma.project.count({
      where: {
        order: {
          status: "IN_PROGRESS",
          brandId: { in: accessibleBrandIds },
        },
      },
    }),
    // Team Members: All users in the organization
    prisma.user.count({
      where: {
        organizationId: orgId,
      },
    }),
    // Order stats - only if Business OS is installed
    hasBusinessOS ? getOrderStats(orgId) : Promise.resolve(null),
    // Lead stats - only if Business OS is installed
    hasBusinessOS ? getLeadStats(orgId) : Promise.resolve(null),
    // Stale tasks - only for Owner/Manager
    session.user.role !== "EDITOR" && accessibleBrandIds.length > 0
      ? getStaleTaskCounts(prisma, accessibleBrandIds[0])
      : Promise.resolve(null),
  ]);

  // Extract values from stats
  const pendingOrders = orderStats?.confirmed ?? 0;
  const openLeads = (leadStats?.new ?? 0) + (leadStats?.qualified ?? 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission Control</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats Grid - Conditional based on installed packages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Always show: Active Projects */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeProjects}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
        </div>

        {/* Always show: Team Members */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{teamMembers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
        </div>

        {/* Only show: Pending Orders if Business OS is installed */}
        {hasBusinessOS && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOrders}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</div>
          </div>
        )}

        {/* Only show: Open Leads if Business OS is installed */}
        {hasBusinessOS && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{openLeads}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Open Leads</div>
          </div>
        )}
      </div>

      {/* Needs Attention - Stale Tasks (for Owner/Manager only) */}
      {staleTaskCounts && staleTaskCounts.total > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8 border-l-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">⚠️ Needs Attention</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {staleTaskCounts.total} task{staleTaskCounts.total !== 1 ? "s" : ""} need attention
            </span>
          </div>
          <div className="flex gap-4">
            {staleTaskCounts.critical > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  {staleTaskCounts.critical} Critical
                </span>
              </div>
            )}
            {staleTaskCounts.stale > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {staleTaskCounts.stale} Stale
                </span>
              </div>
            )}
            {staleTaskCounts.warning > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {staleTaskCounts.warning} Warning
                </span>
              </div>
            )}
          </div>
          <Link
            href="/projects?filter=stale"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            View all tasks →
          </Link>
        </div>
      )}

      {/* Quick Actions - Always show Projects and Team */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/projects" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm text-gray-900 dark:text-white">Projects</div>
          </Link>

          {/* Only show: Leads if Business OS is installed */}
          {hasBusinessOS && installedApps.includes("leads") && (
            <Link href="/leads" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm text-gray-900 dark:text-white">Leads</div>
            </Link>
          )}

          {/* Only show: Orders if Business OS is installed */}
          {hasBusinessOS && installedApps.includes("orders") && (
            <Link href="/orders" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm text-gray-900 dark:text-white">Orders</div>
            </Link>
          )}

          <Link href="/team" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm text-gray-900 dark:text-white">Team</div>
          </Link>

          {/* Only show: Clients if Business OS is installed */}
          {hasBusinessOS && installedApps.includes("clients") && (
            <Link href="/clients" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <div className="text-2xl mb-2">🏢</div>
              <div className="text-sm text-gray-900 dark:text-white">Clients</div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          Activity feed will appear here as you use Zenvas.
        </div>
      </div>
    </div>
  );
}
