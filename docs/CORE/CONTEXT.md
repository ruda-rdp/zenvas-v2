# Context - Zenvas v2

**Last Updated:** 2026-07-21

## What is Zenvas?

**Zenvas** is a **SaaS operating system** for creative businesses — and creative individuals.

> *"Operating System untuk Creative Businesses"*
> *"Tapi juga untuk Creative Individuals"*

Think **Odoo for creative industry** — starts simple as a solo creator, grows into a full agency with multiple brands, team members, and clients.

---

## The Problem

Creative professionals struggle with fragmented tools:
- Separate apps for project management, client communication, invoicing
- No unified view of operations
- Expensive, complex enterprise software overkill for small teams
- Many tools assume you already have a business with employees and clients

## The Solution

**Zenvas** starts where you are:

| Your Situation | Zenvas Supports You |
|----------------|---------------------|
| Solo creator making YouTube content | Project management, scripts, storyboards, tasks |
| Solo creator with first client | Add client management, simple invoices |
| Growing with multiple clients | Client Portal, order tracking, professional invoicing |
| Full studio/agency | Multi-brand, team, Odoo integration, advanced features |

---

## Core Philosophy: Modular from Day One

Unlike platforms that force you into a specific business model, **Zenvas adapts to how you grow**.

### Three Modes of Operation

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ZENVAS MODES                                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   SOLO      │  │   GROWING    │  │   AGENCY    │               │
│  │  CREATOR    │  │              │  │              │               │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤               │
│  │ Project OS  │  │ Project OS  │  │ Project OS  │               │
│  │ Human Cap   │  │ Human Cap   │  │ Human Cap   │               │
│  │             │  │ Business OS │  │ Business OS │               │
│  │             │  │             │  │ + Advanced  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Three OS Layers

| Layer | Description | Always ON? |
|-------|-------------|------------|
| **Project OS** | Projects, Stages, Tasks, Scripts, Storyboards | ✅ YES |
| **Human Capital OS** | User roles, Team, Board, Payout, Wallet | ✅ YES |
| **Business OS** | Clients, Orders, Invoices, Client Portal | ⚡ OPTIONAL |

---

## Real User Journeys

### Journey 1: Jacob (Solo Creator → Project-Based)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Jacob's Story                                                      │
│                                                                     │
│  MONTH 1: "I'm making films"                                        │
│  ────────────────────────────────────────────────────────────────  │
│  • Solo filmmaker, no clients yet                                  │
│  • Uses Zenvas for: Projects, Tasks, Scripts, Storyboards          │
│  • Business OS: NOT NEEDED                                         │
│  • Setup: "Jacob Org" → "Jacob Film" brand (no portal)             │
│                                                                     │
│  MONTH 6: "A hotel wants a video"                                  │
│  ────────────────────────────────────────────────────────────────  │
│  • Jacob installs Business OS app                                   │
│  • Now can: Create client "Ayana Resort", track project with them  │
│  • Hotel prefers WhatsApp — that's fine, Jacob manages in Zenvas   │
│  • Invoice generated in Zenvas even if client doesn't login         │
│                                                                     │
│  YEAR 2: "I have recurring clients"                                 │
│  ────────────────────────────────────────────────────────────────  │
│  • Enables Client Portal for "Jacob Films Studio" brand             │
│  • Gets free subdomain: jacobfilms.zenvas-portal.app               │
│  • Some clients login to check progress, others still prefer WA    │
│  • Growing steadily                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Journey 2: Dewa (YouTube → Content Business)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dewa's Story                                                       │
│                                                                     │
│  START: "Solo YouTuber"                                             │
│  ────────────────────────────────────────────────────────────────  │
│  • Dewa Personal brand                                              │
│  • Managing his own content pipeline                                │
│  • Project OS: Research → Script → Shoot → Edit → Publish          │
│                                                                     │
│  GROWTH: "Hotels want collaborations"                              │
│  ────────────────────────────────────────────────────────────────  │
│  • Creates "Dewa Collaboration" brand                               │
│  • Has Client Portal with free subdomain                           │
│  • Hotel contacts via website, Dewa creates project in Zenvas       │
│  • Invoice sent through Zenvas                                     │
│                                                                     │
│  TODAY: "I'm building dewa.id"                                      │
│  ────────────────────────────────────────────────────────────────  │
│  • Now has custom domain for Client Portal: studio.dewa.id         │
│  • CNAME pointing to his Zenvas subdomain                          │
│  • Professional, branded experience for clients                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Journey 3: EatPrayEdit (Full Studio)

