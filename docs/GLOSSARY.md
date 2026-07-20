# GLOSSARY.md

Status: Locked v1.0

Purpose: Every important term used across Zenvas documentation is defined
here, once. Other documents use these terms — they do not redefine them.
Each entry links back to its home document for full context.

---

### ADR (Architecture Decision Record)
A record of a significant technical decision and its reasoning. See
ADR-0001-odoo-integration.md for the first example.

### AI Context
The accumulated Knowledge Entries (SOP, Style Guides, Client Preferences,
Templates) as future raw material for AI-assisted features. Not yet scoped.
→ KNOWLEDGE_ENGINE.md

### Apply / Assign
The two ways a User enters a Task/Stage on the Board: Apply (User requests
it) or Assign (Owner/Manager assigns it directly). Both coexist.
→ HUMAN_CAPITAL_OS.md

### Board
An aggregated, cross-Brand list of open Task/Stage opportunities, scoped to
a User's current Brand Access. Not a per-Brand board.
→ HUMAN_CAPITAL_OS.md

### Brand
An independent creative business identity (e.g. EatPrayEdit, Balistory,
KreatifProduction, Personal) operating under one Organization. Owns its own
identity, pricing, services, and customer experience.
→ BUSINESS_OS.md ("Brand First"), CONTEXT.md

### Brand Access
A simple grant connecting a User to a Brand, modeled on Odoo's multi-company
pattern. Does not create a new identity — only changes what a User can see.
→ CONTEXT.md, HUMAN_CAPITAL_OS.md

### Clock-In / Clock-Out
Mandatory time-tracking for Inhouse Users, feeding both Subscription
capacity verification and payroll hour input.
→ HUMAN_CAPITAL_OS.md

### Client
An external party who orders from a Brand. Has a Client Account, is the
subject of the Financial Confidentiality and Client Relationship Ownership
principles.
→ BUSINESS_OS.md, CONTEXT.md

### Client Portal
The Client's home inside a Brand — never inside Zenvas or Odoo's own
interface.
→ BUSINESS_OS.md

### Client Relationship Ownership Principle
The Client relationship belongs to the Brand, never to an individual person.
Editors never have direct Client contact; Owner/Manager/Producer do.
→ CONTEXT.md, HUMAN_CAPITAL_OS.md (Roles & Permissions)

### Delivery
The completed output of a Project, sent to the Client for approval. Approval
triggers the Final Invoice (Business OS) and Payout crediting (Human Capital
OS).
→ PROJECT_OS.md, BUSINESS_OS.md

### Employment Type
An attribute on User: Freelance or Inhouse. Determines the compensation
rule. Independent from Role.
→ CONTEXT.md, HUMAN_CAPITAL_OS.md

### Financial Confidentiality Principle
Order/Invoice values are confidential to Owner/Manager. Editors only ever
see their own Payout value, never the original Order value. A hard,
access-control-level rule, not a UI convention.
→ CONTEXT.md, BUSINESS_OS.md

### Invoice
A billing document tied to an Order — an Order can have more than one (e.g.
DP, Final). Managed in Odoo per ADR-0001; Zenvas orchestrates its status.
→ BUSINESS_OS.md, ADR-0001

### Knowledge Entry
A documented piece of organizational knowledge: SOP/Style Guide,
Template/Asset, Client Preference, or Lessons Learned. Attached at the same
hierarchy level as the object it describes (Service, Client, Project).
→ KNOWLEDGE_ENGINE.md

### Knowledge Surfacing
The mechanism by which relevant Knowledge Entries appear automatically
inside a Brief, rather than requiring a separate library search.
→ KNOWLEDGE_ENGINE.md

### Level
A rank (e.g. Junior/Senior Editor) unlocked by accumulated Points. Grants
Board priority and reputation visibility. Subject to Point System Stability.
→ HUMAN_CAPITAL_OS.md

### Lessons Learned
An optional, lightweight note captured after a Project's Delivery is
approved, which can be promoted into an SOP update.
→ KNOWLEDGE_ENGINE.md

### Mission Control
The operational awareness dashboard — answers "what needs attention,"
"where is the bottleneck," without performing work itself. Surfaces stale
Tasks automatically.
→ BUSINESS_OS.md, PROJECT_OS.md

