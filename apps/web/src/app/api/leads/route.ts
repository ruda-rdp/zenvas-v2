/**
 * API: /api/leads
 * CRUD for Leads (Business OS - Lead Management)
 * 
 * Per LEAD_MANAGEMENT.md: Dual-path lead capture + qualification funnel
 * Lead → Qualified → Converted to Client
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBrandIds } from "@/lib/authorize";
import { syncClientToOdoo, createOdooClient } from "@/lib/odoo";
import { LeadStatus } from "@/generated/prisma";

// GET /api/leads - List all leads for user's accessible brands
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

    // For Editors, strip confidential data
    if (session.user.role === "EDITOR") {
      const safeLeads = leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        status: lead.status,
        priority: lead.priority,
        interest: lead.interest,
        createdAt: lead.createdAt,
        brand: lead.brand,
      }));
      return NextResponse.json({ leads: safeLeads });
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Owner and Manager can create leads
  if (session.user.role === "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
        userId: session.user.id,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
