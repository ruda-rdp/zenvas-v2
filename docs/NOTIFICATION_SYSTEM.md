# Notification System - Zenvas v2

## Overview

In-app notification system for real-time updates about important events.

## Architecture

### Database Model

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String           // recipient
  type      NotificationType
  title     String
  message   String
  link      String?          // optional navigation link
  read      Boolean          @default(false)
  createdAt DateTime        @default(now())
}

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
```

## Components

### NotificationBell (`src/components/NotificationBell.tsx`)
- Bell icon with unread badge count
- Dropdown panel with notification list
- Mark as read functionality
- Auto-refresh every 30 seconds (polling)
- Click notification to navigate to link

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Get user's notifications |
| `/api/notifications/read-all` | POST | Mark all as read |
| `/api/notifications/:id/read` | PATCH | Mark single as read |

### GET /api/notifications
Query params:
- `limit` - Number of notifications (default: 20)
- `unreadOnly` - Filter unread only

Response:
```json
{
  "notifications": [...],
  "unreadCount": 5
}
```

## Usage

### Creating Notifications

```typescript
import { createNotification } from "@/lib/notifications";

// When task is assigned
await createNotification({
  userId: assigneeId,
  type: "TASK_ASSIGNED",
  title: "New Task Assigned",
  message: "You have been assigned to 'Video Editing'",
  link: "/projects/123",
});

// When project stage changes
await createNotification({
  userId: ownerId,
  type: "PROJECT_UPDATE",
  title: "Project Stage Updated",
  message: "Project 'Villa Video' is now in Editing stage",
  link: "/projects/123",
});
```

### Notification Types

| Type | When to Trigger |
|------|-----------------|
| `TASK_ASSIGNED` | Task assigned to user |
| `TASK_COMPLETED` | Task marked complete |
| `PROJECT_UPDATE` | Project stage changed |
| `DELIVERY_READY` | Delivery ready for client |
| `LEAD_NEW` | New lead created |
| `ORDER_CONFIRMED` | Order confirmed |
| `ORDER_COMPLETED` | Order completed |
| `SYSTEM` | System announcements |

## UI Placement

- **Dashboard Header** - Notification bell icon in top-right
- Click bell → dropdown panel with notifications
- Badge shows unread count

## Future Enhancements

- [ ] Email notifications
- [ ] Push notifications (browser)
- [ ] WebSocket for real-time (instead of polling)
- [ ] Notification preferences per user
- [ ] Sound alerts

## Files

- `prisma/schema.prisma` - Notification model
- `src/components/NotificationBell.tsx` - Bell UI component
- `src/app/api/notifications/` - API routes
- `src/lib/notifications.ts` - Helper functions
