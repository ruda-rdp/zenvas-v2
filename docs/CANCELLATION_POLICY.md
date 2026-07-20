# CANCELLATION_POLICY.md

**Status:** DRAFT v0.1 — Ready for Review

**Purpose:** Define fair cancellation and refund policy for Zenvas Orders.

---

# Fair & Real World Policy

## Core Principle

```
┌────────────────────────────────────────────────────────────────┐
│  "Deposit itu insurance. Once work starts, deposit jadi       │
│  milik studio."                                                │
└────────────────────────────────────────────────────────────────┘
```

---

# Refund Policy by Stage

## A. CLIENT CANCELS — BY PRODUCTION STAGE

| Stage | Work Done | Refund |
|-------|------------|--------|
| **Pre-Production** | Planning, script, setup only | ✅ **FULL REFUND** (minus admin fee) |
| **Production** | Shoot completed | ❌ **NO REFUND** |
| **Post-Production** | Editing started | ❌ **NO REFUND** |
| **Final Delivery** | Video delivered, pending approval | ❌ **NO REFUND** |

### Exceptions (always deducted from refund):
- **Admin fee**: Rp 100,000-200,000 (processing costs)
- **Direct costs**: Location deposits, equipment bookings already paid by studio

---

## B. STUDIO CANCELS

| Reason | Refund |
|--------|--------|
| Force majeure (disease, natural disaster) | 100% refund |
| Studio fails to deliver | 100% refund + compensation |
| Team unavailable (no replacement) | 100% refund |

---

## C. GHOSTING / NO RESPONSE

| Days Without Response | Action |
|---------------------|--------|
| Day 1-14 | Warning notification sent |
| Day 15-30 | Final warning + project suspension notice |
| Day 31+ | Project suspended, deposit held |
| Day 90+ | Deposit forfeited (studio keeps) |

**Client can reactivate** by responding within 90 days.

---

# Why This Is Fair

```
┌────────────────────────────────────────────────────────────────┐
│  CLIENT PERSPECTIVE                                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Cancel early = get money back                              │
│  ✓ Policy clear from the start                                 │
│  ✓ No surprises                                                │
│  ✓ Deposit secures their slot                                  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  STUDIO PERSPECTIVE                                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Work invested = compensated                                 │
│  ✓ Slot protection = fair                                     │
│  ✓ Clear rules = no disputes                                  │
│  ✓ Deposit = security against no-shows                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

# Service Template Cancellation Config

```typescript
interface ServiceCancellationConfig {
  serviceId: string;
  
  // Deposit policy
  depositPercentage: number;        // 30-50% typical
  
  // Cancellation window (days before production)
  cancellationWindowDays: number;   // Days to get full refund
  
  // Refund percentages
  fullRefundPercentage: number;     // 100% within window
  partialRefundPercentage: number;  // % if between window and production
  noRefundPercentage: number;       // 0% after production started
  
  // Revision limits
  maxRevisionsIncluded: number;    // e.g., 2-3 revisions
  extraRevisionRate: number;        // e.g., Rp 500,000 per extra revision
  
  // Non-refundable costs
  nonRefundableCosts: {
    adminFee: number;               // Always kept
    locationDeposit: boolean;       // If studio booked location
    equipmentDeposit: boolean;      // If equipment reserved
  };
}
```

---

# Service Examples

## Real Estate Edit (No Production Day)

```typescript
const realEstateEdit: ServiceCancellationConfig = {
  serviceId: 'real-estate-edit',
  depositPercentage: 33,
  
  // Pure post-production, no shoot day to protect
  cancellationWindowDays: 0,
  fullRefundPercentage: 100,        // Before editing starts
  partialRefundPercentage: 0,
  noRefundPercentage: 0,
  
  maxRevisionsIncluded: 2,
  extraRevisionRate: 500000,
  
  nonRefundableCosts: {
    adminFee: 100000,              // Small admin fee
    locationDeposit: false,
    equipmentDeposit: false
  }
};

// Logic: Cancel before editing = full refund
//        Cancel after editing started = no refund
```

## Wedding Film (Has Production Day)

```typescript
const weddingFilm: ServiceCancellationConfig = {
  serviceId: 'wedding-film',
  depositPercentage: 50,
  
  // Protect shoot date — harder to fill
  cancellationWindowDays: 14,        // 2 weeks before = full refund
  fullRefundPercentage: 100,          // 14+ days before
  partialRefundPercentage: 50,        // 3-14 days = 50%
  noRefundPercentage: 0,             // < 3 days = forfeit
  
  maxRevisionsIncluded: 3,
  extraRevisionRate: 750000,
  
  nonRefundableCosts: {
    adminFee: 200000,
    locationDeposit: true,          // Venue booking
    equipmentDeposit: true           // Gear reservation
  }
};

// Logic: Cancel 14+ days before = full refund
//        Cancel 3-14 days before = 50% refund
//        Cancel < 3 days before = no refund
```

## Commercial Video (Large Production)

```typescript
const commercialVideo: ServiceCancellationConfig = {
  serviceId: 'commercial-video',
  depositPercentage: 30,
  
  // Commercial = higher stakes, tighter window
  cancellationWindowDays: 7,         // 1 week before = full refund
  fullRefundPercentage: 100,         // 7+ days before
  partialRefundPercentage: 25,        // 3-7 days = 25%
  noRefundPercentage: 0,             // < 3 days = forfeit
  
  maxRevisionsIncluded: 2,
  extraRevisionRate: 1000000,
  
  nonRefundableCosts: {
    adminFee: 200000,
    locationDeposit: true,          // Location permits
    equipmentDeposit: true           // Full crew/equipment
  }
};

