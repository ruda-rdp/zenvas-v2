/**
 * Modular Sidebar Navigation
 * Based on app registry with role-based filtering
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { APPS, getNavItems, type App } from "@/lib/apps";

interface SidebarProps {
  organizationApps?: string[];
}

export default function Sidebar({ organizationApps }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "EDITOR";

  const navItems = getNavItems(userRole, organizationApps);

  // Group by category
  const coreApps = navItems.filter(a => a.category === "core" && a.id !== "settings" && a.id !== "profile");
  const businessApps = navItems.filter(a => a.category === "business-os");
  const integrations = navItems.filter(a => a.category === "integrations");

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex-shrink-0">
      {/* Logo */}
      <div className="mb-6 px-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="font-bold text-gray-900">Zenvas</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="px-2 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Quick</div>
        <QuickLinks pathname={pathname} />
      </div>

      {/* Core Apps */}
      {coreApps.length > 0 && (
        <NavSection title="Workspace">
          {coreApps.map(item => (
            <NavItem key={item.id} item={item} pathname={pathname} />
          ))}
        </NavSection>
      )}

      {/* Business Apps */}
      {businessApps.length > 0 && (
        <NavSection title="Business">
          {businessApps.map(item => (
            <NavItem key={item.id} item={item} pathname={pathname} />
          ))}
        </NavSection>
      )}

      {/* Integrations */}
      {integrations.length > 0 && (
        <NavSection title="Integrations">
          {integrations.map(item => (
            <NavItem key={item.id} item={item} pathname={pathname} />
          ))}
        </NavSection>
      )}

      {/* App Store Link */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/apps"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/apps"
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>🛍️</span>
          <span>App Store</span>
        </Link>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-1">
        <NavItem
          item={APPS.find(a => a.id === "profile")!}
          pathname={pathname}
        />
        <NavItem
          item={APPS.find(a => a.id === "settings")!}
          pathname={pathname}
        />
      </div>
    </aside>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="px-3 mb-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItem({ item, pathname }: { item: App; pathname: string }) {
  const isActive = pathname === item.route || pathname.startsWith(item.route + "/");

  // Skip if no route
  if (!item.route) return null;

  return (
    <Link
      href={item.route}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span>{item.icon}</span>
      <span>{item.name}</span>
    </Link>
  );
}

function QuickLinks({ pathname }: { pathname: string }) {
  const quickLinks = [
    { href: "/projects/new", label: "New Project", icon: "➕" },
    { href: "/leads", label: "New Lead", icon: "📝" },
  ];

  return (
    <div className="space-y-1">
      {quickLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            pathname === link.href
              ? "bg-blue-50 text-blue-700"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
