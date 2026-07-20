# API-CONTRACTS.md

Status: Locked v1.0 (Phase 1 scope)

Depends On: DATA-MODELS.md, PAGE-FLOWS.md, CONSTITUTION.md

---

# Purpose

Endpoint specifications for Phase 1. Built as Next.js API Routes (ADR-0002).
Every endpoint below states which Role(s) may call it — this is the
authorization contract, not just a REST shape.

**Convention:** all endpoints scoped under `/api/`. Client Portal and
Internal contexts hit the same backend; authorization is by session Role,
not by which domain the request came from (though the UI serving the
request is domain-gated per ADR-0003).

---

# Auth

```
POST   /api/auth/client/login       Client login (Client Portal context only)
POST   /api/auth/internal/login     Internal login (Owner/Manager/Editor)
POST   /api/auth/logout
```

**Assumption (flagging, not asking — low-stakes technical choice):** Client
and User are different tables (per DATA-MODELS.md), so they need separate
NextAuth configurations/providers. A Client can never authenticate into the
Internal context and vice versa — this is enforced by using entirely
different credential tables, not just a role check.

---

# Orders (Business OS)

```
GET    /api/orders                   List Orders
                                        Client: own Orders only (WHERE clientId = self)
                                        Owner/Manager: all Orders for accessible Brands
                                        Editor: 403 — not exposed to this Role at all

POST   /api/orders                   Create Order (Client Portal, from Intake Form)
                                        Role: Client only
                                        Body: { serviceId, intakeFormData }
                                        → creates Order[status=DRAFT], triggers Odoo DP invoice

GET    /api/orders/:id               Order detail
                                        Client: only if clientId = self
                                        Owner/Manager: any Order in accessible Brands
                                        Editor: 403

POST   /api/orders/:id/confirm       Mark Order Confirmed (DP received)
                                        Role: Owner/Manager, OR system webhook from Odoo
                                        → creates Project + Stages + Tasks from Service.stageTemplate
                                        (CONSTITUTION.md #3 enforced here)

POST   /api/orders/:id/delivery/approve
                                      Client approves final Delivery
                                        Role: Client (must own the Order)
                                        → Order.status = COMPLETED, triggers Final Invoice (Odoo),
                                          triggers Payout.status = CREDITED for all Tasks in the Project
```

---

# Projects / Stages / Tasks (Project OS)

```
GET    /api/projects/:id             Project detail (Stages + Tasks with hierarchy)
                                        Owner/Manager: any Project in accessible Brands,
                                          all Tasks including subtasks, full detail
                                        Editor: only Tasks where assigneeUserId = self are
                                          included — other assignees' Tasks structurally omitted,
                                          subtasks inherited from their parent

GET    /api/board                    Cross-Brand aggregated open/assigned Task list
                                        Role: Editor only
                                        Scoped to Brands in caller's BrandAccess

POST   /api/tasks/:id/apply          Editor applies to an open Task
                                        Role: Editor
                                        → sets assigneeUserId if still unassigned

POST   /api/tasks/:id/assign         Owner/Manager directly assigns a Task
                                        Role: Owner/Manager
                                        Body: { userId, payoutAmount }
                                        → creates Payout[status=ALLOCATED]

POST   /api/tasks/:id/reassign       Reassign a Task to a different User (delegation)
                                        Role: Owner/Manager only
                                        Body: { userId, reason }
                                        → updates assigneeUserId, creates PayoutAuditLog entry
                                        → if payout changes: creates PayoutAuditLog for old + new

PATCH  /api/tasks/:id                Update Task (status, details)
                                        Role: Editor (own Tasks only): update status, check off
                                          subtasks, add subtasks to own Tasks
                                        Role: Owner/Manager: update any field including assignee,
                                          payout, add/edit/delete any subtask
                                        Body: { status?, name?, assigneeUserId?, payoutAmount?,
                                                expectedDurationMinutes?, category?, reason? }
                                        → reason required if payout or assignee changes

POST   /api/tasks/:id/complete       Editor marks their Task complete
                                        Role: Editor, must be the assignee
                                        → Task.status = COMPLETE, completedAt = now()
                                        → if has children: requires all children COMPLETE first
                                        → completion cascades: all children COMPLETE → parent auto-COMPLETE

DELETE /api/tasks/:id                Delete a Task
                                        Role: Owner/Manager only
                                        → deletes Task and all children (cascade)
                                        → if has Payout records: warning + confirmation required
```

