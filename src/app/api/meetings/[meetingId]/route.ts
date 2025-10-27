
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import fs from 'fs';
import path from 'path';

const meetingsDirectory = path.join(process.cwd(), 'meetings');

export async function DELETE(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { meetingId } = params;
  const filePath = path.join(meetingsDirectory, `${meetingId}.json`);

  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const meeting = JSON.parse(fileContent);

      if (meeting.ownerId !== token.sub) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      fs.unlinkSync(filePath);
      return NextResponse.json({ message: 'Meeting deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
