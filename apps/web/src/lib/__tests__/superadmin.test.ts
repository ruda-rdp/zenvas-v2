/**
 * Unit tests for lib/superadmin.ts
 *
 * Tests the super admin authorization logic:
 * - isSuperAdmin() checks email against SUPERADMIN_EMAIL env
 * - requireSuperAdmin() throws if not authorized
 * - Case-insensitive email comparison
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Session } from "next-auth";

// Mock process.env
const originalEnv = { ...process.env };

describe("isSuperAdmin()", () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore env after each test
    process.env = originalEnv;
  });

  const createSession = (email: string | null): Session | null => {
    if (!email) return null;
    return {
      user: {
        id: "user-1",
        email,
        name: "Test User",
        role: "OWNER",
        employmentType: "FREELANCE",
        organizationId: "org-1",
        isActive: true,
        forcePasswordChange: false,
      },
      expires: "2025-01-01",
    };
  };

  it("returns true when email matches SUPERADMIN_EMAIL (case-insensitive)", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { isSuperAdmin } = await import("../superadmin");

    expect(isSuperAdmin(createSession("admin@zenvas.com"))).toBe(true);
    expect(isSuperAdmin(createSession("ADMIN@ZENVAS.COM"))).toBe(true);
    expect(isSuperAdmin(createSession("Admin@Zenvas.Com"))).toBe(true);
  });

  it("returns false when email does not match", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { isSuperAdmin } = await import("../superadmin");

    expect(isSuperAdmin(createSession("user@other.com"))).toBe(false);
    expect(isSuperAdmin(createSession("admin@different.com"))).toBe(false);
    expect(isSuperAdmin(createSession("adminzenvas.com"))).toBe(false); // missing @
  });

  it("returns false when SUPERADMIN_EMAIL is not set", async () => {
    delete process.env.SUPERADMIN_EMAIL;

    const { isSuperAdmin } = await import("../superadmin");

    expect(isSuperAdmin(createSession("admin@zenvas.com"))).toBe(false);
  });

  it("returns false for null session", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { isSuperAdmin } = await import("../superadmin");

    expect(isSuperAdmin(null)).toBe(false);
  });

  it("returns false when session has no email", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { isSuperAdmin } = await import("../superadmin");

    const sessionWithoutEmail = {
      user: {
        id: "user-1",
        name: "Test User",
        role: "OWNER",
        employmentType: "FREELANCE",
        organizationId: "org-1",
        isActive: true,
        forcePasswordChange: false,
      },
      expires: "2025-01-01",
    } as Session;

    expect(isSuperAdmin(sessionWithoutEmail)).toBe(false);
  });

  it("handles whitespace in emails correctly", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { isSuperAdmin } = await import("../superadmin");

    // Note: trimming happens at comparison level via toLowerCase
    expect(isSuperAdmin(createSession(" admin@zenvas.com"))).toBe(false); // leading space
    expect(isSuperAdmin(createSession("admin@zenvas.com "))).toBe(false); // trailing space
  });
});

describe("requireSuperAdmin()", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("does not throw when user is super admin", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { requireSuperAdmin } = await import("../superadmin");

    const session = {
      user: {
        id: "user-1",
        email: "admin@zenvas.com",
        name: "Admin",
        role: "OWNER",
        employmentType: "FREELANCE",
        organizationId: "org-1",
        isActive: true,
        forcePasswordChange: false,
      },
      expires: "2025-01-01",
    } as Session;

    expect(() => requireSuperAdmin(session)).not.toThrow();
  });

  it("throws Error when user is not super admin", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { requireSuperAdmin } = await import("../superadmin");

    const session = {
      user: {
        id: "user-1",
        email: "user@other.com",
        name: "Regular User",
        role: "OWNER",
        employmentType: "FREELANCE",
        organizationId: "org-1",
        isActive: true,
        forcePasswordChange: false,
      },
      expires: "2025-01-01",
    } as Session;

    expect(() => requireSuperAdmin(session)).toThrow("Unauthorized: Super admin access required");
  });

  it("throws Error when session is null", async () => {
    process.env.SUPERADMIN_EMAIL = "admin@zenvas.com";

    const { requireSuperAdmin } = await import("../superadmin");

    expect(() => requireSuperAdmin(null)).toThrow("Unauthorized: Super admin access required");
  });

  it("throws Error when SUPERADMIN_EMAIL is not set", async () => {
    delete process.env.SUPERADMIN_EMAIL;

    const { requireSuperAdmin } = await import("../superadmin");

    const session = {
      user: {
        id: "user-1",
        email: "admin@zenvas.com",
        name: "Admin",
        role: "OWNER",
        employmentType: "FREELANCE",
        organizationId: "org-1",
        isActive: true,
        forcePasswordChange: false,
      },
      expires: "2025-01-01",
    } as Session;

    expect(() => requireSuperAdmin(session)).toThrow("Unauthorized: Super admin access required");
  });
});
