# LOCATION_MANAGEMENT.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_STORE.md
- MODULE_REGISTRY.md
- EPISODIC_PRODUCTION_GUIDE.md

---

# Purpose

Location Management handles location scouting, booking, permits, and coordination. From finding the perfect warehouse to managing permits, this module keeps location operations organized.

---

# Data Model

```prisma
// Location
model Location {
  id              String   @id @default(cuid())
  
  // Basic info
  name            String   // e.g., "Abandoned Warehouse"
  type            LocationType
  
  // Address
  address         String
  city            String
  state           String?
  country         String
  postalCode      String?
  
  // Coordinates
  latitude        Float?
  longitude       Float?
  
  // Details
  description     String?
  
  // Contact
  contactName     String?
  contactPhone    String?
  contactEmail    String?
  
  // Access
  accessNotes     String?
  gateCode        String?
  parkingInfo     String?
  
  // Facilities
  hasPower        Boolean  @default(true)
  hasRestrooms    Boolean  @default(true)
  hasWifi         Boolean  @default(false)
  hasParking      Boolean  @default(true)
  hasGenerator    Boolean  @default(false)
  
  // Photos
  photos          String[]  // URLs
  
  // Status
  status          LocationStatus @default(AVAILABLE)
  
  // Bookings
  bookings        LocationBooking[]
  scouts          LocationScout[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum LocationType {
  PRACTICAL       // Real locations
  STUDIO          // Sound stages
  EXTERIOR        // Outdoor locations
  OFFICE          // Production office
  OTHER
}

enum LocationStatus {
  AVAILABLE
  BOOKED
  ON_HOLD
  UNAVAILABLE
  RELEASED
}

// Location Scout (visit)
model LocationScout {
  id              String   @id @default(cuid())
  
  locationId     String
  location       Location @relation(fields: [locationId], references: [id])
  
  // Date & Time
  scoutDate      DateTime
  
  // Attendees
  attendees      String[]  // User IDs
  
  // Notes
  notes          String?
  
  // Rating
  rating         Int?      // 1-5
  
  // Photos from scout
  photos         String[]
  
  // Recommendation
  recommendation String?  // "Approved", "Needs more info", "Rejected"
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Location Booking
model LocationBooking {
  id              String   @id @default(cuid())
  
  locationId     String
  location       Location @relation(fields: [locationId], references: [id])
  
  productionId   String
  production     Production @relation(fields: [productionId], references: [id])
  
  // Dates
  bookStart      DateTime
  bookEnd        DateTime
  
  // Cost
  rentalFee      Float?
  depositAmount  Float?
  depositPaid    Boolean  @default(false)
  rentalPaid     Boolean  @default(false)
  
  // Permit
  permitRequired Boolean  @default(false)
  permitStatus   PermitStatus?
  permitNumber   String?
  permitDoc      String?
  
  // Insurance
  insuranceRequired Boolean @default(false)
  insuranceProvided Boolean @default(false)
  insuranceDoc   String?
  
  // Status
  status         BookingStatus @default(PENDING)
  
  // Notes
  notes          String?
  
  // Contact
  contactName    String?
  contactPhone   String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PermitStatus {
  NOT_APPLIED
  APPLIED
  IN_REVIEW
  APPROVED
  DENIED
  EXPIRED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
}

// Location Photo/Video
model LocationMedia {
  id              String   @id @default(cuid())
  
  locationId     String
  location       Location @relation(fields: [locationId], references: [id])
  
  type            MediaType
  url             String
  caption         String?
  
  uploadedBy     String
  uploadedAt     DateTime @default(now())
}

enum MediaType {
  PHOTO
  VIDEO
  FLOOR_PLAN
  MAP
}

// Location Brief (for crew)
model LocationBrief {
  id              String   @id @default(cuid())
  
  locationBookingId String @unique
  locationBooking   LocationBooking @relation(fields: [locationBookingId], references: [id])
  
  // Content
  accessInstructions String
  parkingDetails    String?
  powerDetails     String?
  restroomLocation  String?
  nearestHospitals  String?
  noiseRestrictions String?
  contactInfo       String?
  
  // Status
  status         BriefStatus @default(DRAFT)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum BriefStatus {
  DRAFT
  FINAL
  DISTRIBUTED
}
```

---

# API Contracts

### GET `/api/locations`
List locations.

