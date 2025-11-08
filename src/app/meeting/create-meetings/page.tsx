// app/meeting/create-meetings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MeetingForm } from "@/components/app/create-meeting/meeting-form";
import { QRCodeDisplay } from "@/components/app/create-meeting/qr-code-display";
import { Share2, Users, Lock, Globe, Copy, ArrowLeft, Calendar, Languages, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";

// Custom hook to check if the screen is desktop size
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    if (typeof window !== "undefined") {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
      return () => window.removeEventListener("resize", checkScreenSize);
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
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
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
    <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 min-h-screen">
      <Sidebar isOpen={isOpen} isDesktop={isDesktop} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className={cn("relative flex flex-col min-h-screen transition-all duration-300 ease-in-out", isOpen && isDesktop ? "lg:ml-64" : "ml-0")}>
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-grow p-4 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-cyan-600" />
                </div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">{createdMeeting ? "Meeting Created Successfully!" : "Create a New Meeting"}</h1>
              </div>
              <p className="text-gray-600 max-w-xl mx-auto lg:mx-0">{createdMeeting ? "Your meeting room is ready! Share the details below with participants." : "Fill out the form below to create a new meeting room."}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column - Form or Meeting Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                  {createdMeeting ? (
                    <div className="space-y-6">
                      {/* Back Button */}
                      <button onClick={handleCreateNewMeeting} className="flex items-center gap-2 text-cyan-700 hover:text-teal-800 transition-colors font-medium mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Create New Meeting
                      </button>

                      {/* Meeting Details Card */}
                      <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-cyan-600" />
                          Meeting Details
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Meeting Type</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {createdMeeting.isPublic ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-600">Public</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-orange-600">Private</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <Languages className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Language</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {getLanguageInfo(createdMeeting.language).flag} {getLanguageInfo(createdMeeting.language).name}
                            </span>
                          </div>

                          {createdMeeting.passkey && (
                            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-3">
                                <Lock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-medium text-amber-700">Passkey</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-lg border border-amber-200">{createdMeeting.passkey}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(createdMeeting.passkey!);
                                  }}
                                  className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Join Meeting Button */}
                      <a
                        href={`/meeting/${createdMeeting.id}/join`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Users className="h-5 w-5" />
                        Join Meeting Now
                      </a>
                    </div>
                  ) : (
                    <MeetingForm onMeetingCreated={handleMeetingCreated} />
                  )}
                </div>
              </div>

              {/* Right Column - QR Code & Sharing */}
              {createdMeeting && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                    <QRCodeDisplay url={createdMeetingUrl} />
                  </div>

                  {/* Security Notice for Private Meetings */}
                  {createdMeeting.passkey && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Lock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-1">Private Meeting Security</h4>
                          <p className="text-sm text-amber-700">This is a private meeting. Share the passkey only with intended participants through secure channels. Participants will need both the meeting link and passkey to join.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State for Right Column */}
              {!createdMeeting && (
                <div className="hidden lg:block">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Share</h3>
                      <p className="text-gray-600 text-sm">After creating your meeting, you'll get a shareable link and QR code here.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
