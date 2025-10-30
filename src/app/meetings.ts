"use server";

import { summarizeTranscribedText } from "@/ai/flows/summarize-transcribed-text";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Define interfaces for type safety
export interface Transcript {
  name: string;
  transcript: string;
  summary?: string;
  createdAt: Date;
}

export interface Participant {
  name: string;
  email: string;
}

export interface Meeting {
  _id?: ObjectId;
  name: string;
  time: string;
  userId: string;
  createdAt: Date;
  participants: Participant[];
  transcripts: Transcript[];
  summary?: any; // Changed to any to handle structured JSON
  summaryCreatedAt?: Date;
  lastAnalyzed?: Date;
  isPublic: boolean;
  language: "english" | "indonesian" | "korean";
  passkey?: string; // Only for private meetings
}

export async function createMeeting(meetingData: { name: string; time: string; userId: string; isPublic: boolean; language: "english" | "indonesian" | "korean"; passkey?: string }): Promise<{ meetingId: string }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const meeting = {
      ...meetingData,
      createdAt: new Date(),
      transcripts: [],
      participants: [],
    };

    const result = await meetingsCollection.insertOne(meeting);

    if (!result.acknowledged) {
      throw new Error("Failed to create meeting");
    }

    // Return the string representation of the MongoDB ObjectId
    const meetingId = result.insertedId.toString();

    return { meetingId };
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw new Error("Failed to create meeting");
  }
}

// app/meetings.ts - Update the getMeetings function
export async function getMeetings({ userId, isPublic }: { userId?: string; isPublic?: boolean }): Promise<
  Array<{
    id: string;
    name: string;
    time: string;
    isPublic: boolean;
    language: "english" | "indonesian" | "korean";
  }>
> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    // Build query based on parameters
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    }

    const meetings = await meetingsCollection.find(query).sort({ createdAt: -1 }).toArray();

    return meetings.map((meeting) => ({
      id: meeting._id!.toString(),
      name: meeting.name,
      time: meeting.time,
      isPublic: meeting.isPublic,
      language: meeting.language,
    }));
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }
}

export async function getMeeting({ meetingId }: { meetingId: string }): Promise<({
  id: string;
  name: string;
  time: string;
  participants: Participant[];
  transcripts: Transcript[];
  summary?: any;
  summaryCreatedAt?: Date;
  lastAnalyzed?: Date;
  isPublic: boolean;
  language: "english" | "indonesian" | "korean";
  passkey?: string;
}) | null> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const meeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!meeting) {
      return null;
    }

    return {
      id: meeting._id!.toString(),
      name: meeting.name,
      time: meeting.time,
      participants: meeting.participants || [],
      transcripts: meeting.transcripts || [],
      summary: meeting.summary,
      summaryCreatedAt: meeting.summaryCreatedAt,
      lastAnalyzed: meeting.lastAnalyzed,
      isPublic: meeting.isPublic,
      language: meeting.language,
      passkey: meeting.passkey,
    };
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return null;
  }
}

// Function to verify passkey for private meetings
export async function verifyMeetingPasskey({ meetingId, passkey }: { meetingId: string; passkey: string }): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return { success: false, error: "Invalid meeting ID" };
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const meeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!meeting) {
      return { success: false, error: "Meeting not found" };
    }

    // If meeting is public, no passkey needed
    if (meeting.isPublic) {
      return { success: true };
    }

    // If meeting is private, verify passkey
    if (!meeting.passkey) {
      return { success: false, error: "This meeting requires a passkey but none is set" };
    }

    if (meeting.passkey !== passkey.toUpperCase()) {
      return { success: false, error: "Invalid passkey" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying passkey:", error);
    return { success: false, error: "Failed to verify passkey" };
  }
}

