'use client';

import {Header} from '@/components/app/header';
import {MeetingForm} from '@/components/app/meeting-form';
import {useSession, signOut} from 'next-auth/react';
import {useEffect, useState, useCallback} from 'react';
import {useRouter} from 'next/navigation';

export default function Page() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);

  const fetchMeetings = useCallback(() => {
    if (status === 'authenticated') {
      fetch('/api/meetings')
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return Promise.resolve([]); // Non-ok response, resolve with empty array
        })
        .then((data) => {
          setMeetings(Array.isArray(data) ? data : []); // Ensure data is an array
        })
        .catch((error) => {
          console.error('Failed to fetch meetings:', error);
          setMeetings([]); // Set to empty array on any error
        });
    }
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    fetchMeetings();
  }, [status, router, fetchMeetings]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Welcome, {session.user?.name}</h1>
            <button
              onClick={() => signOut({callbackUrl: '/login'})}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
          <MeetingForm onMeetingCreated={fetchMeetings} />
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Your Meetings</h2>
            <ul className="space-y-4">
              {Array.isArray(meetings) && meetings.map((meeting: any) => (
                <li key={meeting._id} className="bg-white p-4 rounded-lg shadow-md">
                  <a href={`/meeting/${meeting._id}`} className="text-blue-500 hover:underline">
                    {meeting._id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
