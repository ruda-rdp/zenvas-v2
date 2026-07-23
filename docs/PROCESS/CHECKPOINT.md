# Zenvas v2 - Development Checkpoint

**Last Updated:** 2026-07-24
**Last Commit:** `e35f790` - feat: Implement global live chat system
**Branch:** main

---

## Project Overview

**Zenvas v2** is a multi-tenant SaaS application for creative businesses (production houses, video editors, agencies).

### Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Language:** TypeScript

---

## Current Status: ✅ Phase 1 Core - 90% Complete

### What's Working

| Module | Status | Notes |
|--------|--------|-------|
| Registration | ✅ | Invite code system |
| Login/Auth | ✅ | NextAuth + bcrypt |
| Session | ✅ | JWT with SessionProvider |
| Onboarding | ✅ | Brand creation |
| Team Management | ✅ | Odoo-style UI |
| User Profile | ✅ | Edit name, password, prefs |
| Theme System | ✅ | Dark/Light mode |
| Notifications | ✅ | Bell + API |
| Brands CRUD | ✅ | Settings API |
| Organizations | ✅ | Settings API |
| **Lead Management** | ✅ | Full lifecycle |
| **Order Management** | ✅ | Full lifecycle + Odoo sync |
| **Project Management** | ✅ | CRUD + Solo mode + 4-stage tabs |
| **Task Management** | ✅ | Get/Update/Apply/Assign/Complete + Premium Task Manager |
| **Client Portal / Domain Routing** | ⏳ | ADR-0003 defined, not wired — planned next (D2) |
| **Payout & Wallet** | ✅ | Full payout system |
| **Editor Board** | ✅ | Task board for editors |
| **Global Chat** | ✅ | Live messaging + @mentions + presence |
| **App Store** | ✅ | Browse/install Apps |
| **Superadmin Enhancement** | ✅ | Hierarchy view + audit logs |

### API Endpoints (Working)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/*` | ALL | ✅ |
| `/api/register` | POST | ✅ |
| `/api/profile` | GET, PATCH | ✅ |
| `/api/profile/password` | POST | ✅ |
| `/api/team` | GET | ✅ |
| `/api/team/invite` | GET, POST, DELETE | ✅ |
| `/api/team/[id]` | DELETE | ✅ |
| `/api/team/[id]/role` | PATCH | ✅ |
| `/api/team/[id]/brands` | POST, DELETE | ✅ |
| `/api/settings/organization` | GET, POST | ✅ |
| `/api/settings/brands` | GET, POST | ✅ |
| `/api/onboarding/setup` | POST | ✅ |
| `/api/notifications` | GET | ✅ |
| `/api/clients` | GET, POST | ✅ |
| `/api/leads` | GET, POST | ✅ |
| `/api/leads/[id]/convert` | POST | ✅ |
| `/api/projects` | GET, POST | ✅ |
| `/api/projects/[id]` | GET, PATCH, DELETE | ✅ |
| `/api/orders` | GET, POST | ✅ |
| `/api/orders/[id]` | GET, PATCH | ✅ |
| `/api/tasks/[id]` | GET, PATCH | ✅ |
| `/api/tasks/[id]/apply` | POST | ✅ |
| `/api/tasks/[id]/assign` | POST | ✅ |
| `/api/tasks/[id]/complete` | POST | ✅ |
| `/api/tasks/[id]/subtasks` | GET, POST | ✅ |
| `/api/board` | GET | ✅ |
| `/api/wallet` | GET | ✅ |
| `/api/wallet/withdraw` | POST | ✅ |
| `/api/payouts` | GET | ✅ |
| `/api/payouts/[id]/mark-paid` | POST | ✅ |

---

## Project Structure

```
apps/web/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── projects/
│   │   │   ├── clients/
│   │   │   ├── leads/
│   │   │   ├── orders/
│   │   │   ├── team/
│   │   │   ├── settings/
│   │   │   └── onboarding/
│   │   └── api/               # API routes
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client
│   │   ├── authorize.ts       # RBAC permissions
│   │   └── notifications.ts   # Notification system
│   └── components/
│       ├── ThemeProvider.tsx
│       ├── NotificationBell.tsx
│       └── dashboard/
└── package.json

docs/
├── SECURITY_AUDIT.md
├── SCALABILITY_PLAN.md
├── PROFILE_SETTINGS.md
├── HUMAN_CAPITAL_OS.md
├── ADR/PLATFORM_ADMIN.md
└── CHECKPOINT.md
```

---

## Database Models

**Core entities:**
- `User` - with role (OWNER, MANAGER, PRODUCER, EDITOR)
- `Organization` - tenant container
- `Brand` - belongs to org (client-facing brand)
- `BrandAccess` - user-brand relationship
- `InviteCode` - single-use registration codes
- `Lead` - potential client
- `Client` - converted lead
- `Order` - client project order
- `Project` - active work
- `Stage` - project phase
- `Task` - work item
- `Notification` - user notifications
- `ActivityLog` - audit trail

---

## Roles & Permissions

```
PLATFORM_ADMIN (future)
    └── OWNER (customer)
        ├── MANAGER
        │   └── PRODUCER
        │       └── EDITOR
        └── EDITOR
```

**Editor restrictions:**
- Cannot see prices/amounts
- Can only see own tasks
- Cannot create leads/clients

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth config + JWT |
| `lib/authorize.ts` | Permission matrix |
| `lib/db.ts` | Prisma client |
| `lib/notifications.ts` | Notification helper |
| `prisma/schema.prisma` | Full schema |

---

## What's Next (TODO)

### High Priority
1. [ ] Test full registration → onboarding flow
2. [ ] Test team invite code registration
3. [ ] Build Projects detail page
4. [ ] Build Orders detail page
5. [ ] Build Leads detail page

### Medium Priority
6. [ ] Implement PLATFORM_ADMIN role (ADR-0011)
7. [ ] Add Row-Level Security (when scaling)
8. [ ] Email notification system
9. [ ] File upload (for briefs)
10. [ ] Client portal (external view)

### Low Priority
11. [ ] Two-factor authentication
12. [ ] OAuth providers (Google)
13. [ ] Mobile responsive design
14. [ ] API rate limiting
15. [ ] Audit logging dashboard

---

## Testing Checklist

- [ ] Registration without invite code (creates OWNER)
- [ ] Registration with invite code (creates EDITOR/MANAGER/PRODUCER)
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Onboarding creates brand
- [ ] Team page shows all users
- [ ] Add user generates invite code
- [ ] Profile page edit name/email
- [ ] Profile page change password
- [ ] Dark mode toggle works
- [ ] Notification bell shows unread
- [ ] Editor cannot see prices

---

## Common Commands

```bash
# Development
cd apps/web
npm run dev

# Database
npx prisma studio          # Open Prisma Studio
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client

# Type check
npx tsc --noEmit
```

---

## Notes for New Agent

When resuming work:
1. Read `docs/CHECKPOINT.md` first
2. Check `docs/DEVELOPMENT_RULES.md` for rules
3. Run `npx prisma studio` to see current data
4. Run `npm run dev` to start development
5. All API routes are in `src/app/api/`

**Current user session:** Check Neon database via Prisma Studio
**Last feature:** User profile settings + team management enhancement
