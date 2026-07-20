import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role, EmploymentType } from "@/generated/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, inviteCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

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
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Organization`,
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
