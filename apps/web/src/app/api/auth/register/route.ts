import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role, EmploymentType } from "@/generated/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema, createValidationErrorResponse } from "@/lib/validation";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  // Validate input with Zod
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const { name, email, password, inviteCode } = parsed.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Check invite code
    if (inviteCode) {
      const code = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
        include: { organization: true },
      });

      if (!code) {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 400 }
        );
      }

      if (code.used) {
        return NextResponse.json(
          { error: "Invite code has already been used" },
          { status: 400 }
        );
      }

      // Check expiry
      if (code.expiresAt && new Date() > code.expiresAt) {
        return NextResponse.json(
          { error: "Invite code has expired" },
          { status: 400 }
        );
      }

      // Create user with role from invite code
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: code.role, // Role from invite code
          employmentType: EmploymentType.FREELANCE,
          organizationId: code.organizationId,
        },
      });

      // Mark code as used
      await prisma.inviteCode.update({
        where: { id: code.id },
        data: { used: true, usedByUserId: user.id },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        inviteCodeUsed: true,
      });
    }

    // No invite code = create own organization as OWNER
    // Generate unique slug to avoid collision
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const orgSlug = `${baseSlug}-${uniqueSuffix}`;
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Organization`,
        slug: orgSlug,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.OWNER,
        employmentType: EmploymentType.FREELANCE,
        organizationId: organization.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      needsOnboarding: true, // First time user needs to create brand
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
