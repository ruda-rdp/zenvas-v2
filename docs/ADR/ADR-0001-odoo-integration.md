# ADR-0001: Integrate with Odoo for CRM, Invoicing, and Payment — Do Not Build These In Zenvas

Status: Accepted
Date: 2026-07-19
Depends On: FOUNDATION.md, BUSINESS_OS.md, CONTEXT.md

---

## Context

FOUNDATION.md already states "Zenvas is not an accounting application," yet
BUSINESS_OS.md listed Invoice and Payment as direct Business OS
responsibilities — a contradiction discovered while deciding how to handle
CRM, invoicing, and payments.

The Organization already self-hosts Odoo and is an experienced, satisfied
user of its Contacts, CRM, and Invoicing modules. The Organization's owner is
not a programmer (a videographer/businessman). Building and maintaining a
custom CRM/invoicing engine carries real risk: accounting logic is
regulation-sensitive (tax, multi-currency, compliance) and errors are costly.
Zenvas is needed urgently as the operational backbone for EPE Studio, whose
client-facing website is already live.

## Decision

Zenvas will **integrate** with self-hosted Odoo for Contacts, CRM,
Quotation, Invoice, Payment, and Accounting — not rebuild them.

Zenvas owns and builds, natively, only what Odoo does not provide and what
constitutes Zenvas's unique value:

- **Project OS** — creative execution workspace (review, revision, approval
  cycles specific to creative work)
- **Human Capital OS** — cross-brand Board, freelance/inhouse compensation,
  Wallet, and the Order-value confidentiality rule
- **Client Portal** — Brand-branded experience (per "Invisible
  Infrastructure"); financial data is fetched from Odoo behind the scenes,
  never exposing Odoo's own UI/branding to the Client
- **Mission Control** — cross-domain dashboard combining Business, Project,
  and People data, which no single system (Odoo included) provides

To avoid hard lock-in to Odoo (relevant for the Stage 2 multi-tenant SaaS
vision in FOUNDATION.md, where future organizations may not use Odoo),
Zenvas maintains its own lightweight `Order`, `Invoice`, and `Client`
records — reference + status only, synced from Odoo via API (XML-RPC/JSON-RPC),
not read/written directly against Odoo's internal tables. Odoo is treated as
a pluggable backend adapter, not a hard dependency baked into Zenvas's core
schema.

## Consequences

**Positive:**
- Removes a major technical risk from the owner's plate (accounting
  correctness) and moves it to mature, trusted software.
- Directly resolves the contradiction between FOUNDATION.md and
  BUSINESS_OS.md — Zenvas stays true to "not an accounting application."
- Lets Zenvas development focus entirely on Project OS and Human Capital OS,
  which are the genuinely novel, high-value parts of the product.
- Faster path to a usable backbone for EPE Studio.

**Negative / Risks to manage:**
- Two systems must stay in sync (Client, Order, Invoice data); sync logic
  and failure handling need to be designed carefully.
- Client Portal must present Odoo-sourced financial data without ever
  exposing Odoo's own interface or branding.
- Future Stage 2 organizations without Odoo will need an alternative
  adapter — the adapter pattern above exists specifically to make this
  swap possible later without redesigning Zenvas's core.

## Alternatives Considered

1. **Build CRM/Invoice/Payment fully custom in Zenvas.** Rejected: highest
   technical risk for a non-programmer owner, contradicts existing Foundation
   principle, slowest path to a working backbone.
2. **Use Odoo only for Contacts/CRM, build Invoice/Payment custom.**
   Rejected: invoicing/payment is the higher-risk, higher-compliance part —
   splitting it out from Odoo's Contacts/CRM removes the benefit while
   keeping the risk.
