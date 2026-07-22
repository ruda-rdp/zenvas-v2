"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
  client: { name: string; email: string };
  service: { name: string; price: number };
  brand: { name: string };
  project: { id: string } | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all"
        ? "/api/orders"
        : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    if (!confirm(`Mark this order as ${newStatus}?`)) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage client orders and project creation</p>
        </div>
        <Link
          href="/leads"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          From Lead
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            {status === "all" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">
            Convert a lead to create your first order.
          </p>
          <Link
            href="/leads"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Leads
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.client.name}</div>
                    <div className="text-sm text-gray-500">{order.service.name}</div>
                    <div className="text-xs text-gray-400">{order.brand.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {order.service.price ? `Rp ${Number(order.service.price).toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || "bg-gray-100"}`}>
                      {order.status.replace("_", " ")}
                    </span>
                    {order.project && (
                      <span className="ml-2 text-xs text-green-600">Has Project</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {order.status === "DRAFT" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Confirm (DP Received)
                        </button>
                      )}
                      {order.status === "CONFIRMED" && !order.project && (
                        <Link
                          href={`/projects/new?orderId=${order.id}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Create Project
                        </Link>
                      )}
                      {order.status === "CONFIRMED" && order.project && (
                        <Link
                          href={`/projects/${order.project.id}`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          View Project
                        </Link>
                      )}
                      {order.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
