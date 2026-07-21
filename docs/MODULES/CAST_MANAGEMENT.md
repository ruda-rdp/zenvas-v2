# CAST_MANAGEMENT.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

Cast Management is critical for episodic and feature productions. It tracks actors, contracts, availability, and payments — ensuring compliance with complex talent deals.

---

# The Problem It Solves

```
WITHOUT CAST MANAGEMENT:
- "Wait, when does Jennifer's contract end?"
- "Did we get the music clearance for the talent?"
- "How many shooting days does she have left?"
- "Her lawyer needs to approve the third-party clip..."
- Spreadsheets. Emails. Chaos.

WITH CAST MANAGEMENT:
- One source of truth for all talent data
- Contract clauses tracked automatically
- Payment triggers based on shooting days
- Availability conflicts prevented
```

---

# Cast Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CAST LIFECYCLE                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │ AUDITION   │───▶│ BOOKED     │───▶│ ON HOLD    │                │
│  │            │    │            │    │            │                 │
│  │ Casting    │    │ Deal closed│    │ Pre-production│              │
│  │ sessions,  │    │ Contract   │    │ hold while  │               │
│  │ callbacks  │    │ signed     │    │ negotiating │               │
│  └─────────────┘    └─────────────┘    └─────────────┘               │
│        │                  │                   │                        │
│        │                  │                   │                        │
│        ▼                  ▼                   ▼                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │
│  │  RELEASED  │    │  ACTIVE    │───▶│   REST    │               │
│  │            │    │            │    │            │                 │
│  │ Didn't get │    │ Currently  │    │ Between   │                │
│  │ the role   │    │ working on │    │ episodes  │                │
│  │            │    │ project    │    │ (if multi│                │
│  └─────────────┘    └─────────────┘    │ season)  │               │
│                           │                   └─────────────┘          │
│                           │                                              │
│                           ▼                                              │
│                    ┌─────────────┐                                      │
│                    │  WRAPPED   │                                      │
│                    │            │                                      │
│                    │ Production │                                      │
│                    │ complete   │                                      │
│                    └─────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

## Database Schema

