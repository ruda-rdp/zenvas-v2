/**
 * API: /api/projects/[id]
 * Get single project detail
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
    
    const project = await prisma.project.findUnique({
      where: { id },
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
                payout: true,
                children: {
                  include: {
                    assignee: {
                      select: { id: true, name: true },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
