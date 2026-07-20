# FOUNDATION.md

Status: Locked v1.1

Depends On:
- PHILOSOPHY.md
- CONTEXT.md

---

# Foundation

## Why Zenvas Exists

Creative businesses are built by talented people, but as they grow, operational
complexity grows even faster.

More clients create more communication.

More projects create more coordination.

More team members create more dependencies.

More brands create more operational overhead.

Eventually, creative work becomes limited not by talent, but by operational chaos.

Zenvas exists to remove that chaos.

Its purpose is to provide a single operating system that allows creative
businesses to grow without sacrificing quality, consistency, or peace of mind.

---

# Vision

To become the operating system behind modern creative service businesses.

Zenvas is not built to become another project management application.

Zenvas is built to become the invisible operational backbone behind thousands
of creative brands around the world.

---

# Mission

Empower creative businesses to focus on creating while Zenvas quietly manages
everything required to keep the business running.

---

# What Zenvas Is

Zenvas is an Operating System for Creative Service Businesses.

It connects every operational layer required to run a modern creative company
into one continuous system.

Rather than replacing creativity, Zenvas protects it by reducing operational
friction.

---

# What Zenvas Is Not

Zenvas is not a website builder.

Zenvas is not a marketing platform (unless Marketing Automation module is installed).

Zenvas is not a social media scheduler (unless Social Media module is installed).

Zenvas is not an accounting application (integrates with Odoo for this).

Zenvas is not a generic project management tool.

Zenvas intentionally focuses on operating creative businesses. Everything
outside that scope should integrate rather than be rebuilt, unless a module
is developed to fill that specific need.

---

# Modular OS Architecture

Zenvas is built on a **modular architecture** — like Odoo Apps or DaVinci Resolve panels.
Each module can be installed, uninstalled, or upgraded independently.

## Philosophy

| Principle | Description |
|-----------|-------------|
| **Like Odoo** | Apps can be installed/uninstalled. Core stays. Organization chooses what they need. |
| **Like DaVinci Resolve** | Modules can grow to become standalone products. What starts as a panel can become a full application. |
| **Like iPhone** | App Store model. Browse, install, upgrade. Not everything installed by default. |
| **Like Figma** | Plugins extend functionality without touching core. |

## Module Properties

```typescript
interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'business' | 'project' | 'creative' | 'collaboration';
  dependencies: string[];      // other modules required
  can_grow: boolean;           // can become standalone v1, v2, v3
  standalone_potential: 'small' | 'medium' | 'large';
  organization_types: string[]; // 'video_production' | 'marketing' | 'all'
  status: 'core' | 'installed' | 'available' | 'coming_soon';
}
```

## Module Categories

### CORE (Always Installed)
These modules are the foundation — cannot be uninstalled.
- Auth & Users
- Organizations & Brands
- Roles & Permissions
- Module Manager (App Store)
- Activity Log (global)

### BUSINESS OS Modules
- CRM & Clients ✓ (Phase 1)
- Invoicing ✓ (Phase 1 — Odoo integration)
- Team & Payroll ✓ (Phase 1)
- Marketing Automation (Phase 3+)
- Social Media (Phase 3+)
- Email Campaigns (Phase 3+)
- Analytics & Reports (Phase 2+)

### PROJECT OS Modules
- Tasks ✓ (Phase 1 — core)
- Delivery ✓ (Phase 1 — basic)
- Script Writer (Phase 2) — can grow to standalone
- Storyboard Canvas (Phase 2) — can grow to standalone
- Free-Form Canvas (Phase 3) — MILANOTE killer, can grow
- Shot List (Phase 2)
- Scheduling & Call Sheets (Phase 2)
- Creative Departments (Phase 3)
- Crew Management (Phase 4)

### AI CONTENT OS Modules
- Content Series (Phase 3) — internal media production
- Character Library (Phase 3) — AI character asset management
- AI Asset Library (Phase 3) — backgrounds, props, LoRA models
- AI Pipeline Config (Phase 3) — tool configuration & cost tracking
- Performance Analytics (Phase 3) — views, engagement, retention

### COLLABORATION Modules
- Chat/Discuss ✓ (Phase 1 — built into Project OS)
- Activity Log ✓ (Phase 1)
- Video Calls (Phase 2)
- AI Summary (Phase 2)
- File Sharing (Phase 2)

