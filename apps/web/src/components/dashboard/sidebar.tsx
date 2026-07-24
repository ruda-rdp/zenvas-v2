"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Board", href: "/board", icon: Target, roles: ["EDITOR"] },
  { name: "Team", href: "/team", icon: Users },
  { name: "Clients", href: "/clients", icon: Building2, roles: ["OWNER"], requiresApp: "clients" },
  { name: "Orders", href: "/orders", icon: ClipboardList, roles: ["OWNER"], requiresApp: "orders" },
  { name: "Leads", href: "/leads", icon: FileText, roles: ["OWNER"], requiresApp: "leads" },
  { name: "Payouts", href: "/payouts", icon: Wallet, roles: ["OWNER"], requiresApp: "payouts" },
  { name: "App Store", href: "/apps", icon: ShoppingCart, roles: ["OWNER"] },
];

const SIDEBAR_STORAGE_KEY = "zenvas-sidebar-collapsed";

// ============================================
// NAV ITEM COMPONENT - Fixed tooltip
// ============================================
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ item, isActive, isCollapsed }: NavItemProps) {
  const Icon = item.icon;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (isCollapsed && itemRef.current) {
      setShowTooltip(true);
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: "fixed",
        left: rect.right + 8,
        top: rect.top + rect.height / 2,
        transform: "translateY(-50%)",
      });
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (isCollapsed) {
    return (
      <div
        ref={itemRef}
        className="relative w-full flex justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={item.href}
          className={`
            flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
            ${isActive
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
              : "text-white/40 hover:text-white hover:bg-white/5"
            }
          `}
        >
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </Link>
        {/* Fixed tooltip */}
        {showTooltip && (
          <div
            style={tooltipStyle}
            className="z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl border border-gray-700/50 whitespace-nowrap pointer-events-none"
          >
            {item.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-gray-900" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : ""}`} strokeWidth={1.75} />
      <span>{item.name}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </Link>
  );
}

// ============================================
// USER MENU COMPONENT
// ============================================
interface UserMenuProps {
  user: SidebarProps["user"];
  theme: string;
  onThemeToggle: () => void;
  isCollapsed: boolean;
}

function UserMenu({ user, theme, onThemeToggle, isCollapsed }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userInitial = user.name?.charAt(0).toUpperCase() || "?";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (isCollapsed && buttonRef.current) {
      setShowTooltip(true);
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: "fixed",
        left: rect.right + 8,
        top: rect.top + rect.height / 2,
        transform: "translateY(-50%)",
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) setShowTooltip(false);
  };

  const menuItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: theme === "dark" ? "Light Mode" : "Dark Mode", icon: theme === "dark" ? Sun : Moon, action: onThemeToggle },
    { label: "Sign Out", icon: LogOut, action: () => signOut({ callbackUrl: "/login" }), danger: true },
  ];

  if (isCollapsed) {
    return (
      <div ref={menuRef} className="w-full flex flex-col items-center">
        {/* User Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
        >
          {userInitial}
        </button>

        {/* Fixed Tooltip */}
        {showTooltip && !isOpen && (
          <div
            style={tooltipStyle}
            className="z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl border border-gray-700/50 whitespace-nowrap pointer-events-none"
          >
            {user.name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-gray-900" />
          </div>
        )}

        {/* Dropdown for collapsed */}
        {isOpen && (
          <div className="fixed left-[72px] bottom-4 w-64 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[100]">
            <UserDropdownContent user={user} menuItems={menuItems} onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-200 flex-shrink-0">
          {userInitial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white/90 truncate">{user.name}</p>
          <p className="text-xs text-white/40 truncate">{user.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
            <UserDropdownContent user={user} menuItems={menuItems} onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}

interface UserDropdownContentProps {
  user: SidebarProps["user"];
  menuItems: Array<{
    label: string;
    href?: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    action?: () => void;
    danger?: boolean;
  }>;
  onClose: () => void;
}

function UserDropdownContent({ user, menuItems, onClose }: UserDropdownContentProps) {
  return (
    <>
      <div className="px-4 py-3.5 border-b border-white/5">
        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
        <p className="text-xs text-white/40 truncate mt-0.5">{user.email}</p>
      </div>

      <div className="py-1.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return item.href ? (
            <Link
              key={i}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          ) : (
            <button
              key={i}
              onClick={() => { item.action?.(); onClose(); }}
              className={`w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                item.danger
                  ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ============================================
// NOTIFICATION BUTTON COMPONENT
// ============================================
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationButtonProps {
  isCollapsed: boolean;
}

function NotificationButton({ isCollapsed }: NotificationButtonProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=10");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications?limit=10");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (isCollapsed && buttonRef.current) {
      setShowTooltip(true);
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: "fixed",
        left: rect.right + 8,
        top: rect.top + rect.height / 2,
        transform: "translateY(-50%)",
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) {
      setShowTooltip(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const markAsRead = async (id: string, link?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      TASK_ASSIGNED: "📋",
      TASK_COMPLETED: "✅",
      PROJECT_UPDATE: "📁",
      DELIVERY_READY: "📦",
      LEAD_NEW: "👤",
      ORDER_CONFIRMED: "💰",
      ORDER_COMPLETED: "🎉",
    };
    return icons[type] || "🔔";
  };

  if (isCollapsed) {
    return (
      <div ref={containerRef} className="w-full flex justify-center mb-2">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-10 h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && !isOpen && (
          <div
            style={tooltipStyle}
            className="z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl border border-gray-700/50 whitespace-nowrap pointer-events-none"
          >
            Notifications
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-gray-900" />
          </div>
        )}

        {/* Dropdown for collapsed */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="fixed left-[72px] bottom-4 w-72 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[100]"
          >
            <NotificationDropdownContent
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllAsRead}
              onMarkAsRead={markAsRead}
              formatTime={formatTime}
              getIcon={getIcon}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-white/60 hover:text-white hover:bg-white/5
          transition-all duration-200
          ${isOpen ? "bg-white/5 text-white" : ""}
        `}
      >
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="text-sm font-medium">Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
            {unreadCount} new
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[100]"
        >
          <NotificationDropdownContent
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllAsRead}
            onMarkAsRead={markAsRead}
            formatTime={formatTime}
            getIcon={getIcon}
          />
        </div>
      )}
    </div>
  );
}

// Shared dropdown content
interface NotificationDropdownContentProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkAsRead: (id: string, link?: string) => void;
  formatTime: (date: string) => string;
  getIcon: (type: string) => string;
}

function NotificationDropdownContent({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkAsRead,
  formatTime,
  getIcon,
}: NotificationDropdownContentProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="font-semibold text-white/90">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-sm text-white/40">No notifications yet</p>
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  onClick={() => onMarkAsRead(notification.id, notification.link)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-white/5 transition-colors
                    ${!notification.read ? "bg-indigo-500/5" : ""}
                  `}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white/90 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
        <Link
          href="/settings/notifications"
          className="block text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </>
  );
}

// ============================================
// MAIN SIDEBAR COMPONENT
// ============================================
export function DashboardSidebar({ user, installedApps = [] }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  // Save collapsed state
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const isActive = (href: string) => pathname.startsWith(href);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");

  const filteredNav = navigation.filter(item => {
    if (item.roles && !item.roles.includes(user.role)) return false;
    if (item.requiresApp && !installedApps.includes(item.requiresApp)) return false;
    return true;
  });

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`
          bg-gray-900/80 backdrop-blur-xl border-r border-white/5
          flex flex-col h-screen
          transition-all duration-300 ease-out flex-shrink-0
          ${mounted ? (isCollapsed ? "w-20" : "w-64") : "w-64"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center border-b border-white/5 ${mounted && isCollapsed ? "justify-center p-4" : "justify-between p-5"}`}>
          {!mounted || !isCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="text-white font-bold text-sm">Z</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white/90">Zenvas</h1>
                  <p className="text-xs text-white/30">Dashboard</p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* Collapsed Logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold">Z</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <div className={`space-y-1 ${mounted && isCollapsed ? "flex flex-col items-center" : ""}`}>
            {filteredNav.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={isActive(item.href)}
                isCollapsed={mounted && isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/5 p-3">
          {/* Notification */}
          <NotificationButton isCollapsed={mounted && isCollapsed} />

          {/* User Menu */}
          <div className="mt-2">
            <UserMenu
              user={user}
              theme={theme}
              onThemeToggle={handleThemeToggle}
              isCollapsed={mounted && isCollapsed}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
