# SCHEDULING_CALL_SHEETS.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

The Scheduling module is the backbone of production operations. It manages shoot days, generates call sheets, tracks cast/crew schedules, and ensures everyone knows when and where to be. A missed call time can cost $50K+ per hour in delays.

---

# The Problem It Solves

```
WITHOUT SCHEDULING MODULE:
- "What time does Jennifer need to be on set?"
- "Where are we shooting tomorrow?"
- "Who forgot to tell the grip truck about the location change?"
- "We can't start until Camera arrives at 7am..."
- Chaos. Angry producers. Expensive delays.

WITH SCHEDULING MODULE:
- One source of truth for the entire schedule
- Auto-generated call sheets
- Cast/crew notifications
- Conflict detection
- Calendar integration
```

---

# Scheduling Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SCHEDULING WORKFLOW                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRE-PRODUCTION                                                          │
│  ├── Break down script into scenes                                      │
│  ├── Identify locations and talent needed                                │
│  ├── Create production schedule (60 shoot days)                         │
│  └── Book locations and talent                                          │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  SCHEDULE CREATION                                                       │
│  ├── Assign scenes to shoot days                                        │
│  ├── Calculate page count per day (1 page ≈ 8 min screen time)          │
│  ├── Book equipment and facilities                                      │
│  ├── Generate call sheet                                                │
│  └── Send to cast/crew                                                  │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  DAY BEFORE                                                               │
│  ├── Finalize call sheet                                                │
│  ├── Confirm all cast/crew attendance                                   │
│  ├── Check weather and adjust if needed                                 │
│  └── Send reminder notifications                                        │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  SHOOT DAY                                                               │
│  ├── Morning: Crew call                                                 │
│  ├── Morning: Cast call (usually later)                                  │
│  ├── Shooting: Scene changes, meal breaks, wrap                         │
│  └── End of day: Update schedule, prep for next day                     │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  POST-PRODUCTION                                                         │
│  ├── Review actual vs. scheduled                                        │
│  └── Update for next production                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Data Model

