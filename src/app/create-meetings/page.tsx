// app/create-meetings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { MeetingForm } from "@/components/app/meeting-form";
import { QRCodeDisplay } from "@/components/app/qr-code-display";
import { Share2, Users, Lock, Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Custom hook to check if the screen is desktop size
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    if (typeof window !== 'undefined') {
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  return isDesktop;
};

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
  
  const isDesktop = useIsDesktop();
  const [isOpen, setIsOpen] = useState(false); // Default to closed

  // Open sidebar on desktop, close on mobile, on mount and on resize
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  const handleMeetingCreated = (meetingData: any) => {
    console.log("Meeting created with data:", meetingData);

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
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
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
    <div className="bg-gray-50 min-h-screen">
      <Sidebar 
        isOpen={isOpen} 
        isDesktop={isDesktop} 
        toggleSidebar={() => setIsOpen(!isOpen)} 
      />
      <div 
        className={cn(
          "relative flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isOpen && isDesktop ? "lg:ml-64" : "ml-0"
        )}
      >
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-grow p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Create a New Meeting</h1>
              <p className="text-gray-600">Fill out the form below to create a new meeting room.</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
              {createdMeeting ? (
                <div className="space-y-6">
                
                  <QRCodeDisplay url={createdMeetingUrl} />

                  {createdMeeting.passkey && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Important</span>
                      </div>
                      <p className="text-xs text-orange-700">This is a private meeting. Participants will need the passkey to join. Make sure to share it securely with intended participants.</p>
                    </div>
                  )}

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

                  <div className="flex gap-3 pt-4">
                    <a href={`/meeting/${createdMeeting.id}/join`} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center">
                      Join Meeting
                    </a>
                  </div>
                </div>
              ) : (
                <MeetingForm onMeetingCreated={handleMeetingCreated} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
