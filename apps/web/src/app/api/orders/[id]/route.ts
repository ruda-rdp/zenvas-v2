/**
 * API: /api/orders/[id]
 * Order operations (Business OS)
 * 
 * Handles Order status transitions:
 * - DRAFT → CONFIRMED (DP received)
 * - CONFIRMED → IN_PROGRESS
 * - IN_PROGRESS → COMPLETED
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/authorize";
import { OrderStatus } from "@/generated/prisma";
import { syncOrderDpInvoice, syncOrderFinalInvoice } from "@/lib/odoo";

// GET /api/orders/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        brand: true,
        project: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Update order status
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
    const { status } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check brand access
    const hasAccess = await canAccessBrand(order.brandId);
    if (!hasAccess) {
      return NextResponse.json({ error: "You don't have access to this order's brand" }, { status: 403 });
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: [OrderStatus.CONFIRMED],
      CONFIRMED: [OrderStatus.IN_PROGRESS],
      IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update order
    const updateData: Record<string, unknown> = { status };
    
    if (status === OrderStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
      
      // Sync DP Invoice to Odoo
      try {
        await syncOrderDpInvoice(id);
      } catch (odooError) {
        console.error("Odoo DP sync failed:", odooError);
      }
    }
    
    if (status === OrderStatus.COMPLETED) {
      updateData.completedAt = new Date();
      
      // Sync Final Invoice to Odoo
      try {
        await syncOrderFinalInvoice(id);
      } catch (odooError) {
        console.error("Odoo Final sync failed:", odooError);
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        service: true,
        brand: true,
        project: true,
      },
    });

    // Log activity
    const activityMap: Record<string, "ORDER_CONFIRMED" | "ORDER_COMPLETED" | "ORDER_CANCELLED"> = {
      CONFIRMED: "ORDER_CONFIRMED",
      COMPLETED: "ORDER_COMPLETED",
      CANCELLED: "ORDER_CANCELLED",
    };

    const activityType = activityMap[status];
    if (activityType) {
      await prisma.activityLog.create({
        data: {
          type: activityType,
          entityType: "Order",
          entityId: id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