### Order
The formal client commitment behind a Project. States: Draft → Confirmed
(DP received) → In Progress → Completed. A Project can only be created once
an Order is Confirmed (except Personal Brand).
→ BUSINESS_OS.md → Customer Journey & Order Lifecycle

### Organization
The top-level entity. Currently one: "Ruda." Owns one or more Brands.
Multi-Organization is the Stage 2 future vision.
→ CONTEXT.md, FOUNDATION.md

### Payout
The internal compensation value paid to an Editor/Freelancer for a
Task/Stage, derived from — but never equal to or visible alongside — the
Order value. Allocated when a Task/Stage is posted to the Board; credited to
the Wallet only after Client approves final Delivery.
→ BUSINESS_OS.md, HUMAN_CAPITAL_OS.md

### Point
An automatically-earned (or automatically/manually-deducted) unit of
performance/reputation, separate from Payout. Redeemable for money only
during an Owner-defined redemption window. Governed by Point System
Stability.
→ HUMAN_CAPITAL_OS.md

### Point System Stability
Governance rule: once Point/Level rules are live, changes must never
retroactively devalue what was already earned. Changes apply forward only.
→ HUMAN_CAPITAL_OS.md

### Producer
A Role that coordinates production and multi-editor Projects. Sees the
internal Payout Budget pool but not the raw Order value. May contact Clients
directly.
→ HUMAN_CAPITAL_OS.md → Roles & Permissions

### Project
A living workspace for creative execution, created from a Confirmed Order.
Structured into Stages and Tasks per its Service Template.
→ PROJECT_OS.md

### Proposal / Quotation
An optional pre-Order document for custom pricing, used when a Client isn't
ordering from a fixed price list.
→ BUSINESS_OS.md

### Resource Library
The growing collection of Talent and Location profiles, owned per-Brand by
default (toggle-shareable across Brands, like Brand Access).
→ KNOWLEDGE_ENGINE.md

### Role
A functional attribute on User: Owner, Manager, Producer, or Editor.
Determines what a User can see and do — independent of Employment Type.
→ HUMAN_CAPITAL_OS.md → Roles & Permissions

### Service (Service Catalog)
What a Brand offers. The starting point of the business, per Product
Principle #1 (Service First). Every Order and Project traces back to a
Service.
→ BUSINESS_OS.md, PRODUCT_PRINCIPLES.md

### Service Template
Defines a Service's Intake Form, Stage list, and Task list (with expected
durations). The concrete mechanism behind "Framework, Not Workflow" — every
Service can differ, even within one Brand.
→ PROJECT_OS.md

### Stage
A sequential phase within a Project (e.g. "Editing"), defined by the
Project's Service Template. The level shown to Clients by default.
→ PROJECT_OS.md

### Stale Task Detection
Automatic surfacing of a Task that remains incomplete past its expected
duration, shown in Mission Control as "Needs Attention." Not a manually
declared "Blocked" status.
→ PROJECT_OS.md

### Subscription
A recurring **request-slot quota** commercial model (e.g. "4 requests/month,
2 active at a time") for a flat fee — distinct from an Order (pays for one
deliverable). Revised from an earlier hour-capacity model per REFERENCES.md's
Wayfront deep-dive. EPE Studio's primary client-retention/growth mechanism.
Billing mechanics deferred.
→ BUSINESS_OS.md

### Task
A granular, checkable unit of work inside a Stage, with its own assignee,
timestamps, and expected duration. Can be nested up to 4 levels deep as
Subtasks (root Task → Subtask → Sub-subtask → Sub-sub-subtask), each level
inheriting assignee/category from its parent unless overridden. Optionally
carries a Task Category (PRE_PRODUCTION / PRODUCTION / POST_PRODUCTION) for
workload reporting.
→ PROJECT_OS.md, DATA-MODELS.md

### User
A single, brand-agnostic identity. One person, one User — regardless of how
many Brands they access or their Employment Type/Role.
→ CONTEXT.md, HUMAN_CAPITAL_OS.md

### Wallet
An Editor/Freelancer's accumulated Payout balance. MVP: manual withdrawal
request → manual bank transfer → balance cleared.
→ HUMAN_CAPITAL_OS.md
