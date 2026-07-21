"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface WithdrawalRequest {
  id: string;
  amount: string;
  status: string;
  requestedAt: string;
  paidAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PayoutsPage() {
  const { data: session } = useSession();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const canManage = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";

  useEffect(() => {
    if (canManage) {
      fetchWithdrawals();
    }
  }, [filter]);

  async function fetchWithdrawals() {
    setLoading(true);
    try {
      const url = filter === "all" 
        ? "/api/payouts" 
        : `/api/payouts?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsPaid(id: string) {
    setProcessing(id);
    try {
      const res = await fetch(`/api/payouts/${id}/mark-paid`, {
        method: "POST",
      });
      if (res.ok) {
        fetchWithdrawals();
      }
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setProcessing(null);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAmount(amount: string) {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID")}`;
  }

  if (!canManage) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          You don&apos;t have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payouts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage editor withdrawal requests</p>
        </div>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Requests</option>
          <option value="REQUESTED">Pending</option>
          <option value="PAID">Completed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {withdrawals.filter(w => w.status === "REQUESTED").length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-orange-600">
            {formatAmount(
              withdrawals
                .filter(w => w.status === "REQUESTED")
                .reduce((sum, w) => sum + parseFloat(w.amount), 0).toString()
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600">
            {withdrawals.filter(w => w.status === "PAID").length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(
              withdrawals
                .filter(w => w.status === "PAID")
                .reduce((sum, w) => sum + parseFloat(w.amount), 0).toString()
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Paid Out Total</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : withdrawals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No withdrawal requests</h3>
          <p className="text-gray-600 dark:text-gray-400">
            When editors request withdrawals, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Editor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {filter === "PAID" ? "Paid" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {withdrawal.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {withdrawal.user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {withdrawal.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(withdrawal.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === "REQUESTED"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}>
                      {withdrawal.status === "REQUESTED" ? "Pending" : "Completed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(withdrawal.requestedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {withdrawal.status === "REQUESTED" ? (
                      <button
                        onClick={() => markAsPaid(withdrawal.id)}
                        disabled={processing === withdrawal.id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processing === withdrawal.id ? "Processing..." : "Mark as Paid"}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {withdrawal.paidAt && formatDate(withdrawal.paidAt)}
                      </span>
                    )}
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
