# RBAC Coverage Analysis

> Audit date: 2026-07-24
> Scope: `apps/web/src/app/api/**/route.ts`
> Reference: `lib/authorize.ts` (CONSTITUTION.md rules)

## Current State Summary

| Category | Count | Notes |
|----------|-------|-------|
| Total API routes | 59 | Including sub-routes |
| Routes with 401 check | 59 | All routes check session |
| Routes using `can()` | 0 | **DEAD CODE** |
| Routes using `enforceConfidentiality()` | 0 | **DEAD CODE** |
| Routes with proper role isolation | ~80% | Most have ad-hoc checks |
| Routes with tenant scoping | ~70% | Brand/organization isolation |

## Role Permissions Matrix

| Action | OWNER | MANAGER | PRODUCER | EDITOR |
|--------|-------|---------|----------|--------|
| read:orders | ✅ | ✅ | ❌ | ❌ |
| write:orders | ✅ | ✅ | ❌ | ❌ |
| read:clients | ✅ | ✅ | ❌ | ❌ |
| write:clients | ✅ | ✅ | ❌ | ❌ |
| read:projects | ✅ | ✅ | ✅ | ✅ |
| write:projects | ✅ | ✅ | ✅ | ❌ |
| read:tasks | ✅ | ✅ | ✅ | ✅ |
| write:tasks | ✅ | ✅ | ✅ | ✅ (own only) |
| read:team | ✅ | ✅ | ❌ | ❌ |
| write:team | ✅ | ❌ | ❌ | ❌ |
| read:payouts | ✅ | ✅ | ❌ | ✅ (own only) |
| write:payouts | ✅ | ✅ | ❌ | ❌ |
| read:leads | ✅ | ✅ | ✅ | ❌ |
| write:leads | ✅ | ✅ | ✅ | ❌ |
| read:brand | ✅ | ✅ | ❌ | ❌ |
| write:brand | ✅ | ✅ | ❌ | ❌ |
| manage:settings | ✅ | ✅ | ❌ | ❌ |
| read:chat | ✅ | ✅ | ✅ | ✅ |
| write:chat | ✅ | ✅ | ✅ | ✅ |
| read:wallet | ❌ | ❌ | ❌ | ✅ (own only) |

## Route Coverage Table

Legend:
- ✅ = Implemented correctly
- ⚠️ = Has gap (see notes)
- ❌ = Missing or incorrect

