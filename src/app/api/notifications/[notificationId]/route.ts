// src/app/api/notifications/[notificationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { deleteNotification } from "@/lib/services/notification-service";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await params;

    // Validate notification ID
    if (!notificationId || notificationId === "undefined") {
      return NextResponse.json({ message: "Invalid notification ID" }, { status: 400 });
    }

    const result = await deleteNotification(notificationId, session.user.id);

    if (result.success) {
      return NextResponse.json({ message: "Notification deleted" });
    } else {
      // FIX: Remove reference to result.error
      return NextResponse.json({ message: "Failed to delete notification" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
