"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface BrandCount {
  clients: number;
  orders: number;
  projects: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  freeSubdomain: string | null;
  primaryColor: string;
  logoUrl: string | null;
  hasClientPortal: boolean;
  createdAt: string;
  _count?: BrandCount;
}

export default function BrandsSettingsPage() {
  const { data: session } = useSession();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: "success" as "success" | "error", text: "" });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form state
  const [newBrand, setNewBrand] = useState({
    name: "",
    slug: "",
    primaryColor: "#2563EB",
    hasClientPortal: false, // Solo Creator mode by default
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    primaryColor: "#2563EB",
    hasClientPortal: false,
    domain: "",
  });

  const isOwnerOrManager = session?.user?.role === "OWNER" || session?.user?.role === "MANAGER";

  // Inline fetch in useEffect to avoid hoisting issues
  useEffect(() => {
    let ignore = false;

    async function loadBrands() {
      try {
        const res = await fetch("/api/settings/brands");
        if (res.ok && !ignore) {
          const data = await res.json();
          setBrands(data.brands || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching brands:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBrands();
    return () => { ignore = true; };
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  async function createBrand() {
    if (!newBrand.name.trim()) {
      setMessage({ type: "error", text: "Brand name is required" });
      return;
    }

    setCreating(true);
    setMessage({ type: "success", text: "" });

    try {
      const res = await fetch("/api/settings/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBrand),
      });

      if (res.ok) {
        const data = await res.json();
        setBrands(prev => [data.brand, ...prev]);
        setShowCreateModal(false);
        setNewBrand({ name: "", slug: "", primaryColor: "#2563EB", hasClientPortal: false });
        setMessage({ type: "success", text: "Brand created successfully" });
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: errorData.error || "Failed to create brand" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setCreating(false);
    }
  }

  async function updateBrand() {
    if (!editingBrand || !editForm.name.trim()) return;

    setCreating(true);
    setMessage({ type: "success", text: "" });

    try {
      const res = await fetch(`/api/settings/brands/${editingBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          primaryColor: editForm.primaryColor,
          hasClientPortal: editForm.hasClientPortal,
          domain: editForm.domain || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? data.brand : b));
        setEditingBrand(null);
        setMessage({ type: "success", text: "Brand updated successfully" });
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: errorData.error || "Failed to update brand" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(brand: Brand) {
    setEditingBrand(brand);
    setEditForm({
      name: brand.name,
      primaryColor: brand.primaryColor,
      hasClientPortal: brand.hasClientPortal,
      domain: brand.domain || "",
    });
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/settings" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
          ← Back to Settings
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
            <p className="text-gray-600 mt-1">Manage your brand identities</p>
          </div>
          {isOwnerOrManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Brand
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Solo Creator Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-900">Solo Creator Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              Brands are created without Client Portal by default. You can enable Client Portal later
              to allow clients to track projects. No domain required to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                {/* Brand Color/Logo */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {brand.name ? brand.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">{brand.name}</h3>
                    {isOwnerOrManager && (
                      <button
                        onClick={() => openEditModal(brand)}
                        className="text-sm text-gray-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">/{brand.slug}</p>

                  {/* Client Portal Status */}
                  <div className="mt-2">
                    {brand.hasClientPortal ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Client Portal Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        Solo Mode
                      </div>
                    )}
                  </div>

                  {/* Portal URL */}
                  {brand.hasClientPortal && (
                    <div className="mt-2 text-xs text-gray-500">
                      {brand.domain ? (
                        <span className="text-blue-600">{brand.domain}</span>
                      ) : brand.freeSubdomain ? (
                        <span>{brand.freeSubdomain}</span>
                      ) : null}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>{brand._count?.projects ?? 0} projects</span>
                    {brand.hasClientPortal && (
                      <>
                        <span>•</span>
                        <span>{brand._count?.clients ?? 0} clients</span>
                        <span>•</span>
                        <span>{brand._count?.orders ?? 0} orders</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-600 mb-4">Create your first brand to start managing projects</p>
          {isOwnerOrManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Brand
            </button>
          )}
        </div>
      )}

      {/* Create Brand Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Brand</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({
                    ...newBrand,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  placeholder="Jacob Film"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newBrand.slug}
                  onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                  placeholder="jacob-film"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Used for: /projects?brand={newBrand.slug || 'slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newBrand.primaryColor}
                    onChange={(e) => setNewBrand({ ...newBrand, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newBrand.primaryColor}
                    onChange={(e) => setNewBrand({ ...newBrand, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBrand.hasClientPortal}
                    onChange={(e) => setNewBrand({ ...newBrand, hasClientPortal: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Enable Client Portal</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allow clients to track projects. Free subdomain provided automatically.
                    </p>
                  </div>
                </label>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createBrand}
                  disabled={creating || !newBrand.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Brand"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingBrand(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Brand</h2>
              <button onClick={() => setEditingBrand(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Jacob Film"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editForm.primaryColor}
                    onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editForm.primaryColor}
                    onChange={(e) => setEditForm({ ...editForm, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.hasClientPortal}
                    onChange={(e) => setEditForm({ ...editForm, hasClientPortal: e.target.checked })}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Enable Client Portal</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allow clients to track projects.
                    </p>
                  </div>
                </label>
              </div>

              {/* Custom Domain (only shown if hasClientPortal is true) */}
              {editForm.hasClientPortal && (
                <div className="border-t pt-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain (Optional)</label>
                  <input
                    type="text"
                    value={editForm.domain}
                    onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                    placeholder="studio.jacobfilms.com"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingBrand.freeSubdomain ? (
                      <>Free subdomain: {editingBrand.freeSubdomain}</>
                    ) : (
                      "Add CNAME record to point to your free subdomain"
                    )}
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setEditingBrand(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBrand}
                  disabled={creating || !editForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