```prisma
// Cast Member
model CastMember {
  id              String   @id @default(cuid())
  
  // Basic Info
  name            String
  email           String?
  phone           String?
  photo           String?  // URL to headshot
  
  // Role
  role            String   // Character name
  roleType        RoleType
  
  // Classification
  billingLevel    BillingLevel // LEAD, SUPPORTING, CO-STAR, DAY_PLAYER, BACKGROUND
  
  // Production info
  productionId    String
  production      Production @relation(fields: [productionId], references: [id])
  
  // Status
  status          CastStatus @default(AUDITION)
  
  // Dates
  hireDate        DateTime?
  wrapDate        DateTime?
  
  // Relations
  contract        CastContract?
  payments        CastPayment[]
  availabilities  Availability[]
  callSheets      CallSheetCast[]
  scenes          CastScene[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum RoleType {
  LEAD
  SUPPORTING
  CO_STAR
  DAY_PLAYER
  BACKGROUND
  STUNT
  VOICE
}

enum BillingLevel {
  ABOVE_TITLE   // "Starring"
  TITLE         // "With"
  SUPPORTING    // Regular billing
  CO_STAR       // Single episode or special
  DAY_PLAYER    // Single day
}

enum CastStatus {
  AUDITION
  CALLBACK
  BOOKED
  ON_HOLD
  ACTIVE
  REST
  WRAPPED
  RELEASED
}

// Contract Details
model CastContract {
  id              String   @id @default(cuid())
  
  castMemberId    String   @unique
  castMember      CastMember @relation(fields: [castMemberId], references: [id])
  
  // Deal Points
  dealType        DealType // FIXED, PER_EPISODE, GUARANTEED
  
  // Money
  totalDeal       Float
  currency        String   @default("USD")
  
  // Episode Guarantees
  guaranteedEpisodes Int    // e.g., 6 episodes minimum
  optionEpisodes    Int?    // e.g., option for 2 more
  
  // Per-episode details (if applicable)
  perEpisodeFee   Float?
  episodesWorked   Int      @default(0)
  
  // Timing
  shootingDaysAllotted Int // Total days in contract
  shootingDaysUsed     Int @default(0)
  
  // Restrictions
  exclusivityStart DateTime?
  exclusivityEnd   DateTime?
  nonCompeteClause Boolean @default(false)
  
  // Backend/Success
  backendPercentage Float?  // e.g., 0.5% of profits
  backendThreshold  String? // e.g., "After $100M gross"
  
  // Legal
  contractDocument String?  // URL to signed contract
  signedDate       DateTime?
  ndaRequired      Boolean @default(false)
  ndaSigned        Boolean @default(false)
  
  // Notes
  specialClauses   String?  // Free text for unusual deal points
  
  // Timestamps
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum DealType {
  FIXED_FEE         // One flat fee for entire production
  PER_EPISODE       // Paid per episode worked
  GUARANTEED_MIN    // Guaranteed minimum + additional per episode
  DAY_RATE          // Paid per day worked
  BACKEND_ONLY      // No upfront, percentage of success
}

// Payments
model CastPayment {
  id              String   @id @default(cuid())
  
  castMemberId    String
  castMember      CastMember @relation(fields: [castMemberId], references: [id])
  
  // Payment Details
  type            PaymentType
  amount          Float
  currency        String   @default("USD")
  
  // Trigger
  triggerType     PaymentTrigger
  triggerRef      String?  // e.g., Episode number, shooting day number
  
  // Status
  status          PaymentStatus @default(PENDING)
  paidDate        DateTime?
  
  // Invoicing
  invoiceNumber   String?
  invoiceSent     DateTime?
  
  // Notes
  notes           String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PaymentType {
  UPFRONT          // Signing bonus
  EPISODE_FEE      // Per episode worked
  SHOOTING_DAY     // Per day worked
  FINALE_BONUS     // Completion bonus
  BACKEND          // Profit participation
  KILL_FEE         // Contract killed before shooting
  RETAINER         // Holding fee
  EXPENSE          // Reimbursable expense
}

enum PaymentTrigger {
  CONTRACT_SIGNING  // Paid when contract signed
  EPISODE_START     // Paid when episode shooting begins
  EPISODE_WRAP      // Paid when episode wraps
  SHOOTING_DAY      // Paid after each shoot day
  DELIVERY          // Paid on delivery approval
  PREMIERE          // Paid on series premiere
  ANNIVERSARY       // Annual backend payment
  MANUAL            // Manual trigger
}

enum PaymentStatus {
  PENDING
  APPROVED
  INVOICED
  PAID
  DISPUTED
}

// Availability
model Availability {
  id              String   @id @default(cuid())
  
  castMemberId    String
  castMember      CastMember @relation(fields: [castMemberId], references: [id])
  
  startDate       DateTime
  endDate         DateTime
  type            AvailabilityType
  
  // Details
  reason          String?  // "Booked on X", "Personal", "Other project"
  conflictProduction String? // If booked elsewhere
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AvailabilityType {
  AVAILABLE
  BOOKED           // Booked on this project
  CONFLICT         // Booked elsewhere
  HOLD             // On hold for this project
  PERSONAL         // Personal commitment
  RESTRICTED       // Limited availability (e.g., only mornings)
  NOT_AVAILABLE    // Completely unavailable
}

// Scenes (for tracking which scenes each cast is in)
model CastScene {
  id              String   @id @default(cuid())
  
  castMemberId    String
  castMember      CastMember @relation(fields: [castMemberId], references: [id])
  
  // Scene reference (linked to Tasks/Episodes)
  episodeId       String
  episode         Episode  @relation(fields: [episodeId], references: [id])
  
  sceneNumber     String   // e.g., "1A-5"
  
  // Tracking
  status          SceneStatus @default(SCHEDULED)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SceneStatus {
  SCHEDULED
  REHEARSED
  SHOT
  PRINT           // Approved as "Print" (the one to use)
  CUT             // Cut from final edit
  IN_EDIT         // Used in edit
  NOT_USED        // Filmed but not used
}

// Call Sheet Integration
model CallSheetCast {
  id              String   @id @default(cuid())
  
  callSheetId     String
  callSheet       CallSheet @relation(fields: [callSheetId], references: [id])
  
  castMemberId    String
  castMember      CastMember @relation(fields: [castMemberId], references: [id])
  
  callTime        String   // e.g., "6:00 AM"
  wardrobe        String?
  makeup          String?
  notes           String?
  
  // Derived from contract
  perDiem         Float?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

# API Contracts

## Cast Management Endpoints

### GET `/api/cast`
List all cast members.

```typescript
// Request
GET /api/cast?status=ACTIVE&billing=LEAD

