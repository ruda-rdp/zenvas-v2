# CONTEXT.md

Status: Locked v1.0 (Layer 0)

Depends On: none (this is the ground truth reference for all other documents)

---

# Purpose

This document defines the actual, current operating reality of Zenvas.

While Philosophy, Foundation, and Product Principles describe timeless beliefs,
this document describes **who, what, and how many** — the concrete facts every
domain document and every agent must build against.

This document changes as the business changes. It is the least abstract,
most factual document in the hierarchy.

---

# Organization

Zenvas today runs a single Organization: **Ruda** (personal).

Multi-Organization (other companies running their own instance of Zenvas) is a
**future vision**, not a current requirement. See FOUNDATION.md → Long-Term Vision.

---

# Brands (Current)

| Brand | Type | Client Orders? | Revenue Flow? |
|---|---|---|---|
| Personal (vlog) | Personal Brand | No | No — project/budget only, no client invoicing |
| EatPrayEdit (EPE Studio) | Client-Service | Yes | Yes — full Order → Invoice → Payment |
| Balistory | Client-Service | Yes | Yes — wedding film |
| KreatifProduction | Client-Service | Yes | Yes — full production house |

Multi-Brand is a **present-day operational requirement**, not a future goal.
The data architecture must support multiple Brands under one Organization from day one.

---

# People & Access Model

Inspired by Odoo's multi-company model:

- One shared **User Pool** — Owner, Manager, Editors (freelance and inhouse).
- A User does **not** get a separate account per Brand.
- Access to a Brand is granted via a simple toggle/permission, not a new identity.
- A User's "Board" (list of available/assigned projects) is an **aggregation**
  across every Brand they have access to — not a per-Brand board.

---

# Employment Types

| Type | Base Compensation | Project Bonus | Benefits | Access Priority |
|---|---|---|---|---|
| Freelance | Full project payout | N/A (payout IS the compensation) | None | Standard |
| Inhouse | Monthly fixed salary | Yes, smaller bonus per project | Yes (e.g. health insurance) | Can be prioritized for larger projects |

A User moving from Freelance → Inhouse is a **status change on the same identity**,
never a new entity. Full project history carries over.

Two entry mechanisms into a project coexist:
- **Apply** — User browses the Board and requests a project.
- **Assign** — Owner/Manager directly assigns a User to a project.

---

# Financial Confidentiality Principle

There are two distinct, non-overlapping money flows:

**Inbound (Revenue):** Client → Order → Invoice → Payment → Brand.
Owned by Business OS. Value is confidential — visible only to Owner/Manager.

**Outbound (Payout):** Project → internal budget allocation (manual or rule-based,
e.g. 20% studio margin) → Payout amount → Freelancer/Editor Wallet → Withdrawal.
Owned by Human Capital OS. Editors/freelancers only ever see their own Payout
value — never the original Order value.

This separation is a **hard rule**, not a UI preference. It must be enforced at
the access-control level, not just hidden in the interface.

MVP payout mechanism (current, manual): dashboard shows completed projects and
accumulated balance → User requests withdrawal → Owner transfers manually
(bank transfer) → balance is cleared. Automation is a future iteration, not a
day-one requirement.

---

# Client Relationship Ownership Principle

The Client relationship — contact information, direct communication — belongs
to the Brand/studio, never to an individual person. This is a hard rule,
enforced at the access-control level, same as Financial Confidentiality.

This protects business continuity (see FOUNDATION.md → Organization Memory,
Operational Continuity): a Client should never be able to bypass the studio
and go directly to an individual Editor, which would put the studio's
sustainability at risk. See HUMAN_CAPITAL_OS.md → Roles & Permissions for
exactly who can and cannot contact a Client directly.

---

# The Four Pillars (naming, confirmed)

1. **Business OS** — inbound: brand, client, order, revenue
2. **Project OS** — creative execution, living workspace
3. **Human Capital OS** — outbound: people, access, compensation, payout
4. **Knowledge Engine** — organizational memory, templates, SOP (depth TBD)

---

# Architecture Implication

Because Multi-Brand is a present reality, the data model must be designed as:

```
Organization → Brand → (Service, Client, Order, Project, User Access)
```

from the very first schema — even though the current feature scope only serves
one Organization. This is cheap to do now, expensive to retrofit later.
