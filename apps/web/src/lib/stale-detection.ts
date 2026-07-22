/**
 * lib/stale-detection.ts — Stale Task Detection
 *
 * Per PROJECT_OS.md — Stale Task Detection:
 * "A Task that remains unchecked past its expected duration is automatically
 * surfaced to Mission Control as 'Needs Attention.' This is inferred from
 * elapsed time, not manually declared by anyone."
 *
 * This module computes staleness on READ — the result is NOT stored.
 * This ensures Mission Control always shows fresh data.
 */

import type { TaskStatus, Task } from "@/generated/prisma";

/**
 * How stale detection works:
 *
 * 1. A Task has `expectedDurationMinutes` (from Service Template)
 * 2. When a Task starts (status = IN_PROGRESS), `startedAt` is set
 * 3. Stale detection compares elapsed time vs expected duration
 *
 * Staleness thresholds (configurable):
 * - NORMAL: < 80% of expected duration
 * - WARNING: 80-100% of expected duration
 * - STALE: > 100% of expected duration (needs attention)
 * - CRITICAL: > 200% of expected duration
 */

export enum StalenessLevel {
  NORMAL = "NORMAL",
  WARNING = "WARNING",
  STALE = "STALE",
  CRITICAL = "CRITICAL",
}

/**
 * Staleness threshold percentages
 */
const STALENESS_THRESHOLDS = {
  WARNING: 0.8,   // 80% of expected duration
  STALE: 1.0,     // 100% (exactly at expected)
  CRITICAL: 2.0,   // 200% (double the expected)
};

export interface StaleTaskInfo {
  taskId: string;
  taskName: string;
  stageName: string;
  projectName: string;
  projectId: string;
  assigneeName: string | null;
  expectedDurationMinutes: number;
  actualDurationMinutes: number;
  stalenessLevel: StalenessLevel;
  stalenessPercentage: number; // actual / expected * 100
  startedAt: Date | null;
  isOverdue: boolean;
  overdueMinutes: number;
}

/**
 * Calculate staleness for a single task
 *
 * Rules:
 * - Only OPEN or IN_PROGRESS tasks can be stale
 * - Task must have startedAt set to be stale
 * - Completed tasks are never stale
 */
export function calculateStaleness(
  task: Pick<Task, "status" | "expectedDurationMinutes" | "startedAt" | "completedAt">,
  now: Date = new Date()
): {
  level: StalenessLevel;
  actualDurationMinutes: number;
  overdueMinutes: number;
  isOverdue: boolean;
  percentage: number;
} {
  // Completed tasks are never stale
  if (task.status === "COMPLETE" || task.completedAt) {
    return {
      level: StalenessLevel.NORMAL,
      actualDurationMinutes: 0,
      overdueMinutes: 0,
      isOverdue: false,
      percentage: 0,
    };
  }

  // Task must have started to be stale
  if (!task.startedAt) {
    // Task hasn't started yet — check if it's past due (assigned but not started)
    // For now, return normal
    return {
      level: StalenessLevel.NORMAL,
      actualDurationMinutes: 0,
      overdueMinutes: 0,
      isOverdue: false,
      percentage: 0,
    };
  }

  // Calculate actual duration
  const startTime = new Date(task.startedAt).getTime();
  const nowTime = now.getTime();
  const actualDurationMs = nowTime - startTime;
  const actualDurationMinutes = Math.floor(actualDurationMs / (1000 * 60));

  // Calculate expected vs actual
  const expectedMinutes = task.expectedDurationMinutes;
  const percentage = expectedMinutes > 0 ? actualDurationMinutes / expectedMinutes : 0;
  const overdueMinutes = Math.max(0, actualDurationMinutes - expectedMinutes);

  // Determine staleness level
  let level: StalenessLevel;

  if (percentage >= STALENESS_THRESHOLDS.CRITICAL) {
    level = StalenessLevel.CRITICAL;
  } else if (percentage >= STALENESS_THRESHOLDS.STALE) {
    level = StalenessLevel.STALE;
  } else if (percentage >= STALENESS_THRESHOLDS.WARNING) {
    level = StalenessLevel.WARNING;
  } else {
    level = StalenessLevel.NORMAL;
  }

  return {
    level,
    actualDurationMinutes,
    overdueMinutes,
    isOverdue: percentage >= 1.0,
    percentage,
  };
}

/**
 * Get all stale tasks for a brand
 * Used by Mission Control dashboard
 * 
 * FIXED: Supports both solo projects (project.brandId) and order-based projects (project.order.brandId)
 */
export async function getStaleTasks(prisma: any, brandId: string): Promise<StaleTaskInfo[]> {
  const now = new Date();

  // Get all tasks that are OPEN or IN_PROGRESS
  // Supports both solo projects (project.brandId) and order-based projects (project.order.brandId)
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        {
          stage: {
            project: {
              brandId: brandId,
            },
          },
        },
        {
          stage: {
            project: {
              order: {
                brandId: brandId,
              },
            },
          },
        },
      ],
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
    include: {
      stage: {
        include: {
          project: true,
        },
      },
      assignee: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc", // Oldest first
    },
  });

  const staleTasks: StaleTaskInfo[] = [];

  for (const task of tasks) {
    const staleness = calculateStaleness(task, now);

    // Only include tasks that are WARNING or worse
    if (staleness.level !== StalenessLevel.NORMAL) {
      staleTasks.push({
        taskId: task.id,
        taskName: task.name,
        stageName: task.stage.name,
        projectName: task.stage.project.name,
        projectId: task.stage.project.id,
        assigneeName: task.assignee?.name || null,
        expectedDurationMinutes: task.expectedDurationMinutes,
        actualDurationMinutes: staleness.actualDurationMinutes,
        stalenessLevel: staleness.level,
        stalenessPercentage: Math.round(staleness.percentage * 100),
        startedAt: task.startedAt,
        isOverdue: staleness.isOverdue,
        overdueMinutes: staleness.overdueMinutes,
      });
    }
  }

  return staleTasks;
}

