# ADR-0003: Dynamic Brand-by-Domain Resolution, Single Application

Status: Accepted
Date: 2026-07-20
Depends On: ADR-0002-tech-stack.md, BUSINESS_OS.md (Invisible Infrastructure),
CONTEXT.md

---

## Context

Two related questions from SYSTEM-MAP.md needed resolution before
PAGE-FLOWS.md could be written: (1) whether Client Portal domains
(e.g. studio.eatprayedit.com) should be hardcoded to EPE Studio for Phase 1, or
resolve dynamically per Brand; (2) whether internal (Owner/Manager/Editor)
and Client Portal experiences should be one application or two.

## Domain Naming

| Context | Domain | Purpose |
|---------|--------|---------|
| **Client Portal** | `studio.{brand}.com` | "Welcome to your studio" — clients feel like they have their own internal team |
| **Internal** | `app.zenvas.com` | Single entry point for Owner/Manager/Editor (cross-Brand access) |

**Note:** `app.zenvas.com` domain may not exist yet — Phase 1 can use a subdomain
or localhost for internal access. Client Portal domains are per-Brand (e.g.
`studio.eatprayedit.com` for EPE Studio).

Answering these matters now because retrofitting dynamic domain resolution
after hardcoding one Brand is expensive, while building it correctly from
the start is cheap — the same reasoning already applied to the multi-company
data architecture in ADR-0001 and CONTEXT.md.

## Decision

**Dynamic domain resolution, from day one.** `Brand` carries a `domain`
field (e.g. `app.eatprayedit.com`). Middleware resolves the incoming `Host`
header against this field on every request to determine which Brand's
Client Portal is being served — never a hardcoded value. Adding Balistory or
KreatifProduction later means adding a Brand record with its own domain, not
writing new code.

**One application**, not two. A single Next.js app (per ADR-0002) uses
middleware to split traffic into two contexts:
- **Client Portal context** — hostname matches a Brand's `domain`. Serves
  only Client-facing routes, themed/branded per that Brand, per the
  Invisible Infrastructure principle (BUSINESS_OS.md) — the Zenvas name and
  any internal UI must never be reachable from this context.
- **Internal context** — hostname matches the one internal admin domain
  (e.g. an internal-only subdomain), serving Owner/Manager/Editor routes.
  This context is intentionally **not** Brand-specific at the domain level,
  because internal Users work across Brands via Brand Access (per
  HUMAN_CAPITAL_OS.md) — the Board is already a cross-Brand aggregation, so
  a single internal entry point is correct, not a limitation.

An unrecognized hostname (neither a known Brand domain nor the internal
domain) should resolve to a safe default (404 or a neutral landing page),
never accidentally fall through to internal routes.

## Consequences

**Positive:**
- No code change needed to onboard a new Brand's Client Portal — directly
  serves the Stage 1 reality (multi-Brand today) established in CONTEXT.md.
- Reinforces Invisible Infrastructure at the architecture level, not just as
  a design intention — the separation is enforced by middleware routing,
  not by convention.
- One deployment target keeps Phase 1 operationally simple for a
  non-programmer Owner, consistent with ADR-0002.

**Negative / Risks to manage:**
- Middleware becomes a critical, security-sensitive piece of code — a bug
  here could leak internal routes to a Client-facing domain. This needs
  explicit test coverage, not just implicit trust.
- Local development and staging need a way to simulate multiple domains
  (e.g. local hosts file entries or subdomain-based preview environments).

## Alternatives Considered

1. **Hardcode EPE for Phase 1, generalize later.** Rejected — same class of
   mistake as building single-Brand data models first; expensive to retrofit,
   cheap to do correctly now, and the Owner explicitly confirmed multi-Brand
   readiness is wanted immediately.
2. **Two separate applications** (internal admin app + Client Portal app).
   Rejected for Phase 1 — doubles deployment and maintenance surface for a
   single non-technical Owner, without a concrete benefit yet. Can be
   revisited if the internal and Client Portal codebases start to strain
   against sharing one app (e.g. very different scaling needs).
