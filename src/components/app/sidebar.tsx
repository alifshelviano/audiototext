'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getMeetings } from '@/app/meetings';
import { Home, Mic2, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Meetings', href: '/meetings', icon: Mic2 },
    { name: 'History', href: '/history', icon: History },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onClose}
      ></div>

      <div className={cn(
        "fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0 md:shadow-none md:bg-transparent",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-white border-b">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="LISN Logo"
                width={32}
                height={32}
                className="transition-transform group-hover:scale-110"
              />
              <span className="font-bold text-xl text-gray-900">LISN</span>
            </Link>
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto bg-white">
            <nav className="flex-1 px-2 py-4 space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </h3>
                <div className="space-y-1 mt-2">
                  {mainNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose} // Close sidebar on navigation
                      className={cn(
                        "flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900",
                        pathname === item.href 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'text-gray-600'
                      )}
                    >
                      <item.icon className="mr-3 flex-shrink-0 h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Meetings */}
              <div className="flex-1">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Meetings
                </h3>
                <div className="space-y-1 mt-2">
                  {loading ? (
                    <div className="px-2 py-2 text-sm text-gray-500">Loading meetings...</div>
                  ) : meetings.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-gray-500">No meetings yet</div>
                  ) : (
                    meetings.map((meeting) => (
                      <Link
                        key={meeting.id}
                        href={`/meeting/${meeting.id}/join`}
                        onClick={onClose} // Close sidebar on navigation
                        className={cn(
                          "block px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900 truncate",
                          pathname.includes(meeting.id) 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-600'
                        )}
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
      </div>
    </>
  );
}
