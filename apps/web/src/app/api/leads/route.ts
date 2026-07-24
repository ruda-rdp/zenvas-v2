/**
 * API: /api/leads
 * CRUD for Leads (Business OS - Lead Management)
 *
 * Per LEAD_MANAGEMENT.md: Dual-path lead capture + qualification funnel
 * Lead → Qualified → Converted to Client
 *
 * Authorization:
 * - GET: Uses requireUser + requireAction + scopeToBrands
 * - POST: Uses requireUser + requireAction for write:leads + brand access check
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  scopeToBrands,
  enforceConfidentialityArray,
  canAccessBrand,
} from "@/lib/authorize";
import { LeadStatus } from "@/generated/prisma";

// GET /api/leads - List all leads for user's accessible brands
export async function GET(request: Request) {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const brandId = searchParams.get("brandId");

    // Use scopeToBrands for consistent brand filtering
    const { brands } = await scopeToBrands();

    if (brands.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    const where: Record<string, unknown> = {
      brandId: {
        in: brands,
      },
    };

    if (brandId && brands.includes(brandId)) {
      where.brandId = brandId;
    }

    if (status) {
      where.status = status as LeadStatus;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        brand: {
          select: { id: true, name: true },
        },
        client: {
          select: { id: true, name: true },
        },
        assigned: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Apply confidentiality filtering using centralized helper
    const safeLeads = enforceConfidentialityArray(leads, user.role);

    return NextResponse.json({ leads: safeLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction instead of manual role check
  const actionResult = await requireAction(user, "write:leads");
  if (!actionResult.success) return actionResult.response;

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      source,
      sourceDetails,
      interest,
      budget,
      timeline,
      tags,
      brandId,
      assignedTo,
    } = body;

    if (!name || !source || !interest || !brandId) {
      return NextResponse.json(
        { error: "Name, source, interest, and brandId are required" },
        { status: 400 }
      );
    }

    // Check brand access using centralized helper
    const hasAccess = await canAccessBrand(brandId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this brand" },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        sourceDetails,
        interest,
        budget,
        timeline,
        tags: tags || [],
        brandId,
        assignedTo,
        status: LeadStatus.NEW,
      },
      include: {
        brand: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "LEAD_CREATED",
        entityType: "Lead",
        entityId: lead.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