/**
 * Get stale tasks for a specific project
 * FIXED: projectName from project.name instead of project.order.service.name
 */
export async function getProjectStaleTasks(
  prisma: any,
  projectId: string
): Promise<StaleTaskInfo[]> {
  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      stage: {
        projectId: projectId,
      },
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
    include: {
      stage: {
        include: {
          project: true,
        },
      },
      assignee: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  const staleTasks: StaleTaskInfo[] = [];

  for (const task of tasks) {
    const staleness = calculateStaleness(task, now);

    if (staleness.level !== StalenessLevel.NORMAL) {
      staleTasks.push({
        taskId: task.id,
        taskName: task.name,
        stageName: task.stage.name,
        projectName: task.stage.project.name,
        projectId: task.stage.project.id,
        assigneeName: task.assignee?.name || null,
        expectedDurationMinutes: task.expectedDurationMinutes,
        actualDurationMinutes: staleness.actualDurationMinutes,
        stalenessLevel: staleness.level,
        stalenessPercentage: Math.round(staleness.percentage * 100),
        startedAt: task.startedAt,
        isOverdue: staleness.isOverdue,
        overdueMinutes: staleness.overdueMinutes,
      });
    }
  }

  return staleTasks;
}

/**
 * Get stale tasks for a specific user (Editor)
 * FIXED: projectName from project.name instead of project.order.service.name
 */
export async function getUserStaleTasks(prisma: any, userId: string): Promise<StaleTaskInfo[]> {
  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      assigneeUserId: userId,
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
    include: {
      stage: {
        include: {
          project: true,
        },
      },
      assignee: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  const staleTasks: StaleTaskInfo[] = [];

  for (const task of tasks) {
    const staleness = calculateStaleness(task, now);

    if (staleness.level !== StalenessLevel.NORMAL) {
      staleTasks.push({
        taskId: task.id,
        taskName: task.name,
        stageName: task.stage.name,
        projectName: task.stage.project.name,
        projectId: task.stage.project.id,
        assigneeName: task.assignee?.name || null,
        expectedDurationMinutes: task.expectedDurationMinutes,
        actualDurationMinutes: staleness.actualDurationMinutes,
        stalenessLevel: staleness.level,
        stalenessPercentage: Math.round(staleness.percentage * 100),
        startedAt: task.startedAt,
        isOverdue: staleness.isOverdue,
        overdueMinutes: staleness.overdueMinutes,
      });
    }
  }

  return staleTasks;
}

/**
 * Get stale task counts for Mission Control
 * Returns summary counts for each staleness level
 * 
 * FIXED: Supports both solo projects and order-based projects via OR
 */
export async function getStaleTaskCounts(prisma: any, brandId: string): Promise<{
  total: number;
  normal: number;
  warning: number;
  stale: number;
  critical: number;
}> {
  const staleTasks = await getStaleTasks(prisma, brandId);

  const counts = {
    total: staleTasks.length,
    normal: 0,
    warning: 0,
    stale: 0,
    critical: 0,
  };

  for (const task of staleTasks) {
    switch (task.stalenessLevel) {
      case StalenessLevel.NORMAL:
        counts.normal++;
        break;
      case StalenessLevel.WARNING:
        counts.warning++;
        break;
      case StalenessLevel.STALE:
        counts.stale++;
        break;
      case StalenessLevel.CRITICAL:
        counts.critical++;
        break;
    }
  }

  // Add normal tasks count - supports both solo and order-based projects
  counts.normal = (
    await prisma.task.count({
      where: {
        OR: [
          {
            stage: {
              project: {
                brandId: brandId,
              },
            },
          },
          {
            stage: {
              project: {
                order: {
                  brandId: brandId,
                },
              },
            },
          },
        ],
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
        startedAt: {
          not: null,
        },
      },
    })
  ) - counts.total;

  return counts;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days}d ${remainingHours}h`;
}

/**
 * Get staleness color for UI
 * Returns Tailwind CSS color class
 */
export function getStalenessColor(level: StalenessLevel): string {
  switch (level) {
    case StalenessLevel.NORMAL:
      return "text-green-600";
    case StalenessLevel.WARNING:
      return "text-yellow-600";
    case StalenessLevel.STALE:
      return "text-orange-600";
    case StalenessLevel.CRITICAL:
      return "text-red-600";
  }
}

/**
 * Get staleness background color for UI
 */
export function getStalenessBgColor(level: StalenessLevel): string {
  switch (level) {
    case StalenessLevel.NORMAL:
      return "bg-green-100";
    case StalenessLevel.WARNING:
      return "bg-yellow-100";
    case StalenessLevel.STALE:
      return "bg-orange-100";
    case StalenessLevel.CRITICAL:
      return "bg-red-100";
  }
}
