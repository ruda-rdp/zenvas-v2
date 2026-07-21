/**
 * API: /api/payouts/[id]/mark-paid
 * Confirm manual bank transfer completed
 * 
 * Per API-CONTRACTS.md:
 * - POST: Mark withdrawal as paid
 * - Role: Owner/Manager
 * - WithdrawalRequest.status = PAID, paidAt = now()
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Owner and Manager can mark as paid
  if (session.user.role !== "OWNER" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Only Owner and Manager can mark withdrawals as paid" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Get the withdrawal request
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    // Check if already paid
    if (withdrawal.status === "PAID") {
      return NextResponse.json({ error: "This withdrawal has already been marked as paid" }, { status: 400 });
    }

    // Update withdrawal to PAID
    const updatedWithdrawal = await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "WITHDRAWAL_PAID",
        entityType: "WithdrawalRequest",
        entityId: id,
        userId: session.user.id,
        metadata: {
          amount: Number(withdrawal.amount),
          paidTo: withdrawal.user.name,
          paidToEmail: withdrawal.user.email,
        },
      },
    });

    // Notify the editor
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        type: "SYSTEM",
        title: "Withdrawal Processed",
        message: `Your withdrawal of ${Number(withdrawal.amount).toLocaleString()} has been processed.`,
      },
    });

    return NextResponse.json({
      message: "Withdrawal marked as paid",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("Error marking withdrawal as paid:", error);
    return NextResponse.json({ error: "Failed to mark withdrawal as paid" }, { status: 500 });
  }
}
