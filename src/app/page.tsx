
'use client';

import { Header } from '@/components/app/header';
import { MeetingForm } from '@/components/app/meeting-form';
import { useEffect, useState, useCallback } from 'react';

// Define a type for your meeting objects
interface Meeting {
  id: string;
  name: string;
  time: string;
}

export default function Page() {
  // Use the Meeting type to properly type your state
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const fetchMeetings = useCallback(() => {
    fetch('/api/meetings')
      .then((res) => res.json())
      .then((data) => setMeetings(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <main className="bg-background min-h-screen antialiased">
      <Header />
      <div className="container mx-auto p-4">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Create a New Meeting</h2>
            <MeetingForm onMeetingCreated={fetchMeetings} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Existing Meetings</h2>
            <div className="bg-card p-4 rounded-lg shadow-sm border">
              <ul className="space-y-2">
                {meetings.map((meeting) => (
                  <li key={meeting.id}>
                    <a href={`/meeting/${meeting.id}/join`} className="text-blue-500 hover:underline">
                      {meeting.name} - {new Date(meeting.time).toLocaleString()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
