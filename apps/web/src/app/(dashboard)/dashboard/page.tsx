import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  // Get stats for Mission Control
  const [activeProjects, pendingOrders, openLeads, teamMembers] = await Promise.all([
    prisma.project.count({
      where: {
        order: {
          status: "IN_PROGRESS",
          brand: {
            brandAccess: {
              some: { userId: session.user.id },
            },
          },
        },
      },
    }),
    prisma.order.count({
      where: {
        status: "DRAFT",
        brand: {
          brandAccess: {
            some: { userId: session.user.id },
          },
        },
      },
    }),
    prisma.lead.count({
      where: {
        status: { in: ["NEW", "QUALIFIED"] },
        brand: {
          brandAccess: {
            some: { userId: session.user.id },
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        organizationId: session.user.id,
      },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{activeProjects}</div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-purple-600">{openLeads}</div>
          <div className="text-sm text-gray-600">Open Leads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">{teamMembers}</div>
          <div className="text-sm text-gray-600">Team Members</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/projects/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm">New Project</div>
          </a>
          <a href="/leads/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm">Add Lead</div>
          </a>
          <a href="/clients/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm">Add Client</div>
          </a>
          <a href="/team/invite" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">Invite Team</div>
          </a>
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          Activity feed will appear here as you use Zenvas.
        </div>
      </div>
    </div>
  );
}