| Route | Method | Auth | Role | Tenant | Confidential | Notes |
|-------|--------|------|------|--------|-------------|-------|
| **Auth** |
| /api/auth/[...nextauth] | GET,POST | ✅ | N/A | N/A | N/A | NextAuth handlers |
| /api/auth/register | POST | ✅ | ✅ | ✅ | N/A | Rate-limited |
| **Leads** |
| /api/leads | GET | ✅ | ✅ | ✅ | ✅ | EDITOR strips budget/timeline |
| /api/leads | POST | ✅ | ✅ | ✅ | N/A | Checks EDITOR |
| /api/leads/[id]/convert | POST | ✅ | ✅ | ✅ | N/A | Checks EDITOR |
| **Clients** |
| /api/clients | GET | ✅ | ✅ | ✅ | ✅ | EDITOR strips email/phone |
| /api/clients | POST | ✅ | ⚠️ | ✅ | N/A | Uses manual check, not `can()` |
| /api/clients/[id] | GET,PATCH | ✅ | ⚠️ | ⚠️ | ⚠️ | **MISSING** - needs review |
| **Orders** |
| /api/orders | GET | ✅ | ✅ | ✅ | ✅ | EDITOR strips price |
| /api/orders | POST | ✅ | ✅ | ✅ | N/A | |
| /api/orders/[id] | GET | ✅ | ⚠️ | ⚠️ | ✅ | **GAP**: No brand access check |
| /api/orders/[id] | PATCH | ✅ | ✅ | ✅ | N/A | |
| **Projects** |
| /api/projects | GET | ✅ | ✅ | ✅ | ✅ | EDITOR strips financial data |
| /api/projects | POST | ✅ | ✅ | ✅ | N/A | |
| /api/projects/[id] | GET | ✅ | ✅ | ✅ | ✅ | Has brand check |
| /api/projects/[id] | PATCH | ✅ | ✅ | ✅ | N/A | |
| /api/projects/[id] | DELETE | ✅ | ✅ | ✅ | N/A | OWNER only |
| /api/projects/[id]/tasks | GET | ✅ | ⚠️ | ⚠️ | ⚠️ | **GAP**: No brand check, no confidentiality |
| /api/projects/[id]/tasks | POST | ✅ | ✅ | ✅ | N/A | |
| /api/projects/[id]/chat | GET,POST | ✅ | ✅ | ⚠️ | N/A | **GAP**: No brand check |
| **Tasks** |
| /api/tasks/[id] | GET | ✅ | ✅ | ✅ | ✅ | EDITOR only sees own tasks |
| /api/tasks/[id] | PATCH | ✅ | ✅ | ✅ | ✅ | Restricted EDITOR updates |
| /api/tasks/[id]/complete | POST | ✅ | ✅ | ✅ | ✅ | |
| /api/tasks/[id]/apply | POST | ✅ | ✅ | ✅ | N/A | EDITOR only |
| /api/tasks/[id]/assign | POST | ✅ | ✅ | ✅ | N/A | OWNER/MANAGER only |
| /api/tasks/[id]/subtasks | GET,POST | ✅ | ✅ | ⚠️ | N/A | **GAP**: No brand check |
| **Payouts** |
| /api/payouts | GET | ✅ | ✅ | ✅ | N/A | OWNER/MANAGER only |
| /api/payouts/[id]/mark-paid | POST | ✅ | ✅ | ✅ | N/A | |
| **Board** |
| /api/board | GET | ✅ | ✅ | ✅ | ✅ | EDITOR only, own tasks |
| **Wallet** |
| /api/wallet | GET | ✅ | ✅ | ✅ | ✅ | EDITOR only, own data |
| **Team** |
| /api/team | GET | ✅ | ✅ | ✅ | N/A | Returns safe fields |
| /api/team | POST | ✅ | ✅ | N/A | N/A | OWNER only |
| /api/team/invite | POST | ✅ | ✅ | N/A | N/A | |
| /api/team/[id] | GET,PATCH | ✅ | ✅ | ✅ | N/A | |
| /api/team/[id]/brands | GET | ✅ | ✅ | ⚠️ | N/A | **GAP**: No brand check |
| /api/team/[id]/role | PATCH | ✅ | ✅ | N/A | N/A | OWNER only |
| /api/team/heartbeat | POST | ✅ | ✅ | N/A | N/A | |
| **Clients** |
| /api/clients/[id] | GET,PATCH,DELETE | ✅ | ⚠️ | ⚠️ | ⚠️ | **GAP**: Needs brand check |
| **Settings** |
| /api/settings/brands | GET | ✅ | ✅ | ✅ | N/A | Org-scoped |
| /api/settings/brands | POST | ✅ | ✅ | N/A | N/A | |
| /api/settings/brands/[id] | GET,PATCH,DELETE | ✅ | ✅ | ⚠️ | N/A | **GAP**: No brand check |
| /api/settings/organization | GET,POST,PATCH | ✅ | ✅ | N/A | N/A | |
| /api/settings/apps | GET,POST,DELETE | ✅ | ✅ | N/A | N/A | |
| **Chat** |
| /api/chat | GET,POST | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No action-level check |
| /api/chat/[channelId] | GET,POST | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No brand check |
| /api/chat/[channelId]/messages | GET,POST | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No channel access check |
| /api/chat/users/search | GET | ✅ | ⚠️ | N/A | N/A | **GAP**: No org check |
| /api/chat/presence | POST | ✅ | ⚠️ | N/A | N/A | **GAP**: No org check |
| **Notifications** |
| /api/notifications | GET | ✅ | ✅ | ✅ | N/A | Own data only |
| /api/notifications/read-all | POST | ✅ | ✅ | ✅ | N/A | |
| /api/notifications/[id]/read | POST | ✅ | ✅ | ✅ | N/A | |
| **Profile** |
| /api/profile | GET,PATCH | ✅ | ✅ | N/A | N/A | Own data only |
| /api/profile/password | POST | ✅ | ✅ | N/A | N/A | |
| **Wallet** |
| /api/wallet/withdraw | POST | ✅ | ✅ | ✅ | N/A | EDITOR only |
| **Apps** |
| /api/apps | GET | ✅ | ✅ | N/A | N/A | |
| /api/apps | POST,DELETE | ✅ | ✅ | N/A | N/A | OWNER only |
| /api/apps/check | GET | ✅ | ✅ | N/A | N/A | |
| /api/organization/apps | GET,POST | ✅ | ✅ | N/A | N/A | |
| **Upload** |
| /api/upload | POST | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No brand check |
| **Odoo** |
| /api/odoo | GET | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No brand check |
| /api/odoo/sync/client/[id] | POST | ✅ | ⚠️ | ⚠️ | N/A | **GAP**: No brand check |
| **Superadmin** |
| /api/superadmin | GET | ✅ | ✅ | N/A | N/A | isSuperAdmin check |
| /api/superadmin/users | GET,POST | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/users/[id] | GET,PATCH | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/brands | GET | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/brands/[id] | GET,PATCH | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/organizations | GET | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/organizations/[id] | GET,PATCH | ✅ | ✅ | N/A | N/A | |
| /api/superadmin/audit | GET | ✅ | ✅ | N/A | N/A | |

