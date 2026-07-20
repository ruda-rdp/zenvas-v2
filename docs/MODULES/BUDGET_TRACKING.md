if# BUDGET_TRACKING.md

**Status:** PHASE 2 MODULE (Placeholder — Placeholder for Production Module)

**Depends On:**
- PROJECT_OS.md
- KNOWLEDGE_ENGINE.md
- MVP_ROADMAP.md (deferred from Phase 1)

---

# Purpose

Budget Tracking manages the financial planning and monitoring of a Project's production costs. It operates **alongside** the Business OS (which tracks client revenue/Order value) and Human Capital OS (which tracks editor payouts).

Budget Tracking is for **internal cost management** — knowing where money is being spent during production.

---

# Why This Exists

Without Budget Tracking:
- Andi (Producer) in KP-001 has no way to track "Talent: Rp 2,400,000, Drone: Rp 4,500,000"
- Westin Commercial's "Rp 11,600,000 production cost" cannot be monitored
- Scene changes cannot calculate "Budget impact: ~Rp 500,000 extra"

With Budget Tracking:
- Every production decision has financial context
- Projects can be scoped accurately
- Profit margins are clear before accepting

---

# Core Philosophy

**Budget vs Revenue Separation:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FINANCIAL FLOWS IN ZENVAS                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  BUSINESS OS (Revenue side — Client facing)                              │
│  ────────────────────────────────────────────────────────────────────    │
│  Order Value: Rp 35,000,000 (what Westin pays)                        │
│  Invoice: DP Rp 10,500,000 + Final Rp 24,500,000                       │
│  → Visible to: Owner/Manager only (per Constitution #1)                 │
│                                                                          │
│  HUMAN CAPITAL OS (Payout side — Editor compensation)                  │
│  ────────────────────────────────────────────────────────────────────    │
│  Editor Payout: Rp 5,000,000 (Cakra's cut)                            │
│  → Visible to: Cakra only (their own payout)                          │
│                                                                          │
│  BUDGET TRACKING (Cost side — Production expenses)                     │
│  ────────────────────────────────────────────────────────────────────    │
│  Production Cost: Rp 11,600,000                                        │
│  ├── Talent: Rp 2,400,000                                             │
│  ├── Drone: Rp 4,500,000                                              │
│  ├── Location permit: Rp 1,500,000                                    │
│  └── Crew: Rp 3,200,000                                               │
│  → Visible to: Owner/Manager/Producer                                 │
│                                                                          │
│  PROFIT CALCULATION (derived, not stored)                              │
│  ────────────────────────────────────────────────────────────────────    │
│  Revenue - Production Cost - Editor Payout = Studio Margin             │
│  Rp 35,000,000 - Rp 11,600,000 - Rp 5,000,000 = Rp 18,400,000        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Core Objects

## ProjectBudget

```typescript
interface ProjectBudget {
  id: string;
  projectId: string;
  
  // Totals
  totalBudget: number;             // Approved budget limit
  totalActual: number;             // Real spending so far
  totalRemaining: number;           // Remaining budget
  
  // Status
  status: 'DRAFT' | 'APPROVED' | 'OVER_BUDGET' | 'CLOSED';
  
  // Line items
  lineItems: BudgetLineItem[];
  
  // Version tracking
  version: number;                 // For revision tracking
  lastUpdatedAt: DateTime;
  approvedBy?: string;             // User who approved
  approvedAt?: DateTime;
  
  // Metadata
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface BudgetLineItem {
  id: string;
  category: BudgetCategory;
  description: string;
  
  // Planning
  plannedAmount: number;
  
  // Actual
  actualAmount?: number;           // Filled as expenses happen
  vendorId?: string;               // Linked vendor/talent/crew
  
  // Status
  status: 'PLANNED' | 'COMMITTED' | 'INVOICED' | 'PAID';
  
  // Timeline
  expectedDate?: Date;
  actualDate?: Date;
  
  // Notes
  notes?: string;
  
  // Links to other entities
  linkedTalentId?: string;         // From Knowledge Engine
  linkedLocationId?: string;
  linkedCrewMemberId?: string;
  
  // Attachments
  receipts?: string[];             // URLs to receipt documents
  invoices?: string[];             // URLs to vendor invoices
}

enum BudgetCategory {
  TALENT = 'talent',               // Actors, models, voice over
  CREW = 'crew',                   // Camera operator, gaffer, PA, etc.
  LOCATION = 'location',           // Permits, venue fees, parking
  EQUIPMENT = 'equipment',        // Rentals, insurance
  TRANSPORT = 'transport',         // Vehicles, fuel, parking
  CATERING = 'catering',          // Meals, craft services
  POST_PRODUCTION = 'post_production', // VFX, music licensing, stock footage
  CONTINGENCY = 'contingency',     // Buffer for unexpected costs
  OTHER = 'other'
}
```

---

# Budget Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUDGET LIFECYCLE                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │   DRAFT    │───▶│  APPROVED  │───▶│   CLOSED   │                │
│  │            │    │             │    │             │                │
│  │ Planning   │    │ Locked,     │    │ Final       │                │
│  │ phase,     │    │ changes     │    │ reconciliation│               │
│  │ estimate   │    │ require     │    │ actuals vs  │                │
│  │ costs      │    │ approval    │    │ planned     │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
│                                                                          │
│       │                       │                                        │
│       ▼                       ▼                                        │
│  ┌─────────────┐        ┌─────────────┐                                │
│  │ OVER_BUDGET│        │ REVISION    │                                │
│  │            │        │             │                                │
│  │ Actual >   │        │ Approved    │                                │
│  │ Total,     │        │ budget      │                                │
│  │ needs      │        │ modified    │                                │
│  │ approval   │        │ (v2, v3)   │                                │
│  └─────────────┘        └─────────────┘                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Budget UI Mockup

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BUDGET: Westin Commercial Bali                          [EDIT] [APPROVE]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐│
│  │  Total Budget: Rp 11,600,000      Actual: Rp 10,200,000   ✓ ON TRACK ││
│  │  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  88% spent     ││
│  └───────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ── TALENT ─────────────────────────────────────────────────────────────│
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Wayan Sudiarta (Beach scenes)                                    │  │
│  │ Planned: Rp 2,400,000  │  Actual: Rp 2,400,000  │  ✓ PAID     │  │
│  │ 3 days × Rp 800,000    │  [📎 Contract] [🧾 Receipt]              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── EQUIPMENT ─────────────────────────────────────────────────────────│
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Drone Rental (Ketut Ramtha)                                      │  │
│  │ Planned: Rp 4,500,000  │  Actual: Rp 4,500,000  │  ✓ PAID     │  │
│  │ 3 days × Rp 1,500,000   │  [📎 Contract] [🧾 Receipt]              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── LOCATION ──────────────────────────────────────────────────────────│
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Westin Resort — Location Permit                                  │  │
│  │ Planned: Rp 1,500,000  │  Actual: Rp 1,500,000  │  ✓ PAID     │  │
│  │ [📎 Permit] [🧾 Receipt]                                         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Westin Resort — Usage Fee                                        │  │
│  │ Planned: Rp 0  │  Actual: Rp 1,800,000  │  ⚠️ OVER           │  │
│  │ [Add Actual] [📎 Invoice]                                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ── CONTINGENCY ───────────────────────────────────────────────────────│
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Buffer (10%)                                                     │  │
│  │ Planned: Rp 1,600,000  │  Actual: Rp 0  │  Available           │  │
│  │ [Use contingency]                                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  [+ Add Line Item]  [📊 View Breakdown]  [📤 Export]                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Scene Change Impact on Budget

When a scene is added/modified/deleted (per Smart Relations), budget impact is calculated:

```typescript
interface SceneBudgetImpact {
  sceneId: string;
  action: 'ADD' | 'MODIFY' | 'DELETE';
  
  affectedLineItems: {
    itemId: string;
    category: BudgetCategory;
    currentPlanned: number;
    newPlanned: number;
    delta: number;
  }[];
  
  totalImpact: number;            // Positive = more cost, negative = savings
  
  options: {
    id: string;
    description: string;
    budgetAdjustment: number;
  }[];
}
```

**Example: Adding gym scene**

```typescript
const impact = await calculateSceneBudgetImpact({
  sceneId: 'new-gym-scene',
  action: 'ADD',
  requirements: {
    location: 'Westin Gym',
    duration: '30 min',
    talent: 'Wayan (same as beach scenes)'
  }
});

// Output:
{
  affectedLineItems: [
    {
      itemId: 'talent-wayan',
      currentPlanned: 2400000,
      newPlanned: 2640000,       // 3.3 days × Rp 800,000
      delta: +240000
    },
    {
      itemId: 'location-permit',  // Gym is within Westin, permit covers
      currentPlanned: 1500000,
      newPlanned: 1500000,        // No change
      delta: 0
    }
  ],
  totalImpact: +240000,           // About Rp 500,000 was estimate,
                                   // actual is Rp 240,000 (under estimate)
  options: [
    { id: 'extend-day-3', description: 'Add to Day 3 (30 min)', budgetAdjustment: +240000 },
    { id: 'reduce-other', description: 'Cut 30 min from Day 2', budgetAdjustment: 0 }
  ]
}
```

---

# Integration Points

## With Project OS (Script → Budget)

When scenes are created/modified, budget line items can be auto-suggested:

```typescript
// When a new scene with "Talent: Wayan" is added
const suggestions = await suggestBudgetItems({
  scene: newScene,
  linkedTalentId: 'wayan-sudiarta'
});

// Returns:
[
  {
    category: 'TALENT',
    description: 'Wayan Sudiarta — additional day rate',
    estimatedAmount: 800000,
    linkedTalentId: 'wayan-sudiarta'
  }
];
```

## With Knowledge Engine (Talent/Location Rates)

Budget line items auto-pull known rates:

```typescript
// When adding Wayan to budget
const talentProfile = await getTalentProfile('wayan-sudiarta');
// Returns: { dayRate: 800000, specialTerms: ['Beach scenes only'] }

// Budget auto-fills:
// "Wayan Sudiarta: Rp 800,000/day × 3 days = Rp 2,400,000"
```

## With Human Capital OS (Payout Separation)

Budget Tracking shows **production costs**, not editor payouts:

```
Note: Editor payout (Cakra: Rp 5,000,000) is tracked separately 
in Human Capital OS and is NOT included in this budget.
```

---

# Reporting

```typescript
interface BudgetReport {
  projectId: string;
  period: { start: Date; end: Date };
  
  summary: {
    totalBudget: number;
    totalPlanned: number;
    totalActual: number;
    variance: number;              // Actual - Planned (negative = under)
    percentVariance: number;
  };
  
  byCategory: {
    category: BudgetCategory;
    planned: number;
    actual: number;
    variance: number;
  }[];
  
  timeline: {
    date: Date;
    cumulativePlanned: number;
    cumulativeActual: number;
  }[];
  
  alerts: {
    type: 'OVER_BUDGET' | 'STALE' | 'RECEIPT_MISSING';
    lineItemId: string;
    message: string;
  }[];
}
```

---

# Phase 2 Scope

For Phase 2 (KP-001 scenario), Budget Tracking includes:
- ✅ Project budget with line items
- ✅ Category breakdown (Talent, Crew, Location, etc.)
- ✅ Planned vs Actual tracking
- ✅ Scene change budget impact calculation
- ✅ Integration with Talent/Location library

**Phase 3+ additions:**
- Vendor management (separate from Talent/Crew)
- Multi-project budget rollup
- Budget templates per project type
- Automated alerts and approvals

---

# Test Scenarios

See TEST-SCENARIOS.md:
- **KP-001**: Budget tracked per line item, scene change calculates budget impact
- **EPE-001/EPE-002**: Simple projects may not need full budget tracking (optional module)
