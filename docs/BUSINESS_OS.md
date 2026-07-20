# BUSINESS_OS.md

Status: Locked v1.3 (Layer 4 domain review complete, Odoo integration per ADR-0001)

Depends On:
- FOUNDATION.md
- CONTEXT.md
- ADR-0001-odoo-integration.md

---

# Purpose

Business OS exists to operate a creative service business from the moment a
client becomes interested until that client becomes a long-term partner.

It is responsible for transforming creative work into a sustainable business
without increasing operational complexity.

Business OS does not create creative work. Business OS creates the
environment where creative work can happen consistently.

Business OS owns the **inbound** flow of the business: Brand, Service,
Client, Order, and the orchestration of Invoice/Payment status. The **outbound**
flow (people, access, compensation, payout) belongs to Human Capital OS. See
CONTEXT.md → Financial Confidentiality Principle.

The actual CRM, Invoicing, and Payment/Accounting engine is Odoo
(self-hosted), integrated via API — not built inside Zenvas. See
ADR-0001-odoo-integration.md. Business OS orchestrates the business logic
(when an Order becomes Confirmed, when a Project may be created, when a
Payout is triggered) on top of Odoo as the system of record for financial
data.

---

# Core Philosophy

Business OS is not a CRM. It is not an ERP. It is not merely a Project
Management system.

Business OS orchestrates every business activity surrounding creative work
while allowing creative teams to focus entirely on creation.

Business creates trust. Projects create satisfaction. Together they build
long-term relationships.

---

# Responsibilities

Business OS is responsible for everything before, around, and after a project.

**Native to Zenvas:** Brand Management, Service Catalog, Order orchestration
(status, linkage to Project), Client Portal, Subscription business logic,
Business Analytics, Mission Control.

**Delegated to Odoo (see ADR-0001):** Contacts/Client records, CRM,
Proposal/Quotation, Invoice, Payment, Accounting. Zenvas orchestrates *when*
these happen, Odoo is the system of record for *what* they contain.

Business OS intentionally does not manage creative execution. Creative
execution belongs to Project OS. Business OS intentionally does not manage
compensation or payout. That belongs to Human Capital OS.

---

# Brand First
*(merged from FOUNDATION.md "Brand Philosophy" + BUSINESS_OS.md "Brand First" — single home now)*

Zenvas exists to empower Brands, not replace them.

Every Brand owns its own identity, website, marketing, pricing, services, and
customer experience.

Clients build relationships with the Brand. Never with Zenvas.

The success of Zenvas is measured by the success of each Brand.

---

# Invisible Infrastructure
*(moved from FOUNDATION.md — single home now)*

Zenvas should never become the face of the business.

Clients should remember the Brand — not Zenvas. Zenvas succeeds when clients
never realize it exists.

---

# Operating Architecture: One Backbone, Many Brands
*(merged from FOUNDATION.md "Multi-Brand Philosophy")*

One Organization operates many Brands. Each Brand may have its own website,
positioning, pricing, services, and customer experience.

Behind every Brand, Zenvas provides one consistent operational backbone. A
client ordering from EatPrayEdit should never feel they are using the same
system as a client ordering from Balistory. Each Brand remains unique.
Operations remain unified.

For the current, concrete list of Brands and their status, see CONTEXT.md.

---

# Customer Journey & Order Lifecycle
*(canonical version — reconciled with Business Objects, Layer 4)*

**Hierarchy (ownership):**
```
Organization → Brand → Service Catalog
                  └──→ Client (Client Account)
                          └──→ Order
                                 ├──→ Proposal/Quotation (optional, 0 or 1)
                                 ├──→ Invoice (1 or more: DP, Final, etc.)
                                 └──→ Project (created after Order is Confirmed)
                                        └──→ Delivery
                  Client ──→ Relationship (Repeat Order / Subscription)
```

**Chronological flow (per Order cycle):**
```
Prospect → Discovers Brand → Explores Service Catalog
   ↓
(optional) Request Proposal/Quotation → Client confirms
   ↓
Order Created [status: Draft]
   ↓
Invoice (DP) issued → Client pays DP
   ↓
Order [status: Confirmed] → Client Account created (if not existing)
   ↓
Project Created → handed to Project OS (production, review, delivery)
   ↓
Delivery approved by Client → Invoice (Final) issued → Client pays Final
   ↓
Order [status: Completed]
   ↓
Repeat Order → Subscription (see below) → Relationship
```

A Project can only be created once an Order reaches `Confirmed` (DP received).
This is a hard rule — Project OS should never receive a Project without a
Confirmed Order behind it, except for Personal Brand (see CONTEXT.md), which
has no Order at all.

A project is only one chapter of the relationship. The relationship is the
real product.

---

# Subscription — Recurring Request-Slot Model
*(revised per REFERENCES.md's deep-dive on Wayfront's video-editing vertical)*

