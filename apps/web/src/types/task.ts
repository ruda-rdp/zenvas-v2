// ============================================
// Task Types - Shared across Task Components
// ============================================

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskCategory = "PRE_PRODUCTION" | "PRODUCTION" | "POST_PRODUCTION";

export interface TaskAssignee {
  id: string;
  name: string;
}

export interface TaskPayout {
  id: string;
  amount: string;
  status: string;
}

export interface Task {
  id: string;
  parentTaskId: string | null;
  name: string;
  status: TaskStatus;
  category: TaskCategory | null;
  priority: TaskPriority;
  assigneeUserId: string | null;
  assignee: TaskAssignee | null;
  payoutAmount: string | null;
  payout: TaskPayout | null;
  expectedDurationMinutes: number;
  isFromTemplate: boolean;
  startDate: string | null;
  dueDate: string | null;
  description: string | null;
  tags: string[];
  children: Task[];
  order: number;
  stageId: string;
  stageName?: string;
}

// ============================================
// Task Table Column Configuration
// ============================================

export interface TaskTableColumn {
  id: string;
  label: string;
  accessor: keyof Task | "duration" | "subtaskCount" | "actions";
  width: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  align?: "left" | "center" | "right";
}

// ============================================
// Status Configuration
// ============================================

export const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}> = {
  OPEN: {
    label: "To Do",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-gray-700 dark:text-gray-300",
    hoverColor: "hover:bg-gray-200 dark:hover:bg-gray-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bgColor: "bg-blue-500",
    textColor: "text-white",
    hoverColor: "hover:bg-blue-600",
  },
  COMPLETE: {
    label: "Done",
    bgColor: "bg-green-500",
    textColor: "text-white",
    hoverColor: "hover:bg-green-600",
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}> = {
  LOW: {
    label: "Low",
    bgColor: "bg-green-100 dark:bg-green-900/50",
    textColor: "text-green-700 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  MEDIUM: {
    label: "Medium",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    textColor: "text-yellow-700 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  HIGH: {
    label: "High",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
    textColor: "text-orange-700 dark:text-orange-300",
    dotColor: "bg-orange-500",
  },
  URGENT: {
    label: "Urgent",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    textColor: "text-red-700 dark:text-red-300",
    dotColor: "bg-red-500",
  },
};

// ============================================
// Category Configuration
// ============================================

export const CATEGORY_CONFIG: Record<TaskCategory, {
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  PRE_PRODUCTION: {
    label: "Pre-Production",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  PRODUCTION: {
    label: "Production",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    textColor: "text-red-700 dark:text-red-300",
  },
  POST_PRODUCTION: {
    label: "Post-Production",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
    textColor: "text-cyan-700 dark:text-cyan-300",
  },
};

// ============================================
// Default Table Columns
// ============================================

export const DEFAULT_TASK_COLUMNS: TaskTableColumn[] = [
  {
    id: "expand",
    label: "",
    accessor: "name",
    width: 40,
    sortable: false,
  },
  {
    id: "checkbox",
    label: "",
    accessor: "name",
    width: 40,
    sortable: false,
  },
  {
    id: "name",
    label: "Task Name",
    accessor: "name",
    width: 300,
    minWidth: 200,
    sortable: true,
    editable: true,
  },
  {
    id: "status",
    label: "Status",
    accessor: "status",
    width: 130,
    minWidth: 100,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: "priority",
    label: "Priority",
    accessor: "priority",
    width: 110,
    minWidth: 80,
    sortable: true,
    filterable: true,
    editable: true,
  },
  {
    id: "assignee",
    label: "Assignee",
    accessor: "assignee",
    width: 160,
    minWidth: 120,
    sortable: true,
    editable: true,
  },
  {
    id: "startDate",
    label: "Start",
    accessor: "startDate",
    width: 120,
    minWidth: 100,
    sortable: true,
    editable: true,
  },
  {
    id: "dueDate",
    label: "Due",
    accessor: "dueDate",
    width: 120,
    minWidth: 100,
    sortable: true,
    editable: true,
  },
  {
    id: "duration",
    label: "Duration",
    accessor: "duration",
    width: 90,
    minWidth: 70,
    sortable: false,
  },
  {
    id: "subtaskCount",
    label: "Subs",
    accessor: "subtaskCount",
    width: 70,
    minWidth: 50,
    sortable: false,
  },
  {
    id: "actions",
    label: "",
    accessor: "actions",
    width: 60,
    sortable: false,
  },
];

// ============================================
// Filter Types
// ============================================

export interface TaskFilters {
  search: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assignee: string | "ALL" | "UNASSIGNED";
}

// ============================================
// Bulk Action Types
// ============================================

export type BulkAction =
  | { type: "change_status"; status: TaskStatus }
  | { type: "change_priority"; priority: TaskPriority }
  | { type: "assign"; userId: string | null }
  | { type: "delete" }
  | { type: "add_tag"; tag: string };

// ============================================
// View Types
// ============================================

export type ViewType = "spreadsheet" | "board" | "gantt" | "calendar";
