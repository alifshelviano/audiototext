// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { Sidebar } from '@/components/app/sidebar';
// import { Header } from '@/components/app/header';
// import { Users, Briefcase } from 'lucide-react';
// import { useSession } from 'next-auth/react';

// interface Meeting {
//   id: string;
//   name: string;
//   time: string;
//   transcripts?: any[];
// }

// export default function Page() {
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { data: session, status } = useSession();

//   const fetchMeetings = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const res = await fetch('/api/meetings');

//       if (!res.ok) {
//         throw new Error('Failed to fetch meetings');
//       }

//       const data = await res.json();
//       const meetingsData = Array.isArray(data) ? data : [];
//       setMeetings(meetingsData);
//     } catch (error) {
//       console.error('Error fetching meetings:', error);
//       setMeetings([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMeetings();
//   }, [fetchMeetings]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header at the top */}
//       <Header />

//       <div className="flex">
//         {/* Sidebar under the header */}
//         <Sidebar />

//         {/* Main Content */}
//         <main className="flex-1 p-6">
//           {/* Welcome Section */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Dashboard
//             </h1>
//             <p className="text-gray-600">
//             Here is a summary of your meetings and activities.
//             </p>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             {/* Total Meetings Card */}
//             <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Briefcase className="h-5 w-5" />
//                 </div>
//                 <h3 className="font-semibold">Total Meetings</h3>
//               </div>
//               <p className="text-purple-100 text-3xl font-bold mb-4">
//                 {isLoading ? '...' : meetings.length}
//               </p>
//             </div>

//             {/* New Meeting Card */}
//             {status === 'authenticated' && (
//                 <Link href="/meetings">
//                   <div
//                     className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 h-full"
//                   >
//                     <div className="flex items-center gap-3 mb-3">
//                       <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                         <Users className="h-5 w-5" />
//                       </div>
//                       <h3 className="font-semibold">Create New Meeting</h3>
//                     </div>
//                     <p className="text-green-100 text-sm mb-4">
//                       Create meeting room and invite teammates to collaborate
//                     </p>
//                     <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">
//                       Create
//                     </div>
//                   </div>
//                 </Link>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { Users, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";

interface Meeting {
  id: string;
  name: string;
  time: string;
  transcripts?: any[];
}

export default function Page() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/meetings");

      if (!res.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
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
      {/* Header at the top */}
      <Header />

      <div className="flex">
        {/* Sidebar under the header */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Here is a summary of your meetings and activities.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Meetings Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Total Meetings</h3>
              </div>
              <p className="text-purple-100 text-3xl font-bold mb-4">{isLoading ? "..." : meetings.length}</p>
            </div>

            {/* New Meeting Card */}
            {status === "authenticated" && (
              <Link href="/create-meetings">
                {" "}
                {/* ← Changed from /meetings to /create-meetings */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Create New Meeting</h3>
                  </div>
                  <p className="text-green-100 text-sm mb-4">Create meeting room and invite teammates to collaborate</p>
                  <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">Create</div>
                </div>
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