```typescript
// Request
GET /api/locations?type=PRACTICAL&status=AVAILABLE

// Response 200 OK
{
  "locations": [
    {
      "id": "loc_001",
      "name": "Abandoned Warehouse",
      "type": "PRACTICAL",
      "address": "123 Industrial Way, Los Angeles, CA",
      "city": "Los Angeles",
      "hasPower": true,
      "hasRestrooms": true,
      "rating": 4.5,
      "bookingCount": 2,
      "photos": ["https://..."]
    }
  ]
}
```

### POST `/api/locations`
Add location.

```typescript
// Request
{
  "name": "Abandoned Warehouse",
  "type": "PRACTICAL",
  "address": "123 Industrial Way",
  "city": "Los Angeles",
  "state": "CA",
  "country": "USA",
  "latitude": 34.0522,
  "longitude": -118.2437
}

// Response 201 Created
```

### POST `/api/locations/[id]/scout`
Schedule a scout.

```typescript
// Request
{
  "scoutDate": "2026-07-25",
  "attendees": ["user_001", "user_002"],
  "notes": "Check ceiling height for lighting"
}

// Response 201 Created
```

### POST `/api/locations/[id]/book`
Book location.

```typescript
// Request
{
  "productionId": "prod_001",
  "bookStart": "2026-08-01",
  "bookEnd": "2026-08-05",
  "rentalFee": 5000,
  "depositAmount": 1000
}

// Response 201 Created
```

---

# UI Components

## Location Gallery

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LOCATIONS                                              [+ Add Location]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Search...]  [Type ▾]  [City ▾]  [Available ▾]                      │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │       [photo]       │  │       [photo]       │                      │
│  │                      │  │                      │                      │
│  │ Abandoned Warehouse  │  │ City Rooftop         │                      │
│  │ Los Angeles, CA     │  │ Los Angeles, CA      │                      │
│  │ ★★★★☆ (4.5)        │  │ ★★★★★ (5.0)         │                      │
│  │                      │  │                      │                      │
│  │ 🏢 Practical         │  │ 🌆 Exterior          │                      │
│  │ ⚡ Power ✓ │ 🚻 ✓    │  │ ⚡ Power ✓ │ 🚻 ✗    │                      │
│  │                      │  │                      │                      │
│  │ [View] [Scout] [Book]│  │ [View] [Scout] [Book]│                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                      │
│  │       [photo]       │  │       [photo]       │                      │
│  │                      │  │                      │                      │
│  │ Modern Office        │  │ Historic Mansion    │                      │
│  │ Los Angeles, CA     │  │ Malibu, CA         │                      │
│  │ ★★★★☆ (4.2)        │  │ ★★★★☆ (4.3)        │                      │
│  └─────────────────────┘  └─────────────────────┘                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Location Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Locations                                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    [Photo Gallery - 12 photos]                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ABANDONED WAREHOUSE                                                   │
│  Practical Location • Los Angeles, CA                                  │
│  ★★★★☆ (4.5) • 12 scouts • 2 productions                             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  OVERVIEW                    BOOKING STATUS                            │
│  ────────────────────────    ─────────────────────────                  │
│  Address: 123 Industrial   Current: Available                         │
│  Way, Los Angeles, CA                                                   │
│                              [Book This Location]                        │
│  Facilities:                                                           │
│  ⚡ Power - Yes                                                        │
│  🚻 Restrooms - Yes                                                   │
│  📶 WiFi - No                                                         │
│  🅿️ Parking - Yes (20 cars)                                           │
│                              BOOKING HISTORY                             │
│                              ─────────────────────────                   │
│                              ✓ The Movie (2025)                         │
│                              ✓ TV Series ABC (2024)                     │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  CONTACT                                                                │
│  John Owner - +1-555-0100                                             │
│                                                                          │
│  ACCESS NOTES                                                           │
│  Gate code: 1234 • Enter through side door • Parking in rear lot     │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────   │
│                                                                          │
│  [Edit] [Schedule Scout] [Add to Favorites]                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] Location model
- [ ] LocationScout model
- [ ] LocationBooking model
- [ ] LocationMedia model
- [ ] LocationBrief model
- [ ] GET /api/locations endpoint
- [ ] POST /api/locations endpoint
- [ ] GET /api/locations/[id] endpoint
- [ ] POST /api/locations/[id]/scout endpoint
- [ ] POST /api/locations/[id]/book endpoint
- [ ] Location Gallery UI
- [ ] Location Detail View
- [ ] Photo Upload/Gallery
- [ ] Map Integration
- [ ] Scout Scheduling
- [ ] Booking Calendar
- [ ] Permit Tracking
- [ ] Location Brief Generator
- [ ] Export to PDF

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
