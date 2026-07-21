"use client";

import Link from "next/link";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "communication" | "storage" | "accounting" | "automation" | "ai";
  status: "available" | "coming-soon";
  href?: string;
}

const integrations: Integration[] = [
  // Accounting
  {
    id: "odoo",
    name: "Odoo Accounting",
    description: "Sync clients and invoices with your Odoo ERP. Auto-create partners, DP invoices, and final invoices.",
    icon: "📊",
    category: "accounting",
    status: "available",
    href: "/settings/integrations/odoo",
  },
  {
    id: "xero",
    name: "Xero",
    description: "Connect with Xero for seamless bookkeeping and invoicing.",
    icon: "📗",
    category: "accounting",
    status: "coming-soon",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync invoices and expenses with QuickBooks Online.",
    icon: "📘",
    category: "accounting",
    status: "coming-soon",
  },

  // Communication
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications about project updates, task assignments, and client messages in your Slack workspace.",
    icon: "💬",
    category: "communication",
    status: "coming-soon",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect your WhatsApp Business to receive client inquiries directly in Zenvas.",
    icon: "📱",
    category: "communication",
    status: "coming-soon",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Schedule client meetings and video calls directly from project pages.",
    icon: "📹",
    category: "communication",
    status: "coming-soon",
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Auto-generate Google Meet links for client meetings.",
    icon: "🎥",
    category: "communication",
    status: "coming-soon",
  },

  // Storage
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect Google Drive to attach project files and deliver assets to clients.",
    icon: "📁",
    category: "storage",
    status: "coming-soon",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Sync project assets with Dropbox for easy access.",
    icon: "📦",
    category: "storage",
    status: "coming-soon",
  },
  {
    id: "frame-io",
    name: "Frame.io",
    description: "Industry-standard video review and approval workflow.",
    icon: "🎬",
    category: "storage",
    status: "coming-soon",
  },

  // Automation
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect Zenvas to 5000+ apps with no-code automations.",
    icon: "⚡",
    category: "automation",
    status: "coming-soon",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send real-time events to your custom endpoints.",
    icon: "🌐",
    category: "automation",
    status: "coming-soon",
  },

  // AI
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description: "Get smart suggestions for project planning, task breakdowns, and client communications.",
    icon: "🤖",
    category: "ai",
    status: "coming-soon",
  },
  {
    id: "ai-knowledge",
    name: "AI Knowledge Engine",
    description: "Train your own AI on your project history and team expertise.",
    icon: "🧠",
    category: "ai",
    status: "coming-soon",
  },
];

const categoryLabels: Record<string, string> = {
  communication: "Communication",
  storage: "Storage",
  accounting: "Accounting",
  automation: "Automation",
  ai: "AI & Intelligence",
};

export default function IntegrationsPage() {
  const grouped = integrations.reduce((acc, int) => {
    if (!acc[int.category]) acc[int.category] = [];
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">Connect Zenvas to your favorite tools</p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {categoryLabels[category]}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {items.map((int) => {
              const card = (
                <div className={`p-5 border rounded-xl transition-colors ${
                  int.status === "available"
                    ? "border-gray-200 bg-white hover:border-blue-300 cursor-pointer"
                    : "border-gray-100 bg-gray-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {int.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${int.status === "coming-soon" ? "text-gray-500" : "text-gray-900"}`}>
                          {int.name}
                        </h3>
                        {int.status === "available" ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{int.description}</p>
                    </div>
                  </div>
                </div>
              );

              if (int.href && int.status === "available") {
                return (
                  <Link key={int.id} href={int.href}>
                    {card}
                  </Link>
                );
              }

              return <div key={int.id}>{card}</div>;
            })}
          </div>
        </div>
      ))}

      {/* Request Integration */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-2">Need a specific integration?</h3>
        <p className="text-sm text-blue-800 mb-4">
          We&apos;re always adding new integrations. Let us know what you&apos;d like to see.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Request Integration
        </button>
      </div>
    </div>
  );
}
