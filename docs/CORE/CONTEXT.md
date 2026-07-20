# Context - Zenvas v2

## What is Zenvas?

**Zenvas** is a universal operating system for creative businesses.

## The Problem

Creative businesses struggle with fragmented tools:
- Separate apps for project management, client communication, invoicing
- No unified view of operations
- Expensive, complex enterprise software overkill for small teams

## The Solution

Zenvas provides **one platform** for:
- **Project Management** - Tasks, stages, timelines
- **Client Management** - Leads, clients, contacts
- **Team Collaboration** - Roles, permissions, assignments
- **Business Operations** - Orders, invoicing, deliveries

## Design Philosophy

### Universal from Day One

Unlike platforms that force you into a specific business model, Zenvas adapts to how you work:

| Use Case | How Zenvas Supports It |
|----------|------------------------|
| **Video Production Studio** | Full order flow, client portal, invoicing |
| **Freelance Editor** | Projects, tasks, no mandatory client flow |
| **Design Agency** | Multi-brand, team management, approvals |
| **Content Creator** | Personal projects, portfolio management |

### Brand as Center

Everything in Zenvas revolves around a **Brand**:
- Your identity (name, logo, colors)
- Your clients and projects
- Your team members
- Your workflows

### Team Flexibility

**Roles**: OWNER, MANAGER, PRODUCER, EDITOR

**Brand Access**: Team members can access multiple brands based on permissions.

**Invite System**: Generate role-specific invite links for team onboarding.

## Core Modules

### 1. Human Capital OS
- User registration & roles
- Team management
- Brand access control
- Invite codes

### 2. Business OS
- Lead capture & qualification
- Client & contact management
- Order workflow
- Invoicing (via Odoo integration)

### 3. Project OS
- Project creation (with or without client)
- Stage-based task management
- Team assignment
- Client visibility control

### 4. Communication Module
- Client messaging
- System notifications
- Activity logs

## Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js

## Target Users

1. **Studio Owners** - Full control, serve clients
2. **Project Managers** - Manage projects & team
3. **Producers** - Oversee production
4. **Editors/Freelancers** - Execute work
5. **Clients** - View progress, approve deliverables

## Future Vision

Zenvas evolves into a complete **Business Operating System** for creative professionals:
- AI-powered workflows
- Resource management
- Financial dashboard
- Marketplace integration
