/**
 * API: /api/odoo/sync/client/[id]
 * Manually sync a single client to Odoo
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { syncClientToOdoo } from "@/lib/odoo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const result = await syncClientToOdoo(id);

    if (result.success && result.odooId) {
      // Update the client with the Odoo ID
      await prisma.client.update({
        where: { id },
        data: { odooPartnerId: result.odooId.toString() },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          type: "LEAD_CONVERTED",
          entityType: "Client",
          entityId: id,
          userId: session.user.id,
          metadata: {
            action: "manual_odoo_sync",
            odooId: result.odooId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        odooId: result.odooId,
        message: "Client synced to Odoo",
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Sync failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error syncing client:", error);
    return NextResponse.json(
      { error: "Failed to sync client" },
      { status: 500 }
    );
  }
}
