# CHANGELOG-AUDIT-2026-07-24

## Round 2 Audit Remediation

This changelog documents changes made during the Round 2 documentation audit (2026-07-24).

---

## Decisions Addressed

| Decision | Topic | Action |
|----------|-------|--------|
| D6 | `buildType` field | Added to App interface, displayed as badge in App Store |
| D7 | Old docs retirement | Deleted APP_STORE.md, MODULE_REGISTRY.md, updated all references |
| D8 | Constitution Rule #10 | Revised to "Integrate First, Build Native When It Matters" |
| D9 | TypeScript errors | Build was already clean from Round 1 |
| D10 | `alwaysEnabled` | Added to App interface, properly set for core apps |
| D11 | OS as categories | Clarified in docs - not installable units |
| D12 | Packages | Clarified as curated bundles (shortcuts), not prerequisites |

---

## Files Changed

### Documentation (docs/)

| File | Changes |
|------|---------|
| `ARCHITECTURE/APP_REGISTRY.md` | Added `buildType` field to schema, updated alwaysEnabled |
| `ARCHITECTURE/MODULAR_APP_SYSTEM.md` | Synced with final App schema |
| `ADR/ADR-0005-modular-architecture.md` | Removed `paket` field examples, added supersession note |
| `CORE/FOUNDATION.md` | Removed APP_STORE.md reference, updated Related Documents |
| `DESIGN/CONSTITUTION.md` | Rule #10 revised to v1.3 (D8) |
| `PROCESS/ZENVAS_DOCUMENTATION_MAP.md` | Added ARCHITECTURE/ section, updated references |
| `PROCESS/CHECKPOINT.md` | Updated commit, added new features (Chat, App Store, etc.) |
| `PLANNING/README.md` | Updated references to APP_REGISTRY.md |

**Deleted:**
- `docs/MODULES/APP_STORE.md` (D7)
- `docs/MODULES/MODULE_REGISTRY.md` (D7)

**Moved:**
- `PLAN_PREMIUM_TASK_MANAGER.md` → `docs/PLANNING/PLAN_PREMIUM_TASK_MANAGER.md`
- `PLANS/superadmin-enhancement.md` → `docs/PLANNING/SUPERADMIN_ENHANCEMENT.md`

### Code (apps/web/src/)

| File | Changes |
|------|---------|
| `lib/apps.ts` | Added `BuildType`, `buildType` field to all apps, `ALWAYS_ENABLED_APPS` constant, updated utility functions |
| `lib/packages.ts` | Added clarifying comment about curated bundles (D12b) |
| `app/(dashboard)/apps/page.tsx` | Added `buildType` badge to App cards (D6) |

---

## Phase 0: Build Status

**IMPORTANT CORRECTION:** The 55 TS7006 + 20 TS2307 errors reported were **environment artifacts**, not code bugs.

After running `npx prisma generate`:
```
✔ Generated Prisma Client (7.9.0) to .\src\generated\prisma in 217ms
```

**Results:**
- `npx tsc --noEmit` → Exit code: 0 (0 errors)
- `npm run build` → **SUCCEEDED** (all 65 routes compiled)
  - ƒ /api/* (35 endpoints)
  - ƒ /dashboard, /clients, /leads, /orders, /payouts, /projects, /chat, etc.
  - ○ /login, /register, /superadmin (static)

**TS2307 errors were NOT real bugs** - they occurred because `prisma generate` hadn't been run to populate `src/generated/prisma/`. After running `prisma generate`, all TS2307 errors disappeared.

**Conclusion:** Build is clean. No code fixes were required for Phase 0.

---

## Phase A: Documentation Unification

### A1: APP_REGISTRY.md Schema
```typescript
interface App {
  id: string
  name: string
  description: string
  category: "project-os" | "human-capital-os" | "business-os"
           | "ai-content-os" | "collaboration" | "integration"
  buildType: "native" | "integration"   // D6 - mandatory, user-visible
  alwaysEnabled: boolean   // D10 - cannot be disabled
  dependencies: string[]  // D12a - auto-install
}
```

### A5: Constitution Rule #10 (v1.3)
> **Integrate First, Build Native When It Matters**
> 
> Zenvas prioritizes integrating mature, API-accessible third-party tools over
> rebuilding solved problems (e.g., Accounting/Invoicing → Odoo).
> 
> But for the core filmmaking toolchain — Scriptwriter, Storyboard, Shot List,
> and other tools where no adequate integrable alternative exists — Zenvas
> builds natively, deep, and ambitiously.
> 
> This is not an exception to "don't rebuild what works" — filmmaking-specific
> tooling is Zenvas's fundamental differentiator, not a commodity category
> to delegate away.

---

## Phase B: Code Refactoring

### B1: apps.ts Updates
- Added `BuildType = "native" | "integration"` type
- Added `buildType` field to every App definition
- Added `ALWAYS_ENABLED_APPS` constant with 6 apps: dashboard, settings, profile, projects, tasks, team
- Set `alwaysEnabled: true` for these 6 apps
- Updated `canUninstallApp()` to check `alwaysEnabled` field
- Added `ai-content-os` and `collaboration` to `AppCategory` type

### B2: App Store UI
- Added buildType badge to each App card:
  - `native` → "Built-in" (blue badge)
  - `integration` → "Powered by Odoo" (purple badge)

### B3: packages.ts
- Added clarifying comment: "Packages are CURATED BUNDLES (shortcuts) — not a prerequisite layer"

---

## Phase C: Verification

- ✅ No `paket` field references remain (only one legitimate mention in ADR-0005 documenting removal)
- ✅ No APP_STORE.md/MODULE_REGISTRY.md references in scope (remaining refs in MODULES/* are out of scope per task)
- ✅ TypeScript compiles clean
- ✅ Build succeeds

---

## Notes

- MODULES/ files (23 files) and TESTING/ files were explicitly out of scope
- ADR-0003 (domain routing) remains deferred per D2 (Round 1)
- If new contradictions are found in MODULES/ files, they should be reported, not decided

---

*Generated: 2026-07-24*
