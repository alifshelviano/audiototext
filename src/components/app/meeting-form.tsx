'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {createMeeting} from '@/app/meetings';
import {Button} from '@/components/ui/button';
import {QRCodeDisplay} from '@/components/app/qr-code-display';

export function MeetingForm({onMeetingCreated}: {onMeetingCreated: () => void}) {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateMeeting = () => {
    startTransition(async () => {
      const {meetingId} = await createMeeting();
      setMeetingId(meetingId);
      onMeetingCreated();
    });
  };

  const handleJoinMeeting = () => {
    if (meetingId) {
      router.push(`/meeting/${meetingId}`);
    }
  };

  if (meetingId) {
    const meetingUrl = `${window.location.origin}/meeting/${meetingId}`;
    return (
      <div className="flex flex-col items-center space-y-4">
        <QRCodeDisplay url={meetingUrl} />
        <p className="text-lg font-medium">Or join by sharing this link:</p>
        <a href={meetingUrl} className="text-blue-500 hover:underline">
          {meetingUrl}
        </a>
        <Button onClick={handleJoinMeeting} className="mt-4">
          Join Meeting
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleCreateMeeting} disabled={isPending}>
      {isPending ? 'Creating Meeting...' : 'Create New Meeting'}
    </Button>
  );
}
