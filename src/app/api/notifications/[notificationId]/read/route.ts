// src/app/api/notifications/[notificationId]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { markNotificationAsRead } from "@/lib/services/notification-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
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

    const result = await markNotificationAsRead(notificationId);

    if (result.success) {
      return NextResponse.json({ message: "Marked as read" });
    } else {
      // FIX: Remove reference to result.error since it doesn't exist
      return NextResponse.json({ message: "Failed to mark as read" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
