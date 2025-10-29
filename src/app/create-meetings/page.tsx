// // 'use client';

// // import { useState } from 'react';
// // import { Header } from '@/components/app/header';
// // import { Sidebar } from '@/components/app/sidebar';
// // import { MeetingForm } from '@/components/app/meeting-form';
// // import { QRCodeDisplay } from '@/components/app/qr-code-display';
// // import { Share2, Users } from 'lucide-react';
// // import { useSession } from 'next-auth/react';
// // import { useRouter } from 'next/navigation';

// // export default function MeetingsPage() {
// //   const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
// //   const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');
// //   const { data: session, status } = useSession();
// //   const router = useRouter();

// //   const handleMeetingCreated = (meetingId: string) => {
// //     const url = `${window.location.origin}/meeting/${meetingId}/join`;
// //     setCreatedMeetingId(meetingId);
// //     setCreatedMeetingUrl(url);
// //   };

// //   const handleCreateNewMeeting = () => {
// //     setCreatedMeetingId(null);
// //     setCreatedMeetingUrl('');
// //   };

// //   if (status === 'loading') {
// //     return <div>Loading...</div>;
// //   }

// //   if (status === 'unauthenticated') {
// //     router.push('/login');
// //     return null;
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       <Header />
// //       <div className="flex">
// //         <Sidebar />
// //         <main className="flex-1 p-6">
// //           <div className="mb-8">
// //             <h1 className="text-3xl font-bold text-gray-900 mb-2">
// //               Create a New Meeting
// //             </h1>
// //             <p className="text-gray-600">
// //               Fill out the form below to create a new meeting room.
// //             </p>
// //           </div>

// //           <div className="bg-white rounded-xl shadow-md p-6">
// //             {createdMeetingId ? (
// //               <div className="space-y-6">
// //                 <div className="text-center">
// //                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
// //                     <Share2 className="h-8 w-8 text-green-600" />
// //                   </div>
// //                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
// //                     Meeting Room Created!
// //                   </h3>
// //                   <p className="text-gray-600 text-sm">
// //                     Share this QR code or link with your team to join the meeting.
// //                   </p>
// //                 </div>

// //                 <QRCodeDisplay url={createdMeetingUrl} />

// //                 <div className="space-y-3">
// //                   <label className="block text-sm font-medium text-gray-700">
// //                     Meeting Link
// //                   </label>
// //                   <div className="flex gap-2">
// //                     <input
// //                       type="text"
// //                       value={createdMeetingUrl}
// //                       readOnly
// //                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
// //                     />
// //                     <button
// //                       onClick={() => navigator.clipboard.writeText(createdMeetingUrl)}
// //                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
// //                     >
// //                       Copy
// //                     </button>
// //                   </div>
// //                 </div>

// //                 <div className="flex gap-3 pt-4">
// //                   <button
// //                     onClick={handleCreateNewMeeting}
// //                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
// //                   >
// //                     Create Another
// //                   </button>
// //                   <a
// //                     href={`/meeting/${createdMeetingId}/join`}
// //                     className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
// //                   >
// //                     Join Meeting
// //                   </a>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="space-y-4">
// //                 <div className="text-center mb-4">
// //                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
// //                     <Users className="h-8 w-8 text-blue-600" />
// //                   </div>
// //                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
// //                     Create Team Meeting
// //                   </h3>
// //                   <p className="text-gray-600 text-sm">
// //                     Set up a meeting room and invite your team members to collaborate.
// //                   </p>
// //                 </div>

// //                 <MeetingForm onMeetingCreated={handleMeetingCreated} />
// //               </div>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useState } from "react";
// import { Header } from "@/components/app/header";
// import { Sidebar } from "@/components/app/sidebar";
// import { MeetingForm } from "@/components/app/meeting-form";
// import { QRCodeDisplay } from "@/components/app/qr-code-display";
// import { Share2, Users, Lock, Globe } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

