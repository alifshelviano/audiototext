'use client';

import {useEffect, useState} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {AudioInputForm} from '@/components/app/audio-input-form';
import {getMeeting} from '@/app/meetings';

export default function JoinMeetingPage() {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const meetingId = isClient ? pathname.split('/').slice(-2, -1)[0] : null;

  useEffect(() => {
    if (meetingId) {
      getMeeting({meetingId})
        .then((data) => {
          if (data) {
            setMeeting(data);
          } else {
            // Handle meeting not found
            router.push('/');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [meetingId, router]);

  if (!isClient || loading) {
    return <div>Loading...</div>;
  }

  if (!meeting) {
    return <div>Meeting not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">{meeting.name}</h1>
        <p className="text-center text-gray-500 mb-8">{new Date(meeting.time).toLocaleString()}</p>
        <AudioInputForm meetingId={meetingId as string} />
      </div>
    </div>
  );
}