Subscription is a **growth and retention mechanism**, not just a billing
option. It is the natural upgrade path after a Client has a good experience
with one-off Orders — directly serving the "Relationship Over Transactions"
principle later in this document.

**Core model (revised):** Unlike an Order (pays for one deliverable), a
Subscription buys a **recurring request quota** for a flat fee — e.g. "Up to
4 requests/month" or "Unlimited requests, 2 active at a time." This
replaces the earlier "1 Editor, 8 hours/day" capacity framing, which
required Clock-In/Out verification to make credible. The request-slot model
needs no time tracking at all — it's verified simply by counting open
requests against the Client's quota.

- **Request quota:** limited (e.g. 4/month) or unlimited.
- **Concurrent limit:** caps how many requests can be `In Progress` at once,
  regardless of total quota — this is what actually controls team load, not
  a hard hourly commitment.
- Each request a Client submits under a Subscription still becomes a normal
  Project (Order → Confirmed → Project), except billing is drawn from the
  Subscription's quota instead of generating a new Invoice per request.

**Editor selection:** Client may request a specific editor by name (e.g. "I
want Andi again" after a great Order experience). Owner/Manager confirms
availability and finalizes the assignment — it is a request, not a guarantee.

**Growth path this enables (EPE Studio's primary acquisition funnel):**
```
Client tries a one-off Order → happy with result → wants an ongoing team
→ subscribes to a request quota (e.g. "4 requests/month") → recurring relationship
```

> **Deferred to a dedicated session:** How quota consumption is tracked
> against Invoice/billing in Odoo, what happens when a Client hits their
> concurrent limit (queued vs rejected), and whether unused quota rolls
> over. The model above is locked; billing mechanics are not yet designed.

---

# Client Portal Philosophy

The Client Portal is not merely a dashboard. It is the client's home inside
the Brand.

Clients should feel "I have my own creative team," not "I hired a
freelancer."

Inside the portal clients can: order new work, monitor progress, review
work, approve revisions, download deliverables, view invoices, continue
subscriptions. Everything happens under the Brand. Never under Zenvas.

---

# Mission Control

Mission Control is the operational awareness layer. Its purpose is not to
perform work — it helps owners understand the health of the business within
seconds.

Mission Control answers: What needs attention? Which clients are waiting?
Which projects are delayed? Which team members need support? Where is the
bottleneck? What changed since yesterday?

After understanding the situation, users leave Mission Control and enter
Project OS.

---

# Business Objects

See "Customer Journey & Order Lifecycle" above for the canonical hierarchy
and flow diagram — Business Objects and Customer Journey are now merged into
a single source.

---

# Relationship Over Transactions

Business OS is not designed to maximize transactions. It is designed to
maximize relationships.

Success is not measured by how many projects were completed. Success is
measured by how many clients return. A happy returning customer is the
greatest asset of a creative business.

---

# Operational Continuity

Creative businesses should never depend on individuals.

Projects must survive producer changes, manager changes, editor changes,
team expansion, and team reduction.

Business knowledge belongs to the organization. Never to one person.

---

# Financial Confidentiality & Payout Trigger
*(see CONTEXT.md for the full confidentiality principle)*

Order and Invoice values are confidential to the Brand — visible only to
Owner/Manager roles. This must be enforced as an access-control rule, not a
UI convention.

**Margin allocation (Order value → Payout value):**
Happens at Project creation, before the Project is posted to the Board. A
default rule applies automatically (e.g. 20% studio margin), but Owner/Manager
can override it manually per Project. The Payout amount must be visible to
the editor/freelancer *before* they accept the Project — never after.

**Payout crediting (Payout value → Editor Wallet):**
Only happens after the Client approves the final Delivery — not merely when
the editor submits their work. This is a longer chain (Client approval →
Payout credited) by design, since Payout is a downstream consequence of a
confirmed, completed Order.

Editors/freelancers only ever see their own Payout value — never the
original Order value. Full mechanics (wallet, withdrawal) belong to
HUMAN_CAPITAL_OS.md; Business OS only owns the trigger point.

---

# Out of Scope

Business OS does not build websites, does not perform marketing, does not
replace SEO tools, advertising platforms, or social media tools. Brands
remain free to choose their own marketing strategy. Business OS begins when
business becomes operation.

---

# Success Metrics

Business OS succeeds when: Clients return. Teams stay organized. Projects
continue despite personnel changes. Operations scale without chaos. Brands
can grow without rebuilding internal systems.

The greatest success of Business OS is when creative people rarely notice it.

---

# Open Items for Future Sessions

1. Full Subscription execution mechanics (capacity tracking, dedicated
   assignment model) — see note above, belongs to Human Capital OS / Project OS.
2. Proposal/Quotation document structure and states (not yet detailed).
