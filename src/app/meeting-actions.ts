/**
 * @fileOverview Meeting actions
 *
 * This file contains the actions for creating, joining, and managing meetings.
 */

'use server';

import { z } from 'zod';

import { db } from '@/lib/db';

// Placeholder for meeting actions
const createMeetingSchema = z.object({
  password: z.string().optional(),
});

export async function createMeeting(formData: FormData) {
  const meetingId = Math.random().toString(36).substring(2, 8);
  const { password } = createMeetingSchema.parse(Object.fromEntries(formData));

  const meeting = await db.meetings.create({
    meetingId,
    ...(password && { password }),
  });

  return meeting;
}

const joinMeetingSchema = z.object({
  meetingId: z.string(),
  password: z.string().optional(),
});

export async function joinMeeting(formData: FormData) {
  const { meetingId, password } = joinMeetingSchema.parse(
    Object.fromEntries(formData)
  );

  const meeting = await db.meetings.findOne({ meetingId });

  if (!meeting) {
    return { error: 'Meeting not found' };
  }

  if (meeting.password && meeting.password !== password) {
    return { error: 'Invalid password' };
  }

  return meeting;
}
