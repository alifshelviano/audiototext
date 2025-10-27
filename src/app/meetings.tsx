'use server';

import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
import clientPromise from '@/lib/mongodb';
import {ObjectId} from 'mongodb';

// Define interfaces for type safety
export interface Transcript {
  name: string;
  transcript: string;
  summary?: string;
  createdAt: Date;
}

export interface Meeting {
  _id?: ObjectId;
  name: string;
  time: string;
  ownerId: string; // Add ownerId to the interface
  createdAt: Date;
  transcripts: Transcript[];
  summary?: any; // Changed to any to handle structured JSON
  summaryCreatedAt?: Date;
  lastAnalyzed?: Date;
}

export async function createMeeting(meetingData: {
  name: string;
  time: string;
  ownerId: string; // Add ownerId to the function parameters
}): Promise<{meetingId: string}> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const meeting = {
      ...meetingData,
      createdAt: new Date(),
      transcripts: [],
    };

    const result = await meetingsCollection.insertOne(meeting);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create meeting');
    }

    return {meetingId: result.insertedId.toString()};
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw new Error('Failed to create meeting');
  }
}

export async function getMeetings(): Promise<Array<{id: string; name: string; time: string}>> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');
    
    const meetings = await meetingsCollection
      .find({})
      .sort({createdAt: -1})
      .toArray();

    return meetings.map(meeting => ({
      id: meeting._id!.toString(),
      name: meeting.name,
      time: meeting.time,
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

export async function getMeeting({meetingId}: {meetingId: string}): Promise<{
  id: string;
  name: string;
  time: string;
  ownerId: string;
  transcripts: Transcript[];
  summary?: any;
  summaryCreatedAt?: Date;
  lastAnalyzed?: Date;
} | null> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

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
      ownerId: meeting.ownerId,
      transcripts: meeting.transcripts || [],
      summary: meeting.summary,
      summaryCreatedAt: meeting.summaryCreatedAt,
      lastAnalyzed: meeting.lastAnalyzed,
    };
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
}

export async function addTranscriptToMeeting({
  meetingId,
  transcript,
}: {
  meetingId: string;
  transcript: Omit<Transcript, 'createdAt'> & {createdAt?: Date};
}): Promise<{success: boolean; error?: string}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false, error: 'Invalid meeting ID'};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    // Prepare the transcript with createdAt
    const transcriptWithDate = {
      ...transcript,
      createdAt: transcript.createdAt || new Date(),
    };

    // Add the transcript
    const result = await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $push: {
          transcripts: transcriptWithDate,
        },
      }
    );

    if (result.matchedCount === 0) {
      return {success: false, error: 'Meeting not found'};
    }

    return {success: true};
  } catch (error) {
    console.error('Error adding transcript to meeting:', error);
    return {success: false, error: 'Failed to add transcript to meeting'};
  }
}

// NEW: Function to update meeting summary with structured data
export async function updateMeetingSummary({
  meetingId,
  summary
}: {
  meetingId: string;
  summary: any;
}): Promise<{success: boolean; error?: string}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false, error: 'Invalid meeting ID'};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const result = await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $set: { 
          summary: summary,
          lastAnalyzed: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return {success: false, error: 'Meeting not found'};
    }

    return {success: true};
  } catch (error) {
    console.error('Error updating meeting summary:', error);
    return {success: false, error: 'Failed to update meeting summary'};
  }
}

// NEW: Function to generate meeting summary using Gemini
// In your app/meetings.ts - update the generateMeetingSummary function
export async function generateMeetingSummary({
  meetingId,
  transcripts
}: {
  meetingId: string;
  transcripts: any[];
}): Promise<{success: boolean; summary?: any; error?: string}> {
  try {
    if (!transcripts || transcripts.length === 0) {
      return {success: false, error: 'No transcripts available'};
    }

    // Combine all transcripts into a single text
    const combinedTranscript = transcripts
      .map((t: any) => `${t.name}: ${t.transcript}`)
      .join('\n\n');

    // Call the Gemini flow
    const result = await summarizeTranscribedText({
      transcribedText: combinedTranscript
    });

    // Parse the JSON summary
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(result.summary);
    } catch (parseError) {
      console.error('Error parsing summary JSON:', parseError);
      // If it's not valid JSON, create a structured fallback
      parsedSummary = {
        meeting_summary: {
          title: "Meeting Analysis",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          participants: Array.from(new Set(transcripts.map((t: any) => t.name))),
          key_points: ["Analysis completed with raw response"],
          insights_decisions: [],
          action_items: [],
          summary_insights: ["AI analysis completed"]
        }
      };
    }

    // Save to database
    const updateResult = await updateMeetingSummary({
      meetingId,
      summary: parsedSummary
    });

    if (!updateResult.success) {
      return {success: false, error: updateResult.error};
    }

    return {success: true, summary: parsedSummary};
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    return {success: false, error: 'Failed to generate meeting summary'};
  }
}

// Additional utility functions
export async function deleteMeeting(meetingId: string): Promise<{success: boolean}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const result = await meetingsCollection.deleteOne({
      _id: new ObjectId(meetingId),
    });

    return {success: result.deletedCount === 1};
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return {success: false};
  }
}

export async function updateMeeting(
  meetingId: string,
  updates: Partial<Pick<Meeting, 'name' | 'time'>>
): Promise<{success: boolean}> {
  try {
    if (!ObjectId.isValid(meetingId)) {
      return {success: false};
    }

    const client = await clientPromise;
    const db = client.db();
    const meetingsCollection = db.collection<Meeting>('meetings');

    const result = await meetingsCollection.updateOne(
      {_id: new ObjectId(meetingId)},
      {
        $set: updates,
      }
    );

    return {success: result.matchedCount === 1};
  } catch (error) {
    console.error('Error updating meeting:', error);
    return {success: false};
  }
}