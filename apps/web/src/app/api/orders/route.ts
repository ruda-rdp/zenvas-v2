/**
 * API: /api/orders
 * CRUD for Orders (Business OS)
 * 
 * Per BUSINESS_OS.md:
 * - Order lifecycle: DRAFT → CONFIRMED → IN_PROGRESS → COMPLETED
 * - Project created after Order is CONFIRMED (DP received)
 * - Order value confidential to Owner/Manager
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds, canAccessBrand } from "@/lib/authorize";
import { syncOrderDpInvoice } from "@/lib/odoo";
import { OrderStatus } from "@/generated/prisma";

// GET /api/orders - List all orders
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const brandId = searchParams.get("brandId");

    const accessibleBrands = await getAccessibleBrandIds();

    const where: Record<string, unknown> = {
      brandId: {
        in: accessibleBrands,
      },
    };

    if (brandId && accessibleBrands.includes(brandId)) {
      where.brandId = brandId;
    }

    if (status) {
      where.status = status as OrderStatus;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        brand: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // For Editors, strip price
    if (session.user.role === "EDITOR") {
      const safeOrders = orders.map((order) => ({
        ...order,
        service: {
          ...order.service,
          price: undefined,
        },
      }));
      return NextResponse.json({ orders: safeOrders });
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Create a new order (DRAFT)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clientId, serviceId, intakeFormData, brandId } = body;

    if (!clientId || !serviceId || !brandId) {
      return NextResponse.json(
        { error: "clientId, serviceId, and brandId are required" },
        { status: 400 }
      );
    }

    // Check brand access before creating order
    const hasAccess = await canAccessBrand(brandId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this brand" },
        { status: 403 }
      );
    }

    // Verify client and service exist
    const [client, service] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.service.findUnique({ where: { id: serviceId } }),
    ]);

    if (!client || !service) {
      return NextResponse.json(
        { error: "Client or Service not found" },
        { status: 404 }
      );
    }

    const order = await prisma.order.create({
      data: {
        clientId,
        serviceId,
        brandId,
        intakeFormData: intakeFormData || {},
        status: OrderStatus.DRAFT,
      },
      include: {
        client: true,
        service: true,
        brand: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "ORDER_CREATED",
        entityType: "Order",
        entityId: order.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
