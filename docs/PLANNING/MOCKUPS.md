# MOCKUPS.md

Status: Locked v2.0 (Phase 1 — comprehensive wireframes with subtask support)

Depends On: PAGE-FLOWS.md, DATA-MODELS.md, HUMAN_CAPITAL_OS.md,
CONSTITUTION.md, PROJECT_OS.md (Task Hierarchy)

---

# Purpose

Text wireframes for **every important screen** in Phase 1 — both Client
Portal and Internal contexts. Design intent is baked in at the layout
level (what's shown, what's hidden, what role-segregation looks like
visually), not just what's possible to code later.

**Notation convention:**
- `[Button]` = clickable CTA
- `▾ ` = collapsible section
- `●──●──○` = progress indicator (filled = done, half = current, empty = upcoming)
- `☐ ☑` = checkbox (empty / checked)
- `[Bracketed link]` = navigation link
- `{...}` = data placeholder / dynamic content
- `│` borders show screen edges, `├─┤` borders show inner cards
- `[📋 TPL]` = task from Service Template (auto-generated)
- `[+ MANUAL]` = task manually added by Owner/Manager

---

# TABLE OF CONTENTS

## Client Portal (studio.eatprayedit.com)
1. `/login` — Brand-themed login
2. `/projects` — Client's projects list with progress bars
3. `/projects/new` — Intake Form (Service selection)
4. `/projects/:projectId` — Project detail (stage progress)
5. `/projects/:projectId/delivery` — Delivery approval
6. `/account` — Client profile

## Internal (app.zenvas.com)

### Owner / Manager views
7. `/dashboard` — Mission Control
8. `/orders` — Order list (all, with internal values)
9. `/orders/:orderId` — Order detail with real Order/Invoice values
10. `/projects/:projectId` — Project detail with Stage/Task management + subtasks
11. `/clients` — Client list
12. `/clients/:clientId` — Client detail
13. `/team` — User list
14. `/payouts` — Pending withdrawal admin
15. `/settings/services` — Service Catalog editor

### Editor views (gamified workspace)
16. `/dashboard` — Editor personal dashboard (Level, XP, stats, opportunities)
17. `/projects` — Editor's assigned projects
18. `/tasks/:taskId` — Task detail with brief + checklist + subtask checklist
19. `/wallet` — Own Payout + withdrawals
20. `/profile` — Editor profile

---

# CLIENT PORTAL

---

