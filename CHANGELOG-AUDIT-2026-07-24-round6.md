# CHANGELOG-AUDIT-2026-07-24-round6

**Date:** 2026-07-24 · **Round:** 6 · **By:** Claude (senior review, direct code)
**Focus:** Finish ISSUE-03 properly — consolidate confidentiality, add REAL tests,
make RBAC-COVERAGE.md truthful, verify (not self-declare) tenant isolation.

---

## Why this round

Round 5's ISSUE-03 commit claimed "complete RBAC sweep across routes" but changed only
3 files, `enforceConfidentiality` stayed in 1 route, and RBAC-COVERAGE.md carried
inflated counts ("requireUser 20+", "stripConfidentialFields 4") plus several FALSE
gap claims. This round fixes the substance and the honesty.

## Changes

### `apps/web/src/lib/authorize.ts`
- Strengthened `stripConfidentialFields` money patterns: added `payout`, `salary`,
  `wage`, `commission`, `earning`, `income`.
- Added `stripConfidentialFieldsArray()` — array variant, no-op for OWNER/MANAGER.
- Added `stripTaskPayout(task, role)` — removes the whole `payout` relation across a
  task + subtask tree. Centralizes logic previously duplicated inline.
- Added a "SINGLE SOURCE OF TRUTH" doc block explaining the two confidentiality
  dimensions and which helper to use.

### Routes — remove duplicated inline strips
- `projects/[id]/route.ts` GET: replaced hand-rolled payout loop with `stripTaskPayout`;
  now strips for all non-OWNER/MANAGER roles (consistent with helpers), still hides the
  whole `order` object from editors.
- `projects/[id]/tasks/route.ts` GET: replaced inline payout strip with `stripTaskPayout`.
- `projects/[id]/tasks/route.ts` GET+POST: brand check now falls back to
  `project.brandId` for order-less **solo projects** (defense-in-depth).

### Tests
- Added `src/lib/__tests__/confidentiality.test.ts` — imports and tests the **REAL**
  helpers (db/auth mocked), unlike `authorize.test.ts` which tests local copies.
  Includes an explicit anti-leak assertion: no raw money value survives in an EDITOR
  payload; verifies OWNER/MANAGER keep money, EDITOR **and PRODUCER** lose it, and that
  the original object is not mutated.

### Docs
- Rewrote `docs/PLANNING/RBAC-COVERAGE.md` with **verified** counts and corrected the
  false "gap" claims. Confirmed by reading code that `orders/[id]`, `clients/[id]`,
  `projects/[id]/tasks`, `tasks/[id]/subtasks`, `team/[id]/brands`,
  `settings/brands/[id]`, and `chat/[channelId]/messages` are all correctly
  tenant/participant scoped (chat via `chatChannelParticipant` membership).

## Verification

- `npx tsc --noEmit` → run on dev machine (Windows) to confirm exit 0.
- `npm test` → run on dev machine; `confidentiality.test.ts` must pass (couldn't run in
  the reviewer's Linux VM sandbox — vitest native binding is Windows-installed).
- `npm run build` → confirm on dev machine.

## Honest note

Full guard standardization across all 59 routes is deliberately NOT done — the remaining
ad-hoc role checks are individually correct; consolidating them is hygiene, to be done
incrementally and verified by test, never by self-declaration.
