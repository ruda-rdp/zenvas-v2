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
    const status = searchParams.get("status");
    const brandId = searchParams.get("brandId");

    const accessibleBrands = await getAccessibleBrandIds();
    
    const where: Record<string, unknown> = {
      order: {
        brandId: {
          in: accessibleBrands,
        },
      },
    };

    if (brandId && accessibleBrands.includes(brandId)) {
      where.order = { ...where.order as object, brandId };
    }

    if (status) {
      where.order = { ...where.order as object, status };
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
          order: {
            ...project.order,
            service: {
              ...project.order.service,
              // Hide price for editors
            },
          },
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

// POST /api/projects - Create a new project (only from CONFIRMED Order)
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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Check Order exists and is CONFIRMED
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true },
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

    // Check if project already exists for this order
    const existingProject = await prisma.project.findUnique({
      where: { orderId },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: "Project already exists for this order" },
        { status: 400 }
      );
    }

    // Create project with stages and tasks from Service Template
    const stageTemplate = order.service.stageTemplate as Array<{
      name: string;
      tasks: Array<{
        name: string;
        expectedDurationMinutes: number;
        visibility?: boolean;
      }>;
    }>;

    // Create project first
    const project = await prisma.project.create({
      data: {
        orderId,
      },
    });

    // Create stages and tasks from template
    for (let stageIndex = 0; stageIndex < stageTemplate.length; stageIndex++) {
      const stageDef = stageTemplate[stageIndex];
      
      const stage = await prisma.stage.create({
        data: {
          projectId: project.id,
          name: stageDef.name,
          order: stageIndex,
        },
      });

      // Create tasks for this stage
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

    // Fetch complete project
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
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
            tasks: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "PROJECT_CREATED",
        entityType: "Project",
        entityId: project.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ project: completeProject }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
