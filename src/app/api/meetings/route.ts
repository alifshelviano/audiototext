// api/meetings/route.ts
import { NextResponse } from "next/server";
import { createMeeting, getMeetings } from "@/lib/meetings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Function to generate a random passkey
function generatePasskey(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, time, isPublic = true, language = "english" } = await req.json();

    if (!name || !time) {
      return NextResponse.json({ message: "Name and time are required" }, { status: 400 });
    }

    // Validate language
    const validLanguages = ["english", "indonesian", "korean"];
    if (!validLanguages.includes(language)) {
      return NextResponse.json({ message: "Invalid language selection" }, { status: 400 });
    }

    // Generate passkey for private meetings - use undefined for public meetings
    const passkey = !isPublic ? generatePasskey() : undefined;

    const { meetingId } = await createMeeting({
      name,
      time,
      userId: session.user.id,
      isPublic,
      language,
      passkey,
    });

    // Debug log to verify the meetingId
    console.log("Created meeting with ID:", meetingId);

    return NextResponse.json(
      {
        message: "Meeting created successfully",
        meetingId: meetingId,
        id: meetingId, // Include both for compatibility
        isPublic,
        language,
        passkey,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Meeting creation error:", error);
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const publicOnly = searchParams.get("public") === "true";
    const userOnly = searchParams.get("userOnly") === "true";

    // If requesting public meetings, no authentication required
    if (publicOnly) {
      const meetings = await getMeetings({ isPublic: true });
      return NextResponse.json(meetings);
    }

    // For user-specific meetings, require authentication
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // If userOnly is true, return only the current user's meetings
    if (userOnly) {
      const meetings = await getMeetings({ userId: session.user.id });
      return NextResponse.json(meetings);
    }

    // If specific userId is provided, check authorization
    if (userId) {
      if (userId !== session.user.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      const meetings = await getMeetings({ userId });
      return NextResponse.json(meetings);
    } else {
      // Default: return all meetings (admin view or all user's meetings)
      const meetings = await getMeetings({ userId: session.user.id });
      return NextResponse.json(meetings);
    }
  } catch (error: any) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch meetings" }, { status: 500 });
  }
}
