"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "Dashboard" },
  { name: "Projects", href: "/projects", icon: "Projects" },
  { name: "Clients", href: "/clients", icon: "Clients" },
  { name: "Leads", href: "/leads", icon: "Leads" },
  { name: "Team", href: "/team", icon: "Team" },
  { name: "Payouts", href: "/payouts", icon: "Payouts" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Zenvas</h1>
        <p className="text-xs text-gray-400">Internal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.role}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-2 text-gray-400 hover:text-white"
            title="Sign out"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
