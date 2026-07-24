# CREW_MANAGEMENT.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

Crew Management tracks department heads, crew lists, deal memos, and payroll coordination. It's the backbone of production operations for large-scale productions with 50-150 crew members.

---

# The Problem It Solves

```
WITHOUT CREW MANAGEMENT:
- "Who was the boom operator on Episode 2?"
- "What's John's rate? Was it day rate or weekly?"
- "Did everyone sign their deal memos?"
- "We need a gaffer for three shoot days next week..."
- Spreadsheets scattered across emails. Compliance nightmares.

WITH CREW MANAGEMENT:
- One database for all crew information
- Clear rates and deal structures
- Deal memo workflow with e-signatures
- Timecard submission and approval
- Department organization
```

---

# Data Model

```prisma
// Crew Department
model CrewDepartment {
  id              String   @id @default(cuid())
  
  name            String   // e.g., "Camera", "Sound", "Art"
  code            String   // e.g., "CAM", "SND", "ART"
  
  // Hierarchy
  parentId       String?
  parent         CrewDepartment? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children       CrewDepartment[] @relation("DepartmentHierarchy")
  
  // Roles in this department
  roles          CrewRole[]
  
  // Crew members
  members        CrewMember[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Crew Role (position)
model CrewRole {
  id              String   @id @default(cuid())
  
  departmentId   String
  department     CrewDepartment @relation(fields: [departmentId], references: [id])
  
  name            String   // e.g., "Camera Operator", "Boom Operator"
  code            String?  // e.g., "CAM-OP"
  
  // Compensation
  typicalRate    Float?
  rateType       RateType? // DAY, WEEKLY, FLAT
  
  // Requirements
  unionRequired   Boolean  @default(false)
  unionLocal     String?  // e.g., "IATSE Local 600"
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum RateType {
  DAY
  WEEKLY
  FLAT
  HOURLY
}

// Crew Member
model CrewMember {
  id              String   @id @default(cuid())
  
  // Basic info
  firstName      String
  lastName       String
  email          String?
  phone          String?
  
  // Profile
  photoUrl       String?
  headshot       String?
  
  // Emergency contact
  emergencyName  String?
  emergencyPhone String?
  emergencyRelation String?
  
  // Status
  status         CrewStatus @default(AVAILABLE)
  
  // Department & Role
  departmentId   String
  department     CrewDepartment @relation(fields: [departmentId], references: [id])
  
  roleId         String?
  role           CrewRole? @relation(fields: [roleId], references: [id])
  
  // Production history
  productions    CrewProduction[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum CrewStatus {
  AVAILABLE      // Looking for work
  BOOKED         // Currently on a production
  UNAVAILABLE    // Not available
}

// Crew on Production
model CrewProduction {
  id              String   @id @default(cuid())
  
  crewMemberId   String
  crewMember     CrewMember @relation(fields: [crewMemberId], references: [id])
  
  productionId   String
  production     Production @relation(fields: [productionId], references: [id])
  
  // Role
  roleId         String
  role           CrewRole @relation(fields: [roleId], references: [id])
  
  // Deal info
  dealType       DealType
  rate           Float
  currency       String   @default("USD")
  
  // Deal details
  dealDetails    Json     @default("{}")
  // {
  //   "flatFee": 5000,
  //   "overtimeRate": 100,
  //   "kitRental": 500,
  //   "travelIncluded": true
  // }
  
  // Dates
  startDate      DateTime
  endDate        DateTime?
  
  // Status
  status         CrewProductionStatus @default(PENDING)
  
  // Deal memo
  dealMemo       DealMemo?
  
  // Timecards
  timecards      Timecard[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum CrewProductionStatus {
  PENDING        // Offer made, not accepted
  CONFIRMED      // Deal memo signed
  ACTIVE         // Currently working
  COMPLETED      // Wrapped
  RELEASED       // Let go early
}

// Deal Memo
model DealMemo {
  id              String   @id @default(cuid())
  
  crewProductionId String @unique
  crewProduction   CrewProduction @relation(fields: [crewProductionId], references: [id])
  
  // Document info
  title          String   // e.g., "Deal Memo - John Smith"
  
  // Terms
  terms          String   // Deal terms in text
  
  // Compensation
  compensation    Json     // Detailed compensation breakdown
  
  // Clauses
  specialClauses String[] // List of special clauses
  
  // Signatures
  producerSignature String?
  producerSignedAt DateTime?
  crewSignature    String?
  crewSignedAt    DateTime?
  
  // Status
  status         DealMemoStatus @default(DRAFT)
  
  // Document
  documentUrl    String?  // Signed document URL
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DealMemoStatus {
  DRAFT
  SENT
  VIEWED
  SIGNED
  COUNTERSIGNED
  COMPLETED
}

// Timecard
model Timecard {
  id              String   @id @default(cuid())
  
  crewProductionId String
  crewProduction   CrewProduction @relation(fields: [crewProductionId], references: [id])
  
  // Work date
  workDate       DateTime
  
  // Hours
  hoursWorked    Float    // Regular hours
  overtimeHours  Float    @default(0)
  
  // Status
  status         TimecardStatus @default(SUBMITTED)
  
  // Approval
  submittedAt    DateTime
  approvedBy    String?
  approvedAt    DateTime?
  
  // Notes
  notes          String?
  
  // Shoot day reference
  shootDayId    String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum TimecardStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  PAID
}

// Crew Availability
model CrewAvailability {
  id              String   @id @default(cuid())
  
  crewMemberId   String
  crewMember     CrewMember @relation(fields: [crewMemberId], references: [id])
  
  // Date range
  startDate      DateTime
  endDate        DateTime
  
  // Status
  type           AvailabilityType
  
  // Details
  reason         String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AvailabilityType {
  AVAILABLE
  BOOKED
  PERSONAL
  OTHER_PROJECT
  MEDICAL
  VACATION
}

// Crew Expense
model CrewExpense {
  id              String   @id @default(cuid())
  
  crewProductionId String
  crewProduction   CrewProduction @relation(fields: [crewProductionId], references: [id])
  
  // Expense info
  type            ExpenseType
  description     String
  amount          Float
  currency        String   @default("USD")
  
  // Receipt
  receiptUrl     String?
  
  // Status
  status         ExpenseStatus @default(PENDING)
  
  // Approval
  approvedBy    String?
  approvedAt    DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ExpenseType {
  MEAL
  TRANSPORTATION
  ACCOMMODATION
  EQUIPMENT
  OTHER
}

enum ExpenseStatus {
  PENDING
  APPROVED
  REJECTED
  REIMBURSED
}

// Safety Training
model SafetyTraining {
  id              String   @id @default(cuid())
  
  name            String   // e.g., "Set Safety Certification"
  description     String?
  
  // Requirement
  requiredFor    String[]  // Department codes that require this
  
  // Validity
  validDurationDays Int?   // Null = always valid
  
  // Crew who have completed
  completions    SafetyTrainingCompletion[]
  
  createdAt       DateTime @default(now())
}

model SafetyTrainingCompletion {
  id              String   @id @default(cuid())
  
  trainingId     String
  training       SafetyTraining @relation(fields: [trainingId], references: [id])
  
  crewMemberId   String
  
  // Completion
  completedAt    DateTime
  expiresAt      DateTime?
  
  // Proof
  certificateUrl String?
}
```

