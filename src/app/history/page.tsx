// app/history/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Trash2, Edit, Calendar, Users, Globe, Lock, FileText } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  time: string;
  isPublic: boolean;
  language: string;
  transcripts?: any[];
  summary?: any;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", time: "" });

  const fetchMeetings = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/meetings?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch meetings");
      }
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchMeetings(session.user.id);
    }
  }, [status, session, fetchMeetings]);

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete meeting");
      }

      // Remove the deleted meeting from the state
      setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));
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
  };

  const handleUpdate = async (meetingId: string) => {
    if (!editForm.name.trim() || !editForm.time) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        throw new Error("Failed to update meeting");
      }

      // Update the meeting in the state
      setMeetings(meetings.map((meeting) => (meeting.id === meetingId ? { ...meeting, name: editForm.name, time: editForm.time } : meeting)));

      setEditingMeeting(null);
      setEditForm({ name: "", time: "" });
    } catch (error) {
      console.error("Error updating meeting:", error);
      alert("Failed to update meeting. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingMeeting(null);
    setEditForm({ name: "", time: "" });
  };

  const getLanguageInfo = (language: string) => {
    const languages: { [key: string]: { name: string; flag: string } } = {
      english: { name: "English", flag: "🇺🇸" },
      indonesian: { name: "Indonesian", flag: "🇮🇩" },
      korean: { name: "Korean", flag: "🇰🇷" },
    };
    return languages[language] || { name: language, flag: "🌐" };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasTranscripts = (meeting: Meeting) => {
    return meeting.transcripts && meeting.transcripts.length > 0;
  };

  const hasSummary = (meeting: Meeting) => {
    return meeting.summary && Object.keys(meeting.summary).length > 0;
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 h-48">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your meeting history</h1>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Meetings</h1>
            <p className="text-gray-600">Manage and review your created meetings</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : meetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  {editingMeeting === meeting.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meeting name"
                      />
                      <input
                        type="datetime-local"
                        value={editForm.time}
                        onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(meeting.id)} className="flex-1">
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800 pr-2">{meeting.name}</h2>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border flex-shrink-0">
                          {meeting.isPublic ? (
                            <>
                              <Globe className="w-3 h-3 text-green-600" />
                              <span className="text-green-600">Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-orange-600" />
                              <span className="text-orange-600">Private</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(meeting.time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-lg">{getLanguageInfo(meeting.language).flag}</span>
                          <span className="capitalize">{meeting.language}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          {hasTranscripts(meeting) && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Transcripts
                            </span>
                          )}
                          {hasSummary(meeting) && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Summary
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/meeting/${meeting.id}/join`} className="flex-1">
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(meeting)} title="Edit meeting">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(meeting.id)} title="Delete meeting">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Meetings Created</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't created any meetings yet. Start by creating your first meeting room.</p>
              <Link href="/create-meetings">
                <Button size="lg">Create Your First Meeting</Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
