# IMPLEMENTATION-PLAN.md

Status: Locked v1.0 (Phase 1 scope)

Depends On: All PLANNING/ documents, ADR-0001/0002/0003, DATA-MODELS.md,
API-CONTRACTS.md

---

# Purpose

The last planning artifact before code. File structure and build order —
answers "what do I build first" so Claude Code (or any implementer) doesn't
have to re-derive sequencing from 15 documents every session.

---

# File Structure

```
apps/web/
├── prisma/
│   └── schema.prisma          # from DATA-MODELS.md, exactly
├── src/
│   ├── middleware.ts           # ADR-0003: domain resolution (Brand vs internal)
│   ├── app/
│   │   ├── (client-portal)/    # served only when hostname matches a Brand.domain
│   │   │   ├── login/
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [orderId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── delivery/
│   │   │   └── account/
│   │   │
│   │   ├── (internal)/         # served only on the internal domain
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── projects/[projectId]/
│   │   │   ├── clients/
│   │   │   ├── team/
│   │   │   ├── payouts/
│   │   │   ├── settings/
│   │   │   ├── board/          # Editor
│   │   │   ├── tasks/[taskId]/ # Editor
│   │   │   ├── wallet/         # Editor
│   │   │   └── profile/        # Editor
│   │   │
│   │   └── api/                # routes per API-CONTRACTS.md
│   │       ├── auth/
│   │       ├── orders/
│   │       ├── projects/
│   │       ├── tasks/
│   │       ├── board/
│   │       ├── wallet/
│   │       ├── payouts/
│   │       ├── team/
│   │       ├── clients/
│   │       ├── services/
│   │       └── dashboard/
│   │
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config (2 providers: Client, internal User)
│   │   ├── authorize.ts         # the ONE can(session, action, resource) function —
│   │   │                        # CONSTITUTION.md #4, every API route imports this
│   │   ├── odoo.ts               # Odoo API client (XML-RPC/JSON-RPC, per ADR-0001)
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── stale-detection.ts    # computes "Needs Attention" per Task, not stored
│   │
│   └── components/
│       ├── client-portal/        # Brand-themed components only
│       └── internal/             # Owner/Manager/Editor shared internal components
│
└── packages/shared/
    └── types/                    # types shared between API and both app contexts
```

---

# Build Order

**Phase A — Foundation (no UI yet)**
1. `prisma/schema.prisma` from DATA-MODELS.md → run first migration
2. `middleware.ts` — domain resolution (ADR-0003), even before auth exists,
   so every later screen is built against the correct context from day one
3. `lib/authorize.ts` — the shared permission function, written and tested
   BEFORE any API route that needs it (CONSTITUTION.md #4 is easiest to get
   right first, hardest to retrofit)
4. `lib/auth.ts` — NextAuth, two separate credential flows (Client, User)
5. `lib/odoo.ts` — Odoo client, minimal: create Client (res.partner), create
   Invoice (account.move), read status. Manual-trigger acceptable
   (SYSTEM-MAP.md's resolved recommendation)

**Phase B — Business OS core**
6. `/api/services` (CRUD) + `/settings/services` (internal UI) — Owner needs
   to define EPE's Real Estate Edit Service before anything else can flow
7. `/api/orders` (create, list, detail) + Client Portal `/orders/new`,
   `/orders/[id]`
8. `/api/orders/:id/confirm` — wired to Odoo DP status (manual trigger OK)

**Phase C — Project OS**
9. Project/Stage/Task creation from `Service.stageTemplate` on Order confirm
10. `lib/stale-detection.ts` + surfacing in internal `/dashboard`
11. Client Portal Order detail — Stage progress view (MOCKUPS.md screen #1)

**Phase D — Human Capital OS**
12. `/api/board`, `/api/tasks/:id/apply`, `/api/tasks/:id/assign` —
    internal `/board`, `/tasks/[taskId]` (MOCKUPS.md screens #3, #4)
13. Payout allocation + crediting logic (tied to Delivery approval)
14. `/api/wallet`, `/api/payouts` — Wallet + manual withdrawal flow

**Phase E — Close the loop**
15. `/orders/:id/delivery` (Client approval) → triggers Final Invoice +
    Payout crediting in one transaction
16. Internal `/dashboard` (Mission Control, MOCKUPS.md screen #2), `/clients`,
    `/team`

**Phase F — Hardening**
17. Verify every CONSTITUTION.md rule against the running app, not just
    the code — specifically: log in as an Editor and confirm `/orders`,
    `/clients`, `/dashboard` are structurally unreachable, not just absent
    from navigation
18. Cancellation/Refund flow (MVP_ROADMAP.md's flagged gap) — design and
    build before real Clients transact, not after

---

# What This Plan Deliberately Does Not Include

Producer role, Points/Levels, Subscription, Knowledge Engine library,
Clock-In/Out, Multi-Brand UI — all Phase 2+, per MVP_ROADMAP.md. Do not
build scaffolding for these now; the schema and route structure above
leaves room for them without requiring it.

---

# Definition of Done (repeated from MVP_ROADMAP.md, now with a build path to it)

A real EPE Studio Client can place a real Order, get a Confirmed status
after DP, watch their Project move through Stages with live Task updates,
an Editor can Apply/be Assigned and get paid via the Wallet flow, and the
Owner never needs a spreadsheet or a WhatsApp message to know where any of
it stands.
