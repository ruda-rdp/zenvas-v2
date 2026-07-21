# DATA-MODELS.md

**Status:** Updated v1.1 (Reflects ADR-0005: Modular Architecture)
**Previous:** v1.0 (Locked, Phase 1 scope)

Depends On: ADR-0002 (Prisma/PostgreSQL), ADR-0005 (Modular Architecture),
all foundation docs, PAGE-FLOWS.md

---

# Purpose

Concrete Prisma schema for Zenvas v2. This reflects the **Modular Architecture**
decision (ADR-0005) where:
- **Project OS** and **Human Capital OS** are CORE (always installed)
- **Business OS** is OPTIONAL (installable per Organization)
- **Brand** no longer requires a domain for personal use

**Design note:** Organization and Brand are first-class, multi-row-capable tables.
Schema supports Solo Creator (no domain needed) to Full Agency (multi-brand with
custom domains).

---

# Schema (Prisma-style)

## ── ORGANIZATION (Tenant) ──────────────────────────────────────

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique  // URL-safe identifier for org
  
  // Plan & Apps (Org-level feature flags per ADR-0005)
  plan      String   @default("solo")  // "solo" | "growing" | "agency"
  apps      String[] @default(["project-os", "human-capital-os"])
            // Installed apps. Core apps are always present.
            // Optional: "business-os", "lead-management", "odoo-sync"
  
  brands    Brand[]
  users     User[]
  inviteCodes InviteCode[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([slug])
}
```

### Plan Definitions

| Plan | Description | Default Apps |
|------|-------------|--------------|
| `solo` | Solo creator, personal projects | project-os, human-capital-os |
| `growing` | Has clients, needs Business OS | project-os, human-capital-os, business-os |
| `agency` | Full studio, multi-brand | All core apps |

### App Registry

| App | Description | Type |
|-----|-------------|------|
| `project-os` | Projects, Stages, Tasks, Scripts | CORE |
| `human-capital-os` | Users, Roles, Board, Payout | CORE |
| `business-os` | Clients, Orders, Invoices | OPTIONAL |
| `lead-management` | Lead capture, qualification | OPTIONAL |
| `odoo-sync` | Odoo integration | OPTIONAL |

---

## ── BRAND (Identity Unit) ──────────────────────────────────────

```prisma
model Brand {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Identity (always required)
  name           String       // "EatPrayEdit", "Jacob Film", "Dewa Personal"
  slug           String       @unique  // URL-safe identifier: "eatprayedit", "jacob-film"
  
  // Domain & Portal (optional per ADR-0005)
  domain         String?      @unique  // Custom domain: "studio.eatprayedit.com"
                                        // Nullable: personal brands may not have domains
  freeSubdomain  String?      @unique  // Free subdomain: "jacobfilm.zenvas-portal.app"
                                        // Auto-generated when hasClientPortal = true
  hasClientPortal Boolean     @default(false)
                                        // When true: enables Business OS features for this brand
  
  // NOTE: isPersonalBrand is deprecated
  // → Use hasClientPortal = false for personal use
  // → Use plan = "solo" for solo creator mode
  
  // Branding
  logoUrl        String?      // If null, renders `name` as styled text wordmark
  primaryColor   String       @default("#2563EB") // Hex, for Client Portal only
                                                  // Never affects Internal app
  
  // Relations
  services       Service[]
  clients        Client[]     // Only used if hasClientPortal = true
  orders         Order[]      // Only used if hasClientPortal = true
  leads          Lead[]       // Only used if hasClientPortal = true
  brandAccess    BrandAccess[]
  projects       Project[]    // Solo projects without orders
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([organizationId])
  @@index([slug])
}
```

### Brand Types in Practice

| Use Case | slug | domain | freeSubdomain | hasClientPortal |
|----------|------|--------|---------------|------------------|
| Jacob Film (solo) | `jacob-film` | null | null | false |
| Dewa Collaboration | `dewa-collab` | null | `dewa-collab.zenvas-portal.app` | true |
| EPE Studio | `epe-studio` | `studio.eatprayedit.com` | null | true |
| EPE Wedding | `epe-wedding` | `wedding.eatprayedit.com` | null | true |

---

## ── SERVICE & SERVICE TEMPLATE ────────────────────────────────

```prisma
model Service {
  id            String   @id @default(cuid())
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  
  name          String   // "Real Estate Edit", "Wedding Film"
  price         Decimal  @db.Decimal(12, 2)  // Fixed price
                    // NOTE: Service.price visible only to OWNER/MANAGER
                    // Editors cannot see this (CONSTITUTION.md rule)
  
  intakeFormSchema Json  // Field definitions for Order Form
                    // Only used if brand.hasClientPortal = true
  
  stageTemplate Json     // Ordered: [{ name, tasks: [{ name, expectedDurationMinutes, visibility }] }]
                    // visibility: true = CLIENT_VISIBLE, false = INTERNAL_ONLY
  
  orders        Order[]  // Only used if hasClientPortal = true
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([brandId])
}
```

---

## ── LEAD MANAGEMENT ──────────────────────────────────────────

> Only relevant if `business-os` app is installed in Organization

```prisma
enum LeadSource {
  WEBSITE_FORM
  FACEBOOK_DM
  INSTAGRAM_DM
  WHATSAPP
  PHONE_CALL
  REFERRAL
  GOOGLE_SEARCH
  EMAIL
  WALK_IN
  OTHER
}

