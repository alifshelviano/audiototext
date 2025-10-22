
import {NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  }

  const client = await clientPromise;
  const db = client.db('meetings');
  const meetings = db.collection('meetings');

  const userMeetings = await meetings.find({host: session.user.email}).toArray();

  return NextResponse.json(userMeetings);
}