// Response 200 OK
{
  "cast": [
    {
      "id": "cast_001",
      "name": "Sarah Mitchell",
      "role": "Detective Jane Carter",
      "roleType": "LEAD",
      "billingLevel": "TITLE",
      "status": "ACTIVE",
      "photo": "https://...",
      "email": "sarah@agency.com",
      "contract": {
        "dealType": "GUARANTEED_MIN",
        "totalDeal": 500000,
        "guaranteedEpisodes": 8,
        "optionEpisodes": 2,
        "shootingDaysAllotted": 45,
        "shootingDaysUsed": 23
      }
    }
  ],
  "pagination": { ... }
}
```

### POST `/api/cast`
Add a new cast member.

```typescript
// Request
{
  "name": "Sarah Mitchell",
  "email": "sarah@agency.com",
  "role": "Detective Jane Carter",
  "roleType": "LEAD",
  "billingLevel": "TITLE",
  "productionId": "prod_001"
}

// Response 201 Created
{
  "id": "cast_001",
  "name": "Sarah Mitchell",
  "status": "AUDITION",
  ...
}
```

### GET `/api/cast/[id]`
Get cast member details.

```typescript
// Response 200 OK
{
  "id": "cast_001",
  "name": "Sarah Mitchell",
  "role": "Detective Jane Carter",
  "roleType": "LEAD",
  "billingLevel": "TITLE",
  "status": "ACTIVE",
  "photo": "...",
  "contact": {
    "email": "sarah@agency.com",
    "phone": "+1-555-0123",
    "manager": {
      "name": "John Smith",
      "email": "john@agency.com",
      "phone": "+1-555-0124"
    }
  },
  "contract": {
    "dealType": "GUARANTEED_MIN",
    "totalDeal": 500000,
    "guaranteedEpisodes": 8,
    "optionEpisodes": 2,
    "perEpisodeFee": 50000,
    "shootingDaysAllotted": 45,
    "shootingDaysUsed": 23,
    "payments": {
      "paid": 350000,
      "pending": 50000,
      "upcoming": 100000
    }
  },
  "availability": [...],
  "upcomingScenes": [
    { "episode": "Ep 5", "scene": "5A-12", "scheduledDate": "2026-08-15" }
  ],
  "callSheetHistory": [...]
}
```

### PATCH `/api/cast/[id]`
Update cast member.

```typescript
// Request
{
  "status": "WRAPPED",
  "wrapDate": "2026-07-20"
}

// Response 200 OK
{
  "success": true,
  "cast": { ... }
}
```

### GET `/api/cast/[id]/contract`
Get contract details.

```typescript
// Response 200 OK
{
  "id": "contract_001",
  "castMemberId": "cast_001",
  "dealType": "GUARANTEED_MIN",
  "totalDeal": 500000,
  "guaranteedEpisodes": 8,
  "optionEpisodes": 2,
  "perEpisodeFee": 50000,
  "episodesWorked": 8,
  "shootingDaysAllotted": 45,
  "shootingDaysUsed": 42,
  "payments": [
    {
      "id": "pay_001",
      "type": "UPFRONT",
      "amount": 100000,
      "status": "PAID",
      "paidDate": "2026-01-15"
    },
    {
      "id": "pay_002",
      "type": "EPISODE_FEE",
      "amount": 50000,
      "status": "PAID",
      "paidDate": "2026-03-01",
      "triggerRef": "Ep 1"
    },
    // ... more episodes
    {
      "id": "pay_009",
      "type": "EPISODE_FEE",
      "amount": 50000,
      "status": "PENDING",
      "triggerRef": "Ep 8"
    },
    {
      "id": "pay_010",
      "type": "FINALE_BONUS",
      "amount": 50000,
      "status": "PENDING",
      "triggerRef": "Series Finale"
    }
  ],
  "balance": {
    "earned": 500000,
    "paid": 350000,
    "pending": 150000
  }
}
```

### POST `/api/cast/[id]/contract`
Create/attach contract.

```typescript
// Request
{
  "dealType": "GUARANTEED_MIN",
  "totalDeal": 500000,
  "guaranteedEpisodes": 8,
  "optionEpisodes": 2,
  "perEpisodeFee": 50000,
  "shootingDaysAllotted": 45,
  "specialClauses": "Must be available for table read Jan 15",
  "backendPercentage": 0.5,
  "contractDocument": "https://..."
}

