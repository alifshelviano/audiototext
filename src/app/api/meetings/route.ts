import { NextResponse } from 'next/server';
import { createMeeting, getMeetings } from '@/app/meetings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, time } = await req.json();

    if (!name || !time) {
      return NextResponse.json(
        { message: 'Name and time are required' },
        { status: 400 }
      );
    }

    const { meetingId } = await createMeeting({ name, time, userId: session.user.id });

    return NextResponse.json(
      { 
        message: 'Meeting created successfully',
        meetingId: meetingId,
        id: meetingId
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // If a userId is provided, filter meetings for that user
    if (userId) {
      if (userId !== session.user.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      const meetings = await getMeetings({ userId });
      return NextResponse.json(meetings);
    } else {
      // If no userId is provided, return all meetings (or handle as per your app's logic)
      const meetings = await getMeetings({});
      return NextResponse.json(meetings);
    }

  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
