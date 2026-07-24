/**
 * API: /api/profile/password
 * Change password
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authorize";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ChangePasswordSchema, createValidationErrorResponse } from "@/lib/validation";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

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

  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    // Get current user with password
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userRecord?.passwordHash) {
      return NextResponse.json({ error: "No password set" }, { status: 400 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userRecord.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
