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
 * FIXED: Now filters by user's organization
 */
export async function getAccessibleBrandIds(): Promise<string[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  // Get user's organization first
  const userWithOrg = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });

  if (!userWithOrg?.organizationId) {
    return [];
  }

  // Owner and Manager see all brands in their organization only
  if (user.role === "OWNER" || user.role === "MANAGER") {
    const orgBrands = await prisma.brand.findMany({
      where: { organizationId: userWithOrg.organizationId },
      select: { id: true },
    });
    return orgBrands.map((b) => b.id);
  }

  // Editor sees only brands they have access to in their organization
  const brandAccess = await prisma.brandAccess.findMany({
    where: { 
      userId: user.id,
      brand: { organizationId: userWithOrg.organizationId }
    },
    select: { brandId: true },
  });
  return brandAccess.map((b) => b.brandId);
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
 * FIXED: Now enforces tenant isolation for OWNER/MANAGER
 */
export async function canAccessBrand(brandId: string): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }

  // Owner and Manager: check if brand belongs to their organization
  if (user.role === "OWNER" || user.role === "MANAGER") {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { organizationId: true },
    });
    
    if (!brand) {
      return false;
    }
    
    return brand.organizationId === user.organizationId;
  }

  // Editor must have explicit brand access (unchanged)
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
 * Allowlist of fields that EDITORs can see
 * Per CONSTITUTION.md #1: Financial Confidentiality
 * Default deny - only these fields are visible to EDITORs
 */
const EDITOR_ALLOWED_FIELDS = new Set([
  // Task fields
  "id", "name", "description", "status", "order",
  "expectedDurationMinutes", "startedAt", "completedAt",
  "parentTaskId", "assigneeUserId", "stageId",
  // Common fields
  "createdAt", "updatedAt",
]);

/**
 * Validate that an editor is not accessing confidential data
 * Per CONSTITUTION.md #1: Financial Confidentiality
 * FIXED: Uses allowlist pattern - only defined fields are visible to EDITORs
 */
export function enforceConfidentiality<T extends Record<string, unknown>>(
  data: T,
  userRole: Role
): Partial<T> {
  if (userRole === "OWNER" || userRole === "MANAGER") {
    return data;
  }

  // For EDITORs, only return fields in the allowlist
  const result: Partial<T> = {};
  for (const key of Object.keys(data)) {
    if (EDITOR_ALLOWED_FIELDS.has(key)) {
      result[key as keyof T] = data[key as keyof T];
    }
  }

  return result;
}