```prisma
// Production Schedule (season or feature)
model ProductionSchedule {
  id              String   @id @default(cuid())
  
  // References
  productionId    String
  production      Production @relation(fields: [productionId], references: [id])
  
  // Info
  name            String   // e.g., "Series Schedule" or "Feature Schedule"
  
  // Date range
  startDate       DateTime
  endDate         DateTime
  
  // Working days (excluding weekends/holidays by default)
  workingDaysOnly Boolean @default(true)
  
  // Shoot days
  shootDays       ShootDay[]
  
  // Settings
  settings        Json     @default("{}")
  // {
  //   defaultCrewCallTime: "06:00",
  //   defaultCastCallTime: "08:00",
  //   turnAroundHours: 10,
  //   mealPenalties: { first: 15, second: 30 },
  //   holidays: ["2026-12-25", ...]
  // }
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Individual Shoot Day
model ShootDay {
  id              String   @id @default(cuid())
  
  scheduleId      String
  schedule        ProductionSchedule @relation(fields: [scheduleId], references: [id])
  
  // Day Info
  dayNumber       Int      // e.g., Day 1, Day 2
  date            DateTime
  
  // Location
  locationId      String?
  location        Location? @relation(fields: [locationId], references: [id])
  
  // Status
  status          ShootDayStatus @default(DRAFT)
  
  // Call times
  crewCall        String   // e.g., "06:00"
  castCall        String   // e.g., "08:00"
  firstShot       String   // e.g., "07:00"
  wrap            String   // e.g., "19:00"
  
  // Estimated times
  estDayStart     String?
  estDayEnd       String?
  estMealBreak    String?  // e.g., "12:00-13:00"
  estPages        Float?   // Estimated pages for this day
  
  // Actual times
  actualDayStart  String?
  actualDayEnd    String?
  actualPages     Float?   // Actual pages shot
  
  // Scenes assigned
  scenes          ShootDayScene[]
  
  // Call sheet
  callSheet       CallSheet?
  
  // Weather
  weatherForecast String?
  weatherActual   String?
  
  // Notes
  notes           String?
  
  // Production report
  report          ProductionReport?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ShootDayStatus {
  DRAFT           // Being planned
  CONFIRMED       // Locked, sent to crew
  IN_PROGRESS     // Shooting
  COMPLETED       // Day wrapped
  OMITTED         // Day was not used (weather, etc.)
}

// Scenes assigned to a shoot day
model ShootDayScene {
  id              String   @id @default(cuid())
  
  shootDayId     String
  shootDay       ShootDay @relation(fields: [shootDayId], references: [id])
  
  // Scene reference
  episodeId      String?  // For episodic
  sceneNumber    String   // e.g., "5A"
  
  // Scene info
  description    String   // Scene description
  intExt         String   // INT or EXT
  location       String   // e.g., "Warehouse - Int"
  
  // Timing
  estPages       Float    // Estimated pages
  estDuration    Float?   // Estimated shooting duration in minutes
  priority       Int      @default(1) // 1 = must shoot, 2 = should, 3 = if time
  
  // Status
  status         SceneDayStatus @default(PENDING)
  actualDuration Float?
  
  // Order on call sheet
  order          Int
  
  // Notes
  notes          String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum SceneDayStatus {
  PENDING
  SCHEDULED
  READY_TO_SHOOT
  SHOOTING
  COMPLETED
  OMITTED        // Cut from schedule
  ADDED          // Added day-of
}

// Call Sheet
model CallSheet {
  id              String   @id @default(cuid())
  
  shootDayId     String   @unique
  shootDay       ShootDay @relation(fields: [shootDayId], references: [id])
  
  // Version
  version         Int      @default(1)
  
  // Status
  status         CallSheetStatus @default(DRAFT)
  
  // Content
  director        String?
  dp             String?  // Director of Photography
  ad             String?  // Assistant Director
  producer       String?
  
  // Day info
  date           DateTime
  dayNumber      Int
  weekday        String?  // e.g., "Monday"
  
  // Location
  locationName   String
  locationAddress String?
  locationNotes  String?
  parkingInfo    String?
  
  // Weather
  weather        String?
  temperature    String?
  
  // Times
  crewCall       String
  castCall       String
  firstShot      String
  wrap           String
  mealBreak      String?
  
  // Daily schedule
  scheduleItems   CallSheetScheduleItem[]
  
  // Cast
  cast           CallSheetCast[]
  
  // Crew summary
  crewSummary    String?
  
  // Notes for crew
  crewNotes      String?
  
  // Attached files
  attachments    Json?    // [{ name, url, type }]
  
  // PDF
  pdfUrl         String?
  
  // Sent status
  sentAt         DateTime?
  sentTo         String[]  // Email addresses sent to
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum CallSheetStatus {
  DRAFT
  REVIEW
  FINAL
  DISTRIBUTED
}

model CallSheetScheduleItem {
  id              String   @id @default(cuid())
  
  callSheetId    String
  callSheet      CallSheet @relation(fields: [callSheetId], references: [id])
  
  time           String   // e.g., "06:00"
  duration       Float?   // minutes
  activity       String   // e.g., "Crew Call", "Camera Setup"
  description    String?
  
  order          Int
  
  createdAt       DateTime @default(now())
}

model CallSheetCast {
  id              String   @id @default(cuid())
  
  callSheetId    String
  callSheet      CallSheet @relation(fields: [callSheetId], references: [id])
  
  castMemberId   String
  castMember     CastMember @relation(fields: [castMemberId], references: [id])
  
  callTime       String   // Individual call time
  wardrobe       String?
  makeup         String?
  hair           String?
  
  // Derived from contract
  perDiem        Float?
  travelAllowance Float?
  
  // Status
  confirmed      Boolean  @default(false)
  confirmedAt     DateTime?
  
  notes          String?
  
  createdAt       DateTime @default(now())
}

// Production Report (end of day)
model ProductionReport {
  id              String   @id @default(cuid())
  
  shootDayId     String   @unique
  shootDay       ShootDay @relation(fields: [shootDayId], references: [id])
  
  // Times
  dayStart       String
  dayEnd         String
  totalHours     Float
  
  // Production
  scenesShot     Int
  pagesShot      Float
  setupsCompleted Int
  
  // Cast/crew
  castPresent    Int
  castAbsent     Int
  crewPresent    Int
  
  // Work done
  workCompleted   String   @default("[]") // JSON array of completed work
  workRemaining   String   @default("[]") // JSON array of remaining work
  
  // Issues
  issues          String   @default("[]") // JSON array of issues
  incidents       String   @default("[]") // JSON array of incidents
  
  // Statistics
  wrapTime        String
  nextDayCallTime String
  
  // Prepared by
  preparedBy      String?
  preparedAt      DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Location (for scheduling)
model Location {
  id              String   @id @default(cuid())
  
  name            String   // e.g., "Warehouse"
  address         String?
  
  // Details
  type            LocationType // STUDIO, PRACTICAL, EXTERIOR, STAGE
  contactName     String?
  contactPhone    String?
  contactEmail    String?
  
  // Access
  accessNotes     String?  // Gate codes, parking
  parkingInfo     String?
  
  // Facilities
  hasPower        Boolean  @default(true)
  hasRestrooms    Boolean  @default(true)
  hasWifi         Boolean  @default(false)
  
  // Bookings
  bookings        ShootDay[]
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum LocationType {
  STUDIO
  PRACTICAL
  EXTERIOR
  STAGE
  OFFICE
  OTHER
}

// Calendar event (for integration)
model CalendarEvent {
  id              String   @id @default(cuid())
  
  // References
  shootDayId     String?  // If tied to shoot day
  castMemberId   String?  // If tied to cast
  
  // Event info
  title          String   // e.g., "Ep 3 - Day 15 Call"
  description    String?
  
  // Timing
  startTime      DateTime
  endTime        DateTime
  
  // Location
  location       String?
  address        String?
  
  // Notification
  notifyBefore   Int?     // Minutes before to notify
  
  // External
  googleEventId  String?  // Google Calendar ID
  outlookEventId String?  // Outlook ID
  
  // Status
  status         CalendarEventStatus @default(CONFIRMED)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum CalendarEventStatus {
  TENTATIVE
  CONFIRMED
  CANCELLED
}
```

