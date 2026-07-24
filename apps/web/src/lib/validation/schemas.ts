/**
 * Zod Validation Schemas for API Input
 *
 * These schemas validate all mutation endpoints to ensure data integrity.
 * Use schema.safeParse() in routes and return structured 400 errors.
 *
 * Usage in routes:
 *   const parsed = RegisterSchema.safeParse(body);
 *   if (!parsed.success) {
 *     return NextResponse.json(
 *       { error: "Validation failed", details: parsed.error.flatten() },
 *       { status: 400 }
 *     );
 *   }
 */

import { z } from "zod";

// ============================================================================
// Auth & User Schemas
// ============================================================================

/**
 * Password policy:
 * - Minimum 8 characters
 * - At least one letter (a-z, A-Z)
 * - At least one number (0-9)
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
  inviteCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email format").optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ============================================================================
// Lead Schemas
// ============================================================================

export const CreateLeadSchema = z.object({
  name: z.string().min(1, "Lead name is required").max(200),
  email: z.string().email("Invalid email format").optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  source: z.string().min(1, "Lead source is required"),
  sourceDetails: z.string().max(500).optional().nullable(),
  interest: z.string().min(1, "Interest is required"),
  budget: z.number().positive().optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  brandId: z.string().min(1, "Brand ID is required"),
  assignedTo: z.string().optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

// ============================================================================
// Client Schemas
// ============================================================================

export const CreateClientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(200),
  email: z.string().email("Invalid email format"),
  phone: z.string().max(50).optional().nullable(),
  brandId: z.string().min(1, "Brand ID is required"),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;

// ============================================================================
// Order Schemas
// ============================================================================

export const CreateOrderSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  intakeFormData: z.record(z.string(), z.unknown()).optional().default({}),
  brandId: z.string().min(1, "Brand ID is required"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["DRAFT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
    error: "Invalid order status",
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ============================================================================
// Project Schemas
// ============================================================================

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  posterUrl: z.string().url("Invalid URL format").optional().nullable(),
  posterAspect: z.enum(["16:9", "4:3", "1:1", "9:16"]).optional().default("16:9"),
  brandId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  posterUrl: z.string().url("Invalid URL format").optional().nullable(),
  posterAspect: z.enum(["16:9", "4:3", "1:1", "9:16"]).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ============================================================================
// Task Schemas
// ============================================================================

export const CreateTaskSchema = z.object({
  name: z.string().min(1, "Task name is required").max(200),
  category: z.string().optional().default("PRE_PRODUCTION"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  expectedDurationMinutes: z.number().int().positive().optional().default(60),
  dueDate: z.string().datetime().optional().nullable(),
  stageId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETE"]).optional(),
  assigneeUserId: z.string().optional().nullable(),
  payoutAmount: z.number().nonnegative().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  description: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// ============================================================================
// Team Schemas
// ============================================================================

export const CreateTeamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().max(50).optional().nullable(),
  role: z.enum(["EDITOR", "MANAGER", "PRODUCER"]),
  employmentType: z.enum(["FREELANCE", "INHOUSE"]).optional().default("FREELANCE"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  brandIds: z.array(z.string()).optional().default([]),
});

export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberSchema>;

export const UpdateTeamMemberRoleSchema = z.object({
  role: z.enum(["EDITOR", "MANAGER", "PRODUCER"]),
});

export type UpdateTeamMemberRoleInput = z.infer<typeof UpdateTeamMemberRoleSchema>;

export const UpdateTeamMemberBrandsSchema = z.object({
  brandIds: z.array(z.string()),
});

export type UpdateTeamMemberBrandsInput = z.infer<typeof UpdateTeamMemberBrandsSchema>;

export const CreateInviteCodeSchema = z.object({
  role: z.enum(["EDITOR", "MANAGER", "PRODUCER"]).optional().default("EDITOR"),
  expiresIn: z.number().int().positive().optional(), // hours
});

export type CreateInviteCodeInput = z.infer<typeof CreateInviteCodeSchema>;

// ============================================================================
// Superadmin Schemas
// ============================================================================

export const SuperadminCreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  role: z.enum(["OWNER", "MANAGER", "PRODUCER", "EDITOR"]).optional().default("EDITOR"),
  organizationId: z.string().min(1, "Organization ID is required"),
  employmentType: z.enum(["FREELANCE", "INHOUSE"]).optional().default("FREELANCE"),
});

export type SuperadminCreateUserInput = z.infer<typeof SuperadminCreateUserSchema>;

// ============================================================================
// Withdrawal Schemas
// ============================================================================

export const CreateWithdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

export type CreateWithdrawalInput = z.infer<typeof CreateWithdrawalSchema>;

// ============================================================================
// Brand Schemas
// ============================================================================

export const CreateBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100),
  slug: z.string().max(100).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().default("#2563EB"),
  hasClientPortal: z.boolean().optional().default(false),
});

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;

// ============================================================================
// Organization Schemas
// ============================================================================

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  plan: z.enum(["solo", "growing", "agency"]).optional(),
  apps: z.array(z.string()).optional(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
