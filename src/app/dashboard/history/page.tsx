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
      const res = await fetch(`/api/meetings?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch meetings");
      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
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


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMeetings(meetings);
    } else {
      const filtered = meetings.filter((meeting) => meeting.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredMeetings(filtered);
    }
  }, [searchQuery, meetings]);


  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meeting");
      setMeetings(meetings.filter((m) => m.id !== meetingId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete meeting.");
    }
  };


  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting.id);

    // Convert meeting time to local datetime string for the input
    const meetingDate = new Date(meeting.time);

    // Adjust for timezone offset to get correct local time display
    const timezoneOffset = meetingDate.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(meetingDate.getTime() - timezoneOffset);

    setEditForm({
      name: meeting.name,
      time: localDate.toISOString().slice(0, 16),
    });
    setActiveMenu(null);
  };


  const handleUpdate = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      const updatedMeeting = await res.json();
      setMeetings(meetings.map((m) => (m.id === meetingId ? updatedMeeting : m)));
      setEditingMeeting(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update meeting.");
    }
  };


  const handleCancelEdit = () => setEditingMeeting(null);


  const handleCopyPasskey = (passkey: string) => {
    navigator.clipboard.writeText(passkey).then(() => {
      setCopiedPasskey(passkey);
      setTimeout(() => setCopiedPasskey(null), 2000);
    });
  };


  const getLanguageInfo = (language: string) => {
    const languages: { [key: string]: { name: string; flag: string; color: string } } = {
      english: { name: "English", flag: "🇺🇸", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
      indonesian: { name: "Indonesian", flag: "🇮🇩", color: "bg-red-100 text-red-700 border-red-200" },
      korean: { name: "Korean", flag: "🇰🇷", color: "bg-purple-100 text-purple-700 border-purple-200" },
    };
    return languages[language] || { name: language, flag: "🌐", color: "bg-gray-100 text-gray-700 border-gray-200" };
  };


  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      isPast: date < new Date(),
    };
  };


  const hasTranscripts = (m: Meeting) => m.transcripts && m.transcripts.length > 0;
  const hasSummary = (m: Meeting) => m.summary && Object.keys(m.summary).length > 0;


  const renderMeetingCard = (meeting: Meeting) => {
    const datetime = formatDateTime(meeting.time);
    const langInfo = getLanguageInfo(meeting.language);


    if (editingMeeting === meeting.id) {
      return (
        <div key={meeting.id} className="bg-white rounded-2xl shadow-lg border-2 border-cyan-500 p-6">
          <Input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="text-lg font-semibold mb-4" />
          <Input type="datetime-local" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-full mb-4" />
          <div className="flex gap-3">
            <Button onClick={() => handleUpdate(meeting.id)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
              Save
            </Button>
            <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      );
    }


    return (
      <div key={meeting.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-cyan-200">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 pr-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">{meeting.name}</h2>
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setActiveMenu(activeMenu === meeting.id ? null : meeting.id)} className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {activeMenu === meeting.id && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 min-w-32">
                <Button variant="ghost" onClick={() => handleEdit(meeting)} className="w-full justify-start text-sm">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(meeting.id)} className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>


        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {meeting.isPublic ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Globe className="w-3 h-3 mr-1.5" />
              Public
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Lock className="w-3 h-3 mr-1.5" />
              Private
            </Badge>
          )}
          {!meeting.isPublic && meeting.passkey && (
            <Badge
              variant="outline"
              className={`bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 cursor-pointer gap-1.5 transition-all ${copiedPasskey === meeting.passkey ? "!bg-green-50 !text-green-700 !border-green-200" : ""}`}
              onClick={() => handleCopyPasskey(meeting.passkey!)}
              title="Click to copy passkey"
            >
              {copiedPasskey === meeting.passkey ? <CheckCircle className="w-3 h-3" /> : <Key className="w-3 h-3" />}
              <span>{copiedPasskey === meeting.passkey ? "Copied" : meeting.passkey}</span>
            </Badge>
          )}
        </div>


        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">{datetime.date}</p>
                <p className="text-xs text-gray-500">{datetime.time}</p>
              </div>
            </div>
            <Badge variant={datetime.isPast ? "secondary" : "default"} className={datetime.isPast ? "" : "bg-green-100 text-green-700"}>
              {datetime.isPast ? "Past" : "Upcoming"}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-lg">{langInfo.flag}</span>
              <p className="text-sm font-medium text-gray-700 capitalize">{meeting.language}</p>
            </div>
            <Badge variant="outline" className={langInfo.color}>
              {langInfo.name}
            </Badge>
          </div>
        </div>


        <div className="flex items-center gap-4 mb-6">
          {hasTranscripts(meeting) && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <Users className="w-3 h-3 mr-1.5" />
              Transcripts
            </Badge>
          )}
          {hasSummary(meeting) && (
            <Badge variant="outline" className="bg-cyan-100 text-cyan-800">
              <FileText className="w-3 h-3 mr-1.5" />
              Summary
            </Badge>
          )}
        </div>


        <Link href={`/meeting/${meeting.id}/join`} className="flex-1">
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Join Meeting</span>
          </Button>
        </Link>
      </div>
    );
  };


  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  );


  const renderEmptyState = () => (
    <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-cyan-50/30">
      <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">No Meetings Created Yet</h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">Start by creating your first meeting room.</p>
      <Link href="/meeting/create-meetings">
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg">Create Your First Meeting</Button>
      </Link>
    </div>
  );


  if (status === "loading" || !session) {
    return <DashboardLayout>{renderSkeleton()}</DashboardLayout>;
  }


  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-700 bg-clip-text text-transparent">My Meetings</h1>
            <p className="text-xl text-gray-600 max-w-2xl">Manage and review all your created meetings.</p>
          </div>
          <Link href="/meeting/create-meetings">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              New Meeting
            </Button>
          </Link>
        </div>


        <div className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search meetings by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
          />
        </div>
      </div>


      {!isLoading && meetings.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-semibold text-cyan-600">{filteredMeetings.length}</span> of {meetings.length} meetings
          </p>
        </div>
      )}


      {isLoading ? (
        renderSkeleton()
      ) : filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredMeetings.map(renderMeetingCard)}</div>
      ) : searchQuery ? (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold text-gray-800">No meetings found</h3>
          <p className="text-gray-500">No meetings match "{searchQuery}"</p>
          <Button onClick={() => setSearchQuery("")} className="mt-4 bg-cyan-600 text-white">
            Clear search
          </Button>
        </div>
      ) : (
        renderEmptyState()
      )}
    </DashboardLayout>
  );
}
