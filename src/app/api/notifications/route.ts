// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { getUserNotifications } from "@/lib/services/notification-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await getUserNotifications(session.user.id, unreadOnly);

    const unreadCount = unreadOnly ? notifications.length : notifications.filter((n) => !n.read).length;

    // Transform MongoDB documents to client-safe format
    const clientNotifications = notifications.map((notification) => ({
      id: notification._id?.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      meetingId: notification.meetingId,
      meetingName: notification.meetingName,
      actionItem: notification.actionItem,
      read: notification.read,
      createdAt: notification.createdAt,
    }));

    return NextResponse.json({
      notifications: clientNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
