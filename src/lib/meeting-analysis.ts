// lib/meeting-analysis.ts
'use server';

import { getMeeting, generateMeetingSummary } from '@/app/meetings';

export async function analyzeMeeting(meetingId: string): Promise<{
  success: boolean;
  summary?: any;
  error?: string;
}> {
  try {
    // Get meeting data
    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      return { success: false, error: 'Meeting not found' };
    }

    // Check if we have transcripts
    if (!meeting.transcripts || meeting.transcripts.length === 0) {
      return { success: false, error: 'No transcripts available for analysis' };
    }

    // Generate summary using Gemini
    const result = await generateMeetingSummary({
      meetingId,
      transcripts: meeting.transcripts
    });

    return result;
  } catch (error) {
    console.error('Error in meeting analysis service:', error);
    return { success: false, error: 'Analysis failed' };
  }
}

export async function shouldAutoAnalyze(meetingId: string): Promise<boolean> {
  try {
    const meeting = await getMeeting({ meetingId });
    if (!meeting) return false;

    // Auto-analyze if:
    // 1. No summary exists AND we have transcripts
    // 2. OR last analysis was before the latest transcript
    if (!meeting.summary && meeting.transcripts && meeting.transcripts.length > 0) {
      return true;
    }

    if (meeting.lastAnalyzed && meeting.transcripts && meeting.transcripts.length > 0) {
      const latestTranscript = meeting.transcripts[meeting.transcripts.length - 1];
      return new Date(latestTranscript.createdAt) > new Date(meeting.lastAnalyzed);
    }

    return false;
  } catch (error) {
    console.error('Error checking auto-analysis:', error);
    return false;
  }
}