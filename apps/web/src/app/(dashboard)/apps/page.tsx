/**
 * App Store - Module Installation
 * Odoo-style app marketplace for installing modules
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  ShoppingCart, 
  Check, 
  Building2, 
  ClipboardList, 
  FileText, 
  BarChart3,
  Palette,
  Zap,
  Lock,
  DollarSign,
  Users,
  Briefcase,
  Film,
  MapPin,
  Music,
  Calendar,
  MessageSquare,
  Video,
  FolderOpen,
  FileText as FileTextIcon,
  Puzzle,
  Clock
} from "lucide-react";

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  category: string;
  features: string[];
  status: "available" | "coming_soon";
}

const AVAILABLE_APPS: App[] = [
  // === FREE MODULES (Available) ===
  {
    id: "clients",
    name: "Clients",
    description: "Manage client contacts, companies, and communication history",
    icon: <Building2 className="w-8 h-8" />,
    price: "Free",
    category: "Business OS",
    features: [
      "Client database with contacts",
      "Company profiles",
      "Communication history",
      "Client portal access",
    ],
    status: "available",
  },
  {
    id: "orders",
    name: "Orders",
    description: "Create and manage orders with invoice generation",
    icon: <ClipboardList className="w-8 h-8" />,
    price: "Free",
    category: "Business OS",
    features: [
      "Order creation and tracking",
      "Multi-service orders",
      "Invoice generation",
      "Payment status tracking",
    ],
    status: "available",
  },
  {
    id: "leads",
    name: "Leads",
    description: "Capture and qualify leads with pipeline management",
    icon: <FileText className="w-8 h-8" />,
    price: "Free",
    category: "Business OS",
    features: [
      "Lead capture forms",
      "Pipeline kanban view",
      "Lead qualification",
      "Conversion tracking",
    ],
    status: "available",
  },
  {
    id: "payouts",
    name: "Payouts",
    description: "Manage editor earnings, payout requests, and payment approval",
    icon: <DollarSign className="w-8 h-8" />,
    price: "Free",
    category: "Business OS",
    features: [
      "Editor earnings tracking",
      "Payout request management",
      "Payment approval workflow",
      "Payment history",
    ],
    status: "available",
  },

  // === BUSINESS OS (Coming Soon) ===
  {
    id: "budget",
    name: "Budget Tracking",
    description: "Track production costs, line items, and budget utilization",
    icon: <DollarSign className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Real-time budget tracking",
      "Line item management",
      "Scene change analysis",
      "Budget vs actual reporting",
    ],
    status: "coming_soon",
  },
  {
    id: "cast",
    name: "Cast & Talent",
    description: "Track cast members, contracts, availability, and payments",
    icon: <Users className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Cast database with headshots",
      "Contract tracking",
      "Payment scheduling",
      "Scene breakdown by cast",
    ],
    status: "coming_soon",
  },
  {
    id: "crew",
    name: "Crew Management",
    description: "Department heads, crew lists, deal memos, and payroll",
    icon: <Briefcase className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Department organization",
      "Crew database with rates",
      "Deal memo tracking",
      "Timecard submission",
    ],
    status: "coming_soon",
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Business intelligence with revenue, performance, and retention metrics",
    icon: <BarChart3 className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Revenue analytics",
      "Project performance",
      "Team productivity",
      "Lead conversion funnel",
    ],
    status: "coming_soon",
  },
  {
    id: "branding",
    name: "Branding Kit",
    description: "Customize brand colors, logos, and client portal",
    icon: <Palette className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Brand color customization",
      "Logo uploads",
      "Client portal themes",
      "Email templates",
    ],
    status: "coming_soon",
  },
  {
    id: "automation",
    name: "Automation",
    description: "Workflow automation and task triggers",
    icon: <Zap className="w-8 h-8" />,
    price: "Pro",
    category: "Business OS",
    features: [
      "Auto task creation",
      "Notification triggers",
      "Status automations",
      "Webhook integrations",
    ],
    status: "coming_soon",
  },

  // === PROJECT OS (Coming Soon) ===
  {
    id: "dailies",
    name: "Dailies Review",
    description: "Daily footage review, sync, and approval workflow",
    icon: <Film className="w-8 h-8" />,
    price: "Pro",
    category: "Project OS",
    features: [
      "Frame.io integration",
      "Daily sync from cameras",
      "Print/Favorite/Reject",
      "Timestamped notes per take",
    ],
    status: "coming_soon",
  },
  {
    id: "vfx",
    name: "VFX Tracker",
    description: "Track visual effects shots from onset to delivery",
    icon: <Puzzle className="w-8 h-8" />,
    price: "Pro",
    category: "Project OS",
    features: [
      "VFX shot database",
      "Vendor assignment",
      "Version tracking",
      "Delivery tracking",
    ],
    status: "coming_soon",
  },
  {
    id: "deliverables",
    name: "Deliverables & QC",
    description: "Netflix delivery requirements and QC checks",
    icon: <FolderOpen className="w-8 h-8" />,
    price: "Pro",
    category: "Project OS",
    features: [
      "Episode delivery checklist",
      "Technical specs check",
      "Audio loudness verification",
      "Delivery tracking",
    ],
    status: "coming_soon",
  },
  {
    id: "script",
    name: "Script Writer",
    description: "AI-assisted script writing with scene breakdowns",
    icon: <FileTextIcon className="w-8 h-8" />,
    price: "Free",
    category: "Project OS",
    features: [
      "Scene-by-scene editor",
      "Character management",
      "Shot type suggestions",
      "Export to PDF",
    ],
    status: "coming_soon",
  },
  {
    id: "storyboard",
    name: "Storyboard Canvas",
    description: "Visual storyboarding with drag-and-drop interface",
    icon: <Palette className="w-8 h-8" />,
    price: "Free",
    category: "Project OS",
    features: [
      "Visual frame editor",
      "Drag-and-drop sequencing",
      "Shot type annotations",
      "Export to PDF",
    ],
    status: "coming_soon",
  },
  {
    id: "shotlist",
    name: "Shot List",
    description: "Create detailed shot lists for production days",
    icon: <Film className="w-8 h-8" />,
    price: "Free",
    category: "Project OS",
    features: [
      "Shot database per project",
      "Shot type library",
      "Equipment checklist",
      "Export to call sheet",
    ],
    status: "coming_soon",
  },
  {
    id: "scheduling",
    name: "Scheduling & Call Sheets",
    description: "Production calendar and automated call sheet generation",
    icon: <Calendar className="w-8 h-8" />,
    price: "Pro",
    category: "Project OS",
    features: [
      "Calendar-based planning",
      "Episode breakdown",
      "Call sheet generation",
      "Google Calendar sync",
    ],
    status: "coming_soon",
  },
  {
    id: "locations",
    name: "Location Management",
    description: "Scout, book, and manage production locations",
    icon: <MapPin className="w-8 h-8" />,
    price: "Free",
    category: "Project OS",
    features: [
      "Location database",
      "Scout scheduling",
      "Permit tracking",
      "Sound report management",
    ],
    status: "coming_soon",
  },
  {
    id: "music",
    name: "Music & Sound",
    description: "Music licensing and soundtrack management",
    icon: <Music className="w-8 h-8" />,
    price: "Pro",
    category: "Project OS",
    features: [
      "Music cue database",
      "License tracking",
      "Mix delivery specs",
      "Music cue sheets",
    ],
    status: "coming_soon",
  },

  // === COLLABORATION (Coming Soon) ===
  {
    id: "chat",
    name: "Communication Hub",
    description: "Unified inbox for email, WhatsApp, and chat",
    icon: <MessageSquare className="w-8 h-8" />,
    price: "Pro",
    category: "Collaboration",
    features: [
      "WhatsApp integration",
      "Website chat widget",
      "Auto-reply bot",
      "Conversation history",
    ],
    status: "coming_soon",
  },
  {
    id: "video",
    name: "Video Calls",
    description: "Built-in video conferencing with screen sharing",
    icon: <Video className="w-8 h-8" />,
    price: "Pro",
    category: "Collaboration",
    features: [
      "HD video calls",
      "Screen sharing",
      "Call recording",
      "Calendar integration",
    ],
    status: "coming_soon",
  },
  {
    id: "files",
    name: "File Sharing",
    description: "Centralized file storage with version control",
    icon: <FolderOpen className="w-8 h-8" />,
    price: "Pro",
    category: "Collaboration",
    features: [
      "File upload & organization",
      "Version history",
      "Share links with expiration",
      "Approval workflow",
    ],
    status: "coming_soon",
  },
  {
    id: "ai",
    name: "AI Summary",
    description: "AI-powered meeting summaries and action items",
    icon: <Zap className="w-8 h-8" />,
    price: "Pro",
    category: "Collaboration",
    features: [
      "Meeting transcription",
      "AI-generated summaries",
      "Action item extraction",
      "Send summary to client",
    ],
    status: "coming_soon",
  },
];

export default function AppStorePage() {
  const { data: session, status } = useSession();
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch installed apps on mount
  useEffect(() => {
    async function fetchInstalledApps() {
      try {
        const res = await fetch("/api/organization/apps");
        if (res.ok) {
          const data = await res.json();
          setInstalledApps(data.apps || []);
        }
      } catch (error) {
        console.error("Failed to fetch installed apps:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (status === "authenticated") {
      fetchInstalledApps();
    }
  }, [status]);

  // Check if user is owner
  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500">Only workspace owners can install apps</p>
      </div>
    );
  }

  const handleInstall = async (appId: string) => {
    setInstalling(appId);
    try {
      const res = await fetch("/api/organization/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, action: "install" }),
      });

      if (res.ok) {
        setInstalledApps(prev => [...prev, appId]);
      }
    } catch (error) {
      console.error("Install failed:", error);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (appId: string) => {
    setInstalling(appId);
    try {
      const res = await fetch("/api/organization/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, action: "uninstall" }),
      });

      if (res.ok) {
        setInstalledApps(prev => prev.filter(id => id !== appId));
      }
    } catch (error) {
      console.error("Uninstall failed:", error);
    } finally {
      setInstalling(null);
    }
  };

  const availableApps = AVAILABLE_APPS.filter(a => a.status === "available");
  const comingSoonApps = AVAILABLE_APPS.filter(a => a.status === "coming_soon");

  const filteredApps = activeTab === "available" 
    ? availableApps 
    : activeTab === "coming_soon" 
      ? comingSoonApps 
      : AVAILABLE_APPS;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">App Store</h1>
        </div>
        <p className="text-gray-600">
          Extend your workspace with additional modules. Install free modules or upgrade for pro features.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          All Modules
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "available"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Available ({availableApps.length})
        </button>
        <button
          onClick={() => setActiveTab("coming_soon")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "coming_soon"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          Coming Soon ({comingSoonApps.length})
        </button>
      </div>

      {/* Available Modules */}
      {activeTab !== "coming_soon" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.filter(a => a.status === "available").map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isInstalled={installedApps.includes(app.id)}
                isInstalling={installing === app.id}
                onInstall={() => handleInstall(app.id)}
                onUninstall={() => handleUninstall(app.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Coming Soon Modules */}
      {activeTab !== "available" && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.filter(a => a.status === "coming_soon").map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isInstalled={installedApps.includes(app.id)}
                isInstalling={installing === app.id}
                onInstall={() => handleInstall(app.id)}
                onUninstall={() => handleUninstall(app.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Free modules</strong> are available for all workspace owners</li>
          <li>• <strong>Pro modules</strong> require subscription for advanced features</li>
          <li>• <strong>Coming Soon</strong> modules show what&apos;s planned for future releases</li>
          <li>• Installed apps appear in your sidebar navigation</li>
          <li>• You can remove apps anytime without losing your data</li>
        </ul>
      </div>
    </div>
  );
}

// App Card Component
function AppCard({
  app,
  isInstalled,
  isInstalling,
  onInstall,
  onUninstall,
}: {
  app: App;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onUninstall: () => void;
}) {
  return (
    <div className={`bg-white border rounded-xl p-5 transition-shadow ${
      app.status === "coming_soon" 
        ? "border-gray-200 opacity-75" 
        : "hover:shadow-md border-gray-200"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          app.status === "coming_soon" ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"
        }`}>
          {app.icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            isInstalled
              ? "bg-green-100 text-green-700"
              : app.status === "coming_soon"
              ? "bg-amber-100 text-amber-700"
              : app.price === "Free"
              ? "bg-gray-100 text-gray-600"
              : "bg-purple-100 text-purple-700"
          }`}>
            {isInstalled ? "Installed" : app.status === "coming_soon" ? "Coming Soon" : app.price}
          </span>
          {app.status === "coming_soon" && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Planned
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{app.description}</p>

      <ul className="text-sm text-gray-600 mb-4 space-y-1">
        {app.features.slice(0, 3).map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>

      {isInstalled ? (
        <button
          onClick={onUninstall}
          disabled={isInstalling || app.status === "coming_soon"}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isInstalling ? "Removing..." : "Remove"}
        </button>
      ) : app.status === "coming_soon" ? (
        <button
          disabled
          className="w-full py-2 px-4 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Coming Soon
        </button>
      ) : (
        <button
          onClick={onInstall}
          disabled={isInstalling}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isInstalling ? "Installing..." : "Install"}
        </button>
      )}
    </div>
  );
}
