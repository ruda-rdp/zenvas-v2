# Human Capital OS - Zenvas v2

## Overview

Human Capital OS manages team members, roles, and permissions within the organization.

## Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **OWNER** | Full access, manages org | All access + can manage team |
| **MANAGER** | Manages projects & team | Project management, lead management |
| **PRODUCER** | Oversees production | Task assignment, delivery tracking |
| **EDITOR** | Assigned to tasks | View & complete assigned tasks |

## User Registration Flow

### Scenario 1: Personal Use (Self-Registration)
```
/register (no code)
    ↓
Create OWNER + own Organization
    ↓
Onboarding (create first brand)
    ↓
Dashboard
```

### Scenario 2: Join Existing Team (Invite Code)
```
Owner generates invite link (Editor/Manager/Producer)
    ↓
Share link: /register?code=EDITOR_xxx
    ↓
User registers → joins org as specified role
    ↓
Dashboard
```

## Team Management (Odoo Style)

### Team Page Features

```
┌─────────────────────────────────────────────────────────────────┐
│  Team                                          [+ Add User] [Generate Link] │
├─────────────────────────────────────────────────────────────────┤
│  User       │ Email          │ Role      │ EPE Brand │ Balistory│
├─────────────────────────────────────────────────────────────────┤
│  👤 Admin  │ admin@test.com │ OWNER     │     ☑     │    ☑    │
│  👤 John   │ john@test.com  │ EDITOR ▼  │     ☑     │    ☐    │
│  👤 Sarah  │ sarah@test.com │ MANAGER ▼ │     ☑     │    ☑    │
└─────────────────────────────────────────────────────────────────┘
```

### Actions Available:

**Owner Only:**
- [+ Add User] - Create user and generate invite
- [Generate Invite Link] - Generate invite code
- Click user row → View/Edit profile
- Change role via dropdown
- Toggle brand access via checkbox

### Add User Modal
```
┌─────────────────────────────────────────┐
│  Add Team Member                       [X]│
├─────────────────────────────────────────┤
│  Name: [John Doe]                       │
│  Email: [john@example.com]             │
│  Role: [EDITOR ▼]                       │
│                                          │
│  [Create & Send Invite]                 │
└─────────────────────────────────────────┘
```

### User Profile Modal
```
┌─────────────────────────────────────────┐
│  User Profile                          [X]│
├─────────────────────────────────────────┤
│  [Avatar]  John Doe                     │
│            john@example.com            │
│                                          │
│  Role: [EDITOR ▼]                       │
│  Employment: Freelance                   │
│                                          │
│  Brand Access:                         │
│  ☑ EPE Brand                           │
│  ☐ Balistory                           │
│                                          │
│  [Save Changes]                         │
└─────────────────────────────────────────┘
```

## Generate Invite Links

Owner generates role-specific invite links:

```
┌─────────────────────────────────────────┐
│  Generate Invite Link                  [X]│
├─────────────────────────────────────────┤
│  Role for this invite:                 │
│  [EDITOR ▼]                           │
│                                          │
│  [Generate Invite Link]                 │
└─────────────────────────────────────────┘
```

### Generated Link Format
```
/register?code=EDITOR_abc123
```

### Invite Code Features:
- Role-specific (EDITOR, MANAGER, PRODUCER)
- Single-use (expires after registration)
- Shareable via website/email/WhatsApp

## Brand Access Control

Multi-brand access per user (Odoo style):
- Simple checkbox grid
- Owner controls which brands user can access
- Example: Editor can work on both EPE and Balistory

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/team` | GET | List all users in org |
| `/api/team/invite` | POST | Generate invite code |
| `/api/team/invite` | GET | List all invite codes |
| `/api/team/[id]/role` | PATCH | Change user role |
| `/api/team/[id]/brands` | POST | Grant brand access |
| `/api/team/[id]/brands` | DELETE | Revoke brand access |

## Database Models

```prisma
// User with role
model User {
  id             String @id
  organizationId String
  role           Role   // OWNER, MANAGER, EDITOR, PRODUCER
}

// Brand access (multi-brand per user)
model BrandAccess {
  userId  String
  brandId String
}

// Invite codes
model InviteCode {
  code   String @unique // "EDITOR_abc123"
  role   Role
  used   Boolean @default(false)
}
```

## Future Enhancements

- [ ] Email invite (send email with link)
- [ ] Invite link expiry settings
- [ ] Bulk invite (CSV upload)
- [ ] User deactivation
- [ ] Activity audit log
- [ ] Role templates
