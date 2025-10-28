'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { Globe } from 'lucide-react';

interface Meeting {
  id: string;
  name: string;
  time: string;
}

export default function PublicMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings?public=true');
      if (!res.ok) {
        throw new Error('Failed to fetch public meetings');
      }
      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching public meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Public Meetings
            </h1>
            <p className="text-gray-600">
              Browse and join ongoing public meetings.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">{meeting.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      <Globe className="w-4 h-4" />
                      <span>Public</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    Scheduled for: {new Date(meeting.time).toLocaleString()}
                  </p>
                  <Link href={`/meeting/${meeting.id}/join`}>
                    <div className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">
                      Join Meeting
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">No Public Meetings Found</h3>
                <p className="text-gray-500 text-sm">There are no public meetings available at the moment.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
