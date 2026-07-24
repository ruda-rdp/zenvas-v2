# FILE_SHARING.md

**Status:** Phase 2 Module (Proposed)

**Depends On:**
- FOUNDATION.md
- APP_REGISTRY.md

---

# Purpose

File Sharing provides centralized storage for production files: scripts, storyboards, footage, assets, and deliverables. Includes version control, permissions, and share links.

---

# Data Model

```prisma
// Folder
model FileFolder {
  id              String   @id @default(cuid())
  
  name            String
  
  // Hierarchy
  parentId       String?
  parent         FileFolder? @relation("FolderHierarchy", fields: [parentId], references: [id])
  children       FileFolder[] @relation("FolderHierarchy")
  
  // Organization
  organizationId String
  productionId   String?
  
  // Permissions
  permissions   FilePermission[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// File
model ProductionFile {
  id              String   @id @default(cuid())
  
  name            String
  type            String   // MIME type
  
  // Storage
  storageProvider  StorageProvider @default(LOCAL)
  storageKey      String   // Key in storage
  
  // Size
  size            Int      // bytes
  
  // Folder
  folderId       String?
  folder         FileFolder? @relation(fields: [folderId], references: [id])
  
  // Organization
  organizationId String
  
  // Metadata
  uploadedBy     String
  uploadedAt    DateTime @default(now())
  
  // Versioning
  versions       FileVersion[]
  currentVersion String?
  
  // Permissions
  permissions   FilePermission[]
  
  // Status
  status         FileStatus @default(ACTIVE)
  
  updatedAt       DateTime @updatedAt
}

enum StorageProvider {
  LOCAL
  S3
  GOOGLE_DRIVE
  DROPBOX
  FRAMEIO
}

enum FileStatus {
  ACTIVE
  ARCHIVED
  DELETED
}

// File Version
model FileVersion {
  id              String   @id @default(cuid())
  
  fileId         String
  file           ProductionFile @relation(fields: [fileId], references: [id])
  
  versionNumber   Int
  
  // Storage
  storageKey      String
  size            Int
  
  // Info
  uploadedBy     String
  uploadedAt    DateTime @default(now())
  
  // Notes
  notes          String?
}

// File Permission
model FilePermission {
  id              String   @id @default(cuid())
  
  // Target
  fileId         String?
  folderId       String?
  
  // Who
  type           PermissionType  // USER, TEAM, ROLE
  userId         String?
  teamId         String?
  role           String?
  
  // Permission
  permission     Permission
  
  createdAt       DateTime @default(now())
}

enum PermissionType {
  USER
  TEAM
  ROLE
  PUBLIC
}

enum Permission {
  READ
  WRITE
  ADMIN
}

// Share Link
model FileShareLink {
  id              String   @id @default(cuid())
  
  fileId         String?
  folderId       String?
  
  // Access
  token           String   @unique
  
  // Restrictions
  password        String?  // Hashed
  expiresAt       DateTime?
  maxDownloads    Int?
  
  // Tracking
  downloadCount   Int      @default(0)
  
  // Creator
  createdBy      String
  createdAt       DateTime @default(now())
  
  // Status
  active         Boolean  @default(true)
}
```

---

# API Contracts

### GET `/api/files`
List files.

```typescript
// Request
GET /api/files?folderId=folder_001

// Response 200 OK
{
  "folders": [
    { "id": "f_001", "name": "Scripts", "fileCount": 5 }
  ],
  "files": [
    {
      "id": "file_001",
      "name": "Ep3_Script_v4.pdf",
      "type": "application/pdf",
      "size": 2500000,
      "currentVersion": "4",
      "uploadedBy": { "name": "Jane Screenwriter" },
      "updatedAt": "2026-07-21T10:30:00Z"
    }
  ]
}
```

### POST `/api/files/upload`
Upload file.

```typescript
// Request: multipart/form-data
{
  "file": (binary),
  "folderId": "folder_001",
  "notes": "Updated with new ending"
}

// Response 201 Created
```

### GET `/api/files/[id]`
Get file details.

```typescript
// Response 200 OK
{
  "id": "file_001",
  "name": "Ep3_Script_v4.pdf",
  "versions": [
    { "version": 4, "uploadedBy": "Jane", "uploadedAt": "2026-07-21" },
    { "version": 3, "uploadedBy": "Jane", "uploadedAt": "2026-07-20" }
  ]
}
```

### POST `/api/files/[id]/share`
Create share link.

```typescript
// Request
{
  "expiresInDays": 7,
  "password": "secret123"
}

// Response 200 OK
{
  "url": "https://app.zenvas.com/share/abc123"
}
```

---

# UI Components

## File Browser

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FILES - Episode 3                                         [+ New] [Upload]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 📁 Scripts    │ 📁 Storyboards   │ 📁 Camera      │ 📁 Audio │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  📁 ../ │ 📁 Scripts │ 📁 Storyboards │ 📁 Camera │ 📁 Audio     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ NAME              │ TYPE   │ SIZE    │ UPDATED    │ BY   │   │
│  │────────────────────────────────────────────────────────────────│   │
│  │ ☐ │ 📁 Production     │       │         │            │      │   │
│  │ ☐ │ 📁 Cast          │       │         │            │      │   │
│  │ ☐ │ 📁 Location      │       │         │            │      │   │
│  │ ☐ │ Ep3_Script_v4.pdf│ PDF   │ 2.5 MB │ Jul 21   │ Jane │   │
│  │ ☐ │ Ep3_Board_v2.pdf │ PDF   │ 15 MB  │ Jul 20   │ John │   │
│  │ ☐ │ ShotList_Ep3.xlsx│ Excel │ 150 KB │ Jul 19   │ Jane │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  3 folders, 3 files │ Selected: 0 │ Storage: 2.3 GB / 10 GB       │
│                                                                          │
│  [Download] [Share] [Move] [Delete]                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

- [ ] FileFolder model
- [ ] ProductionFile model
- [ ] FileVersion model
- [ ] FilePermission model
- [ ] FileShareLink model
- [ ] Storage Integration (S3, Google Drive, Frame.io)
- [ ] GET /api/files endpoint
- [ ] POST /api/files/upload endpoint
- [ ] GET /api/files/[id] endpoint
- [ ] POST /api/files/[id]/share endpoint
- [ ] File Browser UI
- [ ] Folder Navigation
- [ ] Drag & Drop Upload
- [ ] Version History
- [ ] Share Links
- [ ] Permissions
- [ ] Search

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
