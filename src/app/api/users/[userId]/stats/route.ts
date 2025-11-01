// app/api/users/[userId]/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/database/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Await params first
    const { userId } = await params;

    const token = await getToken({ req });
    if (!token || token.sub !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Use userId as string since that's how it's stored in your collection
    const meetingsCreated = await db.collection("meetings").countDocuments({
      userId: userId,
    });

    const publicMeetings = await db.collection("meetings").countDocuments({
      userId: userId,
      isPublic: true,
    });

    const privateMeetings = await db.collection("meetings").countDocuments({
      userId: userId,
      isPublic: false,
    });

    // Count total transcripts across all user's meetings
    const userMeetings = await db.collection("meetings").find({ userId: userId }).project({ transcripts: 1, participants: 1, summary: 1, name: 1, createdAt: 1 }).toArray();

    const transcriptsGenerated = userMeetings.reduce((total, meeting) => {
      return total + (meeting.transcripts?.length || 0);
    }, 0);

    // Count meetings with AI analysis (has summary)
    const analyzedMeetings = userMeetings.filter((meeting) => meeting.summary?.summary_text || meeting.summary?.meeting_summary).length;

    // Calculate total participants across all meetings
    const totalParticipants = userMeetings.reduce((total, meeting) => {
      return total + (meeting.participants?.length || 0);
    }, 0);

    // Calculate average participants per meeting
    const avgParticipants = meetingsCreated > 0 ? (totalParticipants / meetingsCreated).toFixed(1) : "0";

    // Get recent meetings (already have them from userMeetings)
    const recentMeetings = userMeetings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    return NextResponse.json(
      {
        // Basic counts
        meetingsCreated,
        transcriptsGenerated,
        publicMeetings,
        privateMeetings,
        analyzedMeetings,

        // Analytics
        totalParticipants,
        avgParticipants,

        // Recent activity
        recentMeetings: recentMeetings.map((meeting) => ({
          id: meeting._id?.toString(),
          name: meeting.name,
          date: meeting.createdAt,
          participants: meeting.participants?.length || 0,
          transcripts: meeting.transcripts?.length || 0,
          hasSummary: !!(meeting.summary?.summary_text || meeting.summary?.meeting_summary),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
