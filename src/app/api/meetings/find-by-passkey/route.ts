// app/api/meetings/find-by-passkey/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/database/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passkey = searchParams.get("passkey");

    if (!passkey) {
      return NextResponse.json({ message: "Passkey is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection("meetings");

    console.log("Searching for meeting with passkey:", passkey);

    // Find meeting by passkey (case insensitive) - search both public and private meetings
    const meeting = await meetingsCollection.findOne({
      passkey: { $regex: new RegExp(`^${passkey}$`, "i") },
    });

    console.log("Found meeting:", meeting);

    if (!meeting) {
      return NextResponse.json({ message: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json({
      meetingId: meeting._id.toString(),
      name: meeting.name,
      isPublic: meeting.isPublic,
      language: meeting.language,
      hasPasskey: !!meeting.passkey,
    });
  } catch (error: any) {
    console.error("Error finding meeting by passkey:", error);
    return NextResponse.json({ message: error.message || "Failed to find meeting" }, { status: 500 });
  }
}
