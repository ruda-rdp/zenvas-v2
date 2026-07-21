/**
 * API: /api/payouts
 * Payout management for Owner/Manager
 * 
 * Per API-CONTRACTS.md:
 * - GET: List pending withdrawal requests
 * - Role: Owner/Manager
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/payouts - List pending withdrawals (Owner/Manager)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Owner and Manager can view all payouts
  if (session.user.role !== "OWNER" && session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Only Owner and Manager can view all payouts" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // REQUESTED, PAID

    // Get pending withdrawal requests
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    // Calculate totals
    const pendingTotal = withdrawals
      .filter(w => w.status === "REQUESTED")
      .reduce((sum, w) => sum + Number(w.amount), 0);

    const paidTotal = withdrawals
      .filter(w => w.status === "PAID")
      .reduce((sum, w) => sum + Number(w.amount), 0);

    return NextResponse.json({
      withdrawals,
      summary: {
        pendingCount: withdrawals.filter(w => w.status === "REQUESTED").length,
        paidCount: withdrawals.filter(w => w.status === "PAID").length,
        pendingTotal,
        paidTotal,
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}
