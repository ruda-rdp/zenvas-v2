/**
 * API: /api/clients
 * CRUD for Clients (Business OS)
 *
 * Per CONSTITUTION.md: Client relationship belongs to Brand
 * Per HUMAN_CAPITAL_OS.md: Editor cannot see Client contact info
 *
 * Authorization:
 * - GET: Uses requireUser + requireAction + scopeToBrands
 * - POST: Uses requireUser + requireAction(write:clients)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  scopeToBrands,
  canAccessBrand,
} from "@/lib/authorize";
import { syncClientToOdoo } from "@/lib/odoo";
import { CreateClientSchema, createValidationErrorResponse } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma";

// GET /api/clients - List all clients for user's accessible brands
// Supports cursor-based pagination
export async function GET(request: Request) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const cursor = searchParams.get("cursor") || undefined;
    const search = searchParams.get("search") || "";
    const brandId = searchParams.get("brandId") || "";

    // Use scopeToBrands for consistent brand filtering
    const { brands } = await scopeToBrands();

    if (brands.length === 0) {
      return NextResponse.json({ clients: [], pagination: { hasMore: false, nextCursor: null } });
    }

    // Build where clause
    const whereClause: Prisma.ClientWhereInput = {
      brandId: {
        in: brands,
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
    if (brandId && brands.includes(brandId)) {
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
      if (user.role === "EDITOR") {
        // Strip email & phone for Editors
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email: _email, phone: _phone, ...safe } = client;
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
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction instead of manual role check
  const actionResult = await requireAction(user, "write:clients");
  if (!actionResult.success) return actionResult.response;

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

  const parsed = CreateClientSchema.safeParse(body);
  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const { brandId, ...clientData } = parsed.data;

  // Check brand access using centralized helper
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
      email: clientData.email,
    },
  });

  if (existingClient) {
    return NextResponse.json(
      { error: "Client with this email already exists in this brand" },
      { status: 400 }
    );
  }

  try {
    // Create client
    const client = await prisma.client.create({
      data: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone ?? null,
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
        userId: user.id,
        metadata: { action: "client_created", name: clientData.name, email: clientData.email },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