---

# API Contracts

## Crew Management Endpoints

### GET `/api/crew/departments`
List all departments.

```typescript
// Response 200 OK
{
  "departments": [
    {
      "id": "dept_001",
      "name": "Camera",
      "code": "CAM",
      "memberCount": 12,
      "roles": [
        { "id": "role_001", "name": "Director of Photography" },
        { "id": "role_002", "name": "Camera Operator" }
      ]
    }
  ]
}
```

### GET `/api/crew/members`
List all crew members.

```typescript
// Request
GET /api/crew/members?department=CAM&status=AVAILABLE

// Response 200 OK
{
  "members": [
    {
      "id": "crew_001",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@email.com",
      "phone": "+1-555-0123",
      "department": { "name": "Camera", "code": "CAM" },
      "role": { "name": "Camera Operator" },
      "status": "AVAILABLE",
      "rating": 4.8,
      "productionCount": 5
    }
  ]
}
```

### POST `/api/crew/members`
Add a crew member.

```typescript
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@email.com",
  "phone": "+1-555-0123",
  "departmentId": "dept_001",
  "roleId": "role_002"
}

// Response 201 Created
```

### GET `/api/crew/productions`
List crew on production.

```typescript
// Request
GET /api/crew/productions?productionId=prod_001

// Response 200 OK
{
  "crew": [
    {
      "id": "cp_001",
      "member": {
        "id": "crew_001",
        "firstName": "John",
        "lastName": "Smith",
        "photo": "https://..."
      },
      "department": { "name": "Camera" },
      "role": { "name": "Camera Operator" },
      "dealType": "DAY",
      "rate": 500,
      "startDate": "2026-07-01",
      "endDate": "2026-09-30",
      "status": "ACTIVE",
      "dealMemo": { "status": "SIGNED" }
    }
  ]
}
```