// Response 201 Created
{
  "id": "contract_001",
  ...
}
```

### GET `/api/cast/[id]/availability`
Get availability calendar.

```typescript
// Response 200 OK
{
  "castMemberId": "cast_001",
  "calendar": [
    { "date": "2026-08-01", "status": "AVAILABLE" },
    { "date": "2026-08-02", "status": "BOOKED", "project": "This Project" },
    { "date": "2026-08-03", "status": "BOOKED", "project": "This Project" },
    { "date": "2026-08-10", "status": "CONFLICT", "project": "Movie X" },
    ...
  ]
}
```

### POST `/api/cast/[id]/availability`
Add availability entry.

```typescript
// Request
{
  "startDate": "2026-09-01",
  "endDate": "2026-09-15",
  "type": "PERSONAL",
  "reason": "Summer vacation"
}

// Response 201 Created
```

### GET `/api/cast/[id]/payments`
Get payment history.

```typescript
// Response 200 OK
{
  "castMemberId": "cast_001",
  "payments": [
    {
      "id": "pay_001",
      "type": "UPFRONT",
      "amount": 100000,
      "status": "PAID",
      "paidDate": "2026-01-15"
    },
    // ...
  ],
  "summary": {
    "totalEarned": 500000,
    "totalPaid": 350000,
    "pending": 150000
  }
}
```

### POST `/api/cast/[id]/payments`
Record a payment.

```typescript
// Request
{
  "type": "EPISODE_FEE",
  "amount": 50000,
  "triggerType": "EPISODE_WRAP",
  "triggerRef": "Ep 8"
}

