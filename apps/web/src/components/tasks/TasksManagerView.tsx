"use client";

import { useMemo } from "react";
import TaskManager from "./TaskManager";

// Project task type (from API)
interface ProjectTask {
  id: string;
  parentTaskId: string | null;
  name: string;
  status: string;
  category: string | null;
  priority: string;
  assigneeUserId: string | null;
  payoutAmount: string | null;
  expectedDurationMinutes: number;
  isFromTemplate: boolean;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  tags: string[];
  assignee: { id: string; name: string } | null;
  children: ProjectTask[];
  payout: { id: string; amount: string; status: string } | null;
  order?: number;
  stageId?: string;
}

interface Project {
  id: string;
  stages: Array<{
    id: string;
    name: string;
    order: number;
    tasks: ProjectTask[];
  }>;
}

interface TasksManagerViewProps {
  project: Project;
  canManage: boolean;
}

export default function TasksManagerView({
  project,
  canManage,
}: TasksManagerViewProps) {
  // Flatten tasks from all stages
  const tasks = useMemo(() => {
    return project.stages.flatMap((stage) => stage.tasks);
  }, [project.stages]);

  // Use TaskManager which has the premium SpreadsheetView built-in
  return (
    <TaskManager
      tasks={tasks as Parameters<typeof TaskManager>[0]["tasks"]}
      users={[]}
      projectId={project.id}
      onRefresh={() => {
        window.location.reload();
      }}
      canManage={canManage}
    />
  );
}
