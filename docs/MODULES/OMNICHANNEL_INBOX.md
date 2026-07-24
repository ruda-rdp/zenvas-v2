# OMNICHANNEL_INBOX.md

> **Catatan:** Dokumen ini soal mengumpulkan pesan dari kanal eksternal (Facebook, WhatsApp, Website chat) ke satu inbox. Ini **berbeda** dari App "Team Chat" (`docs/ARCHITECTURE/APP_REGISTRY.md`) yang sudah dibangun untuk komunikasi internal antar anggota tim.

---

**Purpose:** Unified communication hub — all messages from all channels flow into Zenvas.

**Phase:** Post-MVP (Phase 2+)

---

## Philosophy

Clients use whatever platform they're comfortable with (Facebook Messenger, WhatsApp, website chat). The studio shouldn't juggle 5 apps — everything flows into Zenvas unified inbox.

---

## Unified Inbox

```
┌─────────────────────────────────────────────────────────────────────────┐
│  INBOX — All Messages                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  💬 Budi Santoso (Facebook)                               2m ago    │
│     "Hi, villa-nya masih available untuk next week?"                │
│     Project: RE-Seminyak Villa (Lead)                                │
│                                                                          │
│  💬 Maya Dewi (WhatsApp)                                 15m ago    │
│     "Westin permit confirmed ✅"                                       │
│     Project: Westin Commercial                                        │
│                                                                          │
│  💬 Website Chat (Anonymous)                            1h ago     │
│     "Hi, interested in wedding videography"                          │
│     New Lead: Website Inquiry #123                                     │
│                                                                          │
│  💬 Diaz Wedding (Facebook)                             2h ago     │
│     "Love the teaser! One question about music"                      │
│     Project: Wedding-DiazSarah                                        │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Channels: [All ▼] [Facebook] [WhatsApp] [Website] [Zenvas]        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Channel Integrations

### 1. Facebook Messenger

- Connect via Meta Business API
- Messages from Facebook Page → appear in Zenvas inbox
- Reply from Zenvas → goes to client's Facebook Messenger
- Auto-link to Lead/Project if Facebook profile matches

### 2. WhatsApp Business

- Connect via WhatsApp Business API (Meta)
- Messages from WhatsApp → appear in Zenvas inbox
- Reply from Zenvas → goes to client's WhatsApp
- Auto-link to Lead/Project if phone number matches

### 3. Website Chat Widget

- Like Odoo — installable chat bubble on studio.eatprayedit.com
- Visitors chat directly → appears in Zenvas inbox
- Anonymous visitors prompted to register/create lead
- Chat history saved even after visitor leaves

### 4. Zenvas Internal Chat (existing)

- Team communication
- Per-project threads
- AI chat (Phase 2)

**Note:** The internal chat is now implemented as the "Team Chat" App (see `docs/ARCHITECTURE/APP_REGISTRY.md`). This module focuses on **external** client communications only.

---

## Website Chat Widget (Odoo Style)

```
studio.eatprayedit.com

                    ┌─────────────────────────┐
                    │ 💬 Chat with us!       │
                    │    3 new messages     │
                    └─────────────────────────┘
                                                    [widget]

When clicked:

