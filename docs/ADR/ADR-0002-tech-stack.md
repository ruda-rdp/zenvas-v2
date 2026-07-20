# ADR-0002: Tech Stack Selection

Status: Accepted
Date: 2026-07-20
Depends On: MVP_ROADMAP.md

---

## Context

Phase 1 (EPE Studio MVP) needs a concrete, decided tech stack before any
code is written — foundation documents intentionally do not specify
implementation technology, but Claude Code and any implementer need one
fixed answer, not a per-session guess.

## Decision

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes (same codebase, no separate backend service)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma 5.x
- **Auth:** NextAuth.js
- **Deployment:** Self-hosted Ubuntu VM (initial)

This is a single full-stack Next.js application, not a separate
frontend/backend split — matching the scale of Phase 1 (one Organization,
one Brand) and avoiding infrastructure complexity that isn't earned yet.

## Consequences

**Positive:**
- One codebase, one deployment target, minimal moving parts for a
  non-technical Owner to reason about if something breaks.
- Prisma schema becomes the single, explicit source of truth for the data
  model gap identified as missing before implementation.
- NextAuth handles session/auth primitives so Role enforcement (Owner/
  Manager/Producer/Editor per HUMAN_CAPITAL_OS.md) can be built on a
  standard, well-documented foundation rather than a custom auth system.

**Negative / Risks to manage:**
- Self-hosted Ubuntu VM means Owner (or Claude Code on their behalf) owns
  server maintenance, unlike a managed platform — acceptable for Phase 1
  given cost and control priorities, revisit if operational burden grows.
- Single Next.js app serving both internal and Client Portal traffic
  requires strict middleware-level separation (see ADR-0003) to avoid
  ever leaking internal UI or data to Client-facing routes.

## Alternatives Considered

Not formally evaluated against competing stacks in this session — this ADR
records the decision as made, to close the "no tech stack decided" gap
identified during the foundation documentation review. Revisit only if a
concrete limitation is hit, not preemptively.
