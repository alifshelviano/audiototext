// app/history/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Trash2, Edit, Calendar, Users, Globe, Lock, FileText, Clock, Search, Eye, MoreVertical, Sparkles, Key, Copy, CheckCircle } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  time: string;
  isPublic: boolean;
  language: string;
  passkey?: string;
  transcripts?: any[];
  summary?: any;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", time: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [copiedPasskey, setCopiedPasskey] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const fetchMeetings = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching meetings for user:", userId);
      const res = await fetch(`/api/meetings?userId=${userId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch meetings: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Raw API response:", data);

      const meetingsData = Array.isArray(data) ? data : [];

      // Debug: Check each meeting for passkey
      meetingsData.forEach((meeting: Meeting, index: number) => {
        console.log(`Meeting ${index + 1}:`, {
          id: meeting.id,
          name: meeting.name,
          isPublic: meeting.isPublic,
          hasPasskey: !!meeting.passkey,
          passkey: meeting.passkey,
          shouldShowPasskeyBadge: !meeting.isPublic && !!meeting.passkey,
        });
      });

      setMeetings(meetingsData);
      setFilteredMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
      setFilteredMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchMeetings(session.user.id);
    }
  }, [status, session, fetchMeetings]);

  // Filter meetings based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMeetings(meetings);
    } else {
      const filtered = meetings.filter((meeting) => meeting.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredMeetings(filtered);
    }
  }, [searchQuery, meetings]);

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meeting");
      setMeetings(meetings.filter((m) => m.id !== meetingId));
      setFilteredMeetings(filteredMeetings.filter((m) => m.id !== meetingId));
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting. Please try again.");
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);
    setEditForm({
      name: meeting.name,
      time: new Date(meeting.time).toISOString().slice(0, 16),
    });
    setActiveMenu(null);
  };

  const handleUpdate = async (meetingId: string) => {
    if (!editForm.name.trim() || !editForm.time) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      setMeetings(meetings.map((m) => (m.id === meetingId ? { ...m, ...editForm } : m)));
      setFilteredMeetings(filteredMeetings.map((m) => (m.id === meetingId ? { ...m, ...editForm } : m)));
      setEditingMeeting(null);
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Failed to update meeting. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMeeting(null);
    setActiveMenu(null);
  };

  const handleCopyPasskey = async (passkey: string) => {
    try {
      await navigator.clipboard.writeText(passkey);
      setCopiedPasskey(passkey);
      setTimeout(() => setCopiedPasskey(null), 2000);
    } catch (err) {
      console.error("Failed to copy passkey: ", err);
      alert("Failed to copy passkey to clipboard");
    }
  };

  const getLanguageInfo = (language: string) => {
    const languages: { [key: string]: { name: string; flag: string; color: string } } = {
      english: { name: "English", flag: "🇺🇸", color: "bg-blue-100 text-blue-700 border-blue-200" },
      indonesian: { name: "Indonesian", flag: "🇮🇩", color: "bg-red-100 text-red-700 border-red-200" },
      korean: { name: "Korean", flag: "🇰🇷", color: "bg-purple-100 text-purple-700 border-purple-200" },
    };
    return languages[language] || { name: language, flag: "🌐", color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isPast = date < now;

    return {
      full: date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: isPast ? "past" : "upcoming",
    };
  };

  const hasTranscripts = (m: Meeting) => m.transcripts && m.transcripts.length > 0;
  const hasSummary = (m: Meeting) => m.summary && Object.keys(m.summary).length > 0;

  const renderPasskeyBadge = (meeting: Meeting) => {
    const shouldShow = !meeting.isPublic && meeting.passkey;

    console.log(`Rendering passkey badge for "${meeting.name}":`, {
      isPublic: meeting.isPublic,
      passkey: meeting.passkey,
      shouldShow: shouldShow,
    });

    if (!shouldShow) {
      return null;
    }

    return (
      <Badge
        variant="outline"
        className={`bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 cursor-pointer gap-1.5 px-3 py-1.5 transition-all duration-200 ${
          copiedPasskey === meeting.passkey ? "bg-green-50 text-green-700 border-green-200" : ""
        }`}
        onClick={() => handleCopyPasskey(meeting.passkey!)}
        title="Click to copy passkey"
      >
        <Key className="w-3 h-3" />
        {copiedPasskey === meeting.passkey ? (
          <>
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-medium">Copied!</span>
          </>
        ) : (
          <>
            <span className="text-xs font-medium">Passkey: {meeting.passkey}</span>
            <Copy className="w-3 h-3" />
          </>
        )}
      </Badge>
    );
  };

  const renderMeetingCard = (meeting: Meeting) => {
    const datetime = formatDateTime(meeting.time);
    const langInfo = getLanguageInfo(meeting.language);

    if (editingMeeting === meeting.id) {
      return (
        <div key={meeting.id} className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Meeting name" className="text-lg font-semibold" />
            <Input type="datetime-local" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-full" />
            <div className="flex gap-3">
              <Button onClick={() => handleUpdate(meeting.id)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={meeting.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-blue-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 pr-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{meeting.name}</h2>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu(activeMenu === meeting.id ? null : meeting.id)} className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>

            {activeMenu === meeting.id && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 min-w-32 animate-in fade-in duration-200">
                <Button variant="ghost" onClick={() => handleEdit(meeting)} className="w-full justify-start text-sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(meeting.id)} className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Public/Private Badge */}
          {meeting.isPublic ? (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 flex-shrink-0">
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-gray-200 flex-shrink-0">
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </div>
          )}

          {/* Passkey Badge for Private Meetings */}
          {renderPasskeyBadge(meeting)}
        </div>

        {/* Meeting Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{datetime.date}</p>
                <p className="text-xs text-gray-500">{datetime.time}</p>
              </div>
            </div>
            {/* Past/Upcoming Badge - Moved to the right */}
            <div className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border flex-shrink-0 ${datetime.status === "upcoming" ? "text-green-600 bg-green-50 border-green-200" : "text-gray-600 bg-gray-50 border-gray-200"}`}>
              {datetime.status === "upcoming" ? "Upcoming" : "Past"}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <span className="text-lg">{langInfo.flag}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 capitalize">{meeting.language}</p>
              <p className="text-xs text-gray-500">Language</p>
            </div>
            <Badge variant="outline" className={langInfo.color}>
              {langInfo.name}
            </Badge>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 mb-6">
          {hasTranscripts(meeting) && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4" />
              <span>Transcripts</span>
            </div>
          )}
          {hasSummary(meeting) && (
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
              <FileText className="w-4 h-4" />
              <span>Summary</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/meeting/${meeting.id}/join`} className="flex-1">
            <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl text-center font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:shadow-2xl flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Join Meeting</span>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">No Meetings Created Yet</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Start by creating your first meeting room to collaborate with others and track your conversations.</p>
      <Link href="/meeting/create-meetings">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
          Create Your First Meeting
        </Button>
      </Link>
    </div>
  );

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">My Meetings</h1>
            <p className="text-xl text-gray-600 max-w-2xl">Manage and review all your created meetings in one place</p>
          </div>
          <Link href="/meeting/create-meetings">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Sparkles className="w-5 h-5 mr-2" />
              New Meeting
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search your meetings by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && meetings.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-semibold text-blue-600">{filteredMeetings.length}</span> of <span className="font-semibold text-gray-800">{meetings.length}</span> meetings
          </p>
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
            No meetings match "<span className="font-semibold">{searchQuery}</span>"
          </p>
          <Button onClick={() => setSearchQuery("")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
            Clear search
          </Button>
        </div>
      ) : (
        renderEmptyState()
      )}
    </DashboardLayout>
  );
}
