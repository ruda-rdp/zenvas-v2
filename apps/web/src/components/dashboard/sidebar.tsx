"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Target,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  User,
  Settings,
  ChevronDown,
  Building2,
  ClipboardList,
  FileText,
  Wallet,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
  installedPackages?: string[];
  installedApps?: string[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  roles?: string[];
  requiresPackage?: string;
  requiresApp?: string;
}

const navigation: NavItem[] = [
  // Core - Always visible
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Board", href: "/board", icon: Target, roles: ["EDITOR"] }, // Task board for editors
  { name: "Team", href: "/team", icon: Users },
  { name: "Messages", href: "/chat", icon: MessageSquare },

  // Business modules - Only shown if business-os package is installed
  { name: "Clients", href: "/clients", icon: Building2, roles: ["OWNER"], requiresPackage: "business-os", requiresApp: "clients" },
  { name: "Orders", href: "/orders", icon: ClipboardList, roles: ["OWNER"], requiresPackage: "business-os", requiresApp: "orders" },
  { name: "Leads", href: "/leads", icon: FileText, roles: ["OWNER"], requiresPackage: "business-os", requiresApp: "leads" },
  { name: "Payouts", href: "/payouts", icon: Wallet, roles: ["OWNER"], requiresApp: "payouts" },

  // Admin
  { name: "App Store", href: "/apps", icon: ShoppingCart, roles: ["OWNER"] },
];

const SIDEBAR_STORAGE_KEY = "zenvas-sidebar-collapsed";

export function DashboardSidebar({
  user,
  installedPackages = [],
  installedApps = []
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage on first render (lazy initialization)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return saved === "true";
    }
    return false;
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Set mounted on first render for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load collapsed state from localStorage on mount (only for SSR)
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null && isCollapsed !== (saved === "true")) {
      setIsCollapsed(saved === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run on mount to sync from localStorage

  // Save collapsed state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Filter navigation by user role, packages, AND installed apps
  const filteredNav = navigation.filter(item => {
    // Check role first
    if (item.roles && !item.roles.includes(user.role)) {
      return false;
    }

    // Check if package is required and installed
    if (item.requiresPackage && !installedPackages.includes(item.requiresPackage)) {
      return false;
    }

    // Check if app requires installation
    if (item.requiresApp && !installedApps.includes(item.requiresApp)) {
      return false;
    }

    return true;
  });

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{ width: isCollapsed ? "5rem" : "16rem" }}
    >
      {/* Logo + Collapse Toggle */}
      <div className={`flex items-center border-b border-gray-800 ${isCollapsed ? "p-3 justify-center" : "p-4 justify-between"}`}>
        {!isCollapsed ? (
          <>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Zenvas</h1>
              <p className="text-xs text-gray-500 mt-0.5">Internal</p>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.name} className={`relative group ${isCollapsed ? "flex justify-center" : ""}`}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                } ${isCollapsed ? "w-12" : ""}`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "text-white" : "text-gray-400"
                  }`}
                  strokeWidth={1.75}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>

              {/* Tooltip when collapsed - shows on right */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg border border-gray-700">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-gray-800" ref={userMenuRef}>
        {isCollapsed ? (
          // Collapsed state - just avatar, click to uncollapse + open dropdown
          <button
            onClick={() => {
              setIsCollapsed(false);
              setIsUserMenuOpen(true);
            }}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-800 transition-colors relative group"
            title={user.name || undefined}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm font-medium ring-2 ring-gray-700">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
              {user.name}
            </div>
          </button>
        ) : (
          // Expanded state - full user info
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <UserDropdownMenu
                user={user}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                onClose={() => setIsUserMenuOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// User Dropdown Menu Component
interface UserDropdownMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
  theme?: string;
  onThemeToggle: () => void;
  onClose: () => void;
}

function UserDropdownMenu({
  user,
  theme,
  onThemeToggle,
  onClose,
}: UserDropdownMenuProps) {
  const menuItems = [
    {
      label: "View Profile",
      href: "/profile",
      icon: User,
      onClick: undefined,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      onClick: undefined,
    },
    {
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      href: undefined,
      icon: theme === "dark" ? Sun : Moon,
      onClick: onThemeToggle,
    },
    {
      label: "Sign Out",
      href: undefined,
      icon: LogOut,
      onClick: () => signOut({ callbackUrl: "/login" }),
      danger: true,
    },
  ];

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 w-full bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          if (item.href) {
            return (
              <Link
                key={index}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                item.danger
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
