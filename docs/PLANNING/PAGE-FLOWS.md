# PAGE-FLOWS.md

**Status:** Updated v1.1 (Reflects ADR-0005: Modular Architecture)

Depends On: ADR-0003 (domain routing), ADR-0005 (Modular Architecture),
HUMAN_CAPITAL_OS.md, BUSINESS_OS.md, PROJECT_OS.md

---

# Purpose

Defines every page in Zenvas v2, which context it lives in, and what happens
when a User of a given Role lands on the app.

Key changes from v1.0:
- **Onboarding flow** added for Solo Creator mode
- **App Store** concept introduced for optional modules
- **Client Portal routing** updated to support free subdomains
- **Solo Creator navigation** (no Business OS) documented

---

# Two Root Contexts

```
┌─────────────────────────────────────────────────────────────────────────┐
│  REQUEST ROUTING                                                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  External Domain (e.g., studio.eatprayedit.com)                  │ │
│  │  OR: [slug].zenvas-portal.app                                    │ │
│  │  → CLIENT PORTAL CONTEXT                                         │ │
│  │    • Always requires: business-os app installed                   │ │
│  │    • Always requires: brand.hasClientPortal = true               │ │
│  │    • Client-facing only                                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Internal Domain (e.g., app.zenvas.com, localhost)              │ │
│  │  → INTERNAL CONTEXT                                             │ │
│  │    • Owner / Manager / Editor only                             │ │
│  │    • Project OS always available                               │ │
│  │    • Human Capital OS always available                          │ │
│  │    • Business OS shown only if app installed                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Unknown host → 404 / neutral landing                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# ONBOARDING FLOW

## Entry: /onboarding

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Organization                                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  What's your organization called?                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  "Jacob Org" / "Dewa's Studio" / "EatPrayEdit"          │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  │  [Continue →]                                                   │ │
│  │                                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Create First Brand                                            │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │  What will you call your brand or project?                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  "Jacob Film" / "Dewa Personal" / "EPE Studio"          │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  │  Will clients access a portal to track projects?               │ │
│  │  ┌─────────────┐  ┌─────────────────────────────────────────┐   │ │
│  │  │   No        │  │  Yes (I'll manage clients/projects)    │   │ │
│  │  │   ○         │  │  ●                                    │   │ │
│  │  │  (Solo      │  │  (I have clients or will have)        │   │ │
│  │  │   Creator)  │  │                                       │   │ │
│  │  └─────────────┘  └─────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  │  [Create Brand →]                                               │ │
│  │                                                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Onboarding Logic

| Choice | Result |
|--------|--------|
| **"No" (Solo Creator)** | `hasClientPortal: false`, `apps: ["project-os", "human-capital-os"]` |
| **"Yes" (Growing/Agency)** | `hasClientPortal: true`, `apps: ["project-os", "human-capital-os", "business-os"]` |

---

# CLIENT PORTAL

**Only available if:**
- `business-os` app installed in Organization
- `brand.hasClientPortal = true`

**Key UX decisions:**
- **"Projects" not "Orders"** — Client Portal uses "Projects" terminology.
- **Progress bars** — Each project shows loading-style progress bar with %.
- **No Zenvas branding** — Client Portal feels like the Brand's own internal tool.

```
/login                          Register / Login (branded as the Brand)
/                                Redirect → /projects if logged in, else /login
/projects                        List of Client's Projects (all statuses)
/projects/new                    Project Form = Service's Intake Form
/projects/:projectId             Project detail with Stage progress
/projects/:projectId/delivery    Delivery review — Client approves or requests revision
/account                         Client's profile and notification preferences
```

---

# INTERNAL APP (Solo Creator Mode — No Business OS)

**Shown when:** `apps` does NOT include `"business-os"`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION                                                          │
│                                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Projects │  │ Scripts │  │ Tasks   │  │ Board    │  │ Settings │  │
│  └─────────┘  └─────────┘  └─────────┘  └──────────┘  └──────────┘  │
│                                                                         │
│  NOTE: No /clients, /orders, /invoices menu items                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

```
/login                           Internal login
/                                 Redirect → /projects (Solo landing)

/projects                         All Projects (no client filter)
/projects/new                     Create Project (solo, no client required)
/projects/:projectId              Project detail:
                                     - Stages, Tasks
                                     - Scripts & Storyboards
                                     - Media library
/projects/:projectId/edit         Edit project details

/scripts                          Script library (all projects)
/scripts/:scriptId                Script editor (markdown)

/storyboards                      Storyboard gallery
/storyboards/:projectId           Project storyboards

/tasks                            All Tasks (across projects)
/tasks/:taskId                    Task detail

/board                            Personal task board (Kanban view)

/team                             Team (if has team members)
/team/:userId                     User detail

/settings                         Settings
/settings/organization            Organization settings
/settings/brands                  Brand settings (name, colors)
/settings/brand/:brandId          Brand detail