---

# API Contracts

## Scheduling Endpoints

### GET `/api/schedule`
Get production schedule.

```typescript
// Response 200 OK
{
  "schedule": {
    "id": "sched_001",
    "name": "Series Schedule",
    "startDate": "2026-07-01",
    "endDate": "2026-09-30",
    "totalShootDays": 60,
    "completedDays": 25,
    "remainingDays": 35
  },
  "shootDays": [
    {
      "id": "day_001",
      "dayNumber": 26,
      "date": "2026-07-21",
      "status": "IN_PROGRESS",
      "location": { "name": "Warehouse", "address": "123 Main St" },
      "crewCall": "06:00",
      "castCall": "08:00",
      "scenesCount": 8,
      "pagesEstimate": 5.5
    }
  ]
}
```

### POST `/api/schedule`
Create a production schedule.

```typescript
// Request
{
  "name": "Series Schedule",
  "productionId": "prod_001",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30",
  "settings": {
    "defaultCrewCallTime": "06:00",
    "defaultCastCallTime": "08:00",
    "turnAroundHours": 10
  }
}

// Response 201 Created
```

### GET `/api/schedule/shoot-days/[id]`
Get shoot day detail.

```typescript
// Response 200 OK
{
  "id": "day_001",
  "dayNumber": 26,
  "date": "2026-07-21",
  "weekday": "Monday",
  "status": "IN_PROGRESS",
  "location": {
    "name": "Warehouse",
    "address": "123 Main St",
    "accessNotes": "Enter through side gate, code 1234"
  },
  "times": {
    "crewCall": "06:00",
    "castCall": "08:00",
    "firstShot": "07:00",
    "wrap": "19:00",
    "mealBreak": "12:00-13:00"
  },
  "scenes": [
    {
      "id": "scene_001",
      "sceneNumber": "5A",
      "description": "Warehouse - Int - Detective enters",
      "intExt": "INT",
      "location": "Warehouse",
      "estPages": 0.75,
      "priority": 1,
      "status": "COMPLETED"
    }
  ],
  "callSheet": {
    "id": "cs_001",
    "version": 2,
    "status": "DISTRIBUTED",
    "sentAt": "2026-07-20T18:00:00Z"
  }
}
```