### POST `/api/crew/productions`
Add crew to production.

```typescript
// Request
{
  "crewMemberId": "crew_001",
  "productionId": "prod_001",
  "roleId": "role_002",
  "dealType": "DAY",
  "rate": 500,
  "startDate": "2026-07-01",
  "endDate": "2026-09-30",
  "dealDetails": {
    "overtimeRate": 75,
    "kitRental": 100
  }
}

// Response 201 Created
```

### GET `/api/crew/deal-memos/[id]`
Get deal memo.

```typescript
// Response 200 OK
{
  "id": "dm_001",
  "crewMember": { "name": "John Smith" },
  "production": { "title": "The Series" },
  "role": { "name": "Camera Operator" },
  "compensation": {
    "rate": 500,
    "rateType": "DAY",
    "estimatedDays": 60,
    "totalEstimate": 30000
  },
  "specialClauses": [
    "Overtime after 8 hours",
    "Kit rental included"
  ],
  "status": "SENT",
  "terms": "..."
}
```

### POST `/api/crew/deal-memos/[id]/send`
Send deal memo for signature.

```typescript
// Request
{
  "recipientEmail": "john@email.com"
}

// Response 200 OK
```

### POST `/api/crew/deal-memos/[id]/sign`
Sign deal memo.

```typescript
// Request
{
  "signature": "data:image/png;base64,...",
  "signedBy": "crew",
  "ipAddress": "192.168.1.1"
}

// Response 200 OK
```

### GET `/api/crew/timecards`
Get timecards.

```typescript
// Request
GET /api/crew/timecards?crewProductionId=cp_001&status=SUBMITTED

// Response 200 OK
{
  "timecards": [
    {
      "id": "tc_001",
      "crewMember": { "name": "John Smith" },
      "workDate": "2026-07-20",
      "hoursWorked": 10,
      "overtimeHours": 2,
      "status": "SUBMITTED",
      "submittedAt": "2026-07-21T08:00:00Z"
    }
  ]
}
```

### POST `/api/crew/timecards/[id]/approve`
Approve timecard.

```typescript
// Response 200 OK
{
  "success": true,
  "approvedAt": "2026-07-21T10:00:00Z"
}
```

### GET `/api/crew/availability`
Check crew availability.

```typescript
// Request
GET /api/crew/availability?departmentId=dept_001&startDate=2026-08-01&endDate=2026-08-15

// Response 200 OK
{
  "available": [
    { "id": "crew_001", "name": "John Smith", "role": "Camera Operator" }
  ],
  "unavailable": [
    { "id": "crew_002", "name": "Jane Doe", "reason": "Booked on Project X" }
  ]
}
```

---

# UI Components

