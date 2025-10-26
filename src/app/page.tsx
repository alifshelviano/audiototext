// // 'use client';

// // import { useState, useEffect, useCallback } from 'react';
// // import { Sidebar } from '@/components/app/sidebar';
// // import { Header } from '@/components/app/header';
// // import { Mic2, FileText, Users } from 'lucide-react';

// // interface Meeting {
// //   id: string;
// //   name: string;
// //   time: string;
// //   transcripts?: any[];
// // }

// // export default function Page() {
// //   const [meetings, setMeetings] = useState<Meeting[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);

// //   const fetchMeetings = useCallback(async () => {
// //     try {
// //       setIsLoading(true);
// //       const res = await fetch('/api/meetings');
// //       const data = await res.json();
// //       const meetingsData = Array.isArray(data) ? data : [];
// //       setMeetings(meetingsData);
// //     } catch (error) {
// //       console.error('Error fetching meetings:', error);
// //       setMeetings([]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchMeetings();
// //   }, [fetchMeetings]);

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Header at the top */}
// //       <Header />
      
// //       <div className="flex">
// //         {/* Sidebar under the header */}
// //         <Sidebar />
        
// //         {/* Main Content */}
// //         <main className="flex-1 p-6">

// //           {/* Quick Actions Only */}
// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //             <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
// //               <div className="flex items-center gap-3 mb-3">
// //                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
// //                   <Mic2 className="h-5 w-5" />
// //                 </div>
// //                 <h3 className="font-semibold">Start Recording</h3>
// //               </div>
// //               <p className="text-blue-100 text-sm mb-4">
// //                 Begin a new recording session with real-time transcription
// //               </p>
// //               <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
// //                 Start Now
// //               </button>
// //             </div>

// //             <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
// //               <div className="flex items-center gap-3 mb-3">
// //                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
// //                   <FileText className="h-5 w-5" />
// //                 </div>
// //                 <h3 className="font-semibold">View History</h3>
// //               </div>
// //               <p className="text-purple-100 text-sm mb-4">
// //                 Access all your previous meetings and transcripts
// //               </p>
// //               <button className="w-full bg-white text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors">
// //                 Browse History
// //               </button>
// //             </div>

// //             <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
// //               <div className="flex items-center gap-3 mb-3">
// //                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
// //                   <Users className="h-5 w-5" />
// //                 </div>
// //                 <h3 className="font-semibold">Team Collaboration</h3>
// //               </div>
// //               <p className="text-green-100 text-sm mb-4">
// //                 Invite teammates and collaborate on meeting notes
// //               </p>
// //               <button className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors">
// //                 Invite Team
// //               </button>
// //             </div>
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { Sidebar } from '@/components/app/sidebar';
// import { Header } from '@/components/app/header';
// import { MeetingForm } from '@/components/app/meeting-form';
// import { QRCodeDisplay } from '@/components/app/qr-code-display';
// import { Mic2, FileText, Users, X, Share2 } from 'lucide-react';

// interface Meeting {
//   id: string;
//   name: string;
//   time: string;
//   transcripts?: any[];
// }

// export default function Page() {
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showMeetingForm, setShowMeetingForm] = useState(false);
//   const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
//   const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');

//   const fetchMeetings = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const res = await fetch('/api/meetings');
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

//   const handleMeetingCreated = () => {
//     fetchMeetings();
//     // Generate meeting URL and show QR code
//     if (createdMeetingId) {
//       const url = `${window.location.origin}/meeting/${createdMeetingId}/join`;
//       setCreatedMeetingUrl(url);
//     }
//   };

//   const handleInviteTeam = () => {
//     setShowMeetingForm(true);
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

//   const handleCloseForm = () => {
//     setShowMeetingForm(false);
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

//   const handleCreateNewMeeting = () => {
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

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
//               Welcome to LISN
//             </h1>
//             <p className="text-gray-600">
//               Record, transcribe, and summarize your meetings with AI-powered tools.
//             </p>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Mic2 className="h-5 w-5" />
//                 </div>
//                 <h3 className="font-semibold">Start Recording</h3>
//               </div>
//               <p className="text-blue-100 text-sm mb-4">
//                 Begin a new recording session with real-time transcription
//               </p>
//               <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
//                 Start Now
//               </button>
//             </div>

