'use client';

import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function JoinMeetingPage({params}: {params: {meetingId: string}}) {
  const router = useRouter();
  const {meetingId} = params;

  useEffect(() => {
    // In a real application, you'd add logic here to register the user to the meeting.
    // For this example, we'll just redirect to the meeting page.
    router.push(`/meeting/${meetingId}`);
  }, [meetingId, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Joining meeting...</h1>
    </div>
  );
}
