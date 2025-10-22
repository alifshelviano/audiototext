'use server';

import {z} from 'zod';
import clientPromise from '@/lib/mongodb';
import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
import {transcribeAudioElevenLabs} from '@/ai/flows/transcribe-audio-eleven-labs';

const createMeetingSchema = z.object({});

export async function createMeeting() {
  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  const meetingId = Math.random().toString(36).substring(2, 15);
  await meetings.insertOne({_id: meetingId, transcripts: []});

  return {meetingId};
}

const getMeetingSchema = z.object({
  meetingId: z.string(),
});

export async function getMeeting(values: z.infer<typeof getMeetingSchema>) {
  const {meetingId} = getMeetingSchema.parse(values);
  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  const meeting = await meetings.findOne({_id: meetingId});
  return meeting;
}

const addTranscriptSchema = z.object({
  meetingId: z.string(),
  userName: z.string(),
  audioUrl: z.string().url(),
});

export async function addTranscript(values: z.infer<typeof addTranscriptSchema>) {
  const {meetingId, userName, audioUrl} = addTranscriptSchema.parse(values);
  const {transcription} = await transcribeAudioElevenLabs({audioDataUri: audioUrl});

  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  await meetings.updateOne(
    {_id: meetingId},
    {$push: {transcripts: {name: userName, text: transcription}}},
  );

  return {transcript: transcription};
}

const summarizeMeetingSchema = z.object({
  meetingId: z.string(),
});

export async function summarizeMeeting(values: z.infer<typeof summarizeMeetingSchema>) {
  const {meetingId} = summarizeMeetingSchema.parse(values);
  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  const meeting = await meetings.findOne({_id: meetingId});

  const combinedText = meeting.transcripts
    .map((t: {name: string; text: string}) => `${t.name}: ${t.text}`)
    .join('\n\n---\n\n');
  const {summary} = await summarizeTranscribedText(combinedText);

  return {summary};
}

const getMeetingParticipantsSchema = z.object({
  meetingId: z.string(),
});

export async function getMeetingParticipants(values: z.infer<typeof getMeetingParticipantsSchema>) {
  const {meetingId} = getMeetingParticipantsSchema.parse(values);
  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  const meeting = await meetings.findOne({_id: meetingId});

  if (!meeting || !meeting.transcripts) {
    return {participants: []};
  }

  const participants = meeting.transcripts.map((t: {name: string; text: string}) => t.name);
  const uniqueParticipants = [...new Set(participants)];
  return {participants: uniqueParticipants};
}
