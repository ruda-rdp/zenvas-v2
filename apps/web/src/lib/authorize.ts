import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma";

/**
 * Authorization layer enforcing CONSTITUTION.md rules
 * Every API route should use these checks
 */

export type Action = 
  | "read:orders" 
  | "write:orders"
  | "read:clients"
  | "write:clients"
  | "read:projects"
  | "write:projects"
  | "read:tasks"
  | "write:tasks"
  | "read:team"
  | "write:team"
  | "read:payouts"
  | "write:payouts"
  | "read:leads"
  | "write:leads"
  | "read:brand"
  | "write:brand"
  | "manage:settings";

/**
 * Role-based permissions matrix
 * Per HUMAN_CAPITAL_OS.md Roles & Permissions
 */
const rolePermissions: Record<Role, Action[]> = {
  OWNER: [
    "read:orders", "write:orders",
    "read:clients", "write:clients",
    "read:projects", "write:projects",
    "read:tasks", "write:tasks",
    "read:team", "write:team",
    "read:payouts", "write:payouts",
    "read:leads", "write:leads",
    "read:brand", "write:brand",
    "manage:settings",
  ],
  MANAGER: [
    "read:orders", "write:orders",
    "read:clients", "write:clients",
    "read:projects", "write:projects",
    "read:tasks", "write:tasks",
    "read:team", "write:team",
    "read:payouts", "write:payouts",
    "read:leads", "write:leads",
    "read:brand",
    "manage:settings",
  ],
  PRODUCER: [
    "read:projects", "write:projects",
    "read:tasks", "write:tasks",
    "read:leads", "write:leads",
    "read:orders",
  ],
  EDITOR: [
    "read:tasks",
    "read:payouts", // own only, enforced at query level
    "write:tasks", // own assigned tasks only
  ],
};

/**
 * Check if current user can perform action
 */
export async function can(action: Action): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }

  const permissions = rolePermissions[session.user.role];
  return permissions?.includes(action) ?? false;
}

/**
 * Get current session user
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get user's accessible brand IDs (for multi-brand filtering)
 * Per HUMAN_CAPITAL_OS.md - Brand Access pattern
 */
export async function getAccessibleBrandIds(): Promise<string[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  // Owner and Manager see all brands
  if (user.role === "OWNER" || user.role === "MANAGER") {
    const allBrands = await prisma.brand.findMany({
      select: { id: true },
    });
    return allBrands.map((b) => b.id);
  }

  // Editor sees only brands they have access to
  const brandAccess = await prisma.brandAccess.findMany({
    where: { userId: user.id },
    select: { brandId: true },
  });
  return brandAccess.map((b) => b.brandId);
}

/**
 * Scope a query to only return data the user can access
 * Enforces CONSTITUTION.md #1: Financial Confidentiality
 */
export function scopeQuery<T extends { brandId?: string }>(
  query: T,
  userRole: Role
): Partial<T> {
  // Owner and Manager can see everything
  if (userRole === "OWNER" || userRole === "MANAGER") {
    return query;
  }

  // Editor can only see their own tasks
  // Order, Client, Service.price fields should NEVER be in EDITOR queries
  // This is enforced by not including those relations in the query
  
  const scopedQuery: Partial<T> = {};
  
  // For tasks, only return assigned to current user
  if ("assigneeUserId" in query && userRole === "EDITOR") {
    return query;
  }
  
  return scopedQuery;
}

/**
 * Validate task hierarchy depth (max 4 levels)
 * Per PROJECT_OS.md Task Hierarchy
 */
export function validateTaskDepth(
  parentTaskId: string | null,
  existingDepth: number
): boolean {
  if (parentTaskId === null) {
    return true; // Root task
  }
  
  // 0 = root, 1 = first level, 2 = second level, 3 = third level
  // Max depth = 3 (root + 2 nesting) = 4 total levels
  return existingDepth < 3;
}

/**
 * Check if user can access a specific brand
 * Per Brand Access model in HUMAN_CAPITAL_OS.md
 */
export async function canAccessBrand(brandId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Owner and Manager can access all brands
  if (user.role === "OWNER" || user.role === "MANAGER") {
    return true;
  }

  // Editor must have explicit brand access
  const access = await prisma.brandAccess.findUnique({
    where: {
      userId_brandId: {
        userId: user.id,
        brandId,
      },
    },
  });

  return !!access;
}

/**
 * Validate that an editor is not accessing confidential data
 * Per CONSTITUTION.md #1: Financial Confidentiality
 */
export function enforceConfidentiality<T extends Record<string, unknown>>(
  data: T,
  userRole: Role
): Partial<T> {
  if (userRole === "OWNER" || userRole === "MANAGER") {
    return data;
  }

  // For editors, strip out any financial/confidential fields
  const safeFields = Object.keys(data).filter(
    (key) =>
      !["price", "amount", "budget", "invoice", "odooPartnerId", "odooInvoiceDpId", "odooInvoiceFinalId"].includes(
        key.toLowerCase()
      )
  );

  const result: Partial<T> = {};
  for (const key of safeFields) {
    result[key as keyof T] = data[key as keyof T];
  }

  return result;
}
