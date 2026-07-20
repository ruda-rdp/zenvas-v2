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

Start by reading in this order:

1. **`docs/PHILOSOPHY.md`** — What we believe
2. **`docs/FOUNDATION.md`** — What Zenvas is
3. **`docs/CONTEXT.md`** — Current operating reality (Ruda org, EPE, Balistory, etc.)
4. **`docs/CONSTITUTION.md`** — Rules that cannot be broken
5. **`docs/PRODUCT_PRINCIPLES.md`** — How product decisions are made
6. **`docs/BUSINESS_OS.md`** — Brand, Service, Order, Client (inbound flow)
7. **`docs/PROJECT_OS.md`** — Service Template, Stage, Task, Delivery
8. **`docs/HUMAN_CAPITAL_OS.md`** — User, Role, Payout, Board
9. **`docs/KNOWLEDGE_ENGINE.md`** — SOP, Templates, Resource Library
10. **`docs/UX_MODES.md`** — Business / Project / Focus Mode, how the interface behaves
11. **`docs/MVP_ROADMAP.md`** — Phase 1 scope (EPE Studio operations)
12. **`docs/GLOSSARY.md`** — Terminology
13. **`docs/REFERENCES.md`** — Competitor/inspiration research (Odoo, Wayfront, Zendo, StudioBinder, Contentmaker, etc.)
14. **`docs/ADR/`** — Architecture Decision Records

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

**Phase:** Planning complete — ready for implementation kickoff

**Current focus:**
- [x] Foundation documents locked
- [x] SYSTEM-MAP (visual architecture)
- [x] Page Flow diagrams
- [x] Data Model design
- [x] API Contracts
- [x] UI Mockups (4 critical screens)
- [x] Implementation Plan (file structure + build order)
- [ ] Implementation kickoff (Phase A: Foundation, per IMPLEMENTATION-PLAN.md)

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
