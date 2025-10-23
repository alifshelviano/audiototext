'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {createMeeting} from '@/app/meetings';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {QRCodeDisplay} from '@/components/app/qr-code-display';

export function MeetingForm({onMeetingCreated}: {onMeetingCreated: () => void}) {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateMeeting = () => {
    startTransition(async () => {
      const {meetingId} = await createMeeting({name, time});
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
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Meeting Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter meeting name"
        />
      </div>
      <div>
        <Label htmlFor="time">Time</Label>
        <Input
          id="time"
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <Button onClick={handleCreateMeeting} disabled={isPending || !name || !time}>
        {isPending ? 'Creating Meeting...' : 'Create New Meeting'}
      </Button>
    </div>
  );
}
