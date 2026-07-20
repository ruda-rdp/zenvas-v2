# User Profile & Settings - Zenvas v2

## Overview

Each user has access to their own profile settings where they can:
- View and edit profile information
- Change password
- Manage preferences
- Sign out

## Profile Page Features

### Tab 1: Profile
```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  John Doe                                       │
│            john@example.com                                 │
│            OWNER                                           │
├─────────────────────────────────────────────────────────────┤
│  Name: [John Doe]                                         │
│  Email: [john@example.com]                                │
│                                                             │
│  Role: OWNER           Employment: Freelance               │
│  Organization: EPE Production                               │
│  Member Since: January 2024                                │
│                                                             │
│  [Save Changes]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Editable fields:**
- Name
- Email (with uniqueness check)

**Read-only fields:**
- Role (set by owner)
- Employment Type
- Organization
- Member Since

### Tab 2: Password
```
┌─────────────────────────────────────────────────────────────┐
│  Change Password                                            │
├─────────────────────────────────────────────────────────────┤
│  Current Password: [••••••••]                             │
│  New Password: [••••••••]                                 │
│  Confirm Password: [••••••••]                             │
│                                                             │
│  [Change Password]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Validation:**
- Current password required
- New password min 6 characters
- Confirm must match new password

### Tab 3: Preferences
```
┌─────────────────────────────────────────────────────────────┐
│  Preferences                                               │
├─────────────────────────────────────────────────────────────┤
│  Dark Mode                              [Toggle]          │
│  Email Notifications                    [Toggle]          │
│                                                             │
│  ───────────────────────────────────────────────────────   │
│  [Sign Out]                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Dark/Light mode toggle
- Notification preferences (future)
- Sign out button

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profile` | GET | Get current user profile |
| `/api/profile` | PATCH | Update name/email |
| `/api/profile/password` | POST | Change password |

### GET /api/profile

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "OWNER",
    "employmentType": "FREELANCE",
    "createdAt": "2024-01-15T00:00:00Z",
    "organization": {
      "id": "org_456",
      "name": "EPE Production"
    }
  }
}
```

### PATCH /api/profile

**Request:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "OWNER"
  }
}
```

### POST /api/profile/password

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400`: Missing current/new password
- `400`: New password too short
- `400`: Current password incorrect

## Security Considerations

1. **Password Hashing**: All passwords hashed with bcrypt (12 rounds)
2. **Session Update**: Name change updates session token
3. **Email Uniqueness**: Checked before update
4. **Current Password**: Required for password change

## Future Enhancements

- [ ] Avatar upload
- [ ] Two-factor authentication
- [ ] Active sessions list
- [ ] OAuth connections (Google, GitHub)
- [ ] Notification preferences (email/push)
- [ ] Account deletion
- [ ] Data export (GDPR)
