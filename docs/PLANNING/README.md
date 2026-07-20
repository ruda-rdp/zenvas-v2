# Planning Artifacts

**Purpose:** Pre-implementation planning for Zenvas v2.

These documents exist to align vision, architecture, and user experience before any code is written. They directly address the failures of Zenvas v1, where implementation often outpaced understanding.

---

## 📋 Planning Sequence

Each step must be agreed upon before moving to the next:

| Step | Document | Status | Purpose |
|------|----------|--------|---------|
| 1 | **SYSTEM-MAP.md** | 🟢 Done | Visual architecture, layer diagram, module relationships |
| 2 | **PAGE-FLOWS.md** | 🟢 Done | Navigation flows, URL structure, page hierarchy |
| 3 | **DATA-MODELS.md** | 🟢 Done | Schema overview, entity relationships |
| 4 | **API-CONTRACTS.md** | 🟢 Done | Endpoint specifications, request/response shapes |
| 5 | **MOCKUPS.md** | 🟢 Done (21 wireframes) | UI wireframes, design references |
| 6 | **IMPLEMENTATION-PLAN.md** | 🟢 Done | File structure, build order |

**Planning phase complete.** Ready for implementation kickoff per
IMPLEMENTATION-PLAN.md's Build Order (Phase A onward).

---

## 🏪 Module Roadmap

Zenvas is built on a **modular OS architecture** (see FOUNDATION.md).
Each module can be installed, upgraded, or uninstalled independently.

### Phase 1: MVP (Now)
Modules that must be built first.

```
CORE MODULES (Always installed)
├── Auth & Users
├── Organizations & Brands
├── Roles & Permissions
├── Module Manager (App Store)
└── Activity Log (global)

BUSINESS OS
├── CRM & Clients ✓
├── Invoicing (Odoo) ✓
├── Team & Payroll ✓

PROJECT OS
├── Tasks ✓ (Stages, Tasks, Subtasks, Assignment, Payout)
├── Delivery ✓ (Review links, Approval flow)

COLLABORATION
├── Chat/Discuss ✓ (per-project threads, global access)
└── Activity Log ✓ (immutable timeline)
```

### Phase 2: Communication Hub (Post-MVP)
Unified inbox + external integrations.

```
COMMUNICATION MODULE
├── Website Chat Widget (Odoo-style, installable)
│   └── Auto-create leads from conversations
├── Facebook Messenger Integration
│   └── Messages → Zenvas inbox
├── WhatsApp Business Integration
│   └── Messages → Zenvas inbox
└── Auto-reply Bot
    └── Keyword triggers, lead qualification

SETTINGS > INTEGRATIONS
├── Communication: Facebook, WhatsApp, Website Chat
├── Calendar: Google Calendar
├── Storage: Google Drive
├── Forms: Tally
├── Project: ClickUp
├── Video: Frame.io, Vimeo
└── Accounting: Odoo
```

### Phase 2: Creative Core (After MVP stable)

```
PROJECT OS
├── Script Writer (import/export, AI breakdown)
├── Storyboard Canvas
├── Shot List
└── Scheduling & Call Sheets

COLLABORATION
├── Video Calls (Zoom/Meet integration)
├── AI Summary (chat + calls)
└── File Sharing

INTEGRATIONS
├── Frame.io (video review)
├── Vimeo/YouTube
└── Google Calendar
```

### Phase 3: Creative Suite Expansion

```
PROJECT OS
├── Free-Form Canvas (MILANOTE killer)
├── Creative Departments
│   ├── Cast Management
│   ├── Location Scouting
│   ├── Costume Design
│   └── Production Design

BUSINESS OS
├── Analytics & Reports
├── Marketing Automation
└── Social Media

INTEGRATIONS
├── Final Draft
├── Movie Magic
└── Fuzzlecheck
```

### Phase 4: Full Suite

```
PROJECT OS
├── Crew Management
├── Recruitment
└── Distribution

BUSINESS OS
├── Email Campaigns
└── Client Portal Expansion
```

### Module Properties (Template)

```typescript
interface Module {
  id: string;           // unique identifier
  name: string;         // display name
  version: string;      // semver
  category: 'core' | 'business' | 'project' | 'creative' | 'collaboration';
  phase: 1 | 2 | 3 | 4;
  status: 'core' | 'built' | 'planning' | 'future';
  dependencies: string[]; // required modules
  can_grow: boolean;    // can become standalone product
}
```

---

---

## 🚫 Out of Scope (until Phase 2)

- Knowledge Engine UI (Phase 2 per MVP_ROADMAP.md)
- Multi-Organization support (Stage 2 future)
- Subscription execution mechanics (deferred)
- Points & Levels system (deferred)
- Resource Library (Talent/Location) (deferred)
- Producer role (deferred)

---

## 📌 Design Constraints (Hard Rules)

From `docs/PHILOSOPHY.md`, `docs/FOUNDATION.md`, `docs/CONTEXT.md`:

1. **Organization = Isolation** — Data must be org-scoped
2. **Brand = Required** — Every project belongs to a brand
3. **Service First** — Projects come from Services (Service Catalog)
4. **Project requires Confirmed Order** — Except Personal Brand
5. **Financial Confidentiality** — Editors see only their Payout, never Order value
6. **Client Relationship Ownership** — Editors never contact clients directly
7. **Knowledge surfaces in context** — No separate library to dig through

---

## 📚 Reference Documents

Before contributing to any planning artifact, read:
- `../PHILOSOPHY.md`
- `../FOUNDATION.md`
- `../CONTEXT.md`
- `../PRODUCT_PRINCIPLES.md`
- `../MVP_ROADMAP.md`

---

*Last updated: 2026-07-20*
