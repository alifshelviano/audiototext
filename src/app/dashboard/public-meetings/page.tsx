// public-meetings/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Globe, Clock, Users, RefreshCw, Search, Calendar, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Meeting {
  id: string;
  name: string;
  time: string;
  isPublic: boolean;
  language: string;
}

export default function PublicMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      const publicMeetings = (Array.isArray(data) ? data : []).filter((m: Meeting) => m.isPublic);
      setMeetings(publicMeetings);
      setFilteredMeetings(publicMeetings);
    } catch (error: any) {
      console.error("Error fetching public meetings:", error);
      setError(error.message || "Failed to load public meetings");
      setMeetings([]);
      setFilteredMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Filter meetings based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMeetings(meetings);
    } else {
      const filtered = meetings.filter((meeting) => meeting.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredMeetings(filtered);
    }
  }, [searchQuery, meetings]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

    return {
      date: date.toLocaleDateString("en-US", dateOptions),
      time: date.toLocaleTimeString([], timeOptions),
      status: date > now ? "upcoming" : "past",
    };
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      english: "🇺🇸",
      indonesian: "🇮🇩",
      korean: "🇰🇷",
      // Add other flags as needed
    };
    return flags[language] || "🌐";
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      english: "bg-cyan-100 text-cyan-700 border-cyan-200",
      indonesian: "bg-red-100 text-red-700 border-red-200",
      korean: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[language] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const renderMeetingCard = (meeting: Meeting) => {
    const datetime = formatDateTime(meeting.time);

    return (
      <div key={meeting.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-cyan-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-800 pr-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">{meeting.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 flex-shrink-0 ml-2">
            <Globe className="w-3 h-3" />
            <span>Public</span>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{datetime.date}</p>
              <p className="text-xs text-gray-500">{datetime.time}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${datetime.status === "upcoming" ? "bg-cyan-100 text-cyan-700" : "bg-gray-100 text-gray-600"}`}>{datetime.status === "upcoming" ? "Upcoming" : "Past"}</div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <span className="text-lg">{getLanguageFlag(meeting.language)}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 capitalize">{meeting.language}</p>
              <p className="text-xs text-gray-500">Meeting Language</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getLanguageColor(meeting.language)}`}>Language</div>
          </div>
        </div>

        {/* Join Button */}
        <Link href={`/meeting/${meeting.id}/join`}>
          <div className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 px-4 rounded-xl text-center font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:shadow-2xl flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Join Meeting</span>
          </div>
        </Link>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-cyan-50/30">
      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Globe className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">No Public Meetings Available</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">There are no public meetings happening right now. Check back later or create your own meeting.</p>
      <Link href="/meeting/create-meetings">
        <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          <Users className="w-5 h-5 mr-2" />
          Create a Meeting
        </Button>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-700 bg-clip-text text-transparent">Public Meetings</h1>
            <p className="text-l text-gray-600 max-w-2xl">Browse and join ongoing public meetings. No login required to participate.</p>
          </div>
          <Button
            onClick={fetchMeetings}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-3 px-6 py-3 border-2 border-gray-200 hover:border-cyan-300 rounded-xl hover:bg-cyan-50 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="font-semibold">Refresh</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search meetings by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <p className="text-red-800 font-medium text-lg">{error}</p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && meetings.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-semibold text-cyan-600">{filteredMeetings.length}</span> of <span className="font-semibold text-gray-800">{meetings.length}</span> public meetings
          </p>
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        renderSkeleton()
      ) : filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredMeetings.map(renderMeetingCard)}</div>
      ) : searchQuery ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No meetings found</h3>
          <p className="text-gray-500 mb-6 text-lg">
            No public meetings match "<span className="font-semibold">{searchQuery}</span>"
          </p>
          <Button onClick={() => setSearchQuery("")} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl">
            Clear search
          </Button>
        </div>
      ) : (
        renderEmptyState()
      )}
    </DashboardLayout>
  );
}
