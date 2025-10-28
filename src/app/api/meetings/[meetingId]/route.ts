
import { NextResponse } from 'next/server';
import { deleteMeeting } from '@/app/meetings';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { meetingId } = params;

    const result = await deleteMeeting({ 
      meetingId,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 403 });
    }

    return NextResponse.json({ message: 'Meeting deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
