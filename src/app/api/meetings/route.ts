
import {getMeetings} from '@/app/meetings';
import {NextResponse} from 'next/server';

export async function GET() {
  const meetings = await getMeetings();
  return NextResponse.json(meetings);
}
