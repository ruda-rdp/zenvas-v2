/**
 * Confidentiality guarantees — tests the REAL implementation in lib/authorize.ts.
 *
 * NOTE: unlike authorize.test.ts (which re-defines *copies* of the logic and can
 * therefore drift from the real code), this file imports the actual exported
 * helpers. lib/authorize.ts pulls in @/lib/db (throws without DATABASE_URL) and
 * @/lib/auth (next-auth), so we mock those — the confidentiality helpers under
 * test are pure and use neither.
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {}, default: {} }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import {
  stripConfidentialFields,
  stripConfidentialFieldsArray,
  stripTaskPayout,
  enforceConfidentiality,
} from "@/lib/authorize";
import type { Role } from "@/generated/prisma";

const makeOrder = (): Record<string, unknown> => ({
  id: "o1",
  status: "CONFIRMED",
  service: { id: "s1", name: "Wedding Film", price: 5000000 },
  client: { id: "c1", name: "Acme", budget: 8000000 },
  payoutAmount: 1200000,
});

describe("stripConfidentialFields (money) — real impl", () => {
  it("preserves all money for OWNER and MANAGER", () => {
    for (const role of ["OWNER", "MANAGER"] as Role[]) {
      const out = stripConfidentialFields(makeOrder(), role) as any;
      expect(out.service.price).toBe(5000000);
      expect(out.client.budget).toBe(8000000);
      expect(out.payoutAmount).toBe(1200000);
    }
  });

  it("redacts nested money for EDITOR and PRODUCER, keeps non-money", () => {
    for (const role of ["EDITOR", "PRODUCER"] as Role[]) {
      const out = stripConfidentialFields(makeOrder(), role) as any;
      expect(out.service.price).toBe("[REDACTED]");
      expect(out.client.budget).toBe("[REDACTED]");
      expect(out.payoutAmount).toBe("[REDACTED]");
      expect(out.service.name).toBe("Wedding Film");
      expect(out.status).toBe("CONFIRMED");
    }
  });

  it("ANTI-LEAK: no raw money value survives anywhere in EDITOR payload", () => {
    const json = JSON.stringify(stripConfidentialFields(makeOrder(), "EDITOR" as Role));
    expect(json).not.toContain("5000000");
    expect(json).not.toContain("8000000");
    expect(json).not.toContain("1200000");
  });

  it("does not mutate the original object", () => {
    const original = makeOrder();
    stripConfidentialFields(original, "EDITOR" as Role);
    expect((original as any).service.price).toBe(5000000);
  });
});

describe("stripConfidentialFieldsArray — real impl", () => {
  it("redacts each item for EDITOR, preserves for MANAGER", () => {
    const arr = [makeOrder(), makeOrder()];
    (stripConfidentialFieldsArray(arr, "EDITOR" as Role) as any[]).forEach((o) =>
      expect(o.service.price).toBe("[REDACTED]")
    );
    (stripConfidentialFieldsArray(arr, "MANAGER" as Role) as any[]).forEach((o) =>
      expect(o.service.price).toBe(5000000)
    );
  });
});

describe("stripTaskPayout — real impl", () => {
  const makeTask = (): Record<string, unknown> => ({
    id: "t1",
    name: "Edit",
    payout: { id: "p1", amount: 500000 },
    children: [{ id: "t2", name: "Color", payout: { id: "p2", amount: 200000 } }],
  });

  it("removes payout across the whole task tree for EDITOR/PRODUCER", () => {
    for (const role of ["EDITOR", "PRODUCER"] as Role[]) {
      const out = stripTaskPayout(makeTask(), role) as any;
      expect(out.payout).toBeUndefined();
      expect(out.children[0].payout).toBeUndefined();
      expect(out.name).toBe("Edit");
    }
  });

  it("keeps payout for OWNER/MANAGER", () => {
    const out = stripTaskPayout(makeTask(), "OWNER" as Role) as any;
    expect(out.payout).toBeDefined();
    expect(out.children[0].payout).toBeDefined();
  });
});

describe("enforceConfidentiality (allowlist) — real impl", () => {
  it("keeps only allowlisted fields for EDITOR (drops contact + money)", () => {
    const lead = {
      id: "l1", name: "X", status: "NEW", priority: "HIGH",
      email: "a@b.com", phone: "0812", budget: "5jt", budgetNumeric: 5000000,
    };
    const out = enforceConfidentiality(lead, "EDITOR" as Role) as any;
    expect(out.id).toBe("l1");
    expect(out.status).toBe("NEW");
    expect(out.email).toBeUndefined();
    expect(out.phone).toBeUndefined();
    expect(out.budget).toBeUndefined();
    expect(out.budgetNumeric).toBeUndefined();
  });

  it("returns the full object for OWNER", () => {
    const out = enforceConfidentiality({ id: "l1", email: "a@b.com" }, "OWNER" as Role) as any;
    expect(out.email).toBe("a@b.com");
  });
});
