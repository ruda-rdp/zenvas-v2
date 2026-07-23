# Zenvas Documentation Map

Version: 1.0

---

# Purpose

This document defines the purpose of every core document in the Zenvas documentation.

Each concept should have one primary home.

Other documents may reference it, but should not duplicate it.

---

# Documentation Hierarchy

```
Context (Layer 0 — current operating reality)
    ↓
Philosophy
    ↓
Foundation
    ↓
Product Principles
    ↓
Domain Documents
    ↓
Implementation Documents
```

---

# Core Documents

## CONTEXT.md

**Purpose**

Defines the current, concrete operating reality — Organization, Brands,
People, and the hard rules derived from them (Financial Confidentiality,
Client Relationship Ownership).

Answers:

> What is true about Zenvas's actual business right now?

Contains:

- Organization and Brand facts
- People & Access model
- Employment types
- Hard confidentiality rules

Never contains:

- Timeless beliefs (that's Philosophy)
- Feature specifications

This is the least abstract, most factual document — it changes as the
business changes, unlike Philosophy and Foundation which change rarely.

---

# Core Documents

## PHILOSOPHY.md

**Purpose**

Defines what Zenvas believes.

Answers:

> Why do we build Zenvas this way?

Contains:

- Core beliefs
- Product philosophy
- Long-term values

Never contains:

- Features
- Workflows
- Architecture
- Technical implementation

---

## FOUNDATION.md

**Purpose**

Defines what Zenvas is.

Answers:

> What is Zenvas?

Contains:

- Core Realization
- Positioning
- Four Pillars
- Product Identity
- Long-term Vision

Never contains:

- Detailed workflows
- Feature specifications

---

## PRODUCT_PRINCIPLES.md

**Purpose**

Defines how product decisions are made.

Answers:

> How should Zenvas behave?

Contains:

- Service First
- Living Workspace
- One Source of Truth
- Mission Control
- Growth Principles
- Integration Principles

Never contains:

- UI implementation
- Database structure

---

# Domain Documents

## BUSINESS_OS.md

Defines how creative businesses operate.

Examples:

- Brands
- Services
- Clients
- Orders
- Finance
- Dashboards
- Mission Control

---

## PROJECT_OS.md

Defines how creative work happens.

Examples:

- Research
- Script
- Storyboard
- Production
- Editing
- Review
- Delivery

---

## HUMAN_CAPITAL_OS.md

Defines people inside the ecosystem.

Examples:

- User, Brand Access, Employment Type
- Roles & Permissions (Owner, Manager, Producer, Editor)
- Board, Apply/Assign
- Payout, Wallet, Points, Levels
- Clock-In/Clock-Out

---

## KNOWLEDGE_ENGINE.md

Defines how knowledge grows.

Examples:

- Templates
- References
- SOP
- Lessons Learned
- Studio Library
- AI Context

---

## UX_MODES.md

Defines how the interface itself behaves — the three Modes (Business,
Project, Focus) a User moves through, and what stays constant (Role-based
access) across them.

Answers:

> What does it feel like to use Zenvas, moment to moment?

Contains:

- Business Mode / Project Mode / Focus Mode definitions
- Mission Control's dual role (page vs. persistent layer)

Never contains:

- Data model definitions (that's DATA-MODELS.md)
- New business objects (that's the relevant Domain Document)

---

# Governance Documents

## CONSTITUTION.md

Rules that cannot be broken.

11 compressed hard rules, each pointing back to where it was actually
decided (BUSINESS_OS.md, HUMAN_CAPITAL_OS.md, KNOWLEDGE_ENGINE.md,
FOUNDATION.md, ADR-0001, ADR-0003, ADR-0005). Used the same way
as PRODUCT_PRINCIPLES.md's Decision Checklist, except failing a check here
means stop, not reconsider.

---

## GLOSSARY.md

Shared terminology.

Every important term should be defined only once.

---

## ADR/

Architecture Decision Records.

Documents significant technical decisions.

Current ADRs:
- ADR-0001: Odoo integration
- ADR-0002: Tech Stack (Next.js, Prisma, PostgreSQL)
- ADR-0003: Domain Routing (per-Brand Client Portal) — **defined, implementation deferred (D2)**
- ADR-0004: Payment Gateway
- ADR-0005: Modular Architecture
- PLATFORM_ADMIN.md: Platform-level admin role

---

## MVP_ROADMAP.md

Defines what gets built first.

Answers:

> What is Phase 1, and what is deliberately deferred?

Cuts the full foundation down to one working end-to-end path (Order →
Project → Delivery → Payout) for EPE Studio, with every deferred item
pointing back to where it's already designed.

---

## REFERENCES.md

Defines what Zenvas learns from existing tools, and what it deliberately
does not rebuild.

Answers:

> What already works well elsewhere, and where should Zenvas integrate
> instead of building from scratch?

---

# Documentation Rules

1. One concept has one home.
2. Documents reference each other instead of duplicating content.
3. Foundation changes rarely.
4. Domain documents may evolve.
5. ADR records implementation decisions, not philosophy.