enum LeadStatus {
  NEW
  QUALIFIED
  ON_HOLD
  CONVERTED   // → becomes a Client
  LOST
  WON
}

model Lead {
  id           String   @id @default(cuid())
  brandId      String
  brand        Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  
  // Contact Info
  name         String
  email        String?
  phone        String?
  company      String?  // For B2B leads
  
  // Source Tracking
  source       LeadSource
  sourceDetails String?  // "Facebook DM", "Website form"
  sourceUrl    String?
  
  // Qualification
  status       LeadStatus @default(NEW)
  priority     String     @default("MEDIUM")  // LOW, MEDIUM, HIGH, URGENT
  interest     String     // What they want: "Villa video", "Wedding film"
  budget       String?     // "Rp 5-8 juta"
  budgetNumeric Decimal?   @db.Decimal(12, 2)
  timeline     String?     // "ASAP", "2 weeks"
  timelineDays Int?
  
  // Tags
  tags         String[]   // ["#realestate", "#seminyak"]
  
  // Qualification Notes
  qualificationNotes String?
  referenceLinks    String[]
  
  // Conversion Link
  clientId     String?
  client       Client?   @relation(fields: [clientId], references: [id])
  
  // Metadata
  assignedTo   String?
  assigned     User?     @relation(fields: [assignedTo], references: [id])
  lastContactedAt DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([brandId])
  @@index([status])
  @@index([assignedTo])
  @@index([clientId])
}
```

---

## ── CLIENT & CLIENT CONTACT ─────────────────────────────────

> Only relevant if `business-os` app is installed AND `brand.hasClientPortal = true`

```prisma
model Client {
  id        String   @id @default(cuid())
  brandId   String
  brand     Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  
  name      String   // "PT Sunshine Properties" or "Ayana Resort"
  email     String   // Primary contact email
  phone     String?
  company   String?  // Company/organization name if different from name
  
  odooPartnerId String?  // res.partner id, synced per ADR-0001
  
  orders    Order[]
  leads     Lead[]   // Leads that converted to this client
  contacts  ClientContact[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([brandId])
}

model ClientContact {
  id        String  @id @default(cuid())
  clientId  String
  client    Client  @relation(fields: [clientId], references: [id], onDelete: Cascade)

  name      String
  email     String  @unique  // Each person has one login
  
  role      String? // "Marketing Manager", "Villa GM", "Social Media"

  // Permissions within Client Portal
  canApproveDelivery Boolean @default(false)
  canSeeAllProjects   Boolean @default(true)
  canSeeInvoices      Boolean @default(false)

  // Notification preferences
  notifyProgress Boolean @default(true)
  notifyApproval Boolean @default(true)
  notifyInvoice  Boolean @default(false)

  // Auth
  passwordHash   String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([clientId, email])
  @@index([clientId])
}
```

---

## ── ORDER (Business OS) ──────────────────────────────────────

> Only relevant if `business-os` app is installed AND `brand.hasClientPortal = true`

```prisma
enum OrderStatus {
  DRAFT
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Order {
  id           String      @id @default(cuid())
  brandId      String
  brand        Brand       @relation(fields: [brandId], references: [id], onDelete: Cascade)
  clientId     String
  client       Client      @relation(fields: [clientId], references: [id])
  serviceId    String
  service      Service     @relation(fields: [serviceId], references: [id])
  
  status       OrderStatus @default(DRAFT)
  intakeFormData Json      // Client's submitted answers to Service.intakeFormSchema
  
  // Odoo Integration (per ADR-0001)
  odooInvoiceDpId    String?
  odooInvoiceFinalId String?
  
  project      Project?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  confirmedAt  DateTime?
  completedAt  DateTime?

  // CONSTITUTION.md #3: Project can only be created once status = CONFIRMED
  
  @@index([brandId])
  @@index([clientId])
  @@index([serviceId])
  @@index([status])
}
```

---

## ── PROJECT / STAGE / TASK (Project OS - CORE) ─────────────────

**Always present regardless of plan or installed apps.**

```prisma
model Project {
  id        String   @id @default(cuid())
  orderId   String?  @unique  // Optional - solo projects don't have orders
  order     Order?   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  brandId   String?  // For solo projects - associates with a brand
  brand     Brand?   @relation(fields: [brandId], references: [id], onDelete: Cascade)
  
  // Display
  name        String   // Required - project display name
  description String?  // Project description
  type        String?  // "youtube", "wedding", "corporate", "film"
  posterUrl   String?  // Thumbnail image URL
  posterAspect String  @default("16:9")  // 16:9, 4:3, 1:1, 9:16 (vertical)
  
  // Content (new in v1.1)
  scriptContent  String?  // Markdown/JSON for script
  storyboardUrls String[] // URLs to storyboard images
  
  stages    Stage[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([brandId])
}

model Stage {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  order     Int      // Sequence within the Project
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId])
}

enum TaskStatus {
  OPEN
  IN_PROGRESS
  COMPLETE
}

enum TaskCategory {
  PRE_PRODUCTION   // Script breakdown, location recce, storyboarding
  PRODUCTION       // Principal work (shoot, recording)
  POST_PRODUCTION  // Editing, color, sound, VFX, delivery
}

model Task {
  id                     String     @id @default(cuid())
  stageId                String
  stage                  Stage      @relation(fields: [stageId], references: [id], onDelete: Cascade)

  // Hierarchy (subtasks, max 4 levels)
  parentTaskId           String?    // null = root task
  parent                 Task?      @relation("SubTasks", fields: [parentTaskId], references: [id])
  children               Task[]     @relation("SubTasks")

  // Basic
  name                   String
  order                  Int
  status                 TaskStatus @default(OPEN)
  category               TaskCategory?

  // Origin
  isFromTemplate         Boolean    @default(true)
                          // true = exploded from Service.stageTemplate
                          // false = manually added

  // Assignment
  assigneeUserId         String?
  assignee               User?      @relation(fields: [assigneeUserId], references: [id])
                          // Subtasks inherit parent's assignee unless overridden

  // Payout (parent only)
  payoutAmount           Decimal?   @db.Decimal(12, 2)
                          // Root task: original suggested payout
                          // Subtask: null (payout flows to parent)

  // Timing
  expectedDurationMinutes Int
  startedAt              DateTime?
  completedAt            DateTime?

  // Visibility
  clientVisible          Boolean    @default(true)
                          // true = CLIENT_VISIBLE (shown in Client Portal)
                          // false = INTERNAL_ONLY

  payout                 Payout?
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt

  @@index([stageId])
  @@index([parentTaskId])
  @@index([assigneeUserId])
  @@index([status])
}
```

---

## ── USER, ROLE, BRAND ACCESS (Human Capital OS - CORE) ─────────

**Always present regardless of plan or installed apps.**

```prisma
enum EmploymentType {
  FREELANCE
  INHOUSE
}

enum Role {
  OWNER      // Full access, can manage organization
  MANAGER    // Day-to-day operations
  EDITOR     // Task execution only
  PRODUCER   // Production oversight (Phase 2+)
}

// Invite codes for team member registration
model InviteCode {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  code           String   @unique  // e.g., "EDITOR_abc123"
  role           Role     // Role assigned when using this code
  used           Boolean  @default(false)
  usedByUserId   String?
  expiresAt      DateTime?
  
  invitedName    String?
  invitedEmail   String?

  @@index([organizationId])
  @@index([code])
}

model User {
  id             String         @id @default(cuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  name           String
  email          String         @unique
  phone          String?
  
  role           Role
  employmentType EmploymentType
  
  passwordHash   String?
  passwordSalt   String?
  
  // Status
  isActive       Boolean        @default(true)
  emailVerified  Boolean        @default(false)
  
  // Security
  forcePasswordChange Boolean   @default(false)
  failedLoginAttempts Int       @default(0)
  lockedUntil        DateTime?
  
  // Activity tracking
  lastLoginAt     DateTime?
  lastActiveAt    DateTime?
  
  // Profile
  avatarUrl       String?
  bio             String?
  
  // Relations
  brandAccess     BrandAccess[]
  tasks           Task[]
  payouts         Payout[]
  leads           Lead[]
  withdrawals     WithdrawalRequest[]
  notifications   Notification[]
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([organizationId])
  @@index([email])
  @@index([role])
  @@index([isActive])
}

// Brand Access - which brands can a user access?
model BrandAccess {
  id      String @id @default(cuid())
  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  brandId String
  brand   Brand  @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@unique([userId, brandId])
  @@index([userId])
  @@index([brandId])
}
```

---

## ── NOTIFICATIONS (In-App) ──────────────────────────────────

```prisma
enum NotificationType {
  TASK_ASSIGNED
  TASK_COMPLETED
  PROJECT_UPDATE
  DELIVERY_READY
  LEAD_NEW
  ORDER_CONFIRMED
  ORDER_COMPLETED
  SYSTEM
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType @default(SYSTEM)
  title     String
  message   String
  link      String?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}
```

---

## ── PAYOUT & WALLET (Human Capital OS - CORE) ────────────────

**Always present regardless of plan or installed apps.**

```prisma
enum PayoutStatus {
  ALLOCATED   // Set when Task posted to Board
  CREDITED    // Client approved final Delivery
}

model Payout {
  id        String       @id @default(cuid())
  taskId    String       @unique
  task      Task         @relation(fields: [taskId], references: [id], onDelete: Cascade)
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  amount    Decimal      @db.Decimal(12, 2)
  status    PayoutStatus @default(ALLOCATED)
  creditedAt DateTime?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  // CONSTITUTION.md #1: userId's Payout.amount is the ONLY financial
  // figure an EDITOR may see. Service.price, Order data excluded.

  @@index([taskId])
  @@index([userId])
  @@index([status])
}

enum WithdrawalStatus {
  REQUESTED
  PAID
}

model WithdrawalRequest {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  amount    Decimal          @db.Decimal(12, 2)
  status    WithdrawalStatus @default(REQUESTED)
  requestedAt DateTime       @default(now())
  paidAt    DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  @@index([userId])
  @@index([status])
}
```

---

## ── ACTIVITY LOG (Immutable) ──────────────────────────────────

```prisma
enum ActivityType {
  // Project OS
  PROJECT_CREATED
  TASK_ASSIGNED
  TASK_COMPLETED
  STAGE_COMPLETED
  
  // Business OS (only if installed)
  LEAD_CREATED
  LEAD_QUALIFIED
  LEAD_CONVERTED
  LEAD_LOST
  ORDER_CREATED
  ORDER_CONFIRMED
  ORDER_COMPLETED
  ORDER_CANCELLED
  DELIVERY_SENT
  DELIVERY_APPROVED
  
  // Human Capital OS
  PAYOUT_ALLOCATED
  PAYOUT_CREDITED
  WITHDRAWAL_REQUESTED
  WITHDRAWAL_PAID
}

model ActivityLog {
  id         String       @id @default(cuid())
  type       ActivityType
  entityType String      // "Order", "Project", "Task", etc.
  entityId   String
  userId     String?      // Who performed the action
  metadata   Json?        // Additional context
  createdAt  DateTime     @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}
```

---

# Access Control (CONSTITUTION.md Enforcement)

This schema alone does not enforce permissions — enforcement must happen in the API layer:

## Rule 1: Financial Confidentiality (EDITOR)

Every query on behalf of an `EDITOR` must be scoped:
- Tasks: `WHERE assigneeUserId = currentUser.id`
- Payouts: `WHERE userId = currentUser.id`
- **NEVER** return `Order`, `Client`, or `Service.price` to an Editor

## Rule 2: Role Permissions

| Resource | OWNER | MANAGER | EDITOR |
|----------|-------|---------|--------|
| Organization settings | ✅ | ❌ | ❌ |
| Brand settings | ✅ | ✅ (limited) | ❌ |
| Users management | ✅ | ✅ | ❌ |
| Projects | ✅ | ✅ | View assigned |
| Tasks | ✅ | ✅ | View/Complete assigned |
| Clients | ✅ | ✅ | ❌ |
| Orders | ✅ | ✅ | ❌ |
| Invoices | ✅ | ✅ | ❌ |

## Rule 3: Business OS Feature Flag

Before returning Business OS data, check:
```typescript
// Check if brand has Business OS enabled
if (brand.hasClientPortal !== true) {
  // Return empty or redirect
  // Don't expose Client, Order, Invoice data
}
```

---

# Changes from v1.0

| Change | Reason |
|--------|--------|
| Added `Organization.plan` and `Organization.apps` | Per ADR-0005: App Store model |
| Added `Brand.slug` | Required for URL routing (replaces implicit slug from name) |
| Added `Brand.freeSubdomain` | Free subdomain for Client Portal |
| Added `Brand.hasClientPortal` | Toggle Business OS per brand |
| Deprecated `Brand.isPersonalBrand` | Replaced by `hasClientPortal` + plan |
| Made `Brand.domain` nullable | Personal brands may not have domains |
| Added `Project.scriptContent`, `Project.storyboardUrls` | Script/Storyboard support |
| Added `Project.type` | Content type categorization |

---

*Last updated: 2026-07-21*