// interface CreatedMeetingData {
//   meetingId: string;
//   id: string;
//   isPublic: boolean;
//   language: string;
//   passkey?: string;
// }

// export default function MeetingsPage() {
//   const [createdMeeting, setCreatedMeeting] = useState<CreatedMeetingData | null>(null);
//   const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>("");
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const handleMeetingCreated = (meetingData: any) => {
//     console.log("Meeting created with data:", meetingData);

//     // Use meetingId first, fallback to id if meetingId doesn't exist
//     const actualMeetingId = meetingData.meetingId || meetingData.id;

//     if (!actualMeetingId) {
//       console.error("No meeting ID found in response:", meetingData);
//       return;
//     }

//     const url = `${window.location.origin}/meeting/${actualMeetingId}/join`;

//     setCreatedMeeting({
//       meetingId: actualMeetingId,
//       id: actualMeetingId,
//       isPublic: meetingData.isPublic,
//       language: meetingData.language,
//       passkey: meetingData.passkey,
//     });

//     setCreatedMeetingUrl(url);
//   };

//   const handleCreateNewMeeting = () => {
//     setCreatedMeeting(null);
//     setCreatedMeetingUrl("");
//   };

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   if (status === "unauthenticated") {
//     router.push("/login");
//     return null;
//   }

//   const getLanguageInfo = (language: string) => {
//     const languages: { [key: string]: { name: string; flag: string } } = {
//       english: { name: "English", flag: "🇺🇸" },
//       indonesian: { name: "Indonesian", flag: "🇮🇩" },
//       korean: { name: "Korean", flag: "🇰🇷" },
//     };
//     return languages[language] || { name: language, flag: "🌐" };
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="flex">
//         <Sidebar />
//         <main className="flex-1 p-6">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Meeting</h1>
//             <p className="text-gray-600">Fill out the form below to create a new meeting room.</p>
//           </div>

//           <div className="bg-white rounded-xl shadow-md p-6">
//             {createdMeeting ? (
//               <div className="space-y-6">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Share2 className="h-8 w-8 text-green-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Room Created!</h3>
//                   <p className="text-gray-600 text-sm">Share this QR code or link with your team to join the meeting.</p>
//                 </div>

//                 {/* Meeting Details */}
//                 <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">Meeting Type:</span>
//                     <div className="flex items-center gap-2">
//                       {createdMeeting.isPublic ? (
//                         <>
//                           <Globe className="h-4 w-4 text-green-600" />
//                           <span className="text-sm text-green-600">Public</span>
//                         </>
//                       ) : (
//                         <>
//                           <Lock className="h-4 w-4 text-orange-600" />
//                           <span className="text-sm text-orange-600">Private</span>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium text-gray-700">Language:</span>
//                     <span className="text-sm text-gray-600">
//                       {getLanguageInfo(createdMeeting.language).flag} {getLanguageInfo(createdMeeting.language).name}
//                     </span>
//                   </div>
//                   {createdMeeting.passkey && (
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm font-medium text-gray-700">Passkey:</span>
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{createdMeeting.passkey}</span>
//                         <button onClick={() => navigator.clipboard.writeText(createdMeeting.passkey!)} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
//                           Copy
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <QRCodeDisplay url={createdMeetingUrl} />

//                 <div className="space-y-3">
//                   <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={createdMeetingUrl} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm" />
//                     <button onClick={() => navigator.clipboard.writeText(createdMeetingUrl)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
//                       Copy
//                     </button>
//                   </div>
//                 </div>

//                 {createdMeeting.passkey && (
//                   <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Lock className="h-4 w-4 text-orange-600" />
//                       <span className="text-sm font-medium text-orange-800">Important</span>
//                     </div>
//                     <p className="text-xs text-orange-700">This is a private meeting. Participants will need the passkey to join. Make sure to share it securely with intended participants.</p>
//                   </div>
//                 )}

//                 <div className="flex gap-3 pt-4">
//                   <button onClick={handleCreateNewMeeting} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
//                     Create Another
//                   </button>
//                   <a href={`/meeting/${createdMeeting.meetingId}/join`} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center">
//                     Join Meeting
//                   </a>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="text-center mb-4">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Users className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Team Meeting</h3>
//                   <p className="text-gray-600 text-sm">Set up a meeting room and invite your team members to collaborate.</p>
//                 </div>

//                 <MeetingForm onMeetingCreated={handleMeetingCreated} />
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// app/create-meetings/page.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { MeetingForm } from "@/components/app/meeting-form";
import { QRCodeDisplay } from "@/components/app/qr-code-display";
import { Share2, Users, Lock, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CreatedMeetingData {
  meetingId: string;
  id: string;
  isPublic: boolean;
  language: string;
  passkey?: string;
}

export default function MeetingsPage() {
  const [createdMeeting, setCreatedMeeting] = useState<CreatedMeetingData | null>(null);
  const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>("");
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleMeetingCreated = (meetingData: any) => {
    console.log("Meeting created with data:", meetingData);

    // Use meetingId first, fallback to id if meetingId doesn't exist
    const actualMeetingId = meetingData.meetingId || meetingData.id;

    if (!actualMeetingId) {
      console.error("No meeting ID found in response:", meetingData);
      alert("Error: No meeting ID received. Please try again.");
      return;
    }

    const url = `${window.location.origin}/meeting/${actualMeetingId}/join`;

    setCreatedMeeting({
      meetingId: actualMeetingId,
      id: actualMeetingId,
      isPublic: meetingData.isPublic,
      language: meetingData.language,
      passkey: meetingData.passkey,
    });

    setCreatedMeetingUrl(url);
  };

  const handleCreateNewMeeting = () => {
    setCreatedMeeting(null);
    setCreatedMeetingUrl("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const getLanguageInfo = (language: string) => {
    const languages: { [key: string]: { name: string; flag: string } } = {
      english: { name: "English", flag: "🇺🇸" },
      indonesian: { name: "Indonesian", flag: "🇮🇩" },
      korean: { name: "Korean", flag: "🇰🇷" },
    };
    return languages[language] || { name: language, flag: "🌐" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Meeting</h1>
            <p className="text-gray-600">Fill out the form below to create a new meeting room.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            {createdMeeting ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Room Created!</h3>
                  <p className="text-gray-600 text-sm">Share this QR code or link with your team to join the meeting.</p>
                </div>

                {/* Meeting Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Meeting Type:</span>
                    <div className="flex items-center gap-2">
                      {createdMeeting.isPublic ? (
                        <>
                          <Globe className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-orange-600">Private</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Language:</span>
                    <span className="text-sm text-gray-600">
                      {getLanguageInfo(createdMeeting.language).flag} {getLanguageInfo(createdMeeting.language).name}
                    </span>
                  </div>
                  {createdMeeting.passkey && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Passkey:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{createdMeeting.passkey}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(createdMeeting.passkey!);
                            alert("Passkey copied to clipboard!");
                          }}
                          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <QRCodeDisplay url={createdMeetingUrl} />

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                  <div className="flex gap-2">
                    <input type="text" value={createdMeetingUrl} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdMeetingUrl);
                        alert("Meeting link copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {createdMeeting.passkey && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Important</span>
                    </div>
                    <p className="text-xs text-orange-700">This is a private meeting. Participants will need the passkey to join. Make sure to share it securely with intended participants.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={handleCreateNewMeeting} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Create Another
                  </button>
                  <a href={`/meeting/${createdMeeting.meetingId}/join`} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Team Meeting</h3>
                  <p className="text-gray-600 text-sm">Set up a meeting room and invite your team members to collaborate.</p>
                </div>

                <MeetingForm onMeetingCreated={handleMeetingCreated} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
