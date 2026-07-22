"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Brand {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  brand: {
    id: string;
    name: string;
  };
  _count: {
    orders: number;
  };
}

interface PaginationInfo {
  hasMore: boolean;
  nextCursor: string | null;
}

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clients, setClients] = useState<Client[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // URL state - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [brandFilter, setBrandFilter] = useState(searchParams.get("brand") || "all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brandId: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    hasMore: false,
    nextCursor: null,
  });

  // Debounced search
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (brandFilter !== "all") params.set("brand", brandFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "/clients";
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, brandFilter, router]);

  const fetchClients = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (brandFilter !== "all") params.set("brand", brandFilter);
      if (!reset && pagination.nextCursor) {
        params.set("cursor", pagination.nextCursor);
      }

      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();

      if (reset) {
        setClients(data.clients || []);
      } else {
        setClients((prev) => [...prev, ...(data.clients || [])]);
      }
      setPagination(data.pagination || { hasMore: false, nextCursor: null });
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, brandFilter, pagination.nextCursor]);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, []);

  useEffect(() => {
    fetchClients(true);
    fetchBrands();
  }, [fetchClients, fetchBrands]);

  const filteredClients = clients; // Already filtered server-side

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate brands loaded
    if (brands.length === 0) {
      alert("No brands available. Please create a brand first in Settings.");
      return;
    }

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ name: "", email: "", phone: "", brandId: "" });
        setShowForm(false);
        fetchClients(true);
      } else {
        alert(`Error: ${data.error || "Failed to create client"}`);
        console.error("Create client failed:", data);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Error creating client:", error);
    }
  }

  function handleBrandFilterChange(brandId: string) {
    setBrandFilter(brandId);
    setPagination({ hasMore: false, nextCursor: null });
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setPagination({ hasMore: false, nextCursor: null });
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Client"}
        </button>
      </div>

      {showForm && brands.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-yellow-800 mb-1">No brands available</h3>
          <p className="text-sm text-yellow-700 mb-2">
            You need to create a brand first before adding clients.
          </p>
          <a
            href="/settings"
            className="inline-block px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            Go to Settings →
          </a>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="PT Sunshine Properties"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="+62 812 3456 7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select
                  required
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Client
              </button>
            </div>
          </form>
        </div>
      )}

      {clients.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 pl-10 border rounded-lg"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={brandFilter}
            onChange={(e) => handleBrandFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-lg min-w-[150px]"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || brandFilter !== "all"
              ? "No clients match your search"
              : "No clients yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || brandFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first client to start creating orders."}
          </p>
          {searchQuery || brandFilter !== "all" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setBrandFilter("all");
              }}
              className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Client
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => (window.location.href = `/clients/${client.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      {client.email && (
                        <div className="text-sm text-gray-500">{client.email}</div>
                      )}
                      {client.phone && (
                        <div className="text-sm text-gray-500">📞 {client.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.brand.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client._count.orders} orders
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            {pagination.hasMore && (
              <button
                onClick={() => fetchClients(false)}
                disabled={loadingMore}
                className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            )}

            {!pagination.hasMore && clients.length > 0 && (
              <p className="text-sm text-gray-500 py-2">
                Showing {clients.length} client{clients.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
