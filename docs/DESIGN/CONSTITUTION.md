# CONSTITUTION.md

Status: Locked v1.0

Purpose: Rules that cannot be broken — by any feature, any deadline
pressure, any agent (human or AI) working on Zenvas. Unlike
PRODUCT_PRINCIPLES.md (a lens for evaluating decisions), every rule here is
absolute: if a proposed feature or shortcut would violate one of these,
the feature is wrong, not the rule.

Each rule below is a compressed pointer, not a re-explanation. Full context
lives at its source document — read that before implementing, not just the
one line here.

---

# 1. Financial Confidentiality

Order and Invoice values are confidential to Owner/Manager only. An
Editor/Freelancer sees ONLY their own Payout value — never the original
Order value, never another editor's payout, never the internal margin
calculation.

**Enforcement:** access-control level (queries must be structurally unable
to return this data to unauthorized roles), never a UI-only convention.

→ CONTEXT.md, BUSINESS_OS.md, HUMAN_CAPITAL_OS.md (Roles & Permissions)

---

# 2. Client Relationship Ownership

The Client relationship — contact info, direct communication — belongs to
the Brand, never to an individual person. Editors never contact Clients
directly, under any circumstance. Only Owner, Manager, and Producer may.

**Why this is absolute, not situational:** protects the studio's
sustainability against client-poaching of individual editors — this is a
business continuity rule, not a courtesy.

→ CONTEXT.md, HUMAN_CAPITAL_OS.md (Roles & Permissions)

---

# 3. Order Before Project

A Project can only be created once its Order reaches status `Confirmed`
(DP received). No exceptions except Personal Brand, which has no Order at
all.

→ BUSINESS_OS.md (Customer Journey & Order Lifecycle)

---

# 4. Roles & Permissions Are Structural, Not Cosmetic

The Owner/Manager/Producer/Editor visibility matrix (what each Role can see
and do) must be enforced by the system's actual access control — never
achieved by simply hiding elements in the UI while the underlying data
remains reachable.

→ HUMAN_CAPITAL_OS.md (Roles & Permissions)

---

# 5. Point System Stability

Once a Point-earning or Point-losing rule is live, changing it must never
retroactively devalue Points or Levels already earned. Rule changes apply
forward only, and must be communicated, not silently changed.

**Why:** Points/Levels become part of an editor's career and reputation
inside Zenvas — treating the rules casually breaks trust in the entire
mechanic.

→ HUMAN_CAPITAL_OS.md (Point System Stability)

---

# 6. Editor UI Stays Minimal

An Editor's Zenvas experience is deliberately limited to: their Board,
their current Brief, a checklist, their own Payout/Point balance, and
discussion with Manager/Producer. No file management, no creative canvas,
no feature that competes with their actual creative tool (e.g. DaVinci
Resolve).

**Why:** this is a design constraint, not a missing feature — adding
scope here is a violation, not an improvement.

→ HUMAN_CAPITAL_OS.md (Editor UI Philosophy)

---

# 7. Knowledge Surfaces in Context, Never a Separate Destination

Relevant SOP, Style Guide, and Client Preference information must appear
automatically inside the Brief an Editor already reads — never require a
separate library search to find. A browsing library may exist for Owner/
Manager/Producer, but it is not how Editors are meant to reach this
knowledge.

→ KNOWLEDGE_ENGINE.md (Knowledge Surfacing)

---

# 8. Lessons Learned Is Never Mandatory

Capturing a Lessons Learned note after Delivery is an invitation, not a
gate. It must never block Order/Project completion, and must never become
a required report.

→ KNOWLEDGE_ENGINE.md (The Compounding Loop)

---

# 9. Brand First, Zenvas Invisible

Every Brand owns its identity, pricing, and customer experience. Clients
build relationships with the Brand — never with Zenvas. The Zenvas name
and any internal UI must never be reachable from a Client-facing surface.

→ BUSINESS_OS.md (Brand First, Invisible Infrastructure), ADR-0003 (domain
routing enforces this architecturally)

---

# 10. Zenvas Does Not Rebuild What Already Works Well

Zenvas does not build its own CRM, Invoicing, Accounting (delegated to
Odoo, per ADR-0001), nor its own script breakdown, stripboard, shot list,
storyboarding, frame-accurate video review tooling, or raw file/DAM storage
(Assets are links/references to Dropbox, Google Drive, or local server —
never raw files managed by Zenvas itself). These are mature, well-served
categories per REFERENCES.md. Building these natively is scope creep, not
ambition.

→ FOUNDATION.md ("What Zenvas Is Not"), ADR-0001, REFERENCES.md (Synthesis)

---

# How This Document Is Used

Before implementing any feature, check it against this list the same way
PRODUCT_PRINCIPLES.md's Decision Checklist is used — except a failure here
is not "reconsider," it is "stop." This document should stay short. If a
new hard rule emerges during implementation, it gets added here as one
compressed entry pointing back to wherever it was actually decided — never
explained in full here.