┌─────────────────────────────────────────────────────────┐
│  EPE Studio — Live Chat                            [—][×] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Bot: Hi! Welcome to EPE Studio. How can we help?     │
│        [ Real Estate Video ▾ ]                         │
│        [ Wedding Films ]                                │
│        [ Other ]                                        │
│                                                          │
│  You: Real Estate Video                                 │
│                                                          │
│  Bot: Great! Tell us about your property:              │
│        • Location?                                      │
│        • Timeline?                                       │
│        • Budget?                                        │
│                                                          │
│  You: Villa di Seminyak, ASAP, 6 juta                  │
│                                                          │
│  Bot: Perfect! Let me connect you with our team.       │
│        Happy will be with you shortly.                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [Type a message...]                          [Send ➤] │
└─────────────────────────────────────────────────────────┘
```

---

## Message Linking

### 1. Match by Contact Info

- Phone number matches → Link to Client/Talent
- Facebook ID matches → Link to Client/Talent
- Email matches → Link to Client/Talent

### 2. Match by Context

- "villa" + "Seminyak" + "ASAP" → Suggest RE template
- "wedding" + "Uluwatu" → Suggest Balistory
- Previous project mentioned → Link to that project

### 3. Auto-Create Lead

If no match, create new Lead:
- Name: From chat or "Anonymous #123"
- Source: Facebook/WhatsApp/Website
- Tags: Auto-tagged based on conversation keywords

---

## Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  OMNICHANNEL INBOX ARCHITECTURE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           ┌─────────────────────────────────────────┐   │
│                           │          ZENVAS BACKEND                 │   │
│                           │                                         │   │
│                           │   ┌─────────────────────────────────┐   │   │
│                           │   │      MESSAGE AGGREGATOR        │   │   │
│                           │   │   (unified inbox API)          │   │   │
│                           │   └───────────┬───────────────────┘   │   │
│                           │               │                       │   │
│                           │   ┌───────────┴───────────────────┐   │   │
│                           │   │        CONVERSATION DB        │   │   │
│                           │   │   (linked to leads/projects)  │   │   │
│                           │   └───────────────────────────────┘   │   │
│                           │                                         │   │
│                           └───────────┬───────────────────────────┘   │
│                                       │                               │
│  ┌────────────────────────────────────┼────────────────────────────┐   │
│  │                                    │                             │   │
│  │   ┌──────────────┐    ┌───────────┴────┐    ┌──────────────┐   │   │
│  │   │   FACEBOOK   │    │   WHATSAPP    │    │   WEBSITE    │   │   │
│  │   │   MESSENGER  │    │   BUSINESS    │    │   CHAT       │   │   │
│  │   │              │    │               │    │   WIDGET      │   │   │
│  │   │ Meta API     │    │ Meta WA API   │    │ zenvas.chat.js   │   │
│  │   └──────────────┘    └───────────────┘    └──────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Planning

### Phase 2: Website Chat Widget
- Installable chat bubble (Odoo-style)
- Auto-create leads from conversations
- Basic bot/auto-reply
- Script for studio.eatprayedit.com

### Phase 3: WhatsApp Integration
- WhatsApp Business API connection
- Auto-link by phone number
- Reply from Zenvas → goes to WhatsApp
- Notify team of new messages

### Phase 4: Facebook Messenger Integration
- Meta Business API connection
- Auto-link by Facebook profile
- Reply from Zenvas → goes to Messenger
- Import existing Facebook leads

### Phase 5: AI Enhancement
- Smart auto-reply bot
- Lead qualification chatbot
- Sentiment analysis
- Response time optimization

---

## Settings > Integrations

All integrations in one place, like Odoo Settings > Apps/Integrations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Settings — KreatifProduction                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔌 Integrations                                                  │   │
│  │  │                                                               │   │
│  │  │ COMMUNICATION                                                 │   │
│  │  │ • Facebook Messenger [● ON]                                  │   │
│  │  │ • WhatsApp Business [○ OFF]                                  │   │
│  │  │ • Website Chat Widget [● ON]                                 │   │
│  │  │                                                               │   │
│  │  │ CALENDAR & SCHEDULING                                        │   │
│  │  │ • Google Calendar [● ON]                                      │   │
│  │  │                                                               │   │
│  │  │ STORAGE                                                       │   │
│  │  │ • Google Drive [● ON]                                        │   │
│  │  │                                                               │   │
│  │  │ PROJECT MANAGEMENT                                           │   │
│  │  │ • ClickUp [○ OFF]                                             │   │
│  │  │                                                               │   │
│  │  │ FORMS & LEADS                                                │   │
│  │  │ • Tally [○ OFF]                                              │   │
│  │  │                                                               │   │
│  │  │ VIDEO & REVIEW                                               │   │
│  │  │ • Frame.io [○ OFF]                                           │   │
│  │  │ • Vimeo [○ OFF]                                              │   │
│  │  │                                                               │   │
│  │  │ ACCOUNTING                                                   │   │
│  │  │ • Odoo [● ON]                                                │   │
│  │  │                                                               │   │
│  │  │ MORE COMING SOON                                              │   │
│  │  │ • Slack, Dropbox, Notion, Zapier, Make.com                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Categories

| Category | Integrations |
|----------|-------------|
| **Communication** | Facebook Messenger, WhatsApp Business, Website Chat Widget |
| **Calendar & Scheduling** | Google Calendar |
| **Storage** | Google Drive, Dropbox |
| **Project Management** | ClickUp |
| **Forms & Leads** | Tally |
| **Video & Review** | Frame.io, Vimeo, YouTube |
| **Accounting** | Odoo |
| **Notifications** | Slack, Microsoft Teams |
| **Automation** | Zapier, Make.com |
| **Documentation** | Notion |

---

## Technical Considerations

| Platform | API | Cost | Complexity |
|---------|-----|------|------------|
| WhatsApp Business | Meta | ~$0.05/message + approval | Medium |
| Facebook Messenger | Meta Graph API | Free (with limits) | Medium |
| Website Chat | Custom/Socket | Host yourself | Low |
| Email | SMTP/IMAP | Free | Low |

**Note:** Meta APIs require Facebook Business verification and app approval. Plan 2-4 weeks for setup.

---

## Module Interface

```typescript
interface Integration {
  id: string;
  name: string;
  icon: string;
  category: 'communication' | 'calendar' | 'storage' | 'project' | 'forms' | 'video' | 'accounting';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  actions: IntegrationAction[];
  stats: IntegrationStats;
}

interface IntegrationStats {
  messagesThisMonth: number;
  lastSync: Date;
  status: 'healthy' | 'warning' | 'error';
}
```

---

**Document History:**
- v0.1 (2026-07-21): Initial draft
- v0.2 (2026-07-24): Renamed to OMNICHANNEL_INBOX.md to clarify distinction from Team Chat app (D15)