---

## Subtasks (Task Hierarchy)

```
POST   /api/tasks/:id/subtasks       Add subtask to a Task
                                        Role: Editor: only if task.assigneeUserId = self (their own Task)
                                        Role: Owner/Manager: always allowed
                                        Body: {
                                          name: string,
                                          expectedDurationMinutes: number,
                                          assigneeUserId?: string, // default: inherit from parent
                                          payoutAmount?: number,    // default: null (payout flows to parent)
                                          category?: TaskCategory   // default: inherit from parent
                                        }
                                        → isFromTemplate = false (manually added)
                                        → parentTaskId = :id
                                        → max depth enforced: if parent has parentTaskId set, reject
                                          with 400 "Maximum nesting depth reached"

GET    /api/tasks/:id/subtasks       List subtasks of a Task
                                        Role: Editor: only if can view parent Task
                                        Role: Owner/Manager: always allowed

PATCH  /api/tasks/:id/subtasks/:subtaskId   Update a specific subtask
                                        Same authorization rules as PATCH /api/tasks/:id
                                        Body: { name?, status?, assigneeUserId?, payoutAmount?,
                                                expectedDurationMinutes?, reason? }

DELETE /api/tasks/:id/subtasks/:subtaskId   Delete a subtask
                                        Role: Owner/Manager only
                                        → children of deleted subtask are also deleted (cascade)

POST   /api/tasks/:id/subtasks/:subtaskId/complete
                                        Mark a subtask complete
                                        Role: Editor: only if subtask.assigneeUserId = self
                                        Role: Owner/Manager: always allowed
                                        → when last child COMPLETE: cascade parent to COMPLETE
```

---

# Human Capital / Payout / Wallet

```
GET    /api/wallet                   Own Wallet: balance (computed), Payout history
                                        Role: Editor (own data only)

POST   /api/wallet/withdraw          Request a withdrawal
                                        Role: Editor
                                        Body: { amount }
                                        → creates WithdrawalRequest[status=REQUESTED]

GET    /api/payouts/pending          List pending withdrawal requests
                                        Role: Owner/Manager

POST   /api/payouts/:id/mark-paid    Confirm manual bank transfer completed
                                        Role: Owner/Manager
                                        → WithdrawalRequest.status = PAID, paidAt = now()
```

---

# Team / Clients / Settings (Owner/Manager only)

```
GET    /api/team                     List Users + BrandAccess + Role + EmploymentType
POST   /api/team/:id/brand-access    Grant/revoke Brand Access for a User
GET    /api/clients                  List Clients (Owner/Manager only — CONSTITUTION.md #2)
GET    /api/clients/:id
GET    /api/services                 Service Catalog for accessible Brands
POST   /api/services                 Create/edit a Service (name, price, intakeFormSchema, stageTemplate)
PATCH  /api/brand/:id                Update Brand profile: logoUrl, primaryColor, domain
                                        Role: Owner/Manager
                                        Body: { logoUrl?, primaryColor?, domain? }
GET    /api/dashboard                Mission Control data: stale Tasks, pending payouts, recent activity
```

---

# Cross-Cutting Authorization Rule

Every route above must run through one shared `can(session, action,
resource)` check, not per-route ad hoc logic — this is how CONSTITUTION.md
#4 ("Roles & Permissions Are Structural, Not Cosmetic") gets enforced in
code rather than just documented. A new route added later without going
through this shared check is a violation of the Constitution, not a minor
oversight.

---

# Open Items for Future Sessions

1. Odoo webhook vs polling for `/api/orders/:id/confirm` triggering —
   ties to SYSTEM-MAP.md's still-open "Odoo sync timing" question.
2. Rate limiting / abuse protection on Client-facing endpoints — not
   designed here, needed before public launch.
3. Pagination shape for list endpoints (`/api/orders`, `/api/board`, etc.)
   — not specified, implementer's discretion within reason.
