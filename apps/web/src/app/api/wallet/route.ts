/**
 * API: /api/wallet
 * Editor's Wallet - Balance + Payout history
 * 
 * Per API-CONTRACTS.md:
 * - GET: Own Wallet: balance (computed), Payout history
 * - Role: Editor (own data only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/wallet - Get editor's wallet
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Wallet is for Editors only
  if (session.user.role !== "EDITOR") {
    return NextResponse.json({ error: "Wallet is only available for Editors" }, { status: 403 });
  }

  try {
    const userId = session.user.id;

    // Get all credited payouts for this user
    const creditedPayouts = await prisma.payout.findMany({
      where: {
        userId,
        status: "CREDITED",
      },
      include: {
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { creditedAt: "desc" },
    });

    // Get all paid withdrawals
    const paidWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        userId,
        status: "PAID",
      },
      orderBy: { paidAt: "desc" },
    });

    // Get pending withdrawal requests
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        userId,
        status: "REQUESTED",
      },
      orderBy: { requestedAt: "desc" },
    });

    // Calculate balance
    const totalCredited = creditedPayouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const totalWithdrawn = paidWithdrawals.reduce(
      (sum, w) => sum + Number(w.amount),
      0
    );
    const pendingWithdrawal = pendingWithdrawals.reduce(
      (sum, w) => sum + Number(w.amount),
      0
    );
    const availableBalance = totalCredited - totalWithdrawn;
    const pendingBalance = availableBalance - pendingWithdrawal;

    // Get allocated (not yet credited) payouts
    const allocatedPayouts = await prisma.payout.findMany({
      where: {
        userId,
        status: "ALLOCATED",
      },
      include: {
        task: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalAllocated = allocatedPayouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    return NextResponse.json({
      balance: {
        available: availableBalance,
        pending: pendingBalance,
        pendingWithdrawal,
        allocated: totalAllocated, // Future earnings
        totalEarned: totalCredited,
        totalWithdrawn,
      },
      allocatedPayouts,
      creditedPayouts,
      pendingWithdrawals,
      paidWithdrawals,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
