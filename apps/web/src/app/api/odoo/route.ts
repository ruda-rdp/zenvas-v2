/**
 * API: /api/odoo
 * Odoo Connection Management
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkOdooConnection,
  ODOO_CONFIG,
} from "@/lib/odoo";

// GET /api/odoo - Odoo status & stats
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Check Odoo connection
    const isConnected = await checkOdooConnection();

    // Get sync stats from our DB
    const [totalClients, syncedClients, totalOrders, syncedOrders] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { odooPartnerId: { not: null } } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          OR: [{ odooInvoiceDpId: { not: null } }, { odooInvoiceFinalId: { not: null } }],
        },
      }),
    ]);

    // Get unsynced clients (limit to 10)
    const unsyncedClients = await prisma.client.findMany({
      where: { odooPartnerId: null },
      include: { brand: { select: { id: true, name: true } } },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // Get clients with potential sync issues (no Odoo ID)
    const recentSyncErrors = await prisma.activityLog.findMany({
      where: {
        entityType: "Client",
        metadata: { path: ["action"], equals: "client_created" },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      connection: {
        isConnected,
        url: ODOO_CONFIG.url,
        db: ODOO_CONFIG.db,
        username: ODOO_CONFIG.username,
        hasApiKey: !!ODOO_CONFIG.apiKey,
      },
      stats: {
        totalClients,
        syncedClients,
        unsyncedClients: totalClients - syncedClients,
        totalOrders,
        syncedOrders,
      },
      unsyncedClients: unsyncedClients.map((c) => ({
        id: c.id,
        name: c.name,
        email: (c as any).email,
        brand: c.brand.name,
        createdAt: c.createdAt,
      })),
      lastSyncErrors: recentSyncErrors,
    });
  } catch (error) {
    console.error("Error fetching Odoo status:", error);
    return NextResponse.json({ error: "Failed to fetch Odoo status" }, { status: 500 });
  }
}