export async function addTranscriptToMeeting({ meetingId, transcript }: { meetingId: string; transcript: Omit<Transcript, "createdAt"> & { createdAt?: Date } }): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return { success: false, error: "Invalid meeting ID" };
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    // Prepare the transcript with createdAt
    const transcriptWithDate = {
      ...transcript,
      createdAt: transcript.createdAt || new Date(),
    };

    // Add the transcript
    const result = await meetingsCollection.updateOne(
      { _id: new ObjectId(meetingId) },
      {
        $push: {
          transcripts: transcriptWithDate,
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Meeting not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding transcript to meeting:", error);
    return { success: false, error: "Failed to add transcript to meeting" };
  }
}

// In your meetings.ts server file, update the addParticipantToMeeting function:
export async function addParticipantToMeeting({ meetingId, participant }: { meetingId: string; participant: Participant }): Promise<{ success: boolean; error?: string }> {
  try {
      if (!ObjectId.isValid(meetingId)) {
          return { success: false, error: "Invalid meeting ID" };
      }

      const client = await clientPromise;
      const db = client.db();
      const meetingsCollection = db.collection<Meeting>("meetings");

      // Check if participant already exists (case-insensitive)
      const existingMeeting = await meetingsCollection.findOne({
          _id: new ObjectId(meetingId),
          "participants.email": { $regex: `^${participant.email}$`, $options: 'i' }
      });

      if (existingMeeting) {
          return { success: true }; // Participant already exists
      }

      // Add the participant
      const result = await meetingsCollection.updateOne(
          { _id: new ObjectId(meetingId) },
          {
              $push: {
                  participants: participant,
              },
          }
      );

      if (result.matchedCount === 0) {
          return { success: false, error: "Meeting not found" };
      }

      return { success: true };
  } catch (error) {
      console.error("Error adding participant to meeting:", error);
      return { success: false, error: "Failed to add participant to meeting" };
  }
}

// Function to update meeting summary with structured data
export async function updateMeetingSummary({ meetingId, summary }: { meetingId: string; summary: any }): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return { success: false, error: "Invalid meeting ID" };
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const result = await meetingsCollection.updateOne(
      { _id: new ObjectId(meetingId) },
      {
        $set: {
          summary: summary,
          lastAnalyzed: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Meeting not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating meeting summary:", error);
    return { success: false, error: "Failed to update meeting summary" };
  }
}

// Function to generate meeting summary using Gemini
export async function generateMeetingSummary({ meetingId, transcripts, language }: { meetingId: string; transcripts: any[]; language: "english" | "indonesian" | "korean" }): Promise<{ success: boolean; summary?: any; error?: string }> {
  try {
    if (!transcripts || transcripts.length === 0) {
      return { success: false, error: "No transcripts available" };
    }

    // Get meeting data to access language and time
    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      return { success: false, error: "Meeting not found" };
    }

    // Combine all transcripts into a single text
    const combinedTranscript = transcripts.map((t: any) => `${t.name}: ${t.transcript}`).join("\n\n");

    // Format meeting date and time
    const meetingDate = new Date(meeting.time);
    const formattedDate = meetingDate.toISOString().split("T")[0];
    const formattedTime = meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Call the Gemini flow with language parameter and actual meeting date/time
    const result = await summarizeTranscribedText({
      transcribedText: combinedTranscript,
      language: meeting.language, // Use the meeting's language
      meetingDate: formattedDate, // Use the actual meeting date
      meetingTime: formattedTime, // Use the actual meeting time
    });

    // Parse the JSON summary
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(result.summary);
    } catch (parseError) {
      console.error("Error parsing summary JSON:", parseError);
      // If it's not valid JSON, create a structured fallback with actual meeting date/time
      parsedSummary = {
        meeting_summary: {
          title: "Meeting Analysis",
          date: formattedDate,
          time: formattedTime,
          participants: Array.from(new Set(transcripts.map((t: any) => t.name))),
          key_points: ["Analysis completed with raw response"],
          insights_decisions: [],
          action_items: [],
          summary_insights: ["AI analysis completed"],
        },
      };
    }

    // Save to database
    const updateResult = await updateMeetingSummary({
      meetingId,
      summary: parsedSummary,
    });

    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    return { success: true, summary: parsedSummary };
  } catch (error) {
    console.error("Error generating meeting summary:", error);
    return { success: false, error: "Failed to generate meeting summary" };
  }
}

// Additional utility functions
export async function deleteMeeting({ meetingId, userId }: { meetingId: string; userId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return { success: false, error: "Invalid meeting ID" };
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const meeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!meeting) {
      return { success: false, error: "Meeting not found" };
    }

    if (meeting.userId !== userId) {
      return { success: false, error: "Forbidden" };
    }

    const result = await meetingsCollection.deleteOne({
      _id: new ObjectId(meetingId),
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Meeting not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { success: false, error: "Failed to delete meeting" };
  }
}

export async function updateMeeting(meetingId: string, updates: Partial<Pick<Meeting, "name" | "time" | "isPublic" | "language" | "passkey">>): Promise<{ success: boolean }> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return { success: false };
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const result = await meetingsCollection.updateOne(
      { _id: new ObjectId(meetingId) },
      {
        $set: updates,
      }
    );

    return { success: result.matchedCount === 1 };
  } catch (error) {
    console.error("Error updating meeting:", error);
    return { success: false };
  }
}

// Function to get meeting access info (for join page)
export async function getMeetingAccessInfo({ meetingId }: { meetingId: string }): Promise<{
  id: string;
  name: string;
  isPublic: boolean;
  language: "english" | "indonesian" | "korean";
  requiresPasskey: boolean;
} | null> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>("meetings");

    const meeting = await meetingsCollection.findOne({
      _id: new ObjectId(meetingId),
    });

    if (!meeting) {
      return null;
    }

    return {
      id: meeting._id!.toString(),
      name: meeting.name,
      isPublic: meeting.isPublic,
      language: meeting.language,
      requiresPasskey: !meeting.isPublic && !!meeting.passkey,
    };
  } catch (error) {
    console.error("Error fetching meeting access info:", error);
    return null;
  }
}
