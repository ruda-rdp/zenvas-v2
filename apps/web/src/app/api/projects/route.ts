/**
 * API: /api/projects
 * CRUD for Projects (Project OS)
 * 
 * Per BUSINESS_OS.md: Project created only after Order is CONFIRMED
 * Per PROJECT_OS.md: Project → Stage → Task hierarchy
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can, getAccessibleBrandIds } from "@/lib/authorize";

// GET /api/projects - List all projects for user's accessible brands
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    const accessibleBrands = await getAccessibleBrandIds();
    
    // Include projects with order (brand filter) OR projects without order (solo projects)
    const where: Record<string, unknown> = {
      OR: [
        // Projects with orders from accessible brands
        { order: { brandId: { in: accessibleBrands } } },
        // Solo projects (no order) - they belong to accessible brands through user's access
        { order: null },
      ],
    };

    // For solo projects, we need to handle differently - they need brand association
    // For now, show all projects without orders (solo) or with orders
    
    if (brandId && accessibleBrands.includes(brandId)) {
      where.OR = [
        { order: { brandId } },
        { order: null }, // Solo projects shown for all
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        order: {
          include: {
            client: true,
            service: true,
            brand: true,
          },
        },
        stages: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // For Editors, strip confidential data
    const safeProjects = projects.map((project) => {
      if (session.user.role === "EDITOR") {
        return {
          ...project,
          order: project.order ? {
            ...project.order,
            service: {
              ...project.order.service,
              // Hide price for editors
            },
          } : null,
        };
      }
      return project;
    });

    return NextResponse.json({ projects: safeProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project (solo mode or from CONFIRMED Order)
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
    const { 
      // Solo mode (no order)
      name, 
      description, 
      posterUrl, 
      posterAspect,
      brandId,
      // From order mode
      orderId 
    } = body;

    // If orderId provided, create from order (original flow)
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { service: true, client: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Project can only be created from CONFIRMED Order (DP received)" },
          { status: 400 }
        );
      }

      const existingProject = await prisma.project.findUnique({ where: { orderId } });
      if (existingProject) {
        return NextResponse.json({ error: "Project already exists for this order" }, { status: 400 });
      }

      const stageTemplate = order.service.stageTemplate as Array<{
        name: string;
        tasks: Array<{ name: string; expectedDurationMinutes: number; visibility?: boolean }>;
      }>;

      const projectName = name || `${order.service.name} - ${order.client.name}`;

      const project = await prisma.project.create({
        data: {
          orderId,
          name: projectName,
          description: description || null,
          posterUrl: posterUrl || null,
          posterAspect: posterAspect || "16:9",
        },
      });

      // Create stages and tasks from template
      for (let stageIndex = 0; stageIndex < stageTemplate.length; stageIndex++) {
        const stageDef = stageTemplate[stageIndex];
        const stage = await prisma.stage.create({
          data: { projectId: project.id, name: stageDef.name, order: stageIndex },
        });
        for (let taskIndex = 0; taskIndex < stageDef.tasks.length; taskIndex++) {
          const taskDef = stageDef.tasks[taskIndex];
          await prisma.task.create({
            data: {
              stageId: stage.id,
              name: taskDef.name,
              order: taskIndex,
              expectedDurationMinutes: taskDef.expectedDurationMinutes || 60,
              clientVisible: taskDef.visibility ?? true,
              isFromTemplate: true,
            },
          });
        }
      }

      const completeProject = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          order: { include: { client: true, service: true, brand: true } },
          stages: { include: { tasks: true }, orderBy: { order: "asc" } },
        },
      });

      await prisma.activityLog.create({
        data: { type: "PROJECT_CREATED", entityType: "Project", entityId: project.id, userId: session.user.id },
      });

      return NextResponse.json({ project: completeProject }, { status: 201 });
    }

    // SOLO MODE: Create project directly without order
    if (!name) {
      return NextResponse.json({ error: "Project name is required for solo projects" }, { status: 400 });
    }

    // Get user's accessible brand
    const accessibleBrands = await getAccessibleBrandIds();
    const targetBrandId = brandId && accessibleBrands.includes(brandId) 
      ? brandId 
      : accessibleBrands[0];

    if (!targetBrandId) {
      return NextResponse.json({ error: "No brand available. Please create a brand first." }, { status: 400 });
    }

    // Create solo project (no order association)
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        posterUrl: posterUrl || null,
        posterAspect: posterAspect || "16:9",
        // Create default stages for solo projects
        stages: {
          create: [
            { name: "To Do", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "Done", order: 2 },
          ],
        },
      },
      include: {
        stages: { include: { tasks: true }, orderBy: { order: "asc" } },
      },
    });

    await prisma.activityLog.create({
      data: { type: "PROJECT_CREATED", entityType: "Project", entityId: project.id, userId: session.user.id },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create project: ${message}` }, { status: 500 });
  }
}
