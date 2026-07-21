/**
 * API: /api/team
 * List team members, create users directly (Odoo-style), and manage organization
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@/generated/prisma";
import { hash } from "bcryptjs";

// GET /api/team - List all team members in organization
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users in the organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        brandAccess: {
          select: { brandId: true },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first
        { createdAt: "asc" },
      ],
    });

    // Don't return sensitive fields
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      employmentType: user.employmentType,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      forcePasswordChange: user.forcePasswordChange,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      brandAccess: user.brandAccess,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

// POST /api/team - Create user directly (Odoo-style: no invite required)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only OWNER can create users directly
  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Only owners can create team members" }, { status: 403 });
  }

  if (!session.user.organizationId) {
    console.error("Session missing organizationId:", session.user);
    return NextResponse.json({ error: "Session error: missing organization" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone,
      role = "EDITOR", 
      employmentType = "FREELANCE",
      password,
      brandIds = [],
      sendWelcomeEmail = false
    } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Name must be between 2 and 100 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Validate role
    if (!["EDITOR", "MANAGER", "PRODUCER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Generate password if not provided
    let generatedPassword = password;
    let passwordHash: string | null = null;
    
    if (!password) {
      // Generate random password
      generatedPassword = generateRandomPassword();
      passwordHash = await hash(generatedPassword, 12);
    } else {
      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json({ 
          error: "Password must be at least 8 characters" 
        }, { status: 400 });
      }
      passwordHash = await hash(password, 12);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        email,
        phone: phone || null,
        role: role as Role,
        employmentType,
        passwordHash,
        isActive: true,
        emailVerified: false,
        forcePasswordChange: !password, // Force change if auto-generated
      },
    });

    // Grant brand access
    if (brandIds && brandIds.length > 0) {
      await prisma.brandAccess.createMany({
        data: brandIds.map((brandId: string) => ({
          userId: user.id,
          brandId,
        })),
        skipDuplicates: true,
      });
    }

    // TODO: Send welcome email with credentials if sendWelcomeEmail is true
    // For now, we'll return the generated password for admin to share manually

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        employmentType: user.employmentType,
        isActive: user.isActive,
        forcePasswordChange: user.forcePasswordChange,
        createdAt: user.createdAt,
      },
      // Only include generated password in response if it was auto-generated
      ...(generatedPassword && !password ? { 
        message: "User created successfully. Share these credentials with the user:",
        temporaryPassword: generatedPassword 
      } : {}),
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
