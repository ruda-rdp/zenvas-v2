/**
 * API: /api/leads/[id]/convert
 * Convert Lead to Client (Business OS)
 *
 * Per LEAD_MANAGEMENT.md:
 * - Lead → Qualified → Client
 * - Creates Client record + syncs to Odoo
 *
 * Authorization: Uses requireUser + requireAction(write:leads)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireAction, canAccessBrand } from "@/lib/authorize";
import { syncClientToOdoo } from "@/lib/odoo";
import { LeadStatus } from "@/generated/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction for permission checking
  const actionResult = await requireAction(user, "write:leads");
  if (!actionResult.success) return actionResult.response;

  try {
    const { id } = await params;

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check brand access using centralized helper
    const hasAccess = await canAccessBrand(lead.brandId);
    if (!hasAccess) {
      return NextResponse.json({ error: "You don't have access to this lead's brand" }, { status: 403 });
    }

    if (lead.status === LeadStatus.CONVERTED) {
      return NextResponse.json({ error: "Lead already converted" }, { status: 400 });
    }

    // Check if client already exists with same email
    const existingClient = await prisma.client.findFirst({
      where: {
        brandId: lead.brandId,
        email: lead.email || undefined,
      },
    });

    if (existingClient) {
      // Link lead to existing client
      await prisma.lead.update({
        where: { id },
        data: {
          clientId: existingClient.id,
          status: LeadStatus.WON,
        },
      });

      return NextResponse.json({
        client: existingClient,
        action: "linked_to_existing"
      });
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        name: lead.name,
        email: lead.email || `lead-${lead.id}@placeholder.com`,
        brandId: lead.brandId,
      },
    });

    // Sync to Odoo
    try {
      const odooResult = await syncClientToOdoo(client.id);
      if (odooResult.success && odooResult.odooId) {
        await prisma.client.update({
          where: { id: client.id },
          data: { odooPartnerId: odooResult.odooId.toString() },
        });
      }
    } catch (odooError) {
      console.error("Odoo sync failed:", odooError);
      // Continue - not blocking
    }

    // Update lead status
    await prisma.lead.update({
      where: { id },
      data: {
        clientId: client.id,
        status: LeadStatus.WON,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "LEAD_CONVERTED",
        entityType: "Lead",
        entityId: id,
        userId: user.id,
        metadata: { clientId: client.id },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error converting lead:", error);
    return NextResponse.json({ error: "Failed to convert lead" }, { status: 500 });
  }
}
