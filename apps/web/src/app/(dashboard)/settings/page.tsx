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
  brands?: Array<{ id: string }>;
}

export default function SettingsOverviewPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [brandCount, setBrandCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [hasBusinessOS, setHasBusinessOS] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inline fetch in useEffect to avoid hoisting issues
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [orgRes, teamRes] = await Promise.all([
          fetch("/api/settings/organization"),
          fetch("/api/team"),
        ]);

        if (!ignore) {
          if (orgRes.ok) {
            const data = await orgRes.json();
            setOrganization(data.organization);
            setBrandCount((data.organization?.brands?.length) || 0);
            setHasBusinessOS((data.organization?.apps || []).includes("business-os"));
          }

          if (teamRes.ok) {
            const data = await teamRes.json();
            setTeamCount(data.users?.length || 0);
          }

          // Only fetch clients if business OS is available
          if (hasBusinessOS) {
            const clientsRes = await fetch("/api/clients");
            if (clientsRes.ok) {
              const data = await clientsRes.json();
              setClientCount(data.clients?.length || 0);
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { ignore = true; };
  }, [hasBusinessOS]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  const planLabels: Record<string, string> = {
    solo: "Solo Creator",
    growing: "Growing",
    agency: "Agency",
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your workspace, team, and integrations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Link href="/settings/brands" className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:border-blue-300 transition-colors">
          <div className="text-3xl font-bold text-blue-600">{brandCount}</div>
          <div className="text-sm text-gray-500 mt-1">Brands</div>
        </Link>
        <Link href="/team" className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:border-blue-300 transition-colors">
          <div className="text-3xl font-bold text-purple-600">{teamCount}</div>
          <div className="text-sm text-gray-500 mt-1">Team Members</div>
        </Link>
        <Link href={hasBusinessOS ? "/clients" : "#"} className={`bg-white rounded-xl shadow border border-gray-200 p-5 hover:border-blue-300 transition-colors ${!hasBusinessOS ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="text-3xl font-bold text-green-600">{hasBusinessOS ? clientCount : '🔒'}</div>
          <div className="text-sm text-gray-500 mt-1">
            {hasBusinessOS ? 'Clients' : 'Business OS'}
          </div>
        </Link>
        <Link href="/settings/integrations/odoo" className="bg-white rounded-xl shadow border border-gray-200 p-5 hover:border-blue-300 transition-colors">
          <div className="text-3xl font-bold text-orange-600">📊</div>
          <div className="text-sm text-gray-500 mt-1">Odoo Sync</div>
        </Link>
      </div>

      {/* Workspace Info */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold mb-4">Workspace</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block">Organization</span>
            <span className="font-medium text-lg">{organization?.name || "Not set"}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Plan</span>
            <span className="inline-flex items-center gap-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {planLabels[organization?.plan || "solo"] || "Solo Creator"}
              </span>
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Workspace ID</span>
            <code className="text-xs">{organization?.id || "—"}</code>
          </div>
          <div>
            <span className="text-gray-500 block">Created</span>
            <span>{organization?.createdAt ? new Date(organization.createdAt).toLocaleDateString() : "—"}</span>
          </div>
        </div>
        {organization && (
          <Link
            href="/settings/organization"
            className="text-sm text-blue-600 hover:underline mt-4 inline-block"
          >
            Edit workspace settings →
          </Link>
        )}
      </div>

      {/* Solo Creator Banner */}
      {!hasBusinessOS && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎬</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Solo Creator Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                You&apos;re in Solo Creator mode. You have access to Projects, Tasks, Scripts, and Storyboards.
                No client portal or invoicing features yet.
              </p>
              <div className="mt-3">
                <Link
                  href="/apps"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Browse App Store →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Quick Setup</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/settings/brands"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
          >
            <span className="text-2xl">🎨</span>
            <div>
              <div className="font-medium">Manage Brands</div>
              <div className="text-xs text-gray-500">Add or edit your brands</div>
            </div>
          </Link>
          <Link
            href="/team"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
          >
            <span className="text-2xl">👥</span>
            <div>
              <div className="font-medium">Invite Team</div>
              <div className="text-xs text-gray-500">Add members to your workspace</div>
            </div>
          </Link>
          {hasBusinessOS ? (
            <>
              <Link
                href="/clients"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-medium">Manage Clients</div>
                  <div className="text-xs text-gray-500">View and edit clients</div>
                </div>
              </Link>
              <Link
                href="/orders"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <div className="font-medium">Orders</div>
                  <div className="text-xs text-gray-500">Track client orders</div>
                </div>
              </Link>
            </>
          ) : (
            <Link
              href="/settings/organization"
              className="p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center gap-3"
            >
              <span className="text-2xl">🚀</span>
              <div>
                <div className="font-medium text-blue-900">Enable Business OS</div>
                <div className="text-xs text-blue-700">Add clients, orders, and invoicing</div>
              </div>
            </Link>
          )}
          <Link
            href="/settings/integrations"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
          >
            <span className="text-2xl">🔌</span>
            <div>
              <div className="font-medium">Integrations</div>
              <div className="text-xs text-gray-500">Odoo, and more</div>
            </div>
          </Link>
          <Link
            href="/profile"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3"
          >
            <span className="text-2xl">👤</span>
            <div>
              <div className="font-medium">My Profile</div>
              <div className="text-xs text-gray-500">Personal settings</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