// Response 201 Created
```

### GET `/api/cast/[id]/scenes`
Get scenes involving this cast.

```typescript
// Response 200 OK
{
  "castMemberId": "cast_001",
  "scenes": [
    {
      "episode": "Ep 1",
      "scene": "1A-5",
      "description": "Jane enters the crime scene",
      "status": "IN_EDIT"
    },
    // ...
  ],
  "summary": {
    "totalScenes": 87,
    "shot": 82,
    "inEdit": 75,
    "notUsed": 2
  }
}
```

### GET `/api/cast/conflicts`
Check for scheduling conflicts.

```typescript
// Response 200 OK
{
  "conflicts": [
    {
      "date": "2026-08-10",
      "cast": [
        { "name": "Sarah Mitchell", "role": "Lead", "conflict": "Movie X" },
        { "name": "John Davis", "role": "Supporting", "conflict": "TV Show Y" }
      ]
    }
  ]
}
```

### GET `/api/cast/shooting-days`
Get shooting days summary per cast.

```typescript
// Response 200 OK
{
  "shootingDays": [
    {
      "castId": "cast_001",
      "castName": "Sarah Mitchell",
      "allotted": 45,
      "used": 42,
      "remaining": 3,
      "percentUsed": 93.3
    },
    // ...
  ]
}
```

---

# UI Components

## Cast List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CAST & TALENT                                              [+ Add Cast] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Search...]  [Filter: Status ▾] [Filter: Billing ▾] [Sort ▾]          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ PHOTO │ NAME & ROLE          │ BILLING │ STATUS │ DAYS │ DEAL  │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ [img] │ ★ Sarah Mitchell    │ TITLE   │ ACTIVE │ 42/45│ $500K │    │
│  │       │   Detective Carter  │         │        │      │       │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ [img] │ ★ Michael Chen       │ TITLE   │ ACTIVE │ 40/40│ $400K │    │
│  │       │   Detective Reyes   │         │        │      │       │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │ [img] │   Jennifer Walsh     │ SUPP.   │ ACTIVE │ 18/20│ $80K  │    │
│  │       │   Captain Brooks    │         │        │      │       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Cast Detail View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Cast List                                                    │
│                                                                          │
│  ┌───────┐ Sarah Mitchell                                                │
│  │       │ Detective Jane Carter                                         │
│  │ [img] │ Lead (Above Title)                                            │
│  │       │                                                                │
│  └───────┘ [Edit] [Contract] [Schedule] [Payment History]               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  TAB: [Overview] [Contract] [Scenes] [Payments] [Availability]         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CONTRACT SUMMARY                                                   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Deal Type:    GUARANTEED MIN (8 episodes)                        │   │
│  │ Total Deal:   $500,000                                           │   │
│  │ Episodes:     8 worked / 8 guaranteed (0 remaining)             │   │
│  │ Shooting Days: 42 used / 45 allotted (3 remaining)              │   │
│  │                                                                    │   │
│  │ PAYMENT STATUS                                                     │   │
│  │ ████████████████████░░░░░░░░ $350K paid / $500K total           │   │
│  │                                                                    │   │
│  │ [$100K upfront] [$200K episode fees] [$50K pending finale]       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ UPCOMING SCHEDULE                                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ 📅 Aug 15 - Ep 6, Scene 6B-12 - Warehouse Location              │   │
│  │ 📅 Aug 16 - Ep 6, Scene 6B-15 - Warehouse Location             │   │
│  │ ⚠️ Note: 3 shooting days remaining on contract                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SCENE COUNT: 87 total │ 82 shot │ 75 in edit │ 2 not used     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Contract Editor Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  Contract: Sarah Mitchell - Detective Jane Carter                         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  DEAL TYPE                                                                │
│  ○ Fixed Fee (one flat rate)                                              │
│  ● Per Episode (paid per episode worked)                                  │
│  ○ Guaranteed Minimum (guaranteed + additional)                           │
│  ○ Day Rate (paid per day)                                               │
│                                                                          │
│  TOTAL DEAL ($)                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 500,000                                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  EPISODE DETAILS                                                         │
│  Guaranteed Episodes: [8____]  Option Episodes: [2____]                 │
│  Per Episode Fee: [$50,000____]                                           │
│                                                                          │
│  SHOOTING DAYS                                                           │
│  Allotted: [45____]  Used: 42  Remaining: 3                             │
│                                                                          │
│  BACKEND / PROFIT PARTICIPATION                                          │
│  Percentage: [0.5____] %                                                 │
│  Threshold: [After $100M gross____]                                      │
│                                                                          │
│  SPECIAL CLAUSES                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Must be available for table read Jan 15                         │    │
│  │ Must approve wig style before production                        │    │
│  │ [Add clause]                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  UPLOAD CONTRACT                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  📄 contract_sarah_mitchell_signed.pdf     [Upload]            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  NDA REQUIRED: [✓] NDA SIGNED: [✓]                                       │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                             [Cancel]  [Save Contract]                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] CastMember model
- [ ] CastContract model
- [ ] CastPayment model
- [ ] Availability model
- [ ] CastScene model
- [ ] GET /api/cast endpoint
- [ ] POST /api/cast endpoint
- [ ] GET /api/cast/[id] endpoint
- [ ] GET /api/cast/[id]/contract endpoint
- [ ] POST /api/cast/[id]/contract endpoint
- [ ] GET /api/cast/[id]/payments endpoint
- [ ] POST /api/cast/[id]/payments endpoint
- [ ] GET /api/cast/conflicts endpoint
- [ ] Cast List UI
- [ ] Cast Detail UI
- [ ] Contract Editor Modal
- [ ] Payment Recording UI
- [ ] Availability Calendar
- [ ] Integration with Scheduling (Call Sheets)
- [ ] Export to spreadsheet

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
