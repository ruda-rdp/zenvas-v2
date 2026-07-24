# VIDEO_CALLS.md

**Status:** Phase 3 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md

---

# Purpose

Video Calls provides built-in video conferencing for client calls and team meetings. Includes screen sharing, recording, and calendar integration.

---

# Data Model

```prisma
// Video Room
model VideoRoom {
  id              String   @id @default(cuid())
  
  // Info
  name            String
  description     String?
  
  // Room settings
  settings        Json     @default("{}")
  // {
  //   "maxParticipants": 20,
  //   "enableRecording": true,
  //   "enableChat": true,
  //   "enableScreenShare": true,
  //   "muteOnJoin": false
  // }
  
  // Provider
  provider        VideoProvider @default(DAILY)
  
  // External room ID
  externalRoomId String?
  
  // Status
  status         RoomStatus @default(PENDING)
  
  // Scheduled
  scheduledAt    DateTime?
  duration       Int?       // in minutes
  
  // Recordings
  recordings     VideoRecording[]
  
  // Participants
  participants   VideoParticipant[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum VideoProvider {
  DAILY          // Daily.co
  ZOOM
  GOOGLE_MEET
  JITSI          // Self-hosted
  BUILT_IN       // WebRTC
}

enum RoomStatus {
  PENDING
  READY
  IN_USE
  ENDED
  RECORDING_ONLY
}

// Video Participant
model VideoParticipant {
  id              String   @id @default(cuid())
  
  roomId         String
  room           VideoRoom @relation(fields: [roomId], references: [id])
  
  userId         String?
  
  // Guest (not logged in)
  guestName      String?
  guestEmail     String?
  
  // In call
  joinedAt       DateTime?
  leftAt         DateTime?
  
  // Permissions
  canShare       Boolean  @default(true)
  canRecord      Boolean  @default(false)
  isHost         Boolean  @default(false)
  
  // Timestamps
  createdAt       DateTime @default(now())
}

// Video Recording
model VideoRecording {
  id              String   @id @default(cuid())
  
  roomId         String
  room           VideoRoom @relation(fields: [roomId], references: [id])
  
  // Recording info
  title          String?
  
  // External
  externalRecordingId String?
  
  // File
  fileUrl        String?
  duration        Int?       // seconds
  
  // Status
  status         RecordingStatus @default(PENDING)
  
  // Timestamps
  startedAt       DateTime?
  endedAt        DateTime?
  processedAt    DateTime?
}

enum RecordingStatus {
  PENDING
  RECORDING
  PROCESSING
  READY
  FAILED
}
```

---

# API Contracts

### POST `/api/video/rooms`
Create a video room.

```typescript
// Request
{
  "name": "Weekly Team Standup",
  "description": "Regular team sync",
  "maxParticipants": 15,
  "enableRecording": true,
  "enableChat": true
}

// Response 201 Created
{
  "id": "room_001",
  "name": "Weekly Team Standup",
  "joinUrl": "https://app.zenvas.com/video/room_001/join",
  "hostUrl": "https://app.zenvas.com/video/room_001/host"
}
```

### POST `/api/video/rooms/[id]/schedule`
Schedule a room.

```typescript
// Request
{
  "scheduledAt": "2026-07-22T10:00:00Z",
  "duration": 60,
  "participants": ["user_001", "user_002", "user_003"],
  "sendInvites": true
}

// Response 200 OK
```

### GET `/api/video/rooms/[id]/recordings`
Get recordings.

```typescript
// Response 200 OK
{
  "recordings": [
    {
      "id": "rec_001",
      "title": "Weekly Standup - Jul 15",
      "duration": 3600,
      "status": "READY",
      "fileUrl": "https://...",
      "recordedAt": "2026-07-15T10:30:00Z"
    }
  ]
}
```

---

# UI Components

## Video Room UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WEEKLY TEAM STANDUP                                          [⋮] [📞]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │                                                              │   │
│  │    ┌─────────┐        ┌─────────┐        ┌─────────┐     │   │
│  │    │  John   │        │  Sarah  │        │  Mike   │     │   │
│  │    │         │        │         │        │         │     │   │
│  │    │ [video] │        │ [video] │        │ [video] │     │   │
│  │    │         │        │         │        │         │     │   │
│  │    └─────────┘        └─────────┘        └─────────┘     │   │
│  │                                                              │   │
│  │    ┌─────────┐        ┌─────────┐                            │   │
│  │    │  Jane   │        │  Self   │                            │   │
│  │    │         │        │         │                            │   │
│  │    │ [video] │        │ [video] │                            │   │
│  │    └─────────┘        └─────────┘                            │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  [🎤 Mute] [📹 Video] [🖥️ Share] [💬 Chat] [⏺️ Record] [❌]    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Participants: 5/15 │ Recording: OFF │ Duration: 00:23:45           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] VideoRoom model
- [ ] VideoParticipant model
- [ ] VideoRecording model
- [ ] Video Provider Integration (Daily.co, Zoom, etc.)
- [ ] Room creation UI
- [ ] In-call UI
- [ ] Screen sharing
- [ ] Recording
- [ ] Chat integration
- [ ] Calendar integration
- [ ] Recording storage & playback

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