### PATCH `/api/schedule/shoot-days/[id]`
Update shoot day.

```typescript
// Request
{
  "status": "IN_PROGRESS",
  "actualDayStart": "06:15",
  "castCall": "08:30"
}

// Response 200 OK
```

### POST `/api/schedule/shoot-days/[id]/call-sheet
Generate call sheet.

```typescript
// Request
{
  "director": "John Director",
  "dp": "Jane DP",
  "ad": "Bob AD",
  "includeSchedule": true,
  "includeCast": true
}

// Response 201 Created
{
  "id": "cs_001",
  "version": 1,
  "status": "DRAFT"
}
```

### GET `/api/schedule/shoot-days/[id]/call-sheet/pdf
Get call sheet as PDF.

```typescript
// Response: PDF file download
```

### POST `/api/schedule/shoot-days/[id]/distribute
Distribute call sheet to cast/crew.

```typescript
// Request
{
  "recipients": ["cast", "department_heads", "all_crew"],
  "includePdf": true
}

// Response 200 OK
{
  "success": true,
  "sentTo": 45,
  "sentAt": "2026-07-20T18:00:00Z"
}
```

### GET `/api/schedule/cast/[castId]/calendar`
Get cast member's schedule calendar.

```typescript
// Request
GET /api/schedule/cast/cast_001/calendar?start=2026-07-01&end=2026-07-31

// Response 200 OK
{
  "castMember": {
    "id": "cast_001",
    "name": "Sarah Mitchell"
  },
  "events": [
    {
      "date": "2026-07-21",
      "type": "SHOOT_DAY",
      "callTime": "08:00",
      "location": "Warehouse",
      "scenes": ["5A", "5B", "6A"],
      "confirmed": true
    },
    {
      "date": "2026-07-22",
      "type": "SHOOT_DAY",
      "callTime": "07:30",
      "location": "Studio B",
      "scenes": ["7A", "7B"],
      "confirmed": false
    }
  ],
  "summary": {
    "shootDays": 12,
    "confirmed": 8,
    "pending": 4,
    "daysOff": 3
  }
}
```

### POST `/api/schedule/conflicts
Check for scheduling conflicts.

```typescript
// Request
{
  "date": "2026-07-25",
  "castIds": ["cast_001", "cast_002", "cast_003"],
  "excludeExisting": true
}

// Response 200 OK
{
  "conflicts": [
    {
      "castId": "cast_001",
      "castName": "Sarah Mitchell",
      "conflictType": "BOOKED",
      "conflictDescription": "Already scheduled for Day 18",
      "resolution": "Adjust call time to 10:00 after previous commitment"
    }
  ],
  "canSchedule": false
}
```

### GET `/api/schedule/report/[shootDayId]`
Get production report.

```typescript
// Response 200 OK
{
  "id": "report_001",
  "shootDay": {
    "dayNumber": 25,
    "date": "2026-07-20"
  },
  "times": {
    "dayStart": "06:15",
    "dayEnd": "19:30",
    "totalHours": 13.25
  },
  "production": {
    "scenesShot": 6,
    "pagesShot": 4.5,
    "setupsCompleted": 18
  },
  "workCompleted": [
    "5A - Detective enters warehouse",
    "5B - Discovery scene",
    "5C - Action sequence"
  ],
  "workRemaining": [
    "6A - Climax scene",
    "6B - Resolution"
  ],
  "issues": [
    { "type": "WEATHER", "description": "Rain delay 45 minutes" },
    { "type": "EQUIPMENT", "description": "Camera malfunction, swapped body" }
  ]
}
```

### POST `/api/schedule/calendar/sync
Sync with Google Calendar.

```typescript
// Response 200 OK
{
  "success": true,
  "eventsCreated": 60,
  "eventsUpdated": 5
}
```

---

# UI Components