## Gaps Identified

### High Priority

1. **`/api/orders/[id]` GET** - Missing brand access check
   - Any authenticated user in the system could potentially access any order
   - Need to add `canAccessBrand()` check

2. **`/api/projects/[id]/tasks` GET** - Missing confidentiality enforcement
   - Returns task payout info that EDITORs shouldn't see
   - Need to apply `enforceConfidentiality()` or strip payout fields

3. **`/api/clients/[id]`** - Missing brand access check
   - Need to verify client belongs to accessible brand

### Medium Priority

4. **`/api/chat/**`** - Missing action-level checks
   - `can("read:chat")` and `can("write:chat")` not enforced
   - Brand-scoped channels need brand access check

5. **`/api/team/[id]/brands`** - Missing brand access check
   - Should verify user is in same organization

6. **`/api/tasks/[id]/subtasks`** - Missing brand access check

7. **`/api/settings/brands/[id]`** - Missing brand ownership check

8. **`/api/odoo/**`** - Missing brand access check

### Low Priority (Nice to have)

9. **`/api/upload`** - Missing brand check (may need special handling)

10. **`/api/chat/users/search`** - Missing org scope

## Dead Code

The following functions in `lib/authorize.ts` are **never called** by any route:

- `can()` - Permission checking
- `enforceConfidentiality()` - EDITOR data filtering

## Recommended Actions

### Phase 1: Enable Dead Code (ISSUE-03)

1. Create centralized guard helpers:
   - `requireUser()` - 401 if not logged in
   - `requireAction(action)` - 403 if action not permitted
   - `scopeToBrands(where)` - Filter by accessible brands

2. Apply to high-priority gaps first:
   - `/api/orders/[id]` GET
   - `/api/projects/[id]/tasks` GET

### Phase 2: Consistency Audit

3. Standardize all routes to use guards
4. Remove manual role checks in favor of `can()`

### Phase 3: Full Coverage

5. Address medium priority gaps
6. Add missing actions to matrix (chat, apps)

## Notes

- CONSTITUTION.md Rule #1: "EDITOR tak lihat harga/uang" - Financial data confidentiality
- HUMAN_CAPITAL_OS.md: Brand Access model for tenant isolation
- EDITOR role is production-focused with minimal write access
