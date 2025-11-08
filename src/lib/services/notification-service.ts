// src/lib/services/notification-service.ts
"use server";

import clientPromise from "@/lib/database/mongodb";
import { ObjectId } from "mongodb";

export interface Notification {
  _id?: ObjectId;
  userId: string;
  type: "email_received" | "action_item" | "meeting_summary" | "mention";
  title: string;
  message: string;
  meetingId?: string;
  meetingName?: string;
  actionItem?: {
    task: string;
    deadline: string;
  };
  read: boolean;
  createdAt: Date;
}

export async function createNotification(notification: Omit<Notification, "_id" | "read" | "createdAt">): Promise<{ success: boolean; notificationId?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection<Notification>("notifications");

    const newNotification = {
      ...notification,
      read: false,
      createdAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(newNotification);

    return {
      success: true,
      notificationId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
}

export async function getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection<Notification>("notifications");

    const query: any = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await notificationsCollection.find(query).sort({ createdAt: -1 }).limit(50).toArray();

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection<Notification>("notifications");

    const result = await notificationsCollection.updateOne({ _id: new ObjectId(notificationId) }, { $set: { read: true } });

    return { success: result.modifiedCount > 0 };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection<Notification>("notifications");

    await notificationsCollection.updateMany({ userId, read: false }, { $set: { read: true } });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false };
  }
}

export async function deleteNotification(notificationId: string, userId: string): Promise<{ success: boolean }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const notificationsCollection = db.collection<Notification>("notifications");

    const result = await notificationsCollection.deleteOne({
      _id: new ObjectId(notificationId),
      userId, // Ensure user owns the notification
    });

    return { success: result.deletedCount > 0 };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false };
  }
}

// Function to create notifications for action items
export async function notifyActionItemAssignees(meetingId: string, meetingName: string, actionItems: any[], participants: { name: string; email: string }[]): Promise<void> {
  try {
    for (const item of actionItems) {
      const assignedTo = item.assigned_to;

      // Find participant by name
      const participant = participants.find((p) => p.name.toLowerCase() === assignedTo.toLowerCase());

      if (!participant) continue;

      // Get userId from email (assuming you have a users collection)
      const client = await clientPromise;
      const db = client.db();
      const user = await db.collection("users").findOne({
        email: participant.email.toLowerCase(),
      });

      if (!user) continue;

      await createNotification({
        userId: user._id.toString(),
        type: "action_item",
        title: "New Action Item Assigned",
        message: `You have been assigned: "${item.task}"`,
        meetingId,
        meetingName,
        actionItem: {
          task: item.task,
          deadline: item.deadline,
        },
      });
    }
  } catch (error) {
    console.error("Error notifying action item assignees:", error);
  }
}

// Function to notify users when they receive meeting summary email
export async function notifyEmailRecipients(meetingId: string, meetingName: string, recipientEmails: string[]): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db();

    for (const email of recipientEmails) {
      const user = await db.collection("users").findOne({
        email: email.toLowerCase(),
      });

      if (!user) continue;

      await createNotification({
        userId: user._id.toString(),
        type: "email_received",
        title: "Meeting Summary Received",
        message: `You've received the summary for "${meetingName}"`,
        meetingId,
        meetingName,
      });
    }
  } catch (error) {
    console.error("Error notifying email recipients:", error);
  }
}
