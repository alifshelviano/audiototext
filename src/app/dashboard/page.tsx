"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Briefcase, Key, ArrowRight, X, Plus, Calendar, Clock, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/app/dashboard-layout";
import { CreateMeetingDialog } from "@/components/app/create-meeting-dialog";

interface Meeting {
  id: string;
  name: string;
  time: string;
  transcripts?: any[];
}

export default function Page() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { data: session, status } = useSession();

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);

      // Only fetch meetings if user is authenticated
      if (status !== "authenticated") {
        setMeetings([]);
        return;
      }

      const res = await fetch("/api/meetings?userOnly=true");

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
  }, [status]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");

    try {
      const findMeetingRes = await fetch(`/api/meetings/find-by-passkey?passkey=${passkey}`);

      if (!findMeetingRes.ok) {
        throw new Error("Invalid passkey or meeting not found");
      }

      const meetingData = await findMeetingRes.json();

      if (!meetingData.meetingId) {
        throw new Error("Meeting not found");
      }

      window.location.href = `/meeting/${meetingData.meetingId}/join`;
    } catch (error: any) {
      console.error("Error joining meeting:", error);
      setJoinError(error.message || "Failed to join meeting. Please check the passkey.");
    } finally {
      setIsJoining(false);
    }
  };

  const resetJoinForm = () => {
    setMeetingId("");
    setPasskey("");
    setJoinError("");
    setShowJoinModal(false);
  };

  // Calculate total meetings created by the user
  const userMeetingsCount = meetings.length;

  // Recent meetings (last 3)
  const recentMeetings = meetings.slice(0, 3);

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back{status === "authenticated" && session?.user?.name ? `, ${session.user.name}` : ""}!</h1>
        <p className="text-gray-600 text-sm sm:text-base">Here's a summary of your meetings and activities.</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Total Meetings Card - Only show if user is authenticated */}
        {status === "authenticated" && (
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">My Meetings</h3>
              </div>
              {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-2xl sm:text-3xl font-bold">{userMeetingsCount}</span>}
            </div>
            <p className="text-purple-100 text-xs sm:text-sm opacity-90">Meetings you've created</p>
          </div>
        )}

        {/* Create Meeting Card */}
        {status === "authenticated" && (
          <Link href="/create-meetings" className="block h-full">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">Create Meeting</h3>
              </div>
              <p className="text-green-100 text-xs sm:text-sm mb-4 opacity-90">Start a new meeting room and invite collaborators</p>
              <div className="w-full bg-white/20 backdrop-blur-sm py-2 px-4 rounded-xl font-medium group-hover:bg-white/30 transition-all duration-200 text-center text-sm">Get Started</div>
            </div>
          </Link>
        )}

        {/* Join Meeting Card */}
        <div
          onClick={() => setShowJoinModal(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base">Join Meeting</h3>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mb-4 opacity-90">Join existing meeting with passkey</p>
          <div className="w-full bg-white/20 backdrop-blur-sm py-2 px-4 rounded-xl font-medium group-hover:bg-white/30 transition-all duration-200 text-center text-sm flex items-center justify-center gap-2">
            Join Now <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Access Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Quick Access
          </h3>
          <div className="space-y-3">
            <Link href="/public-meetings">
              <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Search className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">Browse Public Meetings</span>
                    <span className="text-gray-500 text-xs">Discover and join public meetings</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            {status === "authenticated" && (
              <Link href="/history">
                <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 block">Meeting History</span>
                      <span className="text-gray-500 text-xs">View your past meetings</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Meetings / How to Join Card */}
        <div className="space-y-6">
          {/* Recent Meetings - Only show if user has meetings */}
          {status === "authenticated" && recentMeetings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Recent Meetings
              </h3>
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <Link key={meeting.id} href={`/meeting/${meeting.id}`}>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate text-sm sm:text-base">{meeting.name}</p>
                        <p className="text-gray-500 text-xs">{new Date(meeting.time).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
              {meetings.length > 3 && (
                <Link href="/history">
                  <div className="mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">View all {meetings.length} meetings</div>
                </Link>
              )}
            </div>
          )}

          {/* How to Join Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Join a Meeting</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Get the Passkey</p>
                  <p className="text-gray-600 text-xs mt-1">Ask the meeting organizer for the 6-character passkey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Enter Passkey</p>
                  <p className="text-gray-600 text-xs mt-1">Click "Join Meeting" and enter the passkey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Start Collaborating</p>
                  <p className="text-gray-600 text-xs mt-1">Enter your name and join the conversation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Join Meeting</h3>
              <button onClick={resetJoinForm} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" disabled={isJoining}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-6">
              {joinError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm">{joinError}</p>
                </div>
              )}

              <div>
                <label htmlFor="passkey" className="block text-sm font-medium text-gray-700 mb-3">
                  Meeting Passkey
                </label>
                <input
                  id="passkey"
                  type="text"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character passkey"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase text-center text-lg tracking-widest placeholder-gray-400"
                  required
                  disabled={isJoining}
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Enter the 6-character passkey provided by the meeting organizer</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={resetJoinForm} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50" disabled={isJoining}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !passkey || passkey.length !== 6}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Meeting
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Need help finding the passkey?
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Ask the meeting organizer for the passkey</li>
                <li>• The passkey is a 6-character code (letters and numbers)</li>
                <li>• Example: ABC123, XYZ789, MEET12</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
