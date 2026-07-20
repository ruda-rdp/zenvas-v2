# LEAD_MANAGEMENT.md

**Status:** Locked v1.0 (Finalized based on business requirements)

**Depends On:**
- FOUNDATION.md
- BUSINESS_OS.md
- CONTEXT.md
- MVP_ROADMAP.md
- ADR-0001-odoo-integration.md

---

# Purpose

Lead Management fills the critical gap between "Client discovers Brand" and "Order is created." 

Without this module, EPE-001 and EPE-002 scenarios cannot work — Happy has no place to capture, qualify, and convert incoming leads.

---

# The Problem It Solves

```
TODAY (Gap):
Lead comes in → Where does it go? → Nowhere in current architecture

NEEDED:
Lead comes in → Happy captures → Qualifies → Converts to Order → Project created
```

---

# Lead Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEAD LIFECYCLE                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │   NEW      │───▶│  QUALIFIED  │───▶│ CONVERTED   │                │
│  │            │    │             │    │             │                │
│  │ First      │    │ Budget      │    │ Order       │                │
│  │ contact,   │    │ confirmed,  │    │ created,    │                │
│  │ source     │    │ timeline    │    │ Project     │                │
│  │ captured   │    │ agreed      │    │ started      │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
│        │                  │                   │                        │
│        │                  │                   │                        │
│        ▼                  ▼                   ▼                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  LOST       │    │  ON HOLD    │    │  WON        │              │
│  │             │    │             │    │             │              │
│  │ Budget too  │    │ Waiting     │    │ Project     │              │
│  │ low, no     │    │ client     │    │ delivered,  │              │
│  │ response    │    │ decision   │    │ client      │              │
│  │             │    │             │    │ happy       │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Core Objects

## Lead

```typescript
interface Lead {
  id: string;
  brandId: string;                    // Which brand this lead belongs to
  
  // Contact Info
  name: string;
  email?: string;
  phone?: string;
  company?: string;                   // For B2B leads
  
  // Source Tracking
  source: LeadSource;
  sourceDetails?: string;             // e.g., "Facebook DM", "Website form", "Referral"
  sourceUrl?: string;                 // Link to original inquiry
  sourceCampaign?: string;             // UTM tracking if applicable
  
  // Qualification
  status: LeadStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  interest: string;                   // What they want: "Villa video", "Wedding film"
  budget?: string;                    // "Rp 5-8 juta", "IDR 10-15jt"
  budgetNumeric?: number;             // Parsed for reporting
  timeline?: string;                  // "ASAP", "2 weeks", "Next month"
  timelineDays?: number;              // Parsed for sorting
  
  // Tags for filtering
  tags: string[];                    // ["#realestate", "#seminyak", "#urgent"]
  
  // Qualification Notes
  qualificationNotes: string;         // WhatsApp conversation, client preferences
  referenceLinks?: string[];          // Google Maps, reference videos, etc.
  
  // Conversion Link
  orderId?: string;                   // Once converted, links to Order
  clientId?: string;                  // Auto-created Client record
  
  // Metadata
  createdAt: DateTime;
  updatedAt: DateTime;
  lastContactedAt?: DateTime;
  assignedTo?: string;                // User who owns this lead (Happy usually)
  
  // Auto-calculated
  daysSinceCreated: number;           // For stale detection
  daysSinceContact: number;           // For follow-up reminders
}

enum LeadSource {
  WEBSITE_FORM = 'website_form',      // studio.eatprayedit.com form
  FACEBOOK_DM = 'facebook_dm',        // Facebook Messenger
  INSTAGRAM_DM = 'instagram_dm',     // Instagram DM
  WHATSAPP = 'whatsapp',             // Direct WhatsApp
  PHONE_CALL = 'phone_call',         // Phone inquiry
  REFERRAL = 'referral',             // Word of mouth
  GOOGLE_SEARCH = 'google_search',    // Found via search
  EMAIL = 'email',                   // Direct email
  WALK_IN = 'walk_in',              // Physical visit
  OTHER = 'other'
}

enum LeadStatus {
  NEW = 'new',                       // Just came in
  QUALIFIED = 'qualified',           // Budget/timeline confirmed
  ON_HOLD = 'on_hold',              // Waiting for client
  CONVERTED = 'converted',          // Order created
  LOST = 'lost',                    // Didn't convert
  WON = 'won'                       // Project completed (post-conversion win)
}
```