//             <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                   <FileText className="h-5 w-5" />
//                 </div>
//                 <h3 className="font-semibold">View History</h3>
//               </div>
//               <p className="text-purple-100 text-sm mb-4">
//                 Access all your previous meetings and transcripts
//               </p>
//               <button className="w-full bg-white text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors">
//                 Browse History
//               </button>
//             </div>

//             <div 
//               className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200"
//               onClick={handleInviteTeam}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Users className="h-5 w-5" />
//                 </div>
//                 <h3 className="font-semibold">Team Collaboration</h3>
//               </div>
//               <p className="text-green-100 text-sm mb-4">
//                 Create meeting room and invite teammates to collaborate
//               </p>
//               <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">
//                 Invite Team
//               </div>
//             </div>
//           </div>

//           {/* Meeting Form Modal */}
//           {showMeetingForm && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//                 <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     {createdMeetingId ? 'Share Meeting Room' : 'Create Meeting Room'}
//                   </h2>
//                   <button
//                     onClick={handleCloseForm}
//                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   {createdMeetingId ? (
//                     <div className="space-y-6">
//                       <div className="text-center">
//                         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                           <Share2 className="h-8 w-8 text-green-600" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           Meeting Room Created!
//                         </h3>
//                         <p className="text-gray-600 text-sm">
//                           Share this QR code or link with your team to join the meeting.
//                         </p>
//                       </div>

//                       <QRCodeDisplay url={createdMeetingUrl} />

//                       <div className="space-y-3">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Meeting Link
//                         </label>
//                         <div className="flex gap-2">
//                           <input
//                             type="text"
//                             value={createdMeetingUrl}
//                             readOnly
//                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
//                           />
//                           <button
//                             onClick={() => navigator.clipboard.writeText(createdMeetingUrl)}
//                             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//                           >
//                             Copy
//                           </button>
//                         </div>
//                       </div>

//                       <div className="flex gap-3 pt-4">
//                         <button
//                           onClick={handleCreateNewMeeting}
//                           className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                         >
//                           Create Another
//                         </button>
//                         <a
//                           href={`/meeting/${createdMeetingId}/join`}
//                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
//                         >
//                           Join Meeting
//                         </a>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <div className="text-center mb-4">
//                         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                           <Users className="h-8 w-8 text-blue-600" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           Create Team Meeting
//                         </h3>
//                         <p className="text-gray-600 text-sm">
//                           Set up a meeting room and invite your team members to collaborate.
//                         </p>
//                       </div>

//                       <MeetingForm 
//                         onMeetingCreated={(meetingId) => {
//                           setCreatedMeetingId(meetingId);
//                           handleMeetingCreated();
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { MeetingForm } from '@/components/app/meeting-form';
import { QRCodeDisplay } from '@/components/app/qr-code-display';
import { Mic2, FileText, Users, X, Share2 } from 'lucide-react';

interface Meeting {
  id: string;
  name: string;
  time: string;
  transcripts?: any[];
}

export default function Page() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings');
      
      if (!res.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleMeetingCreated = (meetingId: string) => {
    // Update meetings list
    fetchMeetings();
    
    // Generate meeting URL and show QR code
    const url = `${window.location.origin}/meeting/${meetingId}/join`;
    setCreatedMeetingId(meetingId);
    setCreatedMeetingUrl(url);
  };

  const handleInviteTeam = () => {
    setShowMeetingForm(true);
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  const handleCloseForm = () => {
    setShowMeetingForm(false);
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  const handleCreateNewMeeting = () => {
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to AudioScribe AI
            </h1>
            <p className="text-gray-600">
              Record, transcribe, and summarize your meetings with AI-powered tools.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* ... (your existing quick action buttons) */}
            <div 
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200"
              onClick={handleInviteTeam}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">Team Collaboration</h3>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Create meeting room and invite teammates to collaborate
              </p>
              <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">
                Invite Team
              </div>
            </div>
          </div>

          {/* Meeting Form Modal */}
          {showMeetingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {createdMeetingId ? 'Share Meeting Room' : 'Create Meeting Room'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  {createdMeetingId ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Share2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Meeting Room Created!
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Share this QR code or link with your team to join the meeting.
                        </p>
                      </div>

                      <QRCodeDisplay url={createdMeetingUrl} />
                  
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleCreateNewMeeting}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Create Another
                        </button>
                        <a
                          href={`/meeting/${createdMeetingId}/join`}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                        >
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Create Team Meeting
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Set up a meeting room and invite your team members to collaborate.
                        </p>
                      </div>

                      <MeetingForm onMeetingCreated={handleMeetingCreated} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}