// Logic: Cancel 7+ days before = full refund
//        Cancel 3-7 days before = 25% refund
//        Cancel < 3 days before = no refund
```

---

# Zenvas UI: Order Cancellation Screen

```
┌────────────────────────────────────────────────────────────────┐
│  CANCEL ORDER: RE-Seminyak Villa                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Cancellation Policy                                   │  │
│  │                                                          │  │
│  │ Service: Real Estate Edit                               │  │
│  │ Deposit paid: Rp 2,000,000 (33%)                       │  │
│  │ Order value: Rp 6,000,000                              │  │
│  │                                                          │  │
│  │ Current stage: Post-Production                          │  │
│  │ Editing started: July 15, 2026                         │  │
│  │                                                          │  │
│  │ ════════════════════════════════════════════════════════ │  │
│  │                                                          │  │
│  │ Your cancellation eligibility:                          │  │
│  │                                                          │  │
│  │ Because work has already started,                        │  │
│  │ deposit will NOT be refunded.                           │  │
│  │                                                          │  │
│  │ Deposit forfeited: Rp 2,000,000                        │  │
│  │ Refund amount: Rp 0                                     │  │
│  │                                                          │  │
│  │ Admin fee deducted: N/A (no refund)                    │  │
│  │                                                          │  │
│  │ ════════════════════════════════════════════════════════ │  │
│  │                                                          │  │
│  │ Note: If you proceed, the project will be cancelled   │  │
│  │ and the final video will not be delivered.             │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Cancel Order]  [Keep Working]                                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

# Cancellation Workflow

```
┌────────────────────────────────────────────────────────────────┐
│  CANCELLATION WORKFLOW                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLIENT INITIATES CANCELLATION                            │
│     └─→ Opens Order → Clicks "Cancel Order"                  │
│                                                                 │
│  2. ZENVAS CALCULATES ELIGIBILITY                             │
│     ├─ Check current stage                                      │
│     ├─ Check cancellation window                               │
│     └─ Calculate refund amount                                 │
│                                                                 │
│  3. CLIENT SEES POLICY                                        │
│     └─→ Confirmation screen with refund amount                 │
│                                                                 │
│  4. CLIENT CONFIRMS                                           │
│     └─→ Cancellation reason required                           │
│                                                                 │
│  5. OWNER NOTIFIED                                            │
│     └─→ Notification + pending approval                        │
│                                                                 │
│  6. OWNER APPROVES                                            │
│     ├─→ Order status → CANCELLED                              │
│     ├─→ If refund eligible → Generate refund via Odoo         │
│     ├─→ Project assets archived                                │
│     └─→ Editor notified (if applicable)                       │
│                                                                 │
│  7. KNOWLEDGE CAPTURED                                        │
│     └─→ Cancellation reason saved for analytics               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

# Cancellation Reasons (Analytics)

```typescript
enum CancellationReason {
  // Client reasons
  BUDGET_CHANGED = 'budget_changed',
  PROJECT_CANCELLED = 'project_cancelled',
  FOUND_ANOTHER_PROVIDER = 'found_another_provider',
  TIMELINE_CHANGED = 'timeline_changed',
  NO_LONGER_NEEDED = 'no_longer_needed',
  
  // Mutual reasons
  MUTUAL_AGREEMENT = 'mutual_agreement',
  FORCE_MAJEURE = 'force_majeure',
  QUALITY_DISPUTE = 'quality_dispute',
  
  // Studio reasons
  STUDIO_CANCELLED = 'studio_cancelled',
  TEAM_UNAVAILABLE = 'team_unavailable',
  
  // Other
  GHOSTING = 'ghosting',           // No response
  OTHER = 'other'
}

// Analytics tracked:
// - Cancellation rate per service
// - Most common reasons
// - Refund amounts
// - Patterns (e.g., more cancellations in certain months)
```

---

# Integration with Business OS

```typescript
interface CancellationRecord {
  id: string;
  orderId: string;
  
  // Cancellation details
  initiatedBy: 'CLIENT' | 'STUDIO';
  reason: CancellationReason;
  reasonNotes?: string;
  
  // Financial
  depositAmount: number;
  directCosts: number;           // Non-refundable costs
  refundAmount: number;         // To client
  refundStatus: 'PENDING' | 'PROCESSED' | 'WAIVED';
  
  // Timeline
  cancelledAt: DateTime;
  refundProcessedAt?: DateTime;
  
  // Owner approval
  approvedBy?: string;
  approvedAt?: DateTime;
  
  // Impact
  editorPayoutImpact?: {
    editorId: string;
    workDone: number;           // Percentage of work completed
    payoutOwed: number;         // If any
    payoutStatus: 'PENDING' | 'PAID' | 'WAIVED';
  }[];
}
```

---

# Open Items

1. **Force majeure clause** — Should be in every contract, but specifics vary by situation
2. **Dispute resolution** — What if client disputes the refund amount?
3. **Partial deliveries** — If project is partially delivered, how to handle?
4. **Gift cards / credits** — Option to offer credit instead of refund?

---

# References

- Based on standard video production industry practices
- Adapted for Indonesian business context
- Inspired by service industry refund policies
- Should be reviewed by legal counsel for contract use
