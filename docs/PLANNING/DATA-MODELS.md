# DATA-MODELS.md

Status: Locked v1.0 (Phase 1 scope)

Depends On: ADR-0002 (Prisma/PostgreSQL), all locked foundation docs,
PAGE-FLOWS.md

---

# Purpose

Concrete Prisma schema for Phase 1. This is the single source of truth for
field names and types — Claude Code should generate `schema.prisma` from
this, not invent its own naming per session.

**Design note:** the schema below intentionally includes `Organization` and
`Brand` as first-class, multi-row-capable tables even though Phase 1 only
populates one row of each (per CONTEXT.md's "cheap now, expensive later"
reasoning, and ADR-0003's dynamic domain resolution).

---

# Schema (Prisma-style)

```prisma
// ── ORGANIZATION & BRAND ──────────────────────────────────────

model Organization {
  id        String   @id @default(cuid())
  name      String
  brands    Brand[]
  users     User[]
  createdAt DateTime @default(now())
}

model Brand {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  name           String       // "EatPrayEdit"
  domain         String       @unique // "app.eatprayedit.com" — used by ADR-0003 middleware
  isPersonalBrand Boolean     @default(false) // true only for the Personal Brand (no Order flow)
  logoUrl        String?      // if null, Client Portal renders `name` as a styled text wordmark
  primaryColor   String       @default("#2563EB") // hex, used for buttons/accents in Client Portal only —
                                                    // never affects the Internal app (see UX_MODES.md → Brand Theming)
  services       Service[]
  clients        Client[]
  orders         Order[]
  brandAccess    BrandAccess[]
  createdAt      DateTime @default(now())
}

// ── SERVICE & SERVICE TEMPLATE ────────────────────────────────

model Service {
  id            String   @id @default(cuid())
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id])
  name          String   // "Real Estate Edit"
  price         Decimal  // fixed price list, Phase 1 has no Proposal/Quotation
  intakeFormSchema Json  // field definitions for the Order Form
  stageTemplate Json     // ordered [{ name, tasks: [{ name, expectedDurationMinutes, visibility }] }]
                           // visibility: CLIENT_VISIBLE (default) or INTERNAL_ONLY
  orders        Order[]
  createdAt     DateTime @default(now())
}

// ── CLIENT & CLIENT CONTACT ─────────────────────────────────

model Client {
  id        String   @id @default(cuid())
  brandId   String
  brand     Brand    @relation(fields: [brandId], references: [id])
  name      String   // "PT Sunshine Properties" or "Wayfront Cafe"
  email     String   // primary contact email
  odooPartnerId String? // res.partner id, synced per ADR-0001
  orders    Order[]
  contacts  ClientContact[]  // 1-to-many: multiple people per Client Account
  createdAt DateTime @default(now())

  // NOTE: Client == Account (a company/hotel/property). Each Client Account
  // can have multiple ClientContacts (people) with their own logins.
  // Per Wayfront/Zendo pattern — validated by REFERENCES.md research.
}

model ClientContact {
  id        String  @id @default(cuid())
  clientId  String
  client    Client  @relation(fields: [clientId], references: [id])

  name      String
  email     String  // unique per Client — each person has one login
  role      String? // "Marketing Manager", "Villa GM", "Social Media"

  // Permissions within Client Portal
  canApproveDelivery Boolean @default(false)  // gets approval buttons
  canSeeAllProjects   Boolean @default(true)   // or scope to specific projects
  canSeeInvoices      Boolean @default(false)  // financial data

  // Notification preferences
  notifyProgress Boolean @default(true)
  notifyApproval Boolean @default(true)
  notifyInvoice  Boolean @default(false)

  createdAt DateTime @default(now())

  @@unique([clientId, email])  // one email per Client Account
}

// ── ORDER (Business OS, inbound) ──────────────────────────────

enum OrderStatus {
  DRAFT
  CONFIRMED
  IN_PROGRESS
  COMPLETED
}

model Order {
  id           String      @id @default(cuid())
  brandId      String
  brand        Brand       @relation(fields: [brandId], references: [id])
  clientId     String
  client       Client      @relation(fields: [clientId], references: [id])
  serviceId    String
  service      Service     @relation(fields: [serviceId], references: [id])
  status       OrderStatus @default(DRAFT)
  intakeFormData Json      // Client's submitted answers to Service.intakeFormSchema
  odooInvoiceDpId    String?  // account.move id for the DP invoice
  odooInvoiceFinalId String?  // account.move id for the Final invoice
  project      Project?
  createdAt    DateTime    @default(now())
  confirmedAt  DateTime?
  completedAt  DateTime?

  // CONSTITUTION.md #3: Project can only be created once status = CONFIRMED
  // (enforced in application logic, not just documented here)
}

// ── PROJECT / STAGE / TASK (Project OS) ───────────────────────

model Project {
  id        String   @id @default(cuid())
  orderId   String   @unique
  order     Order    @relation(fields: [orderId], references: [id])
  stages    Stage[]
  createdAt DateTime @default(now())
}

model Stage {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  name      String
  order     Int      // sequence within the Project
  tasks     Task[]
}

enum TaskStatus {
  OPEN
  IN_PROGRESS
  COMPLETE
}

enum TaskCategory {
  PRE_PRODUCTION   // script breakdown, location recce, storyboarding, planning
  PRODUCTION       // principal work (shoot, recording, etc.)
  POST_PRODUCTION  // editing, color, sound, VFX, delivery
}

model Task {
  id                     String     @id @default(cuid())
  stageId                String
  stage                  Stage      @relation(fields: [stageId], references: [id])

  // ── HIERARCHY (subtasks, max 4 levels deep — confirmed against
  //    PROJECT_OS.md's Task Hierarchy, see Westin Commercial Bali example) ──
  parentTaskId           String?    // null = root task, set = subtask
  parent                 Task?      @relation("SubTasks", fields: [parentTaskId], references: [id])
  children               Task[]     @relation("SubTasks")
  // NOTE: Prisma's self-relation does not enforce depth on its own — the
  // 4-level cap must be validated in application logic (e.g. in
  // lib/authorize.ts or a dedicated task-hierarchy helper) at creation time,
  // not assumed from the schema alone.

  // ── BASIC ──
  name                   String
  order                  Int
  status                 TaskStatus @default(OPEN)
  category               TaskCategory?  // optional, mainly for parent tasks;
                                       // subtasks inherit parent's category

  // ── ORIGIN (NEW) ──
  isFromTemplate         Boolean    @default(true)
                          // true = exploded from Service.stageTemplate on Order confirm
                          // false = manually added by Owner/Manager to existing project

  // ── ASSIGNMENT ──
  assigneeUserId         String?
  assignee               User?      @relation(fields: [assigneeUserId], references: [id])
                          // Subtasks inherit parent's assignee unless explicitly overridden

  // ── PAYOUT (parent only — see Payout[] for split scenarios) ──
  payoutAmount           Decimal?
                          // Root task: original suggested payout
                          // Subtask: usually null (payout flows to parent)
                          //   Override allowed: creates separate Payout record per subtask

  // ── TIMING ──
  expectedDurationMinutes Int
  startedAt              DateTime?
  completedAt            DateTime?

  // ── VISIBILITY ──
  // Option A: Boolean (simple) — clientVisible = true/false
  // Option B: Enum (more flexible) — supports INHERIT from template
  // Decision: Use Boolean for Phase 1. INHERIT is a UI concept, not a data state.
  // Override happens at Service.stageTemplate level (defaults), Task level for exceptions.
  clientVisible          Boolean    @default(true)
    // true = CLIENT_VISIBLE (shown to Client in portal)
    // false = INTERNAL_ONLY (Owner/Manager only)

  payout                 Payout?   // 0 or 1 — Payout.taskId is @unique

  // ── COMPUTED (not stored) ──
  // • "Needs Attention" (Stale Task Detection):
  //     status != COMPLETE AND now() - startedAt > expectedDurationMinutes
  // • Completion cascade:
  //     When all children are COMPLETE → parent auto-transitions to COMPLETE
  // • Progress % (for parent tasks):
  //     completedChildren / totalChildren
  // Compute at query time or via scheduled job — do not store redundant state
  // that can drift.
}

// ── USER, ROLE, BRAND ACCESS (Human Capital OS) ───────────────

enum EmploymentType {
  FREELANCE
  INHOUSE
}

enum Role {
  OWNER
  MANAGER
  EDITOR
  // PRODUCER intentionally omitted — Phase 1 scope (MVP_ROADMAP.md)
}

model User {
  id             String         @id @default(cuid())
  organizationId String
  organization   Organization   @relation(fields: [organizationId], references: [id])
  name           String
  email          String         @unique
  role           Role
  employmentType EmploymentType
  brandAccess    BrandAccess[]
  tasks          Task[]
  payouts        Payout[]
  withdrawals    WithdrawalRequest[]
  createdAt      DateTime       @default(now())
}

model BrandAccess {
  id      String @id @default(cuid())
  userId  String
  user    User   @relation(fields: [userId], references: [id])
  brandId String
  brand   Brand  @relation(fields: [brandId], references: [id])

  @@unique([userId, brandId])
}

// ── PAYOUT & WALLET (Human Capital OS) ────────────────────────

enum PayoutStatus {
  ALLOCATED   // set when Task posted to Board, not yet earned
  CREDITED    // Client approved final Delivery — now in the Wallet
}

model Payout {
  id        String       @id @default(cuid())
  taskId    String       @unique
  task      Task         @relation(fields: [taskId], references: [id])
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  amount    Decimal
  status    PayoutStatus @default(ALLOCATED)
  creditedAt DateTime?

  // CONSTITUTION.md #1: userId's own Payout.amount is the ONLY financial
  // figure this User's queries may ever return. Order.intakeFormData,
  // Service.price, and any Odoo invoice fields must be structurally
  // excluded from any query scoped to an EDITOR role.
}

// Wallet balance is NOT a stored field — it is computed:
// SUM(Payout.amount WHERE userId = X AND status = CREDITED)
//   - SUM(WithdrawalRequest.amount WHERE userId = X AND status = PAID)
// Storing a redundant balance risks drift; compute it, or cache with a
// clear invalidation rule if performance requires it later.

enum WithdrawalStatus {
  REQUESTED
  PAID
}

model WithdrawalRequest {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id])
  amount    Decimal
  status    WithdrawalStatus @default(REQUESTED)
  requestedAt DateTime       @default(now())
  paidAt    DateTime?
}
```

---

# Access Control Notes (enforcing CONSTITUTION.md #1 and #4)

This schema alone does not enforce Financial Confidentiality or Role
permissions — that must happen in the query/API layer:

- Every query made on behalf of an `EDITOR` role must be scoped to
  `WHERE assigneeUserId = currentUser.id` (Tasks) or `WHERE userId =
  currentUser.id` (Payouts, WithdrawalRequests). Never return `Order`,
  `Client`, or `Service.price` rows to an Editor under any code path.
- `Order`, `Client`, and `Service.price` fields are readable only by
  `OWNER` and `MANAGER` roles — this should be enforced by a shared
  authorization layer (e.g. a single `can(user, action, resource)` function
  used by every API route), not repeated ad hoc per route.

---

# Open Items for Future Sessions

1. Odoo sync mechanism (how `odooInvoiceDpId` etc. get populated/kept in
   sync) — technical detail, not blocking schema design.
2. Whether `Payout.amount` needs an audit trail (who set/overrode it,
   when) — worth adding before Phase 1 ships given CONSTITUTION.md #1's
   weight, flagged here rather than decided.
3. ~~Client multi-contact extension~~ — **RESOLVED**: `ClientContact` model
   added above. Client == Account, each Account can have multiple Contacts
   with their own logins/permissions.
