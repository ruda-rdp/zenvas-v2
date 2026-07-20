/**
 * Notification Helper Functions
 * Use these to create notifications from anywhere in the app
 */

import { prisma } from "@/lib/db";
import { NotificationType } from "@/generated/prisma";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, link } = params;

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });
}

/**
 * Create notification for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  const data = userIds.map((userId) => ({
    userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
  }));

  return prisma.notification.createMany({ data });
}

/**
 * Notification types and when to use them:
 * 
 * TASK_ASSIGNED    - When a task is assigned to a user
 * TASK_COMPLETED   - When a task is marked complete
 * PROJECT_UPDATE   - When a project's stage changes
 * DELIVERY_READY   - When a delivery is ready for client review
 * LEAD_NEW         - When a new lead is created
 * ORDER_CONFIRMED  - When an order is confirmed
 * ORDER_COMPLETED  - When an order is completed
 * SYSTEM          - System-wide announcements
 */

// Example usage:
// 
// await createNotification({
//   userId: task.assigneeUserId,
//   type: "TASK_ASSIGNED",
//   title: "New Task Assigned",
//   message: `You have been assigned to "${task.name}"`,
//   link: `/projects/${projectId}`,
// });
