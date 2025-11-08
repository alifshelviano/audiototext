// app/api/meetings/[meetingId]/route.ts
import { NextResponse } from "next/server";
import { updateMeeting, deleteMeeting } from "@/lib/services/meeting-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { meetingId } = await params;
    const { name, time } = await req.json();

    if (!name || !time) {
      return NextResponse.json({ message: "Name and time are required" }, { status: 400 });
    }

    const result = await updateMeeting(meetingId, { name, time });

    if (!result.success) {
      return NextResponse.json({ message: "Failed to update meeting" }, { status: 500 });
    }

    return NextResponse.json({ message: "Meeting updated successfully" });
  } catch (error: any) {
    console.error("Meeting update error:", error);
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ meetingId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { meetingId } = await params;

    const result = await deleteMeeting({
      meetingId,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.error || "Failed to delete meeting" }, { status: 500 });
    }

    return NextResponse.json({ message: "Meeting deleted successfully" });
  } catch (error: any) {
    console.error("Meeting deletion error:", error);
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
