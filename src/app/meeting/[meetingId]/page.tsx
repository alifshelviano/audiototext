'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {getMeeting} from '@/app/meetings';
import {QRCodeDisplay} from '@/components/app/qr-code-display';
import {Header} from '@/components/app/header';

export default function MeetingPage() {
  const pathname = usePathname();
  const meetingId = pathname.split('/').pop();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meetingId) {
      getMeeting({meetingId: meetingId as string})
        .then(setMeeting)
        .finally(() => setLoading(false));
    }
  }, [meetingId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!meeting) {
    return <div>Meeting not found.</div>;
  }

  const meetingUrl = `${window.location.origin}/meeting/${meetingId}/join`;

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">{meeting.name}</h1>
          <p className="text-center text-gray-500 mb-6">{new Date(meeting.time).toLocaleString()}</p>
          <QRCodeDisplay url={meetingUrl} />
        </div>
      </div>
    </main>
  );
}
