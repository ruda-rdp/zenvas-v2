/**
 * API: /api/orders/[id]
 * Order operations (Business OS)
 *
 * Handles Order status transitions:
 * - DRAFT → CONFIRMED (DP received)
 * - CONFIRMED → IN_PROGRESS
 * - IN_PROGRESS → COMPLETED
 *
 * Authorization:
 * - GET: Uses requireUser + brand access check
 * - PATCH: Uses requireUser + requireAction(write:orders) + brand access
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  stripConfidentialFields,
  canAccessBrand,
} from "@/lib/authorize";
import { OrderStatus } from "@/generated/prisma";
import { syncOrderDpInvoice, syncOrderFinalInvoice } from "@/lib/odoo";

// GET /api/orders/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

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

    // Check brand access - FIXED: was missing this check
    const hasAccess = await canAccessBrand(order.brandId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Apply confidentiality filtering for EDITORs
    const safeOrder = stripConfidentialFields(order, user.role);

    return NextResponse.json({ order: safeOrder });
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
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction instead of manual role check
  const actionResult = await requireAction(user, "write:orders");
  if (!actionResult.success) return actionResult.response;

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
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
