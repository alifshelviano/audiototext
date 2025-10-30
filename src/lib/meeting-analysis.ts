// lib/meeting-analysis.ts
'use server';

import { getMeeting, generateMeetingSummary, updateMeetingSummary } from '@/app/meetings';
import { summarizeTranscribedText } from '@/ai/flows/summarize-transcribed-text';

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

    // Option 1: Use the existing generateMeetingSummary function (if it supports language)
    try {
      const result = await generateMeetingSummary({
        meetingId,
        transcripts: meeting.transcripts,
        language: meeting.language // Pass the meeting's language
      });

      if (result.success) {
        return result;
      }
      // If the existing function fails, fall through to Option 2
    } catch (error) {
      console.warn('generateMeetingSummary failed, trying direct analysis:', error);
    }

    // Option 2: Direct analysis with language support
    const combinedTranscript = meeting.transcripts
      .map((t: any) => `${t.name}: ${t.transcript}`)
      .join('\n\n');

    // Call the Gemini flow with language parameter
    const result = await summarizeTranscribedText({
      transcribedText: combinedTranscript,
      language: meeting.language // Pass the meeting's language
    });

    // Parse and save the summary
    let parsedSummary;
    try {
      parsedSummary = JSON.parse(result.summary);
    } catch (parseError) {
      console.error('Failed to parse summary JSON:', parseError);
      return { 
        success: false, 
        error: 'Failed to parse analysis results' 
      };
    }

    const updateResult = await updateMeetingSummary({
      meetingId,
      summary: parsedSummary
    });

    if (!updateResult.success) {
      return { 
        success: false, 
        error: updateResult.error || 'Failed to save analysis results' 
      };
    }

    return { 
      success: true, 
      summary: parsedSummary 
    };

  } catch (error) {
    console.error('Error in meeting analysis service:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    };
  }
}

export async function shouldAutoAnalyze(meetingId: string): Promise<{
  shouldAnalyze: boolean;
  reason?: string;
}> {
  try {
    const meeting = await getMeeting({ meetingId });
    if (!meeting) {
      return { shouldAnalyze: false, reason: 'Meeting not found' };
    }

    // Check if we have transcripts to analyze
    if (!meeting.transcripts || meeting.transcripts.length === 0) {
      return { shouldAnalyze: false, reason: 'No transcripts available' };
    }

    // Auto-analyze if no summary exists
    if (!meeting.summary) {
      return { 
        shouldAnalyze: true, 
        reason: 'No existing analysis found' 
      };
    }

    // Check if new transcripts have been added since last analysis
    if (meeting.lastAnalyzed && meeting.transcripts.length > 0) {
      const latestTranscript = meeting.transcripts[meeting.transcripts.length - 1];
      const lastAnalysisTime = new Date(meeting.lastAnalyzed);
      const latestTranscriptTime = new Date(latestTranscript.createdAt);
      
      if (latestTranscriptTime > lastAnalysisTime) {
        return { 
          shouldAnalyze: true, 
          reason: 'New transcripts added since last analysis' 
        };
      }
    }

    // Check if summary structure is incomplete or malformed
    if (meeting.summary && typeof meeting.summary === 'object') {
      const summary = meeting.summary;
      
      // If summary exists but is missing critical sections, re-analyze
      if (!summary.meeting_summary || 
          !summary.meeting_summary.key_points || 
          summary.meeting_summary.key_points.length === 0) {
        return { 
          shouldAnalyze: true, 
          reason: 'Existing analysis appears incomplete' 
        };
      }
    }

    return { 
      shouldAnalyze: false, 
      reason: 'Analysis is up to date' 
    };

  } catch (error) {
    console.error('Error checking auto-analysis:', error);
    return { 
      shouldAnalyze: false, 
      reason: 'Error checking analysis status' 
    };
  }
}
