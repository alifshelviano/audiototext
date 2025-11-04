// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/database/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { userIds, notification } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "User IDs are required" }, { status: 400 });
    }

    if (!notification || !notification.type || !notification.title) {
      return NextResponse.json({ message: "Valid notification data is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Store notifications in database
    const notificationsCollection = db.collection("notifications");
    const notificationsToInsert = userIds.map((userId) => ({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      meetingId: notification.meetingId,
      meetingName: notification.meetingName,
      read: false,
      createdAt: new Date(),
    }));

    if (notificationsToInsert.length > 0) {
      await notificationsCollection.insertMany(notificationsToInsert);
    }

    // Try to emit Socket.IO events if server is running in same process
    try {
      // This will only work if the API route is running in the same process as the Socket.IO server
      const { getSocketIOInstanceSafe } = await import("@/lib/socket");
      const io = getSocketIOInstanceSafe();

      if (io) {
        for (const userId of userIds) {
          io.to(`user-${userId}`).emit("new-notification", {
            ...notification,
            id: `temp-${Date.now()}-${userId}`,
            createdAt: new Date(),
          });
        }
        console.log(`✅ Real-time notifications sent to ${userIds.length} users via Socket.IO`);
      } else {
        console.log("ℹ️ Socket.IO not available in API context, notifications stored in DB only");
      }
    } catch (socketError) {
      console.log("ℹ️ Socket.IO not available in API context");
      // Continue without Socket.IO - notifications are stored in DB
    }

    return NextResponse.json({
      message: `Notifications processed for ${userIds.length} users`,
      sent: userIds.length,
      realTime: false, // Indicate that real-time wasn't available
    });
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json({ message: "Failed to send notifications", error: error.message }, { status: 500 });
  }
}