## Schedule Calendar View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRODUCTION SCHEDULE                            [Calendar] [List] [Gantt]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ◀ July 2026 ▶                                                          │
│                                                                          │
│  MON      TUE      WED      THU      FRI      SAT      SUN              │
│  ─────────────────────────────────────────────────────────────────────   │
│     1        2        3        4        5        6        7             │
│                                                                          │
│     8        9       10       11       12       13       14             │
│   ┌───┐              ┌───┐              ┌───┐                              │
│   │D15│              │D16│              │D17│     ← Shoot Days           │
│   └───┘              └───┘              └───┘                              │
│                                                                          │
│    15       16       17       18       19       20       21             │
│                                                                          │
│                       ┌───┐              ┌───┐                              │
│                       │D18│              │D19│                              │
│                       └───┘              └───┘                              │
│                                        ┌───┐                              │
│                                        │D20│    ← Current Day            │
│                                        └───┘                              │
│                                                                          │
│    22       23       24       25       26       27       28             │
│   ┌───┐              ┌───┐              ┌───┐                              │
│   │D21│              │D22│              │D23│                              │
│   └───┘              └───┘              └───┘                              │
│                                                                          │
│    29       30       31        1        2        3        4             │
│   ┌───┐              ┌───┐                                                │
│   │D24│              │D25│                                                │
│   └───┘              └───┘                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Shoot Day Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Schedule                                                      │
│                                                                          │
│  DAY 20 - JULY 21, 2026 (MONDAY)                                         │
│  Status: IN PROGRESS                   [Edit] [Generate Call Sheet]      │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  LOCATION                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🏢 Warehouse - Int                                              │   │
│  │    123 Industrial Way, Los Angeles                               │   │
│  │    Parking: Lot B, Gate code: 4521                             │   │
│  │    [View on Map] [Change Location]                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  TIMES                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Crew Call:    06:00    │  First Shot:  07:00                    │   │
│  │ Cast Call:    08:00    │  Meal Break:  12:00-13:00              │   │
│  │ Wrap:         19:00    │  Est. Pages:  5.5                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  SCENES (8)                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ # │ SCENE    │ INT/EXT │ PAGES │ PRIORITY │ STATUS             │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ 1 │ 6A       │ INT     │ 0.75  │ ★★★      │ ✓ COMPLETED       │   │
│  │ 2 │ 6B       │ INT     │ 1.25  │ ★★★      │ ✓ COMPLETED       │   │
│  │ 3 │ 6C       │ INT     │ 0.50  │ ★★☆      │ ⟳ SHOOTING        │   │
│  │ 4 │ 7A       │ INT     │ 1.00  │ ★★★      │ ○ READY           │   │
│  │ 5 │ 7B       │ INT     │ 0.75  │ ★★☆      │ ○ READY           │   │
│  │ 6 │ 8A       │ EXT     │ 0.50  │ ★☆☆      │ ○ READY           │   │
│  │ 7 │ 8B       │ EXT     │ 0.50  │ ★☆☆      │ ○ READY           │   │
│  │ 8 │ 8C       │ INT     │ 0.75  │ ★☆☆      │ ○ READY           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  CAST (4)                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ★ Sarah Mitchell (Lead)    Call: 08:00  ✓ Confirmed             │   │
│  │   Michael Chen (Supporting) Call: 08:00  ✓ Confirmed            │   │
│  │   Jennifer Walsh (Supporting) Call: 09:00  ⏳ Pending            │   │
│  │   Day Player #1            Call: 09:00  ✓ Confirmed           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  WEATHER                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ☀️ Sunny, 78°F — Good conditions for shooting                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  CALL SHEET                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Version 2 — DISTRIBUTED                                        │   │
│  │ Sent: Jul 20, 6:00 PM to 45 recipients                         │   │
│  │                                                                  │   │
│  │ [Preview PDF] [Re-send] [Download]                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│                              [Create Production Report]                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Call Sheet Preview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CALL SHEET - EPISODE 3, DAY 20                                         │
│  July 21, 2026 (Monday)                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRODUCTION: The Series                                                 │
│  EPISODE: 3 - "The Warehouse"                                           │
│  DIRECTOR: John Director                                                 │
│  1ST AD: Bob Assistant                                                  │
│  DP: Jane Cinematographer                                               │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  LOCATION                                                               │
│  Warehouse - Int                                                         │
│  123 Industrial Way, Los Angeles, CA                                     │
│  Parking: Lot B, Gate code 4521                                        │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  CALL TIMES                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CREW CALL:    06:00    │  FIRST SHOT:   07:00                  │   │
│  │ CAST CALL:   08:00    │  MEAL BREAK:   12:00-13:00             │   │
│  │ WRAP:        19:00    │  EST PAGES:    5.5                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  DAILY SCHEDULE                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 06:00  Crew Call / Breakfast                                    │   │
│  │ 06:30  Camera Setup                                             │   │
│  │ 07:00  First Shot - Scene 6A                                    │   │
│  │ 08:00  Cast Call - Sarah, Michael arrive                       │   │
│  │ 12:00  Lunch                                                     │   │
│  │ 13:00  Resume - Scene 7A                                        │   │
│  │ 17:00  Scene 8A (Exterior)                                      │   │
│  │ 19:00  Wrap                                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  CAST                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 08:00  SARAH MITCHELL — Detective Carter                        │   │
│  │        Wardrobe: Casual detective look                          │   │
│  │        Notes: Arriving from Episode 2 location                   │   │
│  │                                                                  │   │
│  │ 08:00  MICHAEL CHEN — Detective Reyes                          │   │
│  │        Wardrobe: Same as Day 19                                 │   │
│  │                                                                  │   │
│  │ 09:00  JENNIFER WALSH — Captain Brooks                         │   │
│  │        Wardrobe: Formal, captain's uniform                      │   │
│  │        Notes: Stunt work at end of Scene 7B                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  SCENES TO SHOOT                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 6A   INT   Warehouse   Detective discovers clues                │   │
│  │ 6B   INT   Warehouse   Confrontation scene                       │   │
│  │ 6C   INT   Warehouse   Action sequence (stunts)                  │   │
│  │ 7A   INT   Warehouse   Emotional scene                          │   │
│  │ 7B   INT   Warehouse   Captain arrives, interrogation            │   │
│  │ 8A   EXT   Warehouse   Exterior establishing                    │   │
│  │ 8B   EXT   Warehouse   Car chase beginning                      │   │
│  │ 8C   INT   Warehouse   Wrap-up scene                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  CREW NOTES                                                             │
│  • Weather looks good - no concerns                                      │
│  • Stunt coordinator on set for Scene 7B                                │
│  • Camera truck 2 available if needed                                    │
│                                                                          │
│  ════════════════════════════════════════════════════════════════════    │
│                                                                          │
│  EMERGENCY CONTACTS                                                     │
│  Line Producer: Alice Producer (555-0100)                                │
│  Set Medic: Bob Medic (555-0101)                                        │
│  Production Office: (555-0102)                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] ProductionSchedule model
- [ ] ShootDay model
- [ ] ShootDayScene model
- [ ] CallSheet model
- [ ] CallSheetScheduleItem model
- [ ] CallSheetCast model
- [ ] ProductionReport model
- [ ] Location model
- [ ] CalendarEvent model
- [ ] GET /api/schedule endpoint
- [ ] POST /api/schedule endpoint
- [ ] GET /api/schedule/shoot-days/[id] endpoint
- [ ] PATCH /api/schedule/shoot-days/[id] endpoint
- [ ] POST /api/schedule/shoot-days/[id]/call-sheet endpoint
- [ ] GET /api/schedule/shoot-days/[id]/call-sheet/pdf endpoint
- [ ] POST /api/schedule/shoot-days/[id]/distribute endpoint
- [ ] GET /api/schedule/cast/[castId]/calendar endpoint
- [ ] POST /api/schedule/conflicts endpoint
- [ ] GET /api/schedule/report/[shootDayId] endpoint
- [ ] POST /api/schedule/calendar/sync endpoint
- [ ] Schedule Calendar View
- [ ] Shoot Day Detail View
- [ ] Scene Editor
- [ ] Call Sheet Generator
- [ ] Call Sheet PDF Generation
- [ ] Call Sheet Distribution (email)
- [ ] Production Report Form
- [ ] Cast Calendar View
- [ ] Conflict Detection
- [ ] Google Calendar Integration
- [ ] Weather Integration
- [ ] SMS Notifications (Twilio)

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
