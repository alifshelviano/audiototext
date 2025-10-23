'use server';

import clientPromise from '@/lib/mongodb';
import {InsertOneResult, ObjectId} from 'mongodb';

export async function createMeeting(meetingData: {
  name: string;
  time: string;
}): Promise<InsertOneResult<Document>> {
  const client = await clientPromise;
  const db = client.db();
  // Add validation or sanitation as needed
  const result = await db.collection('meetings').insertOne({
    ...meetingData,
    createdAt: new Date(),
  });
  return result;
}

export async function getMeetings() {
  const client = await clientPromise;
  const db = client.db();
  const meetings = await db.collection('meetings').find({}).sort({time: -1}).toArray();
  return meetings.map((meeting) => ({
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

  const meeting = await db.collection('meetings').findOne({
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
  };
}

export async function addTranscriptToMeeting({
  meetingId,
  transcript,
}: {
  meetingId: string;
  transcript: {
    name: string;
    transcript: string;
    summary?: string;
    createdAt: Date;
  };
}) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('meetings').updateOne(
    {_id: new ObjectId(meetingId)},
    {$push: {transcripts: transcript}}
  );
  return result;
}

export async function addSummaryToMeeting({
  meetingId,
  transcriptName,
  summary,
}: {
  meetingId: string;
  transcriptName: string;
  summary: string;
}) {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('meetings').updateOne(
    {_id: new ObjectId(meetingId), 'transcripts.name': transcriptName},
    {$set: {'transcripts.$.summary': summary}}
  );
  return result;
}
