'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';

interface Meeting {
  id: string;
  name: string;
  time: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/meetings?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchMeetings(session.user.id);
    }
  }, [status, session, fetchMeetings]);

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete meeting');
      }

      // Remove the deleted meeting from the state
      setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));

    } catch (error) {
      console.error('Error deleting meeting:', error);
      // Handle error (e.g., show a toast message)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meeting History
            </h1>
            <p className="text-gray-600">
              Browse and review your past meetings.
            </p>
          </div>

          {isLoading ? (
            <p>Loading meetings...</p>
          ) : meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold mb-2">{meeting.name}</h2>
                    <p className="text-gray-600 mb-4">{new Date(meeting.time).toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Link href={`/meeting/${meeting.id}/join`}>
                      <Button>View Details</Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDelete(meeting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No meetings found.</p>
          )}
        </main>
      </div>
    </div>
  );
}
