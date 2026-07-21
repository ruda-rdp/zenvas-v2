"use client";

import { useState, useEffect } from "react";

interface OdooStatus {
  connection: {
    isConnected: boolean;
    url: string;
    db: string;
    username: string;
    hasApiKey: boolean;
  };
  stats: {
    totalClients: number;
    syncedClients: number;
    unsyncedClients: number;
    totalOrders: number;
    syncedOrders: number;
  };
  unsyncedClients: Array<{
    id: string;
    name: string;
    email: string;
    brand: string;
    createdAt: string;
  }>;
}

export default function OdooIntegrationPage() {
  const [status, setStatus] = useState<OdooStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/odoo");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching Odoo status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function syncClient(clientId: string) {
    setSyncing(clientId);
    try {
      const res = await fetch(`/api/odoo/sync/client/${clientId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStatus();
      } else {
        alert(`Sync failed: ${data.error || "Unknown"}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setSyncing(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Loading Odoo status...</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-8">
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          Failed to load Odoo status
        </div>
      </div>
    );
  }

  const syncRate = status.stats.totalClients > 0
    ? Math.round((status.stats.syncedClients / status.stats.totalClients) * 100)
    : 0;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-2xl">
          📊
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odoo Accounting</h1>
          <p className="text-gray-600 text-sm">Sync clients and invoices with your Odoo ERP</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.connection.isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <div>
              <h2 className="font-semibold">
                {status.connection.isConnected ? "Connected" : "Disconnected"}
              </h2>
              <p className="text-sm text-gray-500">
                {status.connection.isConnected
                  ? "Successfully connected to your Odoo instance"
                  : "Unable to reach your Odoo instance"}
              </p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
          <div>
            <span className="text-gray-500 block">Server URL</span>
            <code className="text-gray-900 text-xs">{status.connection.url}</code>
          </div>
          <div>
            <span className="text-gray-500 block">Database</span>
            <code className="text-gray-900">{status.connection.db}</code>
          </div>
          <div>
            <span className="text-gray-500 block">Username</span>
            <code className="text-gray-900">{status.connection.username}</code>
          </div>
          <div>
            <span className="text-gray-500 block">API Key</span>
            <code className="text-gray-900">
              {status.connection.hasApiKey ? "•••• configured" : "⚠️ Missing"}
            </code>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-3xl font-bold text-blue-600">{status.stats.totalClients}</div>
          <div className="text-sm text-gray-500">Total Clients</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-3xl font-bold text-green-600">{status.stats.syncedClients}</div>
          <div className="text-sm text-gray-500">Synced</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-3xl font-bold text-orange-600">{status.stats.unsyncedClients}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-3xl font-bold text-purple-600">{syncRate}%</div>
          <div className="text-sm text-gray-500">Sync Rate</div>
        </div>
      </div>

      {/* Pending Sync */}
      {status.unsyncedClients.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold">Pending Sync ({status.unsyncedClients.length})</h3>
            <p className="text-sm text-gray-500">These clients are not yet in your Odoo</p>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {status.unsyncedClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{client.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{client.email}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{client.brand}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => syncClient(client.id)}
                      disabled={syncing === client.id}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {syncing === client.id ? "Syncing..." : "Sync Now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Odoo Integration Works</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>When a new client is created, it&apos;s automatically synced as a Partner in Odoo</li>
          <li>When an order is confirmed, a Down Payment (DP) invoice is created (50%)</li>
          <li>When project delivery is approved, a Final invoice is created</li>
          <li>All sync operations are logged to Activity Log</li>
          <li>You can manually re-sync any client</li>
        </ul>
      </div>
    </div>
  );
}