/workspace                        Workspace (brand selector if multiple)
```

---

# INTERNAL APP (Growing/Agency Mode — With Business OS)

**Shown when:** `apps` includes `"business-os"`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION                                                          │
│                                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Dashboard│  │ Projects │  │ Clients │  │ Orders   │  │ Settings │  │
│  └─────────┘  └─────────┘  └─────────┘  └──────────┘  └──────────┘  │
│                                                                         │
│  Additional menu items:                                               │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐             │
│  │ Leads   │  │ Invoices│  │ Team     │  │ App Store  │             │
│  └─────────┘  └─────────┘  └──────────┘  └────────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Owner / Manager Routes

```
/dashboard                       Mission Control: attention needed, bottlenecks

/projects                         All Projects
/projects/new                     Create Project (can link to client)
/projects/:projectId               Project detail

/clients                          Client list (CONSTITUTION.md #2: Editor cannot see)
/clients/new                      Create Client
/clients/:clientId                Client detail: Order history, preferences

/orders                           All Orders
/orders/new                       Create Order (select client + service)
/orders/:orderId                  Order detail

/leads                            Lead list (if lead-management app installed)
/leads/new                         Create Lead
/leads/:leadId                    Lead detail

/invoices                         Invoice list
/invoices/new                     Create Invoice
/invoices/:invoiceId              Invoice detail

/team                             User list
/team/:userId                     User detail: assignment history, Wallet

/settings                         Settings
/settings/organization            Organization settings
/settings/brands                  Brand settings + Client Portal config
/settings/brand/:brandId          Brand detail + Portal settings
/settings/apps                     App Store (install/uninstall apps)
```

### Editor Routes

```
/dashboard                         Editor Dashboard (LANDING)
                                       - Level & XP (gamification)
                                       - Stats: earnings, completed, pending
                                       - Available Tasks (Board)
                                       - Continue Working

/projects                          Editor's assigned projects
/projects/:projectId               Project detail (read-only)

/tasks/:taskId                     Task detail
                                       - Brief, checklist
                                       - Mark complete
                                       - Subtasks
                                       - Discussion thread (Manager only, never Client)

/wallet                            Own Payout balance, history, request withdrawal

/profile                           Own profile, Brand Access (read-only)
```

---

# APP STORE

**Entry:** `/settings/apps` (Owner only)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  APP STORE                                                           │
│                                                                         │
│  Your Apps                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  ✅ Project OS (CORE)                                            │ │
│  │  ✅ Human Capital OS (CORE)                                       │ │
│  │  ✅ Business OS                                          [Remove] │ │
│  │  🔲 Lead Management                                      [Install] │ │
│  │  🔲 Odoo Sync                                           [Install] │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Recommended for You                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  📊 Analytics         Track your performance                    │ │
│  │  📱 WhatsApp Integration Chat with clients directly              │ │
│  │  📧 Email Automation  Send automated updates to clients         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# BRAND SETTINGS & CLIENT PORTAL

**Entry:** `/settings/brands/:brandId`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BRAND SETTINGS                                                       │
│                                                                         │
│  Basic Info                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Brand Name: [Jacob Film]                                        │ │
│  │  Slug: [jacob-film]                                              │ │
│  │  Primary Color: [#2563EB]                                        │ │
│  │  Logo: [Upload]                                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Client Portal                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Status: [Enable / Disable]                                      │ │
│  │                                                                  │ │
│  │  Free Subdomain: jacob-film.zenvas-portal.app                   │ │
│  │  [Copy Link]                                                     │ │
│  │                                                                  │ │
│  │  ─── Or use your own domain ───                                  │ │
│  │  Custom Domain: [studio.jacobfilms.com]                          │ │
│  │  Instructions: Add CNAME record pointing to zenvas-portal.app  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# LANDING RULES

```
Owner / Manager (no Business OS) → /projects
Owner / Manager (with Business OS) → /dashboard

Editor → /dashboard (Editor Dashboard — gamified)
```

---

# Flow Diagrams

## Solo Creator Flow (No Business OS)

```
Create Project
      │
      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Script    │────▶│ Storyboard  │────▶│    Tasks    │
│   Writing   │     │  Creation   │     │  Management │
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                    ┌───────────────────────────┘
                    ▼
             ┌─────────────┐
             │   Board     │
             │  (Kanban)   │
             └─────────────┘
                    │
                    ▼
             ┌─────────────┐
             │  Complete   │
             │   Project   │
             └─────────────┘
```

## Growing Creator Flow (With Business OS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUSINESS FLOW (optional)                                              │
│                                                                         │
│  Lead → Client → Order → Project → Delivery → Payout                 │
│      │         │       │        │            │         │              │
│      ▼         ▼       ▼        ▼            ▼         ▼              │
│  [Capture]  [Create] [Create] [Auto-creates] [Client] [Editor]         │
│  Lead form  Client   Order    from Service   views   receives         │
│             record   Draft     template     portal   payout           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Explicitly Out of Scope

- Producer-specific views (no Producer role yet)
- Points/Level UI (future gamification phase)
- Knowledge Engine library (Phase 2)
- Subscription/billing pages (future)
- Clock-In/Clock-Out (future)
- White-label (Phase 3)

---

*Last updated: 2026-07-21*
