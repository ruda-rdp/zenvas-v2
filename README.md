# Zenvas v2

**Operating System for Creative Service Businesses**

> Built fresh from lessons learned. Modular by design. MVP-first.

---

## 🎯 Vision

A modular, Odoo-inspired operating system purpose-built for creative service businesses:
- Video production agencies
- Content creators
- Photographers
- Creative agencies

Modular apps that can be activated/deactivated without breaking the core.

---

## 📚 Documentation

For complete reading order and document descriptions, see [`docs/README.md`](docs/README.md).

Quick reference:
- [`docs/CORE/PHILOSOPHY.md`](docs/CORE/PHILOSOPHY.md) — What we believe
- [`docs/CORE/FOUNDATION.md`](docs/CORE/FOUNDATION.md) — What Zenvas is
- [`docs/CORE/CONTEXT.md`](docs/CORE/CONTEXT.md) — Current operating reality
- [`docs/DESIGN/CONSTITUTION.md`](docs/DESIGN/CONSTITUTION.md) — Rules that cannot be broken
- [`docs/ADR/`](docs/ADR/) — Architecture Decision Records

---

## 🏗️ Architecture

```
ZENVAS-V2/
├── docs/                     # All foundational documents
│   ├── PLANNING/             # Pre-implementation planning artifacts
│   └── ADR/                  # Architecture Decision Records
│
├── apps/
│   └── web/                  # Main Next.js application
│       ├── src/
│       │   ├── app/          # App Router pages
│       │   └── api/          # API routes
│       └── prisma/           # Database schema
│
├── packages/
│   └── shared/               # Shared types, utilities
│
└── workspace/
    └── PLANNING/             # UI mockups, page flows
        └── MOCKUPS/          # Wireframe artifacts
```

---

## 🚀 Status

**Phase:** Phase 1 Core in progress — see [`docs/PROCESS/CHECKPOINT.md`](docs/PROCESS/CHECKPOINT.md) for current state.

**Current focus:**
- [x] Foundation documents locked
- [x] SYSTEM-MAP (visual architecture)
- [x] Page Flow diagrams
- [x] Data Model design
- [x] API Contracts
- [x] UI Mockups (4 critical screens)
- [x] Implementation Plan (file structure + build order)
- [x] Implementation kickoff (Phase A: Foundation, per IMPLEMENTATION-PLAN.md)

---

## 🛠️ Tech Stack (Planned)

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 5.x
- **Auth:** NextAuth.js
- **Deployment:** Self-hosted Ubuntu VM (initial)

---

## 🔗 Integrations

- **Odoo:** bisnis.kreatifproduction.com (standard modules, API integration)
- **WordPress:** eatprayedit.com (separate, no direct integration)
- **Client Portal:** app.eatprayedit.com → Zenvas subdomain

---

*Last updated: 2026-07-20*
