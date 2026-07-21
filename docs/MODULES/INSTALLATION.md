# App Store & Module Installation

## Overview

Zenvas follows an Odoo-style modular architecture where features are organized into installable modules (apps).

## Module Categories

| Category | Icon | Description |
|----------|------|-------------|
| **CORE** | 🏠 | Always installed, cannot be uninstalled |
| **BUSINESS** | 💼 | CRM, Invoicing, Analytics, etc. |
| **PROJECT** | 📋 | Tasks, Delivery, Scheduling, etc. |
| **CREATIVE** | 🎬 | Script Writer, Storyboard, Shot List, etc. |
| **COLLABORATION** | 💬 | Chat, Video, File Sharing, etc. |

## Core vs Optional Modules

### Core Modules (Always Enabled)
These modules are always available and cannot be uninstalled:
- **Dashboard** - Overview and analytics
- **Projects** - Project management with stages and tasks
- **Team** - Team member management
- **Board** - Task board for editors (EDITOR role only)
- **Wallet** - Editor earnings balance (always visible)

### Optional Modules (Business OS)

#### Available Free Modules
| Module | Description |
|--------|-------------|
| **Clients** | Client database, company profiles, communication history |
| **Orders** | Order lifecycle management, invoice generation |
| **Leads** | Lead capture, pipeline kanban, conversion tracking |
| **Payouts** | Editor earnings, payout requests, payment approval |

#### Coming Soon Modules

**Business OS:**
| Module | Description |
|--------|-------------|
| Budget Tracking | Track production costs, line items, and budget utilization |
| Cast & Talent | Track cast members, contracts, availability, and payments |
| Crew Management | Department heads, crew lists, deal memos, and payroll |
| Analytics Dashboard | Business intelligence with revenue, performance metrics |
| Branding Kit | Custom brand colors, logos, and client portal |
| Automation | Workflow automation and task triggers |

**Project OS:**
| Module | Description |
|--------|-------------|
| Dailies Review | Daily footage review, sync, and approval workflow |
| VFX Tracker | Track visual effects shots from onset to delivery |
| Deliverables & QC | Netflix delivery requirements and QC checks |
| Script Writer | AI-assisted script writing with scene breakdowns |
| Storyboard Canvas | Visual storyboarding with drag-and-drop interface |
| Shot List | Create detailed shot lists for production days |
| Scheduling & Call Sheets | Production calendar and automated call sheet generation |
| Location Management | Scout, book, and manage production locations |
| Music & Sound | Music licensing and soundtrack management |

**Collaboration:**
| Module | Description |
|--------|-------------|
| Communication Hub | Unified inbox for email, WhatsApp, and chat |
| Video Calls | Built-in video conferencing with screen sharing |
| File Sharing | Centralized file storage with version control |
| AI Summary | AI-powered meeting summaries and action items |

## Installation Flow

### For New Users
1. User registers → Creates organization with default brand
2. Core modules are automatically enabled
3. Business modules can be installed via App Store

### For Existing Users
1. Navigate to **App Store** in sidebar (OWNER only)
2. Browse available modules
3. Click **Install** to add module
4. Module appears in sidebar immediately

## How It Works

### Data Model
```prisma
model Organization {
  // Core apps are always present
  apps String[] @default(["project-os", "human-capital-os"])
  
  // Optional: add modules like "clients", "orders", "leads"
}
```

### Permission Model
- Only **OWNER** role can install/uninstall apps
- Installed apps appear in sidebar navigation
- Users can remove apps anytime without data loss

## API Endpoints

### GET /api/organization/apps
Returns list of installed app IDs for current organization.

### POST /api/organization/apps
Install or uninstall apps.
```json
{
  "appId": "clients",
  "action": "install" | "uninstall"
}
```

## User Experience

### Sidebar Behavior
```
Before Business OS installed:
├── Dashboard
├── Projects  
├── Team
├── Payouts ⚠️
└── App Store 🆕

After installing Clients + Orders:
├── Dashboard
├── Projects
├── Team
├── Clients ✨
├── Orders ✨
├── Payouts
└── App Store
```

## Implementation Notes

1. **No Mode Switching** - No "Solo Mode" or similar concepts. User simply installs modules as needed.

2. **Brand Per User** - Every user has a default personal brand. They can rename it or add more brands.

3. **Backward Compatible** - Existing organizations with data continue working. New modules are additive.

4. **Data Preservation** - Uninstalling a module hides the UI but data remains in database.

## Module Registry

Full module specifications are available in:
- [MODULE_REGISTRY.md](./MODULE_REGISTRY.md) - Complete catalog of all modules
- [EPISODIC_PRODUCTION_GUIDE.md](./EPISODIC_PRODUCTION_GUIDE.md) - Netflix-scale production needs
- Individual module specs in [docs/MODULES/](../MODULES/)
