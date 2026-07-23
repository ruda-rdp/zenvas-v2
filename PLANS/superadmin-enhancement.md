# Superadmin Panel Enhancement Plan

## User Requirements
- ✅ Full Audit Trail - log all admin actions with export capability
- ✅ Full User Transfer & Reset - transfer users between orgs, force password reset
- ✅ Full CRUD - create, read, update, delete organizations

## Current State
- Basic hierarchy view (Org → Brands → Users)
- Simple stats cards
- User role editing
- Organization/user deletion
- No pagination, no search, no audit logs

## Enhanced Features

### 1. Dashboard / Overview Tab
**UI Improvements:**
- Stats cards with trend indicators (↑↓)
- Activity timeline (recent registrations, actions)
- System health indicators
- Quick actions panel

**API Changes:**
- Add `createdAt` to stats response
- Add `recentActivity` endpoint for timeline

### 2. Organizations Management Tab
**New Features:**
- Search by name
- Sort by name, users count, brands count, created date
- Create new organization (modal form)
- Edit organization details (name, plan)
- Delete with cascade warning modal
- View organization detail modal

**API Changes:**
- Add PATCH endpoint for org update
- Add POST endpoint for org creation
- Add search/filter params

### 3. Users Management Tab
**New Features:**
- Advanced table with:
  - Search by name/email
  - Filter by role, organization
  - Sort by name, email, role, date
  - Pagination (20 per page)
- User detail modal with:
  - Full profile view
  - Organization info
  - Activity summary
- Transfer user to different organization
- Bulk actions (delete, change role)
- Force password reset action

**API Changes:**
- Add search params to GET
- Add pagination
- Add transfer endpoint (PATCH with organizationId)
- Add force reset password endpoint

### 4. Brands Management Tab
**New Features:**
- Search by name
- Filter by organization
- Sort by name, organization, created date
- Brand detail modal
- Edit brand (name, color, domain)
- Delete brand with warning

**API Changes:**
- Add search/filter params
- Add PATCH endpoint for brand update
- Add DELETE endpoint (already exists)

### 5. Activity Logs / Audit Tab
**New Features:**
- Table of admin actions
- Filter by action type (CREATE, UPDATE, DELETE)
- Filter by actor (admin email)
- Filter by date range
- Export capability (CSV)

**API Changes:**
- Create activity log model/table
- Create audit log API endpoint
- Log all admin actions in existing endpoints

### 6. System Settings Tab (optional)
**Features:**
- View current system configuration
- Environment variables (read-only)
- Feature flags

## Implementation Order

### Phase 1: API Enhancements
1. Add search/pagination to existing endpoints
2. Add PATCH endpoints for org/brand update
3. Add POST endpoint for org creation
4. Add audit logging infrastructure

### Phase 2: UI Improvements
1. Rewrite superadmin page with better components
2. Add search/filter inputs
3. Add pagination controls
4. Add modals for create/edit

### Phase 3: Advanced Features
1. User transfer between organizations
2. Bulk operations
3. Activity logs tab
4. System settings tab

## File Changes

### API Routes (New/Modified)
- `apps/web/src/app/api/superadmin/route.ts` - Add extended stats
- `apps/web/src/app/api/superadmin/organizations/route.ts` - POST create, search
- `apps/web/src/app/api/superadmin/organizations/[id]/route.ts` - PATCH update
- `apps/web/src/app/api/superadmin/users/route.ts` - Search, pagination
- `apps/web/src/app/api/superadmin/users/[id]/route.ts` - Transfer, force reset
- `apps/web/src/app/api/superadmin/brands/route.ts` - Search, filter
- `apps/web/src/app/api/superadmin/brands/[id]/route.ts` - PATCH update
- `apps/web/src/app/api/superadmin/audit/route.ts` - NEW: Audit logs

### UI Components
- `apps/web/src/app/superadmin/page.tsx` - Complete rewrite with enhanced UI

## Risk Assessment
- **Medium risk** - Changes to API endpoints
- **Low risk** - UI enhancements only
- No database schema changes required for Phase 1-2
