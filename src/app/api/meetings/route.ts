
import { NextRequest, NextResponse } from 'next/server';
import { createMeeting, getMeetings } from '@/app/meetings';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || !token.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, time } = await req.json();

    if (!name || !time) {
      return NextResponse.json(
        { message: 'Name and time are required' },
        { status: 400 }
      );
    }

    // Use the server action to create the meeting
    const { meetingId } = await createMeeting({ name, time, ownerId: token.sub });

    return NextResponse.json(
      { 
        message: 'Meeting created successfully',
        meetingId: meetingId,
        id: meetingId // Include both for compatibility
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Use the server action to get meetings
    const meetings = await getMeetings();

    return NextResponse.json(meetings);

  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
