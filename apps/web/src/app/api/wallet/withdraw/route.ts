/**
 * API: /api/wallet/withdraw
 * Request a withdrawal from wallet
 * 
 * Per API-CONTRACTS.md:
 * - POST: Request a withdrawal
 * - Role: Editor
 * - Body: { amount }
 * - Creates WithdrawalRequest[status=REQUESTED]
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/wallet/withdraw - Request withdrawal
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Editors can withdraw
  if (session.user.role !== "EDITOR") {
    return NextResponse.json({ error: "Only Editors can request withdrawals" }, { status: 403 });
  }

  try {
    const userId = session.user.id;
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // Calculate available balance
    const creditedPayouts = await prisma.payout.aggregate({
      where: {
        userId,
        status: "CREDITED",
      },
      _sum: { amount: true },
    });

    const paidWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: {
        userId,
        status: "PAID",
      },
      _sum: { amount: true },
    });

    const pendingWithdrawals = await prisma.withdrawalRequest.aggregate({
      where: {
        userId,
        status: "REQUESTED",
      },
      _sum: { amount: true },
    });

    const totalCredited = Number(creditedPayouts._sum.amount) || 0;
    const totalWithdrawn = Number(paidWithdrawals._sum.amount) || 0;
    const pendingWithdrawal = Number(pendingWithdrawals._sum.amount) || 0;
    const availableBalance = totalCredited - totalWithdrawn - pendingWithdrawal;

    // Check if user has sufficient balance
    if (amount > availableBalance) {
      return NextResponse.json(
        { 
          error: "Insufficient balance",
          availableBalance,
          requestedAmount: amount,
          difference: amount - availableBalance,
        },
        { status: 400 }
      );
    }

    // Check if there's already a pending withdrawal
    const existingPending = await prisma.withdrawalRequest.findFirst({
      where: {
        userId,
        status: "REQUESTED",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        status: "REQUESTED",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "WITHDRAWAL_REQUESTED",
        entityType: "WithdrawalRequest",
        entityId: withdrawal.id,
        userId,
        metadata: {
          amount,
        },
      },
    });

    // Notify Owner/Manager (future: notify specific team)

    return NextResponse.json({
      message: "Withdrawal request submitted successfully",
      withdrawal,
      remainingBalance: availableBalance - amount,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 });
  }
}
