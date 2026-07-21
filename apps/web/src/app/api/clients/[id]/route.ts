/**
 * API: /api/clients/[id]
 * CRUD for individual Client
 *
 * Per CONSTITUTION.md: Client relationship belongs to Brand
 * Per HUMAN_CAPITAL_OS.md: Editor cannot see Client contact info
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds } from "@/lib/authorize";

// GET /api/clients/[id] - Get client detail with orders & contacts
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const accessibleBrands = await getAccessibleBrandIds();
    const isEditor = session.user.role === "EDITOR";

    const client = await prisma.client.findFirst({
      where: {
        id,
        brandId: { in: accessibleBrands },
      },
      include: {
        brand: {
          select: { id: true, name: true, primaryColor: true, logoUrl: true },
        },
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            confirmedAt: true,
            completedAt: true,
            service: {
              select: { id: true, name: true, price: true },
            },
            project: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            canApproveDelivery: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { orders: true, leads: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Strip sensitive info for Editors (CONSTITUTION.md #2)
    const safeClient = isEditor
      ? {
          ...client,
          email: undefined,
          phone: undefined,
          contacts: [],
          orders: client.orders.map((order) => ({
            ...order,
            service: order.service ? { id: order.service.id, name: order.service.name } : null,
          })),
        }
      : client;

    // Get activity log with user info
    const activityLogs = await (prisma.activityLog.findMany as any)({
      where: {
        entityType: "Client",
        entityId: id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Transform to safe format
    const activity = activityLogs.map((log: any) => ({
      id: log.id,
      type: log.type,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
      userId: log.userId,
      user: log.user,
    }));

    return NextResponse.json({
      client: safeClient,
      activity,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(
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
    const body = await request.json();
    const { name, email, phone } = body;

    const accessibleBrands = await getAccessibleBrandIds();
    const existing = await prisma.client.findFirst({
      where: { id, brandId: { in: accessibleBrands } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      include: {
        brand: { select: { id: true, name: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "LEAD_QUALIFIED", // reuse existing type - close enough semantically
        entityType: "Client",
        entityId: client.id,
        userId: session.user.id,
        metadata: { action: "client_updated" },
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden - Owner only" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const accessibleBrands = await getAccessibleBrandIds();

    const existing = await prisma.client.findFirst({
      where: { id, brandId: { in: accessibleBrands } },
      include: { _count: { select: { orders: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Don't allow delete if has orders
    if (existing._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with existing orders. Archive instead." },
        { status: 400 }
      );
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