# 1. Client Portal — `/login`

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│            ┌─────────────────────────────┐             │
│            │                             │             │
│            │   [EatPrayEdit logo]        │             │
│            │                             │             │
│            │   Welcome back              │             │
│            │                             │             │
│            │   Email                     │             │
│            │   ┌─────────────────────┐   │             │
│            │   │ {email}             │   │             │
│            │   └─────────────────────┘   │             │
│            │                             │             │
│            │   Password                  │             │
│            │   ┌─────────────────────┐   │             │
│            │   │ ●●●●●●●●           │   │             │
│            │   └─────────────────────┘   │             │
│            │                             │             │
│            │   [   Sign in   ]           │             │
│            │                             │             │
│            │   Don't have an account?    │             │
│            │   [ Contact us ]            │             │
│            │                             │             │
│            └─────────────────────────────┘             │
│                                                        │
│      © 2026 EatPrayEdit                                │
│      (no "Zenvas" anywhere — even footer is brand)     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Design notes:**
- Domain (`app.eatprayedit.com`) already implies the Brand.
- Logo is brand-owned, never Zenvas.
- Brand-themed background color (EatPrayEdit's accent) — *not* Zenvas chrome.
- Footer says "EatPrayEdit" only. CONSTITUTION.md #9.

---

# 2. Client Portal — `/projects` (Your Projects)

```
┌────────────────────────────────────────────────────────────────┐
│  [EPE Logo]   Your Projects              [👤 Sinta ▾] [Out] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Your Projects (3)                                             │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  📽  Real Estate Edit — 123 Maple St                   │  │
│  │      ████████████████████░░░░░░░  67%                   │  │
│  │      Est. delivery: Jan 25                              │  │
│  │      Last update: 2 hours ago                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  📽  Wedding Highlight — Diaz & Sarah                   │  │
│  │      ████████████████████████░░  89%                   │  │
│  │      Est. delivery: Jan 22                              │  │
│  │      Last update: yesterday                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  📽  Product Video — Wayfront Hotel                     │  │
│  │      ████░░░░░░░░░░░░░░░░░░░  15%                    │  │
│  │      Est. delivery: Feb 5                              │  │
│  │      Last update: 3 days ago                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│                    [ + Request New Project ]                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Progress bar psychology:**
- Like a render progress bar — creates anticipation
- Percentage visible at a glance
- Estimated delivery helps client plan their marketing calendar

**Design notes:**
- "Projects" not "Orders" — feels like ownership, not transaction
- Progress bar = ████░░░░░░  = visual, like loading bar
- Estimated delivery date per project
- "Last update" builds trust without exposing internal details
- No price/margin shown (CONSTITUTION.md #1)
- Chat widget icon 💬 appears on every page (bottom-right)

---

# 3. Client Portal — `/orders/new` (Intake Form)

```
┌────────────────────────────────────────────────────────┐
│  [EPE Logo]   Order Form              [← Back]        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Real Estate Edit                                      │
│  Tell us about your property                           │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section 1: Property details                      │  │
│  │ Property address *                               │  │
│  │ Property type *                                  │  │
│  │ ○ House  ● Apartment  ○ Land  ○ Other           │  │
│  │ Video length target                              │  │
│  │ [30s ▼]                                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section 2: Footage                              │  │
│  │ Where will footage be delivered? *               │  │
│  │ Approximate footage length                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Section 3: Style preferences                    │  │
│  │ Mood / vibe (optional)                           │  │
│  │ Reference videos (links)                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│        [ Save draft ]    [ Submit order ]              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**After submit:**
```
┌────────────────────────────────────────────────────────┐
│           ✓ Order received                            │
│   We've created your Order #EPE-0043                  │
│   Next step: Settle the down payment (DP) to confirm. │
│           [ Pay down payment ]   [ View order ]        │
└────────────────────────────────────────────────────────┘
```

**Design notes:**
- Form is auto-generated from `Service.intakeFormSchema` (DATA-MODELS.md).
- "Submit order" does NOT immediately start the project — DP must be paid first (CONSTITUTION.md #3).

---

# 4. Client Portal — `/orders/:orderId` (Order Detail / Stage Progress)

```
┌────────────────────────────────────────────────────────┐
│  [EPE Logo]   Order Detail          [👤 Sinta ▾] [Out] │
├────────────────────────────────────────────────────────┤
│  Real Estate Edit — 123 Maple St                       │
│  Order #EPE-0042                                       │
│  Status: IN PROGRESS                                   │
│                                                        │
│  ●─────────●─────────○                                 │
│  Intake    Editing    Review                           │
│   ✓ done    ▶ now      upcoming                        │
│                                                        │
│  Stage 2 of 3: Editing                                 │
│  Started Jan 15 · Expected ready: Jan 19               │
│                                                        │
│  ▾ See details                                         │
│    ✓ File transfer complete          Jan 14, 10:45am  │
│    ✓ Rough cut started               Jan 15, 11:00am  │
│    ▶ Color grading in progress       Jan 17, 1:35pm   │
│    ○ Audio mix                       upcoming         │
│    ○ Final review                    upcoming         │
│                                                        │
│  [ Message the team ]      [ View Invoice ]            │
│                                                        │
│  Invoice Status                                        │
│  Down payment ($500)    Paid Jan 13 ✓                 │
│  Final payment          Pending — at delivery          │
└────────────────────────────────────────────────────────┘
```

**Design notes:**
- Progress shows **Stage**, not Task count.
- "See details" expand is collapsed by default.
- "Message the team" → Brand-level inbox (CONSTITUTION.md #2).

---

# 5. Client Portal — `/orders/:orderId/delivery` (Delivery Approval)

```
┌────────────────────────────────────────────────────────┐
│  [EPE Logo]          [👤 Sinta ▾] [Out]                │
├────────────────────────────────────────────────────────┤
│  Real Estate Edit — 123 Maple St                       │
│  Your delivery is ready 🎉                             │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ▶  [Video player — 2:34]                        │  │
│  │  [ Download original file ]                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  How does this look?                                   │
│  ○ ✓  Approve as final delivery                       │
│  ○ ↻  Request revision                                │
│  Notes (optional):                                     │
│  [ Submit decision ]                                   │
└────────────────────────────────────────────────────────┘
```

**Design notes:**
- Approve triggers: Order→COMPLETED, Odoo Final invoice, Payout.status=CREDITED.

---

# 6. Client Portal — `/account` (Client Profile)

```
┌────────────────────────────────────────────────────────┐
│  [EPE Logo]    My Account          [👤 Sinta ▾] [Out]  │
├────────────────────────────────────────────────────────┤
│  Contact details                                       │
│  Name              Sinta Wijaya                        │
│  Email             sinta@example.com                   │
│  Phone             +62 812 3456 7890                   │
│            [ Save changes ]                            │
└────────────────────────────────────────────────────────┘
```

---

# INTERNAL — OWNER / MANAGER VIEWS

---

# 7. Internal — `/dashboard` (Mission Control)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   [Brand: EPE Studio ▾]      [👤 Ruda ▾]     │
├────────────────────────────────────────────────────────────────┤
│  Dashboard — Tuesday, Jan 20                                  │
│                                                                │
│  ╔══════════════════════════════════════════════════════════╗ │
│  ║  ⚠ Needs Attention (2)                                   ║ │
│  ║  Order #EPE-0039 · "Download raw files" · 6h overdue     ║ │
│  ║    Assigned: Andi (since 2 days ago)    [ Open Task → ]   ║ │
│  ║  Order #EPE-0041 · "Color grading" · 3h overdue          ║ │
│  ║    Assigned: Sarah (since yesterday)   [ Open Task → ]    ║ │
│  ╚══════════════════════════════════════════════════════════╝ │
│                                                                │
│  💰 Pending Withdrawals: 1     [Review →]                     │
│  📁 Active Projects: 3          [View all →]                   │
│  💵 Active Orders: 8            [View all →]                   │
│                                                                │
│  ──── Team Capacity ─────────────────────────────            │
│  Andi       ▓▓▓▓▓▓░░░░░  2 active Tasks                      │
│  Sarah      ▓▓░░░░░░░░░  1 active Task                       │
│  Cakra      ░░░░░░░░░░  0 active (available)                  │
│                                                                │
│  ──── Recent Activity ──────────────────────────────          │
│  2h ago  · Cakra completed "Rough cut" on EPE-0041           │
│  5h ago  · Andi applied to EPE-0039                           │
│  1d ago  · Order EPE-0041 confirmed (DP received)             │
└────────────────────────────────────────────────────────────────┘
```

---

# 8. Internal — `/orders` (Owner/Manager Order List)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   [Brand: EPE Studio ▾]      [👤 Ruda ▾]     │
├────────────────────────────────────────────────────────────────┤
│  Orders                          [ + New Order ] [⋮ Filters] │
│  Search: [ {search by Order # or client}        ]              │
│  Status: [ All ▾ ] Brand: [ EPE Studio ▾ ]                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order # │ Client      │ Service      │ Status │ Value │   │
│  ├─────────┼─────────────┼──────────────┼────────┼───────┤   │
│  │ EPE-42  │ Sinta W.    │ Real Estate  │ ▶ PROG │ $500  │   │
│  │ EPE-41  │ Wayfront    │ Real Estate  │ ▶ PROG │ $800  │   │
│  │ EPE-40  │ Mandapa     │ Real Estate  │ ✓ DONE │ $750  │   │
│  │ EPE-39  │ Nugroho     │ Real Estate  │ ◯ DRAFT│ $500  │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

# 9. Internal — `/orders/:orderId` (Order Detail, Owner/Manager)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal    Orders › EPE-42               [👤 Ruda ▾]   │
├────────────────────────────────────────────────────────────────┤
│  Order #EPE-42 — Real Estate Edit                            │
│  Status: ▶ IN PROGRESS · Confirmed Jan 13                    │
│                                                                │
│  ╔════════ Client ════════╗  ╔════ Payment ════╗               │
│  ║ Sinta Wijaya          ║  ║ Order Value: Rp 5M  ║           │
│  ║ sinta@example.com     ║  ║ DP Received: Rp 2.5M ✓║          │
│  ║ +62 812 3456 7890     ║  ║ Final: at delivery ║            │
│  ║ Odoo Partner: #421    ║  ╚════════════════════╝            │
│  ║ [ View full client → ]║                                    │
│  ╚═══════════════════════╝                                    │
│                                                                │
│  Intake Form                                                  │
│  Property address: 123 Maple St                              │
│  Type: Apartment · Mood: "Modern, clean, fast cuts"          │
│                                                                │
│  Project: EPE-P-042      [ Open project → ]                   │
│                                                                │
│  Activity Log                                                 │
│  Jan 20 14:35  · Cakra marked "Rough cut" complete          │
│  Jan 17 13:35  · Sarah started "Color grading"               │
│  Jan 13 09:15  · Order confirmed (DP received)               │
│  Jan 12 16:48  · DP invoice issued (Odoo #INV/2026/0042)     │
└────────────────────────────────────────────────────────────────┘
```

---

# 10. Internal — `/projects/:projectId` (Project Detail + Subtasks + Visibility)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Projects › EPE-P-042         [👤 Ruda ▾]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Project EPE-P-042 — Real Estate Edit (Sinta Wijaya)         │
│  Order: EPE-42 · Brand: EPE                                  │
│                                                                │
│  Stage 1: Pre-Production  ◐ 1/3 tasks · Started Jan 13      │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ☑ Script review                    [📋 TPL] ✓        │   │
│  │   Assigned: Cakra · Done Jan 13          👁 Visible   │   │
│  │   Payout: Rp 100,000 [✓ Credited]                    │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ☑ Location research                [📋 TPL] ✓        │   │
│  │   Assigned: Cakra · Done Jan 14          👁 Visible   │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▶ Make new script                  [+ MANUAL] ◐ 50%   │   │
│  │   Assigned: Cakra · Started Jan 15       👁 Visible   │   │
│  │   Payout: Rp 250,000 [ ALLOCATED ]                   │   │
│  │   Category: PRE_PRODUCTION                           │   │
│  │   ┌────────────────────────────────────────────────┐ │   │
│  │   │ ├─ ☑ Meeting klien bahas script  ✓             │ │   │
│  │   │ │   Done Jan 15, 10:00                        │ │   │
│  │   │ ├─ ☑ Cari inspirasi baru       ✓             │ │   │
│  │   │ │   Done Jan 15, 14:30                        │ │   │
│  │   │ └─ ○ Present draft ke klien                  │ │   │
│  │   │     [ + Add subtask ]                         │ │   │
│  │   └────────────────────────────────────────────────┘ │   │
│  │   [ Reassign ] [ Edit payout ] [ 👁/🔒 ] [ Collapse ]│   │
│  │                         ↑                              │   │
│  │                    visibility toggle                  │   │
│  └────────────────────────────────────────────────────────┘   │
│  [ + Add task ]  ← manual root task addition                 │
│                                                                │
│  ──────────────────────────────────────────────                │
│                                                                │
│  Stage 2: Production  ○ UPCOMING                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ○ Shoot day                    [📋 TPL]               │   │
│  │   Unassigned · Auto-posted to Board                  │   │
│  │   Payout: Rp 500,000 (suggested)                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Stage 3: Post-Production + Delivery  ○ UPCOMING             │
│  [ View Tasks ▾ ]                                            │
│                                                                │
│  [ + Add stage ]  [ Edit Order intake ]                      │
└────────────────────────────────────────────────────────────────┘
```

**Legend:**
- `[📋 TPL]` = task from Service Template (auto-generated)
- `[+ MANUAL]` = task manually added by Owner/Manager
- `[◯ 50%]` = parent task progress (2 of 4 subtasks complete)
- `[+ Add subtask]` = button to add subtask under parent
- `[+ Add task]` = per-stage button to add root task

**Inline "Add subtask" popover:**
```
       ┌─────────────────────────────────────┐
       │ Add subtask to "Make new script"    │
       │                                     │
       │ Name: *                             │
       │ [ {subtask name}                  ] │
       │                                     │
       │ Assignee:                           │
       │ [ Inherit from parent (Cakra) ▾  ] │
       │                                     │
       │ Expected duration:                  │
       │ [ {minutes / hours}              ] │
       │                                     │
       │ Category: PRE_PRODUCTION ▾ (locked)│
       │                                     │
       │       [ Cancel ]  [ Add subtask ]   │
       └─────────────────────────────────────┘
```

**Design notes:**
- Subtasks render as **indented children** under parent task.
- Parent progress % computed from children (e.g. 2/4 = 50%).
- `[📋 TPL]` vs `[+ MANUAL]` badges show task origin.
- Auto-completion: when last subtask is checked off, parent auto-flips to ✓.
- Category locked to parent's category (PRE/PROD/POST).

---

# 11. Internal — `/clients` (Client List)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Clients                  [👤 Ruda ▾]        │
├────────────────────────────────────────────────────────────────┤
│  Clients                                  [ + Add Client ]    │
│  Search: [ {name or email}              ]                    │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Client          │ Email              │ Orders │ Total  │   │
│  ├─────────────────┼────────────────────┼────────┼────────┤   │
│  │ Sinta Wijaya    │ sinta@example.com  │   3    │ Rp 4M  │   │
│  │ Wayfront Cafe   │ hello@wayfront.id  │   7    │ Rp 18M │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

# 12. Internal — `/clients/:clientId` (Client Detail)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Clients › Sinta Wijaya      [👤 Ruda ▾]    │
├────────────────────────────────────────────────────────────────┤
│  Sinta Wijaya                                                │
│  sinta@example.com · +62 812 3456 7890                        │
│  Odoo Partner: #421                    [ Resync ]             │
│                                                                │
│  ╔═══════ Lifetime ═════════════╗                             │
│  ║ Orders: 3   Total revenue: 4.5M   ║                       │
│  ║ First order: Jan 12   Last: ongoing║                      │
│  ╚═══════════════════════════════════╝                         │
│                                                                │
│  Orders                                                       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ #EPE-42  · Real Estate  · ▶ PROGRESS  · Rp 1.5M       │   │
│  │ #EPE-31  · Wedding      · ✓ DONE      · Rp 2M        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Notes / Preferences                                          │
│  [ Edit ]                                                     │
│                                                                │
│  Communication thread (Owner/Manager only)                   │
│  [ Open thread → ]                                            │
└────────────────────────────────────────────────────────────────┘
```

---

# 13. Internal — `/team` (User List)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Team                    [👤 Ruda ▾]        │
├────────────────────────────────────────────────────────────────┤
│  Team                                       [ + Invite User ] │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ User         │ Role     │ Type       │ Brands   │ Tasks │   │
│  ├──────────────┼──────────┼────────────┼──────────┼───────┤   │
│  │ Ruda         │ OWNER    │ INHOUSE    │ EPE, KP  │ —     │   │
│  │ Andi         │ EDITOR   │ FREELANCE  │ EPE      │ 2     │   │
│  │ Cakra        │ EDITOR   │ FREELANCE  │ EPE, BS  │ 0     │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**User detail:**
```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Team › Andi                [👤 Ruda ▾]    │
├────────────────────────────────────────────────────────────────┤
│  Andi Susanto · EDITOR (FREELANCE)                           │
│  Brand Access: EPE Studio ✓                                  │
│                                                                │
│  Task Assignment History (last 30d)                          │
│  EPE-0039 · Download raw files · ✓ DONE · Rp 100k          │
│                                                                │
│  Wallet Summary (computed)                                    │
│  Lifetime credited:  Rp 2,400,000                            │
│  Pending withdrawal: Rp 450,000                              │
│                                                                │
│  Brand Access Management                                      │
│  ☑ EPE Studio [Revoke]                                       │
│  ☐ Balistory  [Grant]                                        │
└────────────────────────────────────────────────────────────────┘
```

---

# 14. Internal — `/payouts` (Pending Withdrawals)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Payouts                  [👤 Ruda ▾]       │
├────────────────────────────────────────────────────────────────┤
│  [ Pending (1) ]  [ Paid ]  [ All ]                          │
│  Pending Withdrawals (1)                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Requested │ Editor     │ Amount    │ Action          │   │
│  ├───────────┼────────────┼───────────┼─────────────────┤   │
│  │ Jan 19    │ Cakra      │ Rp 450,000│ [ Mark paid ]   │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

# 15. Internal — `/settings/services` (Service Catalog Editor)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   Settings › Services      [👤 Ruda ▾]       │
├────────────────────────────────────────────────────────────────┤
│  Service Catalog (EPE Studio)                                │
│  Services                                       [ + Add ]    │
│  Real Estate Edit           Rp 1,500,000  [ Edit ]           │
│  Wedding Highlight         Rp 2,500,000  [ Edit ]           │
│                                                                │
│  Editing: Real Estate Edit                                  │
│  Display Name:  [ Real Estate Edit                    ]      │
│  Price:         [ Rp 1,500,000                            ]   │
│                                                                │
│  Intake Form Schema (JSON)                                   │
│  [ { key: "address", label: "Property address", ... } ]      │
│                                                                │
│  Stage Template                                               │
│  Stage 1: Rough Cut          [ + Add Stage ]                 │
│    • Download raw files  (30min) Rp 100k  [ edit ]           │
│    • Rough cut edit      (3h)    Rp 250k  [ edit ]           │
│                                                                │
│  [ Save service ]                                             │
└────────────────────────────────────────────────────────────────┘
```

---

# INTERNAL — EDITOR VIEWS (deliberately minimal)

---

# 16. Internal — `/board` (Editor Cross-Brand Board)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas                                    [👤 Cakra ▾]        │
├────────────────────────────────────────────────────────────────┤
│  My Board                                          [Log out]   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ 📋 Rough Cut — Real Estate Edit                       │   │
│  │    EPE Studio                                          │   │
│  │    Payout: Rp 250,000                                  │   │
│  │                                  [   Apply   ]         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▶ Your Active Task — Open now                          │   │
│  │   Real Estate Edit (EPE) · Rough cut                   │   │
│  │   Payout: Rp 250,000 (allocated)                       │   │
│  │   Started Jan 17 · expected 3h                          │   │
│  │                              [   Continue →   ]        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ───────── Wallet ─────────                                  │
│  Available: Rp 450,000          [ View wallet → ]            │
└────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- No Order value, no Client name/contact, no other editor's earnings
  (CONSTITUTION.md #1, #2).
- Cross-Brand aggregation visible (EPE + Balistory together).
- Payout shown BEFORE Apply click.

---

# 17. Internal — `/tasks/:taskId` (Editor Task Detail + Subtasks)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas                      ← Back to Board      [👤 Cakra ▾] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Rough Cut — Real Estate Edit                                │
│  EPE Studio · Payout: Rp 250,000 (allocated)                 │
│  Expected ~ 3 hours · Started Jan 17, 11:00                  │
│                                                                │
│  ╔══════════ Brief ══════════╗                                │
│  ║ Property: 123 Maple St    ║                                │
│  ║ Type: Apartment           ║                                │
│  ║ Mood: Modern, fast cuts   ║                                │
│  ║                            ║                                │
│  ║ Files: [Google Drive ↗]   ║                                │
│  ║                            ║                                │
│  ║ Style reference:           ║                                │
│  ║   📎 SOP-EPE-Color-v2.pdf  ║  ← Knowledge surfaces here  ║
│  ║   📎 Client note (Sinta)   ║  ← Client preference here    ║
│  ╚════════════════════════════╝                                │
│                                                                │
│  ── My Checklist ────────────────────────────────────        │
│  ☐ Download raw files                                        │
│  ☑ Review brief ✓                                           │
│  ☐ Rough cut edit                                           │
│  ☐ Review pass                                                │
│  ☐ Submit for color grading                                  │
│                                                                │
│  ── Subtasks (for breakdown) ──────────────────────────       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ☑ Meeting klien bahas script           ✓               │   │
│  │ ☑ Cari inspirasi baru                  ✓               │   │
│  │ ○ Present draft ke klien                                │   │
│  │ [ + Add subtask ] (break down your work)               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ── Stale Warning ────────────────────────────────────────     │
│  ⚠ Task is 2h overdue (expected: 3h). Notify Manager?         │
│                                                                │
│  [ Mark this Task complete ]                                 │
│  (Requires all checklist items + subtasks checked)            │
│                                                                │
│  ────── Discussion (with Manager) ──────                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Cakra: Files downloading, will start rough cut by 11am│   │
│  │ Manager: 👍 let me know if needed                      │   │
│  │                                      [+ Add a message]│   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- This is the entirety of the Editor working surface (CONSTITUTION.md #6).
  Real creative work happens in DaVinci Resolve.
- Discussion scoped to **Manager only** — no Client option (CONSTITUTION.md #2).
- SOP / Client Preference knowledge surfaces INSIDE the Brief
  (CONSTITUTION.md #7). No "Knowledge Library" link.
- Subtasks render as an inline checklist. Editor checks them off one by one.
- **"Mark this Task complete"** requires all checklist items AND subtasks checked.
- **"[ + Add subtask ]"** button — Editor CAN add subtasks to their own
  assigned tasks only (like ClickUp). This is how they break down work.
  - Cannot add root tasks (only Manager/Owner can)
  - Cannot add subtasks to OTHER people's tasks
- **Stale warning** — if task is overdue, show gentle prompt to notify Manager.
- Editor **CANNOT reassign** their own task to others — that's Manager's job.

---

# 18. Internal — `/wallet` (Editor Wallet)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas                       My Wallet          [👤 Cakra ▾]  │
├────────────────────────────────────────────────────────────────┤
│  My Wallet                                                    │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │          Available balance                             │   │
│  │          Rp 450,000                                    │   │
│  │          (credited − withdrawn)                        │   │
│  │          [  Request withdrawal  ]                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ──── Pending withdrawal requests ─────                      │
│  Jan 19 · Rp 450,000 · ⏳ Awaiting manual transfer           │
│                                                                │
│  ──── Credited payouts ─────                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Date       │ Task              │ Status   │ Amount     │   │
│  ├────────────┼───────────────────┼──────────┼────────────┤   │
│  │ Jan 17     │ Rough cut EPE-42  │ ✓ CREDIT│ Rp 250,000  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ──── Withdrawal history ─────                               │
│  Jan 15 · Rp 200,000 · Marked PAID by Ruda                   │
│                                                                │
│  [ View payout audit log → ]                                 │
└────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Wallet is **computed**, not stored (DATA-MODELS.md).
- Bank details are *editor's own* — Owner never edits them.

---

# Wireframe List Summary

| # | Page | Context | Roles |
|---|------|---------|-------|
| 1 | `/login` | Client Portal | Client |
| 2 | `/orders` | Client Portal | Client |
| 3 | `/orders/new` | Client Portal | Client |
| 4 | `/orders/:orderId` | Client Portal | Client |
| 5 | `/orders/:orderId/delivery` | Client Portal | Client |
| 6 | `/account` | Client Portal | Client |
| 7 | `/dashboard` | Internal | Owner / Manager |
| 8 | `/orders` | Internal | Owner / Manager |
| 9 | `/orders/:orderId` | Internal | Owner / Manager |
| 10 | `/projects/:projectId` | Internal | Owner / Manager + Subtasks |
| 11 | `/clients` | Internal | Owner / Manager |
| 12 | `/clients/:clientId` | Internal | Owner / Manager |
| 13 | `/team` | Internal | Owner / Manager |
| 14 | `/payouts` | Internal | Owner / Manager |
| 15 | `/settings/services` | Internal | Owner / Manager |
| 16 | `/board` | Internal | Editor |
| 17 | `/tasks/:taskId` | Internal | Editor + Subtasks checklist |
| 18 | `/wallet` | Internal | Editor |

**Total: 18 wireframes** (matching every page in PAGE-FLOWS.md).

---

# Design Patterns Repeated Throughout

1. **Brand chrome replaces Zenvas chrome** in Client Portal
   (CONSTITUTION.md #9).
2. **Payout amount visible only to authorized viewer** — Editor sees own;
   Owner/Manager sees all (CONSTITUTION.md #1).
3. **Client name/contact invisible to Editor** — never appears in any
   Editor route (CONSTITUTION.md #2).
4. **Knowledge surfaces in-context** (Brief, Task description) — no
   separate Library link in Editor routes (CONSTITUTION.md #7).
5. **Activity Log inline** — visible on key internal screens (Order,
   Project, Payouts).
6. **Reassign Requires Reason** — every override, reassign, or payout
   change prompts for a Reason that lands in immutable audit tables.
7. **Subtasks render inline** — under parent task in Project Detail;
   as checklist in Editor Task Detail.
8. **Task origin badges** — `[📋 TPL]` vs `[+ MANUAL]` so Owner can
   see at a glance what's template vs custom.
9. **Completion cascade** — when last subtask done, parent auto-flips
   to ✓. Per PROJECT_OS.md "Task Hierarchy" section.
10. **Editor cannot add tasks** — only check off. Per CONSTITUTION.md #2.

---

---

# NEW WIREFRAMES

---

# A. Client Portal — Chat Widget (Bottom-Right)

```
┌────────────────────────────────────────────────────────────────┐
│  [EPE Logo]   Your Projects              [👤 Sinta ▾] [Out] │
│  ...                                                           │
│                                                            ┌────┐│
│                                                            │ 💬 ││
└────────────────────────────────────────────────────────────└──┬─┘│
                                                               │
                                                               ▼
                                               ┌─────────────────────────┐
                                               │ 💬 Project Chat         │
                                               │    Real Estate — 123 Maple│
                                               ├─────────────────────────┤
                                               │                         │
                                               │ Jan 18, 10:30 AM       │
                                               │ Manager: Files         │
                                               │ received! Starting      │
                                               │ rough cut today.       │
                                               │                         │
                                               │ Jan 18, 2:15 PM       │
                                               │ You: Rough cut done!  │
                                               │ Moving to color.       │
                                               │                         │
                                               │ Jan 19, 9:00 AM       │
                                               │ Manager: Color looks  │
                                               │ great! Almost done.   │
                                               │                         │
                                               ├─────────────────────────┤
                                               │ [Type a message...]    │
                                               │              [Send ➤] │
                                               └─────────────────────────┘
```

**Design notes:**
- Chat widget appears on every Client Portal page (bottom-right)
- Per-project thread — same as Odoo message pattern
- Client sees their thread only, Owner/Manager sees all project threads
- Messages include: Client messages, Manager responses, System notifications

---

# B. Internal — Editor Dashboard (Gamified)

```
┌────────────────────────────────────────────────────────────────┐
│  Zenvas Internal   [Brand: EPE Studio ▾]      [👤 Cakra ▾]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Good morning, Cakra! 👋                                    │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 🎯 Level 3 │  │ 💰 Rp 2.4M │  │ 📁 12 Done │        │
│  │ Video Editor│  │ Lifetime   │  │ Projects   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                │
│  ──── Your Progress ─────────────────────────────────        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ XP: ████████░░░░░░░░░░░░  780 / 2000               │  │
│  │ Next level at 2000 XP (2 more projects)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ──── Available Projects ─────────────────────────────         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📽 Real Estate Edit — EPE Studio                      │  │
│  │    Reward: Rp 300,000                                 │  │
│  │    Difficulty: ★★☆☆☆  Easy                           │  │
│  │    [ View Details ]  [ Apply ]                       │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📽 Wedding Highlight — Balistory                        │  │
│  │    Reward: Rp 500,000                                 │  │
│  │    Difficulty: ★★★☆☆  Medium                        │  │
│  │    [ View Details ]  [ Apply ]                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ──── Continue Working ─────────────────────────────────       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📽 Real Estate — 123 Maple St                          │  │
│  │    Stage: Color Grading                                │  │
│  │    Last: "Rough cut complete ✓"  — 2 hours ago       │  │
│  │    [ Continue → ]                                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  ──── Achievements Unlocked ───────────────────────────       │
│  🎖 Quick Starter    🎬 10 Projects    💎 Top Earner          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Gamification elements:**
- **Level & XP** — each completed project = XP, levels unlock at thresholds
- **Stats cards** — Level, Lifetime earnings, Completed projects at a glance
- **Progress bar** — visual indicator toward next level
- **Available Projects** — presented as "opportunities" with difficulty
- **Continue Working** — quick access to last active task
- **Achievements** — badges for milestones (unlockable)

**Psychology:**
- Editors should enjoy logging in — like a game that rewards consistent work
- Low friction, high clarity, always something to work on
- Creates engagement and loyalty to the platform

---

# C. Client Portal — `/projects/:projectId` (With Chat Open)

```
┌────────────────────────────────────────────────────────────────┐
│  [EPE Logo]   Your Projects              [👤 Sinta ▾] [Out] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Real Estate Edit — 123 Maple St                               │
│  Project #EPE-P-042                                           │
│                                                                │
│  ████████████████████░░░░░░░░░░░  72%                      │
│  Est. delivery: Jan 25 · Started: Jan 15                      │
│                                                                │
│  ●─────────●─────────○                                         │
│  Intake    Editing    Review                                   │
│   ✓ done    ▶ now      upcoming                                │
│                                                                │
│  Stage 2 of 3: Editing                                       │
│  ▾ See details                                                 │
│    ✓ File transfer complete          Jan 14, 10:45am          │
│    ✓ Rough cut started               Jan 15, 11:00am          │
│    ▶ Color grading in progress      Jan 17, 1:35pm           │
│    ○ Audio mix                       upcoming                 │
│    ○ Final review                    upcoming                 │
│                                                                │
│  [ Message the team ]      [ View Invoice ]                    │
│                                                            ┌──┐│
│  Invoice Status                                            │💬││
│  Down payment ($500)    Paid Jan 13 ✓                       └──┘│
└─────────────────────────────────────────────────────────────    │
                                                             Chat │
                                                             Open │
```

---

*Last updated: 2026-07-20 (Client Portal "Projects", Editor Dashboard gamification, Chat widget added)*
