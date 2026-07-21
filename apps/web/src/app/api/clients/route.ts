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
import { getAccessibleBrandIds, canAccessBrand } from "@/lib/authorize";
import { syncClientToOdoo } from "@/lib/odoo";

// GET /api/clients - List all clients for user's accessible brands
// Supports cursor-based pagination
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const cursor = searchParams.get("cursor") || undefined;
    const search = searchParams.get("search") || "";
    const brandId = searchParams.get("brandId") || "";

    const accessibleBrands = await getAccessibleBrandIds();

    // Build where clause
    const whereClause: any = {
      brandId: {
        in: accessibleBrands,
      },
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Add brand filter if specified
    if (brandId && accessibleBrands.includes(brandId)) {
      whereClause.brandId = brandId;
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      include: {
        brand: {
          select: { id: true, name: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Take one extra to check if there's a next page
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    // Check if there are more results
    const hasMore = clients.length > limit;
    const results = hasMore ? clients.slice(0, -1) : clients;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    // For Editors, strip confidential contact info (CONSTITUTION.md #2)
    const safeClients = results.map((client) => {
      if (session.user.role === "EDITOR") {
        // Strip email & phone for Editors
        const { email, phone, ...safe } = client;
        return safe;
      }
      return client;
    });

    return NextResponse.json({
      clients: safeClients,
      pagination: {
        hasMore,
        nextCursor,
      },
    });
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

    // Check brand access before creating client
    const hasAccess = await canAccessBrand(brandId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this brand" },
        { status: 403 }
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
        phone: phone || null,
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
        type: "LEAD_CONVERTED",
        entityType: "Client",
        entityId: client.id,
        userId: session.user.id,
        metadata: { action: "client_created", name, email },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
