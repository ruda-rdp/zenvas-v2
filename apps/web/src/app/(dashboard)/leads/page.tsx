"use client";

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  priority: string;
  interest: string;
  budget: string | null;
  createdAt: string;
  brand: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
}

interface Brand {
  id: string;
  name: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  QUALIFIED: "bg-yellow-100 text-yellow-800",
  ON_HOLD: "bg-gray-100 text-gray-800",
  CONVERTED: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  WON: "bg-green-100 text-green-800",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "WEBSITE_FORM",
    interest: "",
    budget: "",
    brandId: "",
  });

  useEffect(() => {
    // Inline fetch to avoid stale closures
    async function loadData() {
      setLoading(true);
      try {
        const url = filter === "all"
          ? "/api/leads"
          : `/api/leads?status=${filter}`;
        const [leadsRes, brandsRes] = await Promise.all([
          fetch(url),
          fetch("/api/settings/brands"),
        ]);

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData.leads || []);
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.brands || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filter]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const url = filter === "all"
        ? "/api/leads"
        : `/api/leads?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBrands() {
    try {
      const res = await fetch("/api/settings/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }

  async function handleConvert(leadId: string) {
    if (!confirm("Convert this lead to a client?")) return;

    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Lead converted to client!");
        fetchLeads();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to convert lead");
      }
    } catch (error) {
      console.error("Error converting lead:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.brandId) {
      alert("Please select a brand");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          name: "", email: "", phone: "", company: "",
          source: "WEBSITE_FORM", interest: "", budget: "",
          brandId: brands[0]?.id || ""
        });
        setShowForm(false);
        fetchLeads();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create lead");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage incoming leads and inquiries</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Lead</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="WEBSITE_FORM">Website Form</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="INSTAGRAM_DM">Instagram DM</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="GOOGLE_SEARCH">Google Search</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest *</label>
                <input
                  type="text" required
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Real Estate Video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Rp 5-10 juta"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Lead
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {["all", "NEW", "QUALIFIED", "CONVERTED", "LOST"].map((status) => (
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
        <div className="text-center py-12 text-gray-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-600">Leads will appear here as they come in.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">
                      {lead.email || lead.phone || "No contact"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {lead.brand?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {lead.source.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{lead.interest}</div>
                    {lead.budget && (
                      <div className="text-sm text-gray-500">{lead.budget}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[lead.status] || "bg-gray-100"}`}>
                      {lead.status.replace("_", " ")}
                    </span>
                    {lead.client && (
                      <span className="ml-2 text-xs text-green-600">→ {lead.client.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {lead.status !== "CONVERTED" && lead.status !== "WON" && (
                      <button
                        onClick={() => handleConvert(lead.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Convert to Client
                      </button>
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
