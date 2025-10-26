'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getMeetings } from '@/app/meetings';

export function Sidebar() {
  const pathname = usePathname();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const allMeetings = await getMeetings();
        setMeetings(allMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Recording', href: '/recording', icon: '🎙️' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Navigation
            </h3>
            <div className="space-y-1">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 p-2 rounded text-sm hover:bg-gray-800 ${
                    pathname === item.href ? 'bg-gray-800' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Meetings */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Meetings
            </h3>
            <div className="space-y-1">
              {loading ? (
                <div className="p-2 text-sm text-gray-400">Loading meetings...</div>
              ) : meetings.length === 0 ? (
                <div className="p-2 text-sm text-gray-400">No meetings yet</div>
              ) : (
                meetings.map((meeting) => (
                  <Link
                    key={meeting.id}
                    href={`/meeting/${meeting.id}/join`}
                    className={`block p-2 rounded text-sm hover:bg-gray-800 ${
                      pathname.includes(meeting.id) ? 'bg-gray-800' : ''
                    }`}
                  >
                    # {meeting.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}