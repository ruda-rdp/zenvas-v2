# ADR-0004: Payment Gateway Strategy for International Clients

**Status:** Proposed
**Date:** 2026-07-20
**Depends On:** ADR-0001-odoo-integration.md, BUSINESS_OS.md

---

## Context

EPE Studio has **90% international clients**, requiring payment solutions that support:
- International credit cards and payment methods
- Multi-currency (USD, EUR, etc.)
- Settlement to Indonesian bank account

Current approach (manual transfer → Happy confirm in Odoo) works but is not optimal for international clients who expect modern payment options.

---

## Decision

Implement a **multi-gateway approach** with gradual integration:

### Payment Gateway Stack (Priority Order)

| Priority | Gateway | Status | Notes |
|----------|---------|--------|-------|
| 1 | **PayPal** | Primary | Client already familiar; PayPal.me links or invoices |
| 2 | **LemonSqueezy** | To try | Creator-friendly, good API, global payouts |
| 3 | **Creem.io** | To try | Creator-focused, alternative |
| 4 | **Manual/Wire Transfer** | Fallback | Bank transfer / Payoneer details |

### Payment Flow (Phase 1)

```
┌─────────────────────────────────────────────────────────────────┐
│  PAYMENT FLOW (Phase 1)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Zenvas generates Invoice (from Odoo)                       │
│                                                                  │
│  2. Client Portal shows payment options:                        │
│     ├── "Pay with PayPal" → PayPal.me link                     │
│     ├── "Pay with Card" → LemonSqueezy/Creem checkout          │
│     └── "Wire Transfer" → Bank details / Payoneer               │
│                                                                  │
│  3. Client pays (outside Zenvas)                               │
│                                                                  │
│  4. Happy sees payment in:                                      │
│     ├── PayPal dashboard                                        │
│     ├── Payment gateway dashboard                               │
│     └── Bank statement                                          │
│                                                                  │
│  5. Happy manually confirms payment in Zenvas/Odoo             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Points

1. **Phase 1 = Manual Confirmation**
   - Happy confirms payment manually after seeing it in gateway/bank
   - Fast to implement, validates gateway choices
   - Odoo Invoice status updated by Happy

2. **Phase 2+ = Webhook Integration**
   - Auto-confirm when payment received via webhook
   - Sync payment status automatically
   - Requires gateway API integration

3. **Payoneer Integration Note**
   - Payoneer is a **receiving platform**, not a payment gateway
   - Client transfers to PayPal/card → money to Payoneer → withdraw to IDR
   - Zenvas shows Payoneer details as "Wire Transfer" option
   - No direct Payoneer API integration needed

4. **No Odoo Payment Module**
   - Payment collection happens via external gateways
   - Odoo only records confirmed payments (Happy input)
   - Maintains Odoo as accounting source of truth

---

## Consequences

**Positive:**
- Supports 90% international client base
- Flexible - can try multiple gateways to find best fit
- Phase 1 is fast to implement (manual confirmation)
- No complex payment processing in Zenvas initially

**Negative / Risks:**
- Manual confirmation is not ideal for scale
- Multiple gateways = multiple dashboards to check
- Currency conversion handled by gateway (fees apply)

**Trade-offs:**
- Speed of implementation vs. full automation
- Gateway fees vs. client convenience

---

## Alternatives Considered

1. **Stripe** — Excellent for international, but does not support Indonesia registration. Not viable.
2. **Midtrans/Xendit** — Domestic focus, not ideal for international clients.
3. **Single gateway only** — Risky if gateway has issues; multi-gateway provides backup.
4. **Build custom payment integration** — High complexity, regulatory risk, not core to Zenvas value.

---

## Implementation Notes

### PayPal (Priority 1)
- Use PayPal.me for simple link-based payments
- Or PayPal invoicing for formal invoices
- Client pays → Happy checks PayPal → confirms in Zenvas

### LemonSqueezy/Creem (Priority 2-3)
- Create checkout links programmatically
- Webhook for payment confirmation (Phase 2)
- Test with one product/service first

### Manual/Wire Transfer
- Show bank account details or Payoneer email
- Client initiates transfer manually
- Happy confirms when funds arrive

---

*Last updated: 2026-07-20*
