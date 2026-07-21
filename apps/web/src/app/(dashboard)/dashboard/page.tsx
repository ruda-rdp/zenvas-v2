import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds } from "@/lib/authorize";
import { getStaleTaskCounts } from "@/lib/stale-detection";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Get accessible brand IDs based on user role
  const accessibleBrandIds = await getAccessibleBrandIds();

  // Get stats for Mission Control
  // Note: Editors can only see their assigned tasks, handled separately
  const [activeProjects, pendingOrders, openLeads, teamMembers] = await Promise.all([
    // Active Projects: Projects with IN_PROGRESS orders from accessible brands
    prisma.project.count({
      where: {
        order: {
          status: "IN_PROGRESS",
          brandId: { in: accessibleBrandIds },
        },
      },
    }),
    // Pending Orders: Draft orders from accessible brands
    prisma.order.count({
      where: {
        status: "DRAFT",
        brandId: { in: accessibleBrandIds },
      },
    }),
    // Open Leads: New and Qualified leads from accessible brands
    prisma.lead.count({
      where: {
        status: { in: ["NEW", "QUALIFIED"] },
        brandId: { in: accessibleBrandIds },
      },
    }),
    // Team Members: All users in the organization
    prisma.user.count({
      where: {
        organizationId: session.user.organizationId,
      },
    }),
  ]);

  // Get stale task counts for Mission Control
  // Only for Owner/Manager roles
  let staleTaskCounts = null;
  if (session.user.role !== "EDITOR" && accessibleBrandIds.length > 0) {
    // Get counts for first accessible brand (in production, would aggregate across all)
    staleTaskCounts = await getStaleTaskCounts(prisma, accessibleBrandIds[0]);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission Control</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeProjects}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingOrders}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{openLeads}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Open Leads</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{teamMembers}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
        </div>
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/projects" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm text-gray-900 dark:text-white">Projects</div>
          </Link>
          <Link href="/leads" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm text-gray-900 dark:text-white">Leads</div>
          </Link>
          <Link href="/orders" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm text-gray-900 dark:text-white">Orders</div>
          </Link>
          <Link href="/team" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm text-gray-900 dark:text-white">Team</div>
          </Link>
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
