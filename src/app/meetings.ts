'use server';

import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
import clientPromise from '@/lib/mongodb';
import {InsertOneResult, ObjectId, Document} from 'mongodb';

// Define interfaces for type safety
export interface Transcript {
  name: string;
  transcript: string;
  summary?: string;
  createdAt: Date;
}

export interface Meeting extends Document {
  name: string;
  time: string;
  createdAt: Date;
  transcripts: Transcript[];
  summary?: string;
  summaryCreatedAt?: Date;
}

export async function createMeeting(meetingData: {
  name: string;
  time: string;
}): Promise<InsertOneResult<Document>> {
  const client = await clientPromise;
  const db = client.db();
  const meetingsCollection = db.collection<Meeting>('meetings');

  // Create a new meeting with an empty transcripts array
  const result = await meetingsCollection.insertOne({
    ...meetingData,
    createdAt: new Date(),
    transcripts: [],
  });
  return result;
}

export async function getMeetings() {
  const client = await clientPromise;
  const db = client.db();
  const meetingsCollection = db.collection<Meeting>('meetings');
  const meetings = await meetingsCollection.find({}).sort({time: -1}).toArray();
  return meetings.map(meeting => ({
    id: meeting._id.toHexString(),
    name: meeting.name,
    time: meeting.time,
  }));
}

export async function getMeeting({meetingId}: {meetingId: string}) {
  // Add a guard clause to prevent invalid ObjectId creation
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
    id: meeting._id.toHexString(),
    name: meeting.name,
    time: meeting.time,
    transcripts: meeting.transcripts || [],
    summary: meeting.summary,
  };
}

export async function addTranscriptToMeeting({
  meetingId,
  transcript,
}: {
  meetingId: string;
  transcript: Transcript;
}) {
  const client = await clientPromise;
  const db = client.db();
  const meetingsCollection = db.collection<Meeting>('meetings');

  // 1. Fetch the existing meeting
  const currentMeeting = await getMeeting({meetingId});
  if (!currentMeeting) {
    throw new Error('Meeting not found');
  }

  // 2. Update the transcripts array in memory
  const updatedTranscripts = [...currentMeeting.transcripts, transcript];

  // 3. Generate the summary from the updated transcripts
  const transcribedText = updatedTranscripts
    .map(t => `${t.name}: ${t.transcript}`)
    .join('\n');
  const {summary} = await summarizeTranscribedText({transcribedText: transcribedText || ''});

  // 4. Perform a single update with $set
  const result = await meetingsCollection.updateOne(
    {_id: new ObjectId(meetingId)},
    {
      $set: {
        transcripts: updatedTranscripts,
        summary: summary,
        summaryCreatedAt: new Date(),
      },
    }
  );

  return result;
}