### INTEGRATIONS
- Odoo ✓ (Phase 1)
- Google Drive ✓ (Phase 1)
- Frame.io (Phase 2)
- Vimeo/YouTube (Phase 2)
- Google Calendar (Phase 2)

## DaVinci Resolve Analogy

DaVinci Resolve was once multiple separate applications:
- DaVinci (color grading)
- Fusion (VFX)
- Fairlight (audio)

They merged into one "Resolve" and became more powerful together.
Pain points of moving files between apps disappeared.

Zenvas follows the same philosophy:
- What was once separate apps (CRM, PM, invoicing, script tools)
- Now lives in one OS
- Data flows between modules seamlessly

## Odoo Analogy

Odoo's App Store allows organizations to install only what they need.
A small business installs CRM + Invoicing.
A large agency adds Project Management + Timesheet.
A marketing agency adds Email Marketing + Social Media.

Zenvas follows the same model:
- A video production studio installs Tasks + Delivery + Script Writer
- A marketing agency installs Tasks + Social Media + Email Campaigns
- Both share the same Core OS

## Long-Term Growth

Modules can grow to become standalone products:

```
Script Writer Module:
├── v0.1: Basic import/export (Phase 2 MVP)
├── v1.0: Full screenplay formatting + collaboration
├── v2.0: + AI writing assistant
├── v3.0: + Advanced formatting
└── Standalone: "Zenvas Script" (separate product)
```

This is how DaVinci Resolve grew — panels became full applications.
This is how Zenvas will grow — modules become products.

---

# Core Belief

Creative people should spend their time creating.

Not searching for files.

Not asking for project status.

Not chasing invoices.

Not wondering who owns a task.

Not rebuilding lost knowledge.

Operations should quietly support creativity. Never compete with it.

---

# The Four Pillars

Zenvas is built upon four interconnected operational domains. Full definitions
live in each domain's own document — this section only defines their role.

## Business OS
Transforms services into sustainable businesses. Owns the **inbound** flow:
Brand, Service, Client, Order, Invoice, Payment. → See BUSINESS_OS.md

## Project OS
Transforms business commitments into creative execution. Every project becomes
a living workspace where ideas, communication, files, reviews, and progress
exist together. → See PROJECT_OS.md

## Human Capital OS
Transforms individuals into resilient creative organizations. Owns the
**outbound** flow: people, access across Brands, compensation, and payout.
People may change. The organization must continue. → See HUMAN_CAPITAL_OS.md

## Knowledge Engine
Transforms every completed project into organizational intelligence. Every
experience should make the next project better. → See KNOWLEDGE_ENGINE.md

---

# Organization Memory

Organizations should never lose their ability to operate because one person
leaves.

Processes. History. Decisions. Communication. Context. Responsibilities. Knowledge.

must remain with the organization.

Zenvas preserves organizational memory so work can continue regardless of
personnel changes.

---

# Creative Business Flywheel

A stronger Brand attracts better clients.

Better clients create more meaningful Projects.

Better Projects improve organizational Knowledge.

Knowledge develops stronger People.

Stronger People improve Business Operations.

Better Operations strengthen the Brand.

The cycle repeats continuously. Growth becomes cumulative instead of chaotic.

---

# Growth Philosophy

Growth should never require rebuilding the business.

Adding new clients, new editors, new producers, new services, new brands
should increase opportunity rather than complexity.

Zenvas is designed to scale operations while preserving clarity.

---

# Long-Term Vision

**Stage 1 (Now): Single Organization, Multi-Brand.**
One organization operates many independent Brands on top of one shared
operational backbone. See CONTEXT.md for the current, concrete state of this
stage.

**Stage 2 (Future): Multi-Organization / Multi-Tenant.**
Other organizations run their own creative businesses on Zenvas, fully
isolated from one another. Zenvas becomes a SaaS platform powering many
independent creative agencies.

The data architecture is designed for Stage 2 from the start. The feature
scope is deliberately frozen at Stage 1 until it is solved well.

---

# Success Definition

Zenvas succeeds when:

Creative people spend more time creating.

Clients return because the experience feels effortless.

Projects continue regardless of personnel changes.

Organizations retain their knowledge.

Brands grow without operational chaos.

Teams trust the system more than individual memory.

The greatest achievement of Zenvas is not that people notice it. It is that
creative businesses become stronger because of it.
