// public-meetings/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/app/sidebar";
import { Header } from "@/components/app/header";
import { Globe, Clock, Users, RefreshCw } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  time: string;
  isPublic: boolean;
  language: string;
}

export default function PublicMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/meetings?public=true");

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch public meetings");
      }

      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];

      // Filter to ensure only public meetings are shown (double safety)
      const publicMeetings = meetingsData.filter((meeting: Meeting) => meeting.isPublic);
      setMeetings(publicMeetings);
    } catch (error: any) {
      console.error("Error fetching public meetings:", error);
      setError(error.message || "Failed to load public meetings");
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if meeting is in the future
    if (date > now) {
      return `Starts ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `Started ${date.toLocaleDateString()}`;
    }
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      english: "🇺🇸",
      indonesian: "🇮🇩",
      korean: "🇰🇷",
    };
    return flags[language] || "🌐";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Meetings</h1>
                <p className="text-gray-600">Browse and join ongoing public meetings. No login required.</p>
              </div>
              <button onClick={fetchMeetings} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-800 pr-2">{meeting.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 flex-shrink-0">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(meeting.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-lg">{getLanguageFlag(meeting.language)}</span>
                      <span className="capitalize">{meeting.language}</span>
                    </div>
                  </div>

                  <Link href={`/meeting/${meeting.id}/join`}>
                    <div className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">Join Meeting</div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Public Meetings Available</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">There are no public meetings happening right now. Check back later or create your own meeting to get started.</p>
              <Link href="/create-meetings">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <Users className="w-4 h-4" />
                  Create a Meeting
                </div>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
