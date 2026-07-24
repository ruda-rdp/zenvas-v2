/**
 * API: /api/projects
 * CRUD for Projects (Project OS)
 *
 * Per BUSINESS_OS.md: Project created only after Order is CONFIRMED
 * Per PROJECT_OS.md: Project → Stage → Task hierarchy
 *
 * Authorization:
 * - GET: Uses requireUser + requireAction + scopeToBrands
 * - POST: Uses requireUser + requireAction for write:projects
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireUser,
  requireAction,
  scopeToBrands,
  getAccessibleBrandIds,
} from "@/lib/authorize";

// GET /api/projects - List all projects for user's organization
export async function GET() {
  // Use centralized guard
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  try {
    // Use scopeToBrands for consistent brand filtering
    const { brands, scopeFilter } = await scopeToBrands();

    const defaultPagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

    if (brands.length === 0) {
      return NextResponse.json({ projects: [], pagination: defaultPagination });
    }

    // Build where clause - projects from brands in user's organization
    // Include both: projects with orders AND solo projects (brandId only)
    const where: Record<string, unknown> = {
      OR: [
        // Projects with orders from accessible brands
        { order: { brandId: { in: brands } } },
        // Solo projects - direct brand association
        { brandId: { in: brands }, orderId: null },
      ],
    };

    const page = 1;
    const limit = 20;
    const skip = 0;

    // Get total count for pagination
    const total = await prisma.project.count({ where });

    const projects = await prisma.project.findMany({
      where,
      take: limit,
      skip,
      include: {
        order: {
          include: {
            client: true,
            service: true,
            brand: true,
          },
        },
        brand: true, // For solo projects
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

    // Apply confidentiality filtering for EDITORs
    const safeProjects = projects.map((project) => {
      if (user.role === "EDITOR") {
        // Editors should NEVER see order, service, client, or any price data
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          posterUrl: project.posterUrl,
          posterAspect: project.posterAspect,
          createdAt: project.createdAt,
          orderId: project.orderId,
          brandId: project.brandId,
          // Strip all order-related data for editors
          order: undefined,
          brand: project.brand ? {
            id: project.brand.id,
            name: project.brand.name,
          } : undefined,
          stages: project.stages.map(stage => ({
            id: stage.id,
            name: stage.name,
            order: stage.order,
            tasks: stage.tasks.map(task => ({
              id: task.id,
              name: task.name,
              status: task.status,
              order: task.order,
              category: task.category,
              expectedDurationMinutes: task.expectedDurationMinutes,
              startedAt: task.startedAt,
              completedAt: task.completedAt,
              clientVisible: task.clientVisible,
              assignee: task.assignee ? {
                id: task.assignee.id,
                name: task.assignee.name,
              } : undefined,
              // NEVER include payout info for editors
              payout: undefined,
            })),
          })),
        };
      }
      return project;
    });

    return NextResponse.json({
      projects: safeProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST /api/projects - Create a new project (solo mode or from CONFIRMED Order)
export async function POST(request: Request) {
  // Use centralized guards
  const authResult = await requireUser();
  if (!authResult.success) return authResult.response;

  const { user } = authResult;

  // Use requireAction instead of manual role check
  const actionResult = await requireAction(user, "write:projects");
  if (!actionResult.success) return actionResult.response;

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
        data: { type: "PROJECT_CREATED", entityType: "Project", entityId: project.id, userId: user.id },
      });

      return NextResponse.json({ project: completeProject }, { status: 201 });
    }

    // SOLO MODE: Create project directly (no order, brand optional for solo creators)
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 200) {
      return NextResponse.json({ error: "Project name must be between 1 and 200 characters" }, { status: 400 });
    }

    // Sanitize description
    const sanitizedDescription = description ? description.trim().slice(0, 5000) : null;

    // Validate posterUrl if provided (basic URL check)
    if (posterUrl && posterUrl.length > 2000) {
      return NextResponse.json({ error: "Poster URL is too long" }, { status: 400 });
    }

    // Validate posterAspect
    const validAspects = ["16:9", "4:3", "1:1", "9:16"];
    if (posterAspect && !validAspects.includes(posterAspect)) {
      return NextResponse.json({ error: "Invalid poster aspect ratio" }, { status: 400 });
    }

    // Get user's organization and accessible brands
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!userWithOrg?.organizationId) {
      return NextResponse.json({ error: "User has no organization" }, { status: 400 });
    }

    // Get brand from request or find/create one for solo project
    let targetBrandId: string | undefined = brandId;

    if (!targetBrandId) {
      // Try to find existing brand
      const accessibleBrands = await getAccessibleBrandIds();
      targetBrandId = accessibleBrands[0];

      // If no brand exists, create a default one for solo creators
      if (!targetBrandId) {
        const defaultBrand = await prisma.brand.create({
          data: {
            name: `${user.name || 'My'}'s Projects`,
            slug: `${user.id.slice(-8)}-personal`,
            organizationId: userWithOrg.organizationId,
            hasClientPortal: false,
          },
        });

        // Grant user access to this brand
        await prisma.brandAccess.create({
          data: {
            userId: user.id,
            brandId: defaultBrand.id,
          },
        });

        targetBrandId = defaultBrand.id;
      }
    }

    // Create solo project with brand association (no order required)
    const project = await prisma.project.create({
      data: {
        name: trimmedName,
        description: sanitizedDescription,
        posterUrl: posterUrl || null,
        posterAspect: posterAspect || "16:9",
        brandId: targetBrandId,
        stages: {
          create: [
            { name: "To Do", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "Done", order: 2 },
          ],
        },
      },
      include: {
        brand: true,
        stages: { include: { tasks: true }, orderBy: { order: "asc" } },
      },
    });

    await prisma.activityLog.create({
      data: { type: "PROJECT_CREATED", entityType: "Project", entityId: project.id, userId: user.id },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create project: ${message}` }, { status: 500 });
  }
}
