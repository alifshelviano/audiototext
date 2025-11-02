"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MessageSquare, Users, MapPin, FileText, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, ChevronDown, Sparkles } from "lucide-react";
import type { MeetingData } from "@/types/models/Meeting";
import { ShareMeetingDialog } from "./share-meeting-dialog";

interface MeetingHeaderProps {
  meeting: MeetingData;
  analysisStatus: "idle" | "analyzing" | "success" | "error";
  lastAnalysisTime: Date | null;
}

export function MeetingHeader({ meeting, analysisStatus, lastAnalysisTime }: MeetingHeaderProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const participantsRef = useRef<HTMLDivElement>(null);
  const uniqueParticipants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || [])) as string[];

  // Animation effect for analyzing state
  useEffect(() => {
    if (analysisStatus === "analyzing") {
      setIsAnalyzing(true);
    } else {
      setIsAnalyzing(false);
    }
  }, [analysisStatus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (participantsRef.current && !participantsRef.current.contains(event.target as Node)) {
        setShowParticipants(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case "analyzing":
        return (
          <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="relative">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <div className="absolute inset-0 bg-cyan-50 animate-ping rounded-full opacity-75"></div>
              </div>
              <span className="font-medium">AI Analysis in Progress</span>
            </div>
          </Badge>
        );
      case "success":
        return lastAnalysisTime ? (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              <span className="font-medium">Analyzed • {lastAnalysisTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </Badge>
        ) : null;
      case "error":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">Analysis Failed</span>
            </div>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">Ready for Analysis</span>
            </div>
          </Badge>
        );
    }
  };

  const getMeetingDuration = () => {
    if (!meeting.transcripts?.length) return "0 min";
    const timestamps = meeting.transcripts.map((t) => new Date(t.createdAt).getTime()).filter((t) => !isNaN(t));

    if (timestamps.length < 2) return "0 min";

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const durationMinutes = Math.round((maxTime - minTime) / (1000 * 60));

    return durationMinutes > 0 ? `${durationMinutes} min` : "Live";
  };

  const getSpeakingDistribution = () => {
    if (!meeting.transcripts?.length) return null;

    const speakerCounts: Record<string, number> = {};
    meeting.transcripts.forEach((transcript) => {
      speakerCounts[transcript.name] = (speakerCounts[transcript.name] || 0) + 1;
    });

    const topSpeaker = Object.entries(speakerCounts).reduce((a, b) => (a[1] > b[1] ? a : b));

    return {
      topSpeaker: topSpeaker[0],
      messageCount: topSpeaker[1],
      totalMessages: meeting.transcripts.length,
    };
  };

  const speakingStats = getSpeakingDistribution();

  return (
    <div className="bg-gradient-to-br from-white to-cyan-50/30 rounded-3xl shadow-xl border border-cyan-100/50 p-8 mb-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/5 to-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-cyan-500/5 to-teal-500/10 rounded-full blur-3xl"></div>

      {/* Animated dots */}
      {isAnalyzing && (
        <div className="absolute top-4 right-4 flex space-x-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Main Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cyan-100 rounded-xl">
                <MapPin className="w-5 h-5 text-cyan-600" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-700 bg-clip-text text-transparent">{meeting.name}</h1>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <div className="text-sm text-gray-500 font-medium">{meeting.language && <span className="px-2 py-1 bg-gray-100 rounded-md capitalize">{meeting.language}</span>}</div>
              </div>

              <div className="flex items-center gap-2">
                <ShareMeetingDialog meetingId={meeting.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Date Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 rounded-xl">
                <Calendar className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(meeting.time).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(meeting.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 rounded-xl">
                <MessageSquare className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Messages</p>
                <p className="text-lg font-semibold text-gray-900">{meeting.transcripts?.length || 0}</p>
                {speakingStats && <p className="text-xs text-gray-400 mt-1">Top: {speakingStats.topSpeaker}</p>}
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-cyan-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => setShowParticipants(true)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-xl">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Participants</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">{uniqueParticipants.length}</p>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Participants Modal */}
          {showParticipants && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-orange-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-100 rounded-xl">
                      <Users className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Meeting Participants</h4>
                      <p className="text-sm text-gray-600">All participants in this meeting</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white text-cyan-700 border-cyan-200">
                    {uniqueParticipants.length} total participants
                  </Badge>
                </div>

                {/* Participants List */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {uniqueParticipants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 group">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                          <span className="text-white text-lg font-bold">{participant.charAt(0).toUpperCase()}</span>
                        </div>
                        {speakingStats?.topSpeaker === participant && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-white text-xs">⭐</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate">{participant}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {speakingStats?.topSpeaker === participant ? (
                            <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">🎯 Most Active</span>
                          ) : (
                            <span className="text-sm text-gray-500">Participant</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-600">{meeting.transcripts?.filter((t) => t.name === participant).length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Messages</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg font-semibold rounded-xl" onClick={() => setShowParticipants(false)}>
                    Close Participants
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Insights Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {speakingStats && (
            <div className="flex items-center gap-2 bg-cyan-50/50 px-4 py-2 rounded-xl border border-cyan-100">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span className="text-gray-700 font-medium">
                <span className="text-cyan-600 font-semibold">{speakingStats.topSpeaker}</span> was most active ({Math.round((speakingStats.messageCount / speakingStats.totalMessages) * 100)}%)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-green-50/50 px-4 py-2 rounded-xl border border-green-100">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-gray-700 font-medium">
              Duration: <span className="text-green-600 font-semibold">{getMeetingDuration()}</span>
            </span>
          </div>

          {meeting.isPublic !== undefined && (
            <div className="flex items-center gap-2 bg-cyan-50/50 px-4 py-2 rounded-xl border border-cyan-100">
              <Users className="w-4 h-4 text-cyan-600" />
              <span className="text-gray-700 font-medium">{meeting.isPublic ? <span className="text-cyan-600 font-semibold">Public Meeting</span> : <span className="text-cyan-600 font-semibold">Private Meeting</span>}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