---

# Lead Qualification Flow

## Step 1: Capture (NEW)

```typescript
// When a lead comes in (manual or via Communication Module integration)
const lead = await createLead({
  brandId: 'epe-studio',
  name: 'Budi Santoso',
  phone: '+6281234567890',
  source: 'FACEBOOK_DM',
  sourceDetails: 'Facebook Messenger — Ruda\'s DM from yesterday',
  interest: 'Villa in Seminyak, 60s video',
  budget: 'Rp 5-8 juta',
  timeline: 'ASAP (listing goes live in 2 weeks)',
  tags: ['#realestate', '#seminyak', '#urgent'],
  priority: 'HIGH',
  assignedTo: 'happy-user-id'
});
```

## Step 2: Qualify (QUALIFIED)

```typescript
// Happy contacts via WhatsApp, confirms details
await updateLead(lead.id, {
  status: 'QUALIFIED',
  budgetNumeric: 6000000,           // Rp 6 juta confirmed
  timelineDays: 14,                 // 2 weeks
  qualificationNotes: `
    Budget confirmed: Rp 6 juta
    Villa location: [Google Maps link]
    Client can provide drone footage
    Client has reference videos (likes cinematic style)
    Prefers quick turnaround
  `,
  referenceLinks: [
    'https://maps.google.com/...',  // Villa location
    'https://drive.google.com/...'   // Reference videos
  ],
  lastContactedAt: new Date()
});
```

## Step 3: Convert (CONVERTED → ORDER)

```typescript
// One-click convert: creates Client + Order + Project
const conversion = await convertLeadToOrder(lead.id, {
  serviceId: 'real-estate-video-standard',  // From EPE's service catalog
  createProject: true,                       // Auto-create project
  autoAssignTasks: true                      // From service template
});

// This creates:
// - Client record (Budi Santoso)
// - Order (Draft status)
// - Project (RE-Seminyak Villa)
// - All Stages and Tasks from template
// - Links everything together
```

---

# Lead Dashboard (Mission Control Integration)

```typescript
interface LeadDashboard {
  // Summary counts
  totalLeads: number;
  newThisWeek: number;
  qualifiedThisWeek: number;
  convertedThisWeek: number;
  lostThisWeek: number;
  
  // Priority view
  urgentLeads: Lead[];           // URGENT priority, needs immediate action
  highPriorityLeads: Lead[];      // HIGH priority
  staleNewLeads: Lead[];         // NEW status, > 48h without contact
  staleQualifiedLeads: Lead[];   // QUALIFIED, > 7 days without conversion
  
  // Pipeline view (Kanban)
  pipeline: {
    new: Lead[];
    qualified: Lead[];
    onHold: Lead[];
    converted: Lead[];
  };
  
  // Source analytics
  sourceBreakdown: {
    source: LeadSource;
    count: number;
    conversionRate: number;
  }[];
}
```

---

# Quick Actions

```
┌─────────────────────────────────────────────────────────────────┐
│  LEAD QUICK ACTIONS                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  From Lead List (Kanban or Table view):                         │
│                                                                  │
│  [📞 Call]      — Opens WhatsApp/call with pre-filled context  │
│  [💬 Message]    — Quick WhatsApp message template              │
│  [⭐ Qualify]    — Opens qualification form                     │
│  [🔄 Convert]   — Converts to Order (if qualified)              │
│  [📝 Note]      — Add note/conversation log                     │
│  [🏷️ Tag]       — Add/remove tags                             │
│  [⏰ Remind]     — Set follow-up reminder                        │
│  [❌ Lost]       — Mark as lost with reason                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Stale Lead Detection

```typescript
// Automatic reminders based on lead state
const staleRules = [
  {
    condition: 'status === NEW && daysSinceCreated > 1',
    action: 'REMINDER',
    message: 'New lead from {source} has not been contacted for 24h',
    priority: 'MEDIUM'
  },
  {
    condition: 'status === QUALIFIED && daysSinceContact > 3',
    action: 'URGENT_REMINDER',
    message: 'Qualified lead awaiting conversion for 3+ days',
    priority: 'HIGH'
  },
  {
    condition: 'priority === URGENT && status !== CONVERTED && daysSinceCreated > 2',
    action: 'CRITICAL_ALERT',
    message: 'URGENT lead not converted within 48h!',
    priority: 'CRITICAL'
  }
];
```

---

# Lead Template Suggestions (Smart Matching)

When a lead comes in, Zenvas can suggest which Service Template to use based on tags and keywords:

```typescript
const templateSuggestions = await suggestTemplates(lead) 
  // Input: { tags: ['#realestate'], interest: 'Villa video 60s' }
  // Output: 
  [
    { service: 'Real Estate Video Standard', confidence: 0.95 },
    { service: 'Social Media Video', confidence: 0.3 }
  ];
