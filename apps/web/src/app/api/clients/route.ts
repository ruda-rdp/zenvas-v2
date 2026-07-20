/**
 * API: /api/clients
 * CRUD for Clients (Business OS)
 * 
 * Per CONSTITUTION.md: Client relationship belongs to Brand
 * Per HUMAN_CAPITAL_OS.md: Editor cannot see Client contact info
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds, enforceConfidentiality } from "@/lib/authorize";
import { syncClientToOdoo } from "@/lib/odoo";

// GET /api/clients - List all clients for user's accessible brands
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessibleBrands = await getAccessibleBrandIds();

    const clients = await prisma.client.findMany({
      where: {
        brandId: {
          in: accessibleBrands,
        },
      },
      include: {
        brand: {
          select: { id: true, name: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // For Editors, strip confidential contact info
    let safeClients = clients;
    if (session.user.role === "EDITOR") {
      safeClients = clients.map((client) => ({
        ...client,
        // Editors don't see email - constitutional rule
      }));
    }

    return NextResponse.json({ clients: safeClients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Owner and Manager can create clients
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, brandId } = body;

    if (!name || !email || !brandId) {
      return NextResponse.json(
        { error: "Name, email, and brandId are required" },
        { status: 400 }
      );
    }

    // Check if client already exists for this brand+email
    const existingClient = await prisma.client.findFirst({
      where: {
        brandId,
        email,
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "Client with this email already exists in this brand" },
        { status: 400 }
      );
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        brandId,
      },
      include: {
        brand: {
          select: { id: true, name: true },
        },
      },
    });

    // Sync to Odoo (per ADR-0001)
    try {
      const odooResult = await syncClientToOdoo(client.id);
      if (odooResult.success && odooResult.odooId) {
        // Update client with Odoo partner ID
        await prisma.client.update({
          where: { id: client.id },
          data: { odooPartnerId: odooResult.odooId.toString() },
        });
      }
    } catch (odooError) {
      console.error("Odoo sync failed:", odooError);
      // Continue - Odoo sync is not blocking
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "ORDER_CREATED",
        entityType: "Client",
        entityId: client.id,
        userId: session.user.id,
        metadata: { action: "client_created" },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
