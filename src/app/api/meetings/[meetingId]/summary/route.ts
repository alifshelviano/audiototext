import { NextRequest, NextResponse } from 'next/server';
import { getMeeting, updateMeetingSummary, generateMeetingSummary } from '@/app/meetings';

export async function POST(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const { summary, regenerate } = await request.json();
    const meetingId = params.meetingId;

    if (regenerate) {
      // Regenerate summary using AI
      const meeting = await getMeeting({ meetingId });
      if (!meeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        );
      }

      const result = await generateMeetingSummary({
        meetingId,
        transcripts: meeting.transcripts
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        summary: result.summary,
        message: 'Summary regenerated successfully'
      });
    }

    // Update with provided summary
    if (!summary) {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    const result = await updateMeetingSummary({
      meetingId,
      summary
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Summary updated successfully'
    });

  } catch (error) {
    console.error('Error in summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;
    const meeting = await getMeeting({ meetingId });

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      summary: meeting.summary,
      lastAnalyzed: meeting.lastAnalyzed
    });
  } catch (error) {
    console.error('Error fetching meeting summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}