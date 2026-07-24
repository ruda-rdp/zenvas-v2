# RBAC & Confidentiality Coverage (verified)

> Audit date: 2026-07-24 (Round 6 — verified against actual code, not self-reported)
> Scope: `apps/web/src/app/api/**/route.ts`
> Reference: `lib/authorize.ts`, CONSTITUTION.md #1 (money) & #2 (client contact info)

> ⚠️ Prior versions of this file contained **inflated usage counts** and **false gap
> claims**. Every number and gap below was re-verified with `grep` + manual read.

## Verified usage counts (files under `src/app/api`)

| Helper (in `lib/authorize.ts`) | Files | Where |
|---|---|---|
| `requireUser()` | 9 | clients, leads, leads/[id]/convert, orders, orders/[id], profile/password, projects, projects/[id], projects/[id]/tasks |
| `requireAction()` | 8 | same set (permission-gated GET/POST) |
| `canAccessBrand()` | ~10 | orders/[id], leads/[id]/convert, projects/[id], projects/[id]/tasks, tasks/[id], tasks/[id]/subtasks, … |
| `stripConfidentialFields()` (money, recursive redact) | 3 | orders, orders/[id], tasks/[id] |
| `stripTaskPayout()` (removes payout tree) | 2 | projects/[id], projects/[id]/tasks |
| `enforceConfidentiality()` (tight allowlist) | 1 | leads |

Routes not in the list use either their own correct scoping (see below) or are
user-scoped (profile, notifications, wallet, board) / superadmin-gated.

## Two confidentiality dimensions (both hidden from EDITOR & PRODUCER)

1. **Money (CONSTITUTION #1)** — price, amount, payout, budget, cost, fee, salary…
   - Rich objects: `stripConfidentialFields()` / `stripConfidentialFieldsArray()` (redacts money keys recursively, keeps shape).
   - Task payout relation: `stripTaskPayout()` (removes the whole `payout` object across the subtask tree).
   - Whole-object hiding (order/service/client) for editors: `projects` GET rebuilds a minimal object; `orders`/`payouts` restrict by role.
2. **Client contact info (CONSTITUTION #2)** — email/phone.
   - `clients` GET and `clients/[id]` GET strip `email`/`phone` (and contacts) for EDITOR.
   - `leads` GET uses `enforceConfidentiality()` (tight allowlist — the minimal-view case).

> Design note: OWNER/MANAGER see everything; EDITOR **and PRODUCER** are treated as
> non-finance roles and get money redacted. This is intentional and consistent across
> all helpers. If PRODUCER should see money, change the guard in one place
> (`lib/authorize.ts`) — do not special-case routes.

## Tenant isolation — VERIFIED (previously false-flagged as gaps)

The following were marked "GAP / missing brand check" in earlier versions but are in
fact correctly scoped (verified by reading the code):

| Route | Mechanism |
|---|---|
| `orders/[id]` GET/PATCH | `canAccessBrand(order.brandId)` |
| `clients/[id]` GET/PATCH/DELETE | `brandId: { in: accessibleBrands }` |
| `projects/[id]/tasks` GET | `canAccessBrand(brandId)` |
| `tasks/[id]/subtasks` | `canAccessBrand()` with order/brand fallback |
| `team/[id]/brands` | `organizationId: session.user.organizationId` |
| `settings/brands/[id]` | `organizationId`-scoped queries |
| `chat/[channelId]/messages` GET/POST | `chatChannelParticipant` membership → 403 if not a participant |

## Genuine remaining items (low/medium, not security-critical)

- **Solo projects in `projects/[id]/tasks`**: brand check runs off `project.order?.brandId`;
  for order-less solo projects (`project.brandId` set, no order) the explicit
  `canAccessBrand` branch is skipped. The list query is still bounded by the project
  the user opened, but add a `project.brandId` fallback for defense-in-depth.
- **Guard standardization**: ~50 routes still use ad-hoc `if (role === …)` checks
  instead of `requireAction()`. These are individually correct; consolidating is
  hygiene, not a fix. Do it incrementally, verified by test — never by self-declaration.
- **`enforceConfidentiality` vs `stripConfidentialFields`**: two helpers by design
  (tight allowlist vs redact-money). Keep both; do not merge (merging would loosen the
  leads minimal-view).

## Tests

- `src/lib/__tests__/authorize.test.ts` — **tests copies** of the matrix logic
  (re-defined locally). Useful as documentation, but can drift from real code.
- `src/lib/__tests__/confidentiality.test.ts` — **tests the REAL exported helpers**
  (`stripConfidentialFields`, `stripConfidentialFieldsArray`, `stripTaskPayout`,
  `enforceConfidentiality`), including an explicit anti-leak assertion that no raw
  money value survives in an EDITOR payload. This file is the actual guarantee.

## Honest status vs ISSUE-03 goal

- ✅ Centralized guards exist and are used on the core business routes.
- ✅ Money confidentiality is enforced on every route that returns money to a
  potential EDITOR/PRODUCER (verified), now via shared helpers (no duplicated inline
  payout-stripping in project/task routes).
- ✅ Real tests added for the confidentiality helpers.
- ⚠️ Full guard standardization across all 59 routes is **not** done (and not required
  for security). Tracked as hygiene above.
