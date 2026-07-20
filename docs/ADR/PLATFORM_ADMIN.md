# ADR-0011: Platform Admin Role

## Status
Proposed

## Context
Zenvas is a multi-tenant SaaS application. Currently, all users belong to organizations and can only access their own organization's data. However, for platform maintenance, billing, and support purposes, we need a super-admin role that can access all organizations' data.

## Decision

### Add PLATFORM_ADMIN Role

A new role `PLATFORM_ADMIN` will be introduced with the following characteristics:

1. **Creation**: Only created manually in database (not via registration)
2. **Access**: Can access ALL organizations, brands, users, and data
3. **Isolation Bypass**: No `organizationId` filtering applies to PLATFORM_ADMIN
4. **Audit Required**: All PLATFORM_ADMIN actions must be logged

### Role Hierarchy

```
PLATFORM_ADMIN (Zenvas internal)
    └── OWNER (customer organization)
        ├── MANAGER
        │   └── PRODUCER
        │       └── EDITOR
        └── EDITOR
```

### Capabilities

| Capability | PLATFORM_ADMIN | OWNER | Notes |
|------------|----------------|-------|-------|
| View all organizations | ✅ | ❌ | |
| View all users | ✅ | ❌ | |
| Manage organizations | ✅ | ❌ | |
| Manage billing | ✅ | ❌ | |
| View all projects | ✅ | ❌ | |
| Manage platform settings | ✅ | ❌ | |
| Access customer support | ✅ | ❌ | |

### Security Considerations

1. **Isolation Bypass**: PLATFORM_ADMIN can see all data - requires additional audit logging
2. **No Password Reset**: Cannot reset customer passwords
3. **Read-Heavy**: Primarily for viewing/monitoring, limited write access
4. **IP Restriction**: Should be restricted to known admin IPs
5. **MFA Required**: PLATFORM_ADMIN must use 2FA

### Database Changes

```prisma
enum Role {
  PLATFORM_ADMIN  // New - super admin
  OWNER           // Customer org owner
  MANAGER
  PRODUCER
  EDITOR
}
```

### API Changes

```typescript
// Middleware to check PLATFORM_ADMIN
function isPlatformAdmin(session) {
  return session.user.role === "PLATFORM_ADMIN";
}

// In API routes
if (isPlatformAdmin(session)) {
  // Skip organizationId filter
  // Apply audit log
}
```

## Consequences

### Positive
- ✅ Platform can be managed without database direct access
- ✅ Support team can help customers
- ✅ Billing can be managed in-app

### Negative
- ⚠️ Security risk if admin credentials compromised
- ⚠️ Requires careful audit logging
- ⚠️ More complex authorization logic

### Risks
- Must implement comprehensive audit logging
- Need rate limiting for admin actions
- Consider IP whitelist for admin access

## Implementation Plan

1. Add `PLATFORM_ADMIN` to Role enum
2. Update authorization middleware
3. Create admin dashboard (future)
4. Implement audit logging
5. Add IP restriction middleware

## References
- Security Audit: `docs/SECURITY_AUDIT.md`
- Scalability Plan: `docs/SCALABILITY_PLAN.md`