## Crew Directory

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CREW DIRECTORY                                        [+ Add Crew]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Search: [________________] [Department ▾] [Status ▾] [Sort ▾]         │
│                                                                          │
│  DEPARTMENT                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🎥 Camera (12)    │ 🎤 Sound (8)     │ 🎨 Art (15)          │   │
│  │ 👗 Wardrobe (6)  │ 💄 Makeup (5)    │ 🏗️ Construction (10) │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  🎥 CAMERA - 12 members                                                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ PHOTO │ NAME          │ ROLE              │ STATUS    │ RATE   │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ [img] │ John Smith    │ Camera Operator   │ ● Active  │ $500/d │   │
│  │ [img] │ Jane Doe      │ DP                 │ ○ Available│ $800/d │   │
│  │ [img] │ Bob Camera    │ 1st AC             │ ● Active  │ $350/d │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Crew Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Crew Directory                                               │
│                                                                          │
│  ┌───────┐ John Smith                                                  │
│  │       │ Camera Operator - Camera Department                          │
│  │ [img] │                                                             │
│  │       │ 📧 john@email.com  📱 +1-555-0123                          │
│  └───────┘                                                             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  TABS: [Overview] [Experience] [Documents] [Timecards] [Availability]   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CURRENT PRODUCTION                                                 │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ The Series (Ep 1-3)                                              │   │
│  │ Role: Camera Operator  │  Days: 15/60  │  Status: Active     │   │
│  │ Rate: $500/day         │  Deal: Signed │  [View Deal Memo]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ RECENT PRODUCTION HISTORY                                          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ✓ The Movie (2025)        │ Camera Operator  │ 45 days         │   │
│  │ ✓ Commercial Project X   │ 2nd Camera      │ 5 days           │   │
│  │ ✓ TV Series ABC          │ Camera Operator  │ 22 days         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  EMERGENCY CONTACT                                                       │
│  Jane Smith (Wife) - +1-555-0199                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Deal Memo Editor

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✕                                                                         │
│                                                                          │
│  DEAL MEMO                                                              │
│  Crew: John Smith                                                       │
│  Production: The Series                                                 │
│  Role: Camera Operator                                                  │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  COMPENSATION                                                           │
│  Rate Type: [Day Rate ▾]                                                │
│  Rate: [$500____] per day                                              │
│                                                                          │
│  ESTIMATED                                                              │
│  Estimated Days: [60____]                                               │
│  Total Estimate: $30,000                                               │
│                                                                          │
│  ADDITIONAL                                                             │
│  □ Overtime Rate: $[75____] per hour                                  │
│  □ Kit Rental: [$100____]                                              │
│  □ Travel Expenses: ☐ Included  ☐ Not Included                        │
│                                                                          │
│  SPECIAL CLAUSES                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Overtime applies after 8 hours of work                       │   │
│  │ 2. Kit rental includes basic camera accessories                  │   │
│  │ 3. Travel time not billable unless pre-approved                  │   │
│  │ [+ Add Clause]                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TERMS                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [Standard contract terms...]                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  [Save Draft]  [Preview]  [Send for Signature]                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Timecard Submission

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MY TIMECARDS                                                         │
│                                                                          │
│  Current Production: The Series                                       │
│  Role: Camera Operator │ Rate: $500/day                             │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ DATE         │ HOURS │ OVERTIME │ STATUS  │ NOTES             │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ Jul 20, 2026│  10   │    2     │ ✓ Approved │ Warehouse location│   │
│  │ Jul 19, 2026│   8   │    0     │ ✓ Approved │                   │   │
│  │ Jul 18, 2026│  12   │    4     │ ✓ Approved │ Night shoot      │   │
│  │ Jul 17, 2026│   8   │    0     │ ✓ Approved │                   │   │
│  │ Jul 16, 2026│  10   │    2     │ ✓ Approved │                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  SUBMIT NEW TIMECARD                                                    │
│                                                                          │
│  Date: [Jul 21, 2026____]                                             │
│  Hours Worked: [10____]                                                 │
│  Overtime Hours: [2____]                                               │
│                                                                          │
│  Notes: [____________________________________________________]         │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  SUMMARY                                                                │
│  Total Hours: 380 │ Total Overtime: 45 │ Estimated Pay: $22,250     │
│                                                                          │
│                              [Submit Timecard]                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] CrewDepartment model
- [ ] CrewRole model
- [ ] CrewMember model
- [ ] CrewProduction model
- [ ] DealMemo model
- [ ] Timecard model
- [ ] CrewAvailability model
- [ ] CrewExpense model
- [ ] SafetyTraining model
- [ ] SafetyTrainingCompletion model
- [ ] GET /api/crew/departments endpoint
- [ ] GET /api/crew/members endpoint
- [ ] POST /api/crew/members endpoint
- [ ] GET /api/crew/productions endpoint
- [ ] POST /api/crew/productions endpoint
- [ ] GET /api/crew/deal-memos/[id] endpoint
- [ ] POST /api/crew/deal-memos/[id]/send endpoint
- [ ] POST /api/crew/deal-memos/[id]/sign endpoint
- [ ] GET /api/crew/timecards endpoint
- [ ] POST /api/crew/timecards/[id]/approve endpoint
- [ ] GET /api/crew/availability endpoint
- [ ] Crew Directory UI
- [ ] Crew Detail View
- [ ] Department Browser
- [ ] Crew Search
- [ ] Deal Memo Editor
- [ ] Deal Memo E-Signature
- [ ] Timecard Submission UI
- [ ] Timecard Approval UI
- [ ] Crew Availability Calendar
- [ ] Production Crew List
- [ ] Export to Spreadsheet
- [ ] Email Notifications
- [ ] Document Management

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