```

---

# Communication Module Integration (Future)

Lead Management is designed to integrate with Communication Module:

```typescript
// When Communication Module captures a message from Facebook/WhatsApp:
interface IncomingMessage {
  platform: 'facebook' | 'whatsapp' | 'instagram';
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  message: string;
  timestamp: Date;
}

// Auto-create lead if new sender
const lead = await autoCreateLeadFromMessage(message);
// Or link to existing lead if sender is known
```

---

# Revenue Pipeline Reporting

```typescript
interface LeadPipelineReport {
  period: { start: Date; end: Date };
  
  // Funnel metrics
  leadsIn: number;
  qualifiedRate: number;           // qualified / new
  conversionRate: number;          // converted / qualified
  
  // Value metrics
  totalPotentialValue: number;     // Sum of all lead budgets
  avgDealSize: number;            // Average converted deal
  pipelineValue: number;           // Qualified + On Hold leads
  
  // Source performance
  bestSource: LeadSource;          // Highest conversion rate
  worstSource: LeadSource;         // Lowest conversion rate
  
  // Velocity
  avgDaysToQualify: number;
  avgDaysToConvert: number;
}
```

---

# Out of Scope

- **Lead scoring (complex)** — simple priority (LOW/HIGH) is enough for Phase 1
- **Lead nurturing sequences** — Phase 3+ if Communication Module grows
- **Lead assignment rules** — manual assignment is fine for now

---

# Open Items

1. How does a website form submission automatically create a Lead?
   - Depends on Communication Module (Phase 2+)
   - Phase 1: Manual entry by Happy is acceptable
2. Lead deduplication — same person, different sources?
3. Integration with Facebook/WhatsApp Business API
4. Lead-to-Client merge if same person inquiries for different services

---

# Test Scenarios

See TEST-SCENARIOS.md:
- **EPE-001**: Lead comes in → Captured → Qualified → Converted
- **EPE-002**: Multiple leads handled, template matching, priority management

---

# Business Requirements (Finalized 2026-07-20)

## Dual-Path Lead Acquisition

Based on client type and communication preferences:

### Path 1: Self-Service (Small Clients / Individual)
For clients who prefer digital onboarding:
1. Client discovers brand via social media/Google
2. Happy shares link to `studio.eatprayedit.com`
3. Client creates account and submits inquiry via website form
4. Lead auto-created in Zenvas
5. Happy qualifies and converts

### Path 2: Manual (Enterprise / B2B Clients)
For clients like PT Pupuk Kalimantan Timur who are too busy for self-service:
1. Client inquiry comes via email, phone, or meeting
2. Happy manually creates Lead in Zenvas
3. Happy qualifies (confirm budget, timeline, requirements)
4. Happy creates Project directly if client is ready
5. Odoo sync happens automatically for contact creation

## Odoo Integration

Per ADR-0001-odoo-integration.md:
- Every new Client created from Lead conversion **must** create a Contact in Odoo
- Odoo is the source of truth for Client records
- Zenvas syncs with Odoo for Client data
- If Odoo sync fails, notify Owner with error details

## Lead Source Tracking

All leads must track their source for reporting:
- This informs marketing decisions (which channel produces best clients)
- Source is captured at Lead creation time
- Conversion rate per source is tracked in LeadDashboard

## Editor/Freelancer Note

Lead Management is for **Client Acquisition** only.
- Leads are managed by Owner/Manager (Happy/Ruda)
- Editor/Freelancer does not have access to Lead Management
- Editor sees only their assigned Tasks and Board opportunities
