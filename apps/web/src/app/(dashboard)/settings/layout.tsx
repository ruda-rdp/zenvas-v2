"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasBusinessOS, setHasBusinessOS] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = session?.user?.role === "OWNER";
  const isManager = session?.user?.role === "MANAGER";

  // Check if business-os app is installed
  useEffect(() => {
    async function checkApps() {
      try {
        const res = await fetch("/api/settings/organization");
        if (res.ok) {
          const data = await res.json();
          const apps = data.organization?.apps || [];
          setHasBusinessOS(apps.includes("business-os"));
        }
      } catch (err) {
        console.error("Error checking apps:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      checkApps();
    }
    // Don't call setLoading here - checkApps handles it via finally
  }, [session?.user]);

  const navSections = [
    {
      title: "Workspace",
      items: [
        { href: "/settings", label: "Overview", icon: "🏠", available: true },
        { href: "/settings/organization", label: "Organization", icon: "🏢", available: isOwner },
        { href: "/settings/brands", label: "Brands", icon: "🎨", available: isOwner || isManager },
        { href: "/team", label: "Team", icon: "👥", available: true },
      ],
    },
    {
      title: "Business Features",
      items: [
        { href: "/clients", label: "Clients", icon: "👤", available: hasBusinessOS },
        { href: "/orders", label: "Orders", icon: "📋", available: hasBusinessOS },
        { href: "/leads", label: "Leads", icon: "🎯", available: hasBusinessOS, badge: "Soon" },
      ],
    },
    {
      title: "Integrations",
      items: [
        { href: "/settings/integrations", label: "All Integrations", icon: "🔌", available: true },
        { href: "/settings/integrations/odoo", label: "Odoo Accounting", icon: "📊", badge: "Active", available: true },
        { href: "/settings/integrations/slack", label: "Slack", icon: "💬", badge: "Soon", available: false },
        { href: "/settings/integrations/google-drive", label: "Google Drive", icon: "📁", badge: "Soon", available: false },
        { href: "/settings/integrations/whatsapp", label: "WhatsApp", icon: "📱", badge: "Soon", available: false },
        { href: "/settings/integrations/zoom", label: "Zoom", icon: "📹", badge: "Soon", available: false },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/settings/billing", label: "Billing & Plans", icon: "💳", badge: "Soon", available: false },
        { href: "/settings/notifications", label: "Notifications", icon: "🔔", badge: "Soon", available: false },
        { href: "/settings/security", label: "Security", icon: "🔒", badge: "Soon", available: false },
        { href: "/settings/api-keys", label: "API Keys", icon: "🔑", badge: "Soon", available: false },
      ],
    },
    {
      title: "Advanced",
      items: [
        { href: "/settings/audit-log", label: "Audit Log", icon: "📋", badge: "Soon", available: false },
        { href: "/settings/webhooks", label: "Webhooks", icon: "🌐", badge: "Soon", available: false },
        { href: "/settings/data-export", label: "Data Export", icon: "📦", badge: "Soon", available: false },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex-shrink-0">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Workspace & integrations</p>
        </div>

        <nav className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const isDisabled = !item.available;

                  if (isDisabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-400 cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            item.badge === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* App Store Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/apps"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>🛍️</span>
            <span>App Store</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/profile"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <span>👤</span>
            <span>My Profile →</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
