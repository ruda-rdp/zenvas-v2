import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role, User } from "@/generated/prisma";
import type { NextRequest } from "next/server";

/**
 * Authorization layer enforcing CONSTITUTION.md rules
 * Every API route should use these checks
 *
 * NOTE: These functions are designed to be used in API routes.
 * They handle session validation, permission checking, and data confidentiality.
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
  | "manage:settings"
  | "read:chat"
  | "write:chat"
  | "read:wallet"
  | "write:wallet";

/**
 * Guard return type - either the authorized user or a NextResponse error
 * Uses session user type which is a subset of Prisma User
 */
export type GuardResult<T = SessionUser> =
  | { success: true; user: T }
  | { success: false; response: NextResponse };

/**
 * Session user type - subset of Prisma User returned by auth()
 * Matches the extended next-auth session user
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  employmentType: string;
  organizationId: string;
  isActive: boolean;
  forcePasswordChange: boolean;
}

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
    "read:chat", "write:chat",
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
    "read:chat", "write:chat",
  ],
  PRODUCER: [
    "read:projects", "write:projects",
    "read:tasks", "write:tasks",
    "read:leads", "write:leads",
    "read:orders",
    "read:chat", "write:chat",
  ],
  EDITOR: [
    "read:tasks",
    "write:tasks", // own assigned tasks only - enforced at query level
    "read:payouts", // own only - enforced at query level
    "read:chat", "write:chat",
    "read:wallet", "write:wallet",
  ],
};

/**
 * ============================================
 * GUARD HELPERS
 * ============================================
 * These helpers provide consistent auth patterns for API routes.
 * Use them instead of manual session checks.
 */

/**
 * requireUser - Guard that returns user or 401 response
 *
 * Usage:
 *   const { success, user, response } = await requireUser();
 *   if (!success) return response;
 *   // user is guaranteed to be logged in
 *
 * @returns GuardResult with authenticated user
 */
export async function requireUser(): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  return { success: true, user: session.user };
}

/**
 * requireAction - Guard that checks if user has permission for action
 *
 * Usage:
 *   const auth = await requireUser();
 *   if (!auth.success) return auth.response;
 *
 *   const action = await requireAction(auth.user, "write:projects");
 *   if (!action.success) return action.response;
 *   // User has permission
 *
 * @param user - The authenticated user (from requireUser)
 * @param action - The action to check
 * @returns GuardResult (true if allowed, 403 response if denied)
 */
export async function requireAction(
  user: SessionUser,
  action: Action
): Promise<GuardResult> {
  const permissions = rolePermissions[user.role as Role];
  const hasPermission = permissions?.includes(action) ?? false;

  if (!hasPermission) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: `Forbidden. Insufficient permissions for action: ${action}`,
          required: action,
          yourRole: user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { success: true, user };
}

/**
 * scopeToBrands - Add brand filtering to Prisma where clause
 *
 * Automatically resolves brandId for both solo projects (project.brandId)
 * and order-based projects (project.order.brandId).
 *
 * Usage:
 *   const { success, user } = await requireUser();
 *   if (!success) return user;
 *
 *   const { brands, scopeFilter } = await scopeToBrands();
 *   if (brands.length === 0) {
 *     return NextResponse.json({ ... }, { status: 403 }); // No access
 *   }
 *
 *   // Use scopeFilter in your Prisma query
 *   const projects = await prisma.project.findMany({
 *     where: {
 *       OR: [
 *         { brandId: { in: brands } },
 *         { order: { brandId: { in: brands } } },
 *       ],
 *       ...scopeFilter, // Additional filters
 *     },
 *   });
 *
 * @returns Object with accessible brand IDs and helper filter
 */
export async function scopeToBrands(): Promise<{
  brands: string[];
  scopeFilter: {
    OR: Array<{
      brandId?: { in: string[] };
      order?: { brandId?: { in: string[] } };
    }>;
  };
}> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      brands: [],
      scopeFilter: {
        OR: [{ brandId: { in: [] } }],
      },
    };
  }

  const accessibleBrands = await getAccessibleBrandIds();

  return {
    brands: accessibleBrands,
    scopeFilter: {
      OR: [
        { brandId: { in: accessibleBrands } },
        { order: { brandId: { in: accessibleBrands } } },
      ],
    },
  };
}

/**
 * checkBrandAccess - Verify user can access a specific brand
 *
 * Usage:
 *   const hasAccess = await checkBrandAccess(user, brandId);
 *   if (!hasAccess) {
 *     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *   }
 *
 * @param user - The authenticated user
 * @param brandId - Brand to check access for
 * @returns true if user can access the brand
 */
export async function checkBrandAccess(
  user: SessionUser,
  brandId: string
): Promise<boolean> {
  return canAccessBrand(brandId);
}

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
  "dueDate", "startDate", "priority", "category", "tags",
  // Common fields
  "createdAt", "updatedAt",
  // Safe relations (limited fields only)
  "brandId", "projectId", "stageName",
]);

/**
 * Validate that an editor is not accessing confidential data
 * Per CONSTITUTION.md #1: Financial Confidentiality
 * Uses allowlist pattern - only defined fields are visible to EDITORs
 *
 * Usage:
 *   // Single item
 *   const safeTask = enforceConfidentiality(task, user.role);
 *
 *   // Array of items
 *   const safeTasks = enforceConfidentialityArray(tasks, user.role);
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

/**
 * Apply enforceConfidentiality to an array of items
 *
 * Usage:
 *   const safeTasks = enforceConfidentialityArray(tasks, user.role);
 */
export function enforceConfidentialityArray<T extends Record<string, unknown>>(
  data: T[],
  userRole: Role
): Partial<T>[] {
  if (userRole === "OWNER" || userRole === "MANAGER") {
    return data;
  }

  return data.map((item) => enforceConfidentiality(item, userRole));
}

/**
 * Strip confidential fields from an item based on role
 * Used when the allowlist pattern doesn't fit (e.g., nested objects)
 *
 * Usage:
 *   const safeOrder = stripConfidentialFields(order, user.role, {
 *     exclude: ['service.price', 'client.budget'],
 *   });
 */
export function stripConfidentialFields<T extends Record<string, unknown>>(
  data: T,
  userRole: Role,
  options: {
    exclude?: string[];
    includeMoneyFields?: boolean;
  } = {}
): T {
  if (userRole === "OWNER" || userRole === "MANAGER") {
    return data;
  }

  // Deep clone and strip money fields
  const result = JSON.parse(JSON.stringify(data)) as T;

  const moneyFieldPatterns = [
    'price', 'amount', 'budget', 'cost', 'fee', 'rate',
    'payoutAmount', 'total', 'subtotal', 'tax', 'discount',
    'revenue', 'profit', 'margin', 'balance', 'withdrawal',
  ];

  const stripMoneyFields = (obj: Record<string, unknown>): void => {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (
        moneyFieldPatterns.some((pattern) =>
          key.toLowerCase().includes(pattern.toLowerCase())
        )
      ) {
        obj[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        stripMoneyFields(value as Record<string, unknown>);
      }
    }
  };

  stripMoneyFields(result as Record<string, unknown>);
  return result;
}
