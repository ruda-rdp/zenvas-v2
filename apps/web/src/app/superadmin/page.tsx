"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Stats {
  organizations: number;
  users: number;
  brands: number;
  projects: number;
  tasks: number;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    users: number;
    brands: number;
  };
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "organizations" | "users" | "brands">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is super admin
  const isSuperAdmin = session?.user?.email?.toLowerCase() === process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL?.toLowerCase();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && !isSuperAdmin) {
      setError("Access denied. You are not a super admin.");
      setLoading(false);
      return;
    }

    if (status === "authenticated" && isSuperAdmin) {
      fetchData();
    }
  }, [status, isSuperAdmin, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/superadmin");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setStats(data.stats);
      setOrganizations(data.recentOrgs);
      setLoading(false);
    } catch (err) {
      setError("Failed to load data");
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-xl mb-2">⚠️ Access Denied</div>
        <p className="text-gray-600">
          {error || "You do not have super admin access."}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Contact the system administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔐</span>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
        </div>
        <p className="text-gray-600">
          Manage all organizations, brands, and users in the Zenvas SaaS platform.
        </p>
        <div className="mt-2 text-sm text-green-600">
          Logged in as: {session?.user?.email}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl font-bold text-blue-600">{stats.organizations}</div>
            <div className="text-gray-600">Organizations</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl font-bold text-green-600">{stats.users}</div>
            <div className="text-gray-600">Users</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl font-bold text-purple-600">{stats.brands}</div>
            <div className="text-gray-600">Brands</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl font-bold text-orange-600">{stats.projects}</div>
            <div className="text-gray-600">Projects</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl font-bold text-red-600">{stats.tasks}</div>
            <div className="text-gray-600">Tasks</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("organizations")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "organizations"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          All Organizations
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "brands"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          All Brands
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow border p-6">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Organizations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3">Organization</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">Users</th>
                    <th className="pb-3">Brands</th>
                    <th className="pb-3">Projects</th>
                    <th className="pb-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{org.name}</td>
                      <td className="py-3">
                        <div className="text-gray-500">N/A</div>
                      </td>
                      <td className="py-3">{org._count.users}</td>
                      <td className="py-3">{org._count.brands}</td>
                      <td className="py-3 text-gray-400">-</td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No organizations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "organizations" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Organizations</h2>
            <p className="text-gray-600 mb-4">
              Click on an organization to view details. (Coming soon: suspend/delete)
            </p>
            <OrganizationsList />
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <p className="text-gray-600 mb-4">
              View all users across all organizations. (Coming soon: manage roles)
            </p>
            <UsersList />
          </div>
        )}

        {activeTab === "brands" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">All Brands</h2>
            <p className="text-gray-600 mb-4">
              View all brands across all organizations.
            </p>
            <BrandsList />
          </div>
        )}
      </div>
    </div>
  );
}

// Organizations List Component
function OrganizationsList() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/organizations")
      .then((res) => res.json())
      .then((data) => {
        setOrgs(data.organizations || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-3">Organization</th>
            <th className="pb-3">Owner</th>
            <th className="pb-3">Users</th>
            <th className="pb-3">Brands</th>
            <th className="pb-3">Projects</th>
            <th className="pb-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
          <tr key={org.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium">{org.name}</td>
              <td className="py-3 text-gray-500">N/A</td>
              <td className="py-3">{org._count.users}</td>
              <td className="py-3">{org._count.brands}</td>
              <td className="py-3 text-gray-400">-</td>
              <td className="py-3 text-sm text-gray-500">
                {new Date(org.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {orgs.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                No organizations
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Users List Component
function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-3">User</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Organization</th>
            <th className="pb-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium">{user.name}</td>
              <td className="py-3 text-gray-600">{user.email}</td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === "OWNER" ? "bg-purple-100 text-purple-700" :
                  user.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                  user.role === "PRODUCER" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3">
                <div className="text-sm">{user.organization?.name || "N/A"}</div>
              </td>
              <td className="py-3 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No users
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Brands List Component
function BrandsList() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data.brands || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-3">Brand</th>
            <th className="pb-3">Organization</th>
            <th className="pb-3">Projects</th>
            <th className="pb-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-3 font-medium">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: brand.primaryColor || "#2563EB" }}
                  />
                  {brand.name}
                </div>
              </td>
              <td className="py-3 text-gray-600">{brand.organization?.name || "N/A"}</td>
              <td className="py-3">{brand._count.projects}</td>
              <td className="py-3 text-sm text-gray-500">
                {new Date(brand.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {brands.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                No brands
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