```
┌─────────────────────────────────────────────────────────────────────┐
│  EPE's Story                                                        │
│                                                                     │
│  STARTED: "Video production studio"                                 │
│  ────────────────────────────────────────────────────────────────  │
│  • Multi-brand: EPE Studio, EPE Wedding                            │
│  • Full Business OS from day one                                   │
│  • Custom domains: studio.eatprayedit.com, wedding.eatprayedit.com │
│  • Team: Owner, Managers, Editors                                   │
│  • Odoo integration for accounting                                │
│                                                                     │
│  APPS INSTALLED:                                                    │
│  • Project OS (core)                                               │
│  • Human Capital OS (core)                                          │
│  • Business OS (client portal, orders, invoices)                   │
│  • Odoo Sync                                                       │
│  • Lead Management                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Architecture: Multi-Tenant SaaS

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ZENVAS SaaS                                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ORGANIZATION (Tenant)                                       │   │
│  │  "Jacob Org" / "Dewa's Studio" / "EatPrayEdit"              │   │
│  │                                                              │   │
│  │  ├── Plan: Solo | Growing | Agency                          │   │
│  │  ├── Installed Apps: [Project OS, Business OS, ...]         │   │
│  │  └── Billing & Settings                                      │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │  BRANDS                                                  │  │   │
│  │  │                                                           │  │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │   │
│  │  │  │ Jacob Film  │  │ EPE Studio  │  │ EPE Wedding │   │  │   │
│  │  │  │ (Personal)   │  │ (Business)  │  │ (Business)  │   │  │   │
│  │  │  ├─────────────┤  ├─────────────┤  ├─────────────┤   │  │   │
│  │  │  │ Portal: ❌  │  │ Portal: ✅  │  │ Portal: ✅  │   │  │   │
│  │  │  │ Domain: —   │  │ Domain: ★   │  │ Domain: ★   │   │  │   │
│  │  │  │ Invoices:❌ │  │ Invoices:✅ │  │ Invoices:✅ │   │  │   │
│  │  │  │ Projects:✅ │  │ Projects:✅ │  │ Projects:✅ │   │  │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘   │  │   │
│  │  │                                                           │  │   │
│  │  │  ★ = Custom domain OR free subdomain                    │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │  USERS                                                  │  │   │
│  │  │  Jacob (Owner), Dewa (Owner), Team Members...        │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Organization is always required** — Every user belongs to an Organization
2. **Brand is the identity unit** — Each Brand can have different features
3. **Business OS is optional** — Solo creators start without it
4. **App Store model** — Users install features as they grow

---

## Feature Flags: Three Levels

| Level | Scope | Controls |
|-------|-------|----------|
| **Organization** | Per tenant | Installed apps, plan, billing |
| **Brand** | Per brand | Client Portal, domain, branding |
| **User** | Per user | Role, permissions, brand access |

### Example: Feature Flag Behavior

```
Organization "Dewa's Studio":
├── Apps installed: [Project OS, Human Capital OS, Business OS]
└── Plan: Growing

Brand "Dewa Personal":
├── hasClientPortal: false
├── freeSubdomain: null
└── Business features: DISABLED

Brand "Dewa Collaboration":
├── hasClientPortal: true
├── freeSubdomain: dewa-collab.zenvas-portal.app
├── domain: null (not set yet)
└── Business features: ENABLED
```

---

## Target Users

| User Type | Description | Primary Use |
|-----------|-------------|-------------|
| **Solo Creator** | Individual making content | Project OS only |
| **Freelancer** | Solo with clients | Project + Light Business OS |
| **Studio** | Small team, multiple clients | Full Business OS |
| **Agency** | Multi-brand, team | Multi-brand + Advanced features |
| **Client** | External stakeholder | Client Portal (read-only) |

---

## Core Modules

### 1. Project OS (CORE - Always On)
- Project management
- Stage & Task tracking
- Script & Storyboard management
- Media library
- Timeline

### 2. Human Capital OS (CORE - Always On)
- User registration & roles
- Team management
- Brand access control
- Board (task assignment)
- Payout & Wallet

### 3. Business OS (OPTIONAL - Installable)
- Lead capture & qualification
- Client & Contact management
- Order workflow
- Invoicing
- **Client Portal** (subdomain-based)

### Future Modules (App Store)
- Odoo Sync
- Lead Management
- Knowledge Engine
- Cast Management
- Communication Module

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js
- **Deployment**: Vercel (planned)

---

## Design Principles

### 1. Start Simple, Grow Complex
> "Don't make users configure what they don't need yet"

### 2. Invisible Infrastructure
> "Clients should never know they're using Zenvas — it should feel like YOUR brand"

### 3. Opinionated Defaults
> "Sensible defaults that work for 80% of users, with customization for the rest"

### 4. Modular by Design
> "Every feature can be optional — the core (Project + Human Capital OS) works alone"

---

## Future Vision

Zenvas evolves into the **Odoo for Creative Industry**:

- **Phase 1**: Solo creator, project management, optional client portal
- **Phase 2**: Growing with clients, invoicing, team
- **Phase 3**: Full studio/agency with multi-brand, integrations
- **Phase 4**: Marketplace for templates, plugins, AI tools

---

*Last updated: 2026-07-21*
