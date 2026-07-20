# Scalability Plan - Zenvas SaaS

## Overview

This document outlines Zenvas's multi-tenant architecture strategy for scaling from startup to enterprise.

## Current State

**Architecture**: Shared database with `organizationId` tenant isolation

```
┌─────────────────────────────────────────┐
│          Zenvas Application              │
├─────────────────────────────────────────┤
│  Next.js Frontend                      │
│  Next.js API Routes                    │
│  Prisma ORM                            │
├─────────────────────────────────────────┤
│  PostgreSQL (Neon)                     │
│  ├── Organizations                     │
│  ├── Users (filtered by org_id)        │
│  ├── Brands (filtered by org_id)        │
│  └── All other entities...             │
└─────────────────────────────────────────┘
```

**Strengths**:
- ✅ Simple for MVP
- ✅ Easy to maintain
- ✅ Cheap (single database)

## Scaling Phases

### Phase 1: Current (0-100 Organizations)

**Target**: < 100 organizations, < 10,000 users

**Strategy**: Shared database + optimization

| Component | Action |
|-----------|--------|
| Database | Neon PostgreSQL (serverless) |
| Indexes | Add composite indexes on `(organizationId, createdAt)` |
| Caching | Redis for session & frequently accessed data |
| Monitoring | Add metrics for slow queries |

**When to migrate**: When Neon connection limits hit or query performance degrades

---

### Phase 2: Growth (100-1,000 Organizations)

**Target**: 100-1,000 organizations, < 100,000 users

**Strategy**: Row-Level Security (RLS)

```sql
-- Enable RLS on all tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users USING (organization_id = current_setting('app.current_org_id'));
```

**Benefits**:
- ✅ Database-enforced tenant isolation
- ✅ No application-level filtering needed
- ✅ Security guarantee even if code has bugs

**Add**:
- Connection pooling (PgBouncer)
- Read replicas for heavy reads
- Background job queue (BullMQ)

---

### Phase 3: Scale (1,000+ Organizations)

**Target**: 1,000+ organizations, 100,000+ users

**Strategy Options**:

#### Option A: Per-Organization Database
```
├── zenvas_main (platform data, billing)
├── org_001_db (Customer A)
├── org_002_db (Customer B)
└── org_N_db (Customer N)
```
- Pros: Complete isolation, easy backup per customer
- Cons: Complex migrations, higher infra cost

#### Option B: Database Sharding
```
Sharding Key: organizationId
├── Shard 1: org_001 - org_999
├── Shard 2: org_1000 - org_1999
└── Shard N: ...
```
- Pros: Scalable, distributed
- Cons: Complex queries (cross-shard)

#### Option C: Hybrid
```
├── Main DB: Platform, billing, small orgs
└── Enterprise DB: Large customers get dedicated DB
```
- Pros: Best of both worlds
- Cons: Complexity

---

## Multi-Tenant Isolation Strategy

### Current: Application-Level Filter

```typescript
// Every query includes org_id filter
const users = await prisma.user.findMany({
  where: { organizationId: session.user.organizationId }
});
```

### Future: Row-Level Security (RLS)

```sql
-- Set at connection time
SET app.current_org_id = 'org_123';

-- Now all queries automatically filter
SELECT * FROM users; -- Returns only org_123 users
```

---

## Migration Checklist

When to migrate between phases:

| Signal | Action |
|--------|--------|
| Query latency > 500ms p95 | Add indexes |
| Neon connection errors | Add connection pooling |
| Slow queries > 1s | Analyze and optimize |
| > 100 orgs | Plan RLS implementation |
| > 1000 orgs | Plan per-org database or sharding |

---

## Data Privacy & Compliance

### GDPR Considerations

1. **Data Export**: Per-org data export capability
2. **Data Deletion**: Cascade delete when org cancels
3. **Data Portability**: Export all org data as JSON/CSV
4. **Audit Trail**: Log all data access

### Implementation:

```typescript
// Data export endpoint
async function exportOrganizationData(orgId: string) {
  const data = {
    users: await prisma.user.findMany({ where: { organizationId: orgId }}),
    brands: await prisma.brand.findMany({ where: { organizationId: orgId }}),
    // ... all entities
  };
  return JSON.stringify(data);
}
```

---

## Monitoring & Alerting

### Key Metrics

| Metric | Warning | Critical |
|--------|---------|----------|
| DB connections | > 80% | > 95% |
| Query latency p95 | > 200ms | > 500ms |
| Error rate | > 1% | > 5% |
| CPU usage | > 70% | > 90% |

### Alerts

- Email/Slack for critical metrics
- Dashboard for trend analysis
- Weekly summary reports

---

## Cost Optimization

### Neon PostgreSQL

| Usage | Cost Model |
|-------|------------|
| Free tier | 0.5 GB storage, 1 project |
| Paid | Based on usage, connection pool |

### Scale Cost Estimate

| Phase | Est. Monthly Cost |
|-------|------------------|
| Phase 1 | $0-50 (Neon free tier) |
| Phase 2 | $100-500 (Neon paid + Redis) |
| Phase 3 | $1000-5000+ (Dedicated DBs or shards) |

---

## Conclusion

**Start Simple, Scale When Needed**

Current architecture (shared DB + org_id) is sufficient for:
- MVP development
- Initial customers
- Product-market fit validation

Invest in proper monitoring and migration planning to know WHEN to scale, not prematurely.

---

## References

- ADR-0011: Platform Admin Role
- Security Audit: `docs/SECURITY_AUDIT.md`
- Neon Documentation: https://neon.tech/docs
- Prisma Multi-tenancy: https://www.prisma.io/docs/guides/database/multi-tenancy
