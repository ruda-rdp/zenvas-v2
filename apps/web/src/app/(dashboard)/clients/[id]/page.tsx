"use client";

import { useState, useEffect, use, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  brand: { id: string; name: string; primaryColor?: string };
  orders: Order[];
  contacts: Contact[];
  _count: { orders: number; leads: number };
  odooPartnerId?: string;
}

interface Order {
  id: string;
  status: string;
  service: { name: string; price: number | string };
  project?: { id: string; name: string };
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  canApproveDelivery?: boolean;
}

interface ActivityLog {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  userId: string | null;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

const orderStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const activityIcons: Record<string, string> = {
  LEAD_CONVERTED: "🎯",
  LEAD_QUALIFIED: "✏️",
  ORDER_CREATED: "📦",
  ORDER_CONFIRMED: "✅",
  ORDER_COMPLETED: "🏁",
  PROJECT_CREATED: "📁",
  TASK_ASSIGNED: "👤",
};

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [client, setClient] = useState<Client | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "orders" | "contacts" | "activity">("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const canEdit = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";
  const canDelete = session?.user?.role === "OWNER";

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        throw new Error("Client not found");
      }
      const data = await res.json();
      setClient(data.client);
      setActivity(data.activity || []);
    } catch (err) {
      console.error("Error fetching client:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function syncToOdoo() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/odoo/sync/client/${id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Synced to Odoo! Partner ID: ${data.odooId}`);
        fetchClient();
      } else {
        alert(`Sync failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${client?.name}"? This cannot be undone.`)) {
      setShowDeleteConfirm(false);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/clients");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Failed to delete"}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <Link href="/clients" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Clients
        </Link>
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          Client not found
        </div>
      </div>
    );
  }

  const brandColor = client.brand.primaryColor || "#2563EB";

  const tabs: Array<{ id: "overview" | "orders" | "contacts" | "activity"; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: `Orders (${client._count.orders})` },
    { id: "contacts", label: `Contacts (${client.contacts.length})` },
    { id: "activity", label: `Activity (${activity.length})` },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/clients" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Clients
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
              >
                {client.brand.name}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Joined {new Date(client.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 text-sm"
                style={{ backgroundColor: brandColor }}
              >
                ✏️ Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Odoo Sync Status Banner */}
      <div className="mb-4">
        {client.odooPartnerId ? (
          <div className="border rounded-lg p-3 flex items-center justify-between" style={{ borderColor: `${brandColor}40`, backgroundColor: `${brandColor}10` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: brandColor }}>
              <span className="text-lg">✓</span>
              <span><strong>Synced with Odoo</strong> · Partner ID: <code className="px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}20` }}>{client.odooPartnerId}</code></span>
            </div>
            {canEdit && (
              <button
                onClick={() => syncToOdoo()}
                disabled={syncing}
                className="text-xs px-3 py-1 text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                {syncing ? "Syncing..." : "Re-sync"}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <span className="text-lg">⚠️</span>
              <span><strong>Not synced with Odoo</strong> · This client is not in your accounting system yet.</span>
            </div>
            {canEdit && (
              <button
                onClick={() => syncToOdoo()}
                disabled={syncing}
                className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {syncing ? "Syncing..." : "Sync to Odoo"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-3xl font-bold" style={{ color: brandColor }}>{client._count.orders}</div>
          <div className="text-sm text-gray-500">Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-3xl font-bold text-purple-600">{client._count.leads}</div>
          <div className="text-sm text-gray-500">Leads</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-3xl font-bold text-green-600">
            {client.orders.filter((o) => o.status === "COMPLETED").length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={activeTab === tab.id ? { borderColor: brandColor, color: brandColor } : {}}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">Name</span>
                <span className="font-medium">{client.name}</span>
              </div>
              {client.email && (
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              <div>
                <span className="text-gray-500 block">Brand</span>
                <span>{client.brand.name}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium overflow-hidden">
                      {log.user?.avatarUrl ? (
                        <Image src={log.user.avatarUrl} alt={log.user.name} fill className="object-cover" />
                      ) : (
                        <span>{log.user?.name?.charAt(0).toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-900">
                        <span className="font-medium">{log.user?.name || "System"}</span>
                        <span className="text-gray-500 ml-1">{log.type.replace(/_/g, " ").toLowerCase()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {client.orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <p>No orders yet for this client</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {client.orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.service?.name || "—"}</div>
                      {order.service?.price && session?.user?.role !== "EDITOR" && (
                        <div className="text-sm text-gray-500">
                          Rp {typeof order.service.price === 'string' ? parseFloat(order.service.price).toLocaleString() : order.service.price.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${orderStatusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.project ? (
                        <Link href={`/projects/${order.project.id}`} className="text-blue-600 hover:underline text-sm">
                          {order.project.name}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          {client.contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p>No additional contacts yet</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                + Add Contact (coming soon)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.contacts.map((contact: Contact) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.email}</div>
                  {contact.role && (
                    <div className="text-xs text-gray-500 mt-1">{contact.role}</div>
                  )}
                  {contact.canApproveDelivery && (
                    <div className="text-xs bg-green-100 text-green-700 inline-block px-2 py-0.5 rounded mt-2">
                      ✓ Can approve delivery
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          {activity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No activity yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.map((log) => (
                <div key={log.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0">
                    {log.user?.avatarUrl ? (
                      <Image src={log.user.avatarUrl} alt={log.user.name} fill className="object-cover" />
                    ) : (
                      <span>{log.user?.name?.charAt(0).toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activityIcons[log.type] || "•"}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          <span className="text-blue-600">{log.user?.name || "System"}</span>
                          <span className="text-gray-600 ml-1">{log.type.replace(/_/g, " ").toLowerCase()}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-xs text-gray-400 mt-2 bg-gray-50 rounded px-2 py-1">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            fetchClient();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-red-600">Delete Client</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{client?.name}</strong>?
              </p>
              <p className="text-sm text-red-500">
                This action cannot be undone. All client data will be permanently removed.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditClientModal({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const originalEmail = client.email || "";
  const originalPhone = client.phone || "";
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(originalEmail);
  const [phone, setPhone] = useState(originalPhone);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    name !== client.name ||
    email !== originalEmail ||
    phone !== originalPhone;

  async function handleSave() {
    if (!hasChanges) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Edit Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name || !email || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
