"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MessageSquare, Users, MapPin, FileText, Share2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import type { MeetingData } from "@/types/models/Meeting";
import { ShareMeetingDialog } from "./share-meeting-dialog";

interface MeetingHeaderProps {
  meeting: MeetingData;
  analysisStatus: "idle" | "analyzing" | "success" | "error";
  lastAnalysisTime: Date | null;
}

export function MeetingHeader({ meeting, analysisStatus, lastAnalysisTime }: MeetingHeaderProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInfoDropdown, setShowInfoDropdown] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const participantsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const uniqueParticipants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || [])) as string[];

  /* -------------------------------------------------- */
  useEffect(() => {
    setIsAnalyzing(analysisStatus === "analyzing");
  }, [analysisStatus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (participantsRef.current && !participantsRef.current.contains(e.target as Node)) {
        setShowParticipants(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowInfoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  /* -------------------------------------------------- */

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case "analyzing":
        return (
          <Badge className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="font-medium">Analyzing...</span>
            </div>
          </Badge>
        );
      case "success":
        return lastAnalysisTime ? (
          <Badge className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3" />
              <span className="font-medium">
                {lastAnalysisTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </Badge>
        ) : null;
      case "error":
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 px-2 py-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">Failed</span>
            </div>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span className="font-medium">Ready</span>
            </div>
          </Badge>
        );
    }
  };

  const getMeetingDuration = () => {
    if (!meeting.transcripts?.length) return "0 min";
    const ts = meeting.transcripts.map((t) => new Date(t.createdAt).getTime()).filter((t) => !isNaN(t));
    if (ts.length < 2) return "Live";
    const diff = Math.round((Math.max(...ts) - Math.min(...ts)) / (1000 * 60));
    return diff > 0 ? `${diff} min` : "Live";
  };

  const getSpeakingDistribution = () => {
    if (!meeting.transcripts?.length) return null;
    const counts: Record<string, number> = {};
    meeting.transcripts.forEach((t) => {
      counts[t.name] = (counts[t.name] || 0) + 1;
    });
    const top = Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b));
    return {
      topSpeaker: top[0],
      messageCount: top[1],
      totalMessages: meeting.transcripts.length,
    };
  };
  const speakingStats = getSpeakingDistribution();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* -------------------------------------------------- */
  /*  CARD COMPONENT – dipakai di desktop & di dropdown */
  const InfoCard = ({ icon: Icon, label, value, sub, onClick, className = "" }: { icon: any; label: string; value: React.ReactNode; sub?: React.ReactNode; onClick?: () => void; className?: string }) => (
    <div className={`bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-cyan-100/50 ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-cyan-50 rounded-lg">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
  /* -------------------------------------------------- */

  return (
    <>
      <div className="bg-gradient-to-br from-white to-cyan-50/20 rounded-2xl sm:rounded-3xl shadow-lg border border-cyan-100 p-4 sm:p-6 lg:p-8 mb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-cyan-100 rounded-lg sm:rounded-xl">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-700 bg-clip-text text-transparent truncate">{meeting.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              {getStatusBadge()}
              {meeting.language && <span className="px-2 py-1 bg-gray-100 rounded capitalize font-medium">{meeting.language}</span>}
              <div className="hidden sm:block ml-auto">
                <ShareMeetingDialog meetingId={meeting.id} />
              </div>
            </div>
          </div>

          <div className="sm:hidden">
            <ShareMeetingDialog meetingId={meeting.id} />
          </div>
        </div>

        {/* ----------  DESKTOP: 4 cards  ---------- */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <InfoCard icon={Calendar} label="Date" value={formatDate(meeting.time)} />
          <InfoCard icon={Clock} label="Time" value={formatTime(meeting.time)} />
          <InfoCard icon={MessageSquare} label="Messages" value={meeting.transcripts?.length || 0} sub={speakingStats && `Top: ${speakingStats.topSpeaker}`} />
          <InfoCard icon={Users} label="Participants" value={uniqueParticipants.length} onClick={() => setShowParticipants(true)} />
        </div>

        {/* ----------  MOBILE: Dropdown  ---------- */}
        <div className="md:hidden relative mb-5" ref={dropdownRef}>
          <button onClick={() => setShowInfoDropdown((v) => !v)} className="w-full bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-cyan-100/50 flex items-center justify-between hover:bg-white/90 transition-all" aria-label="Toggle meeting info">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Calendar className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Meeting Info</p>
                <p className="text-xs text-gray-500">
                  {formatDate(meeting.time)} • {formatTime(meeting.time)}
                </p>
              </div>
            </div>
            {showInfoDropdown ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showInfoDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 space-y-4">
                <InfoCard icon={Calendar} label="Date" value={formatDate(meeting.time)} className="p-0 bg-transparent border-0 shadow-none" />
                <InfoCard icon={Clock} label="Time" value={formatTime(meeting.time)} className="p-0 bg-transparent border-0 shadow-none" />
                <InfoCard icon={MessageSquare} label="Messages" value={meeting.transcripts?.length || 0} sub={speakingStats && `Top: ${speakingStats.topSpeaker}`} className="p-0 bg-transparent border-0 shadow-none" />
                <div
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setShowParticipants(true);
                    setShowInfoDropdown(false);
                  }}
                >
                  <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Participants</p>
                    <p className="font-medium text-gray-900">{uniqueParticipants.length} people</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="flex flex-col sm:flex-row gap-3 text-xs sm:text-sm">
          {speakingStats && (
            <div className="flex items-center gap-2 bg-cyan-50/70 px-3 py-2 rounded-xl border border-cyan-100">
              <FileText className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-gray-700">
                <span className="font-semibold text-cyan-600">{speakingStats.topSpeaker}</span> most active ({Math.round((speakingStats.messageCount / speakingStats.totalMessages) * 100)}
                %)
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-green-50/70 px-3 py-2 rounded-xl border border-green-100">
            <Clock className="w-3.5 h-3.5 text-green-600" />
            <span className="text-gray-700">
              Duration: <span className="font-semibold text-green-600">{getMeetingDuration()}</span>
            </span>
          </div>
          {meeting.isPublic !== undefined && (
            <div className="flex items-center gap-2 bg-cyan-50/70 px-3 py-2 rounded-xl border border-cyan-100">
              <Users className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-semibold text-cyan-600">{meeting.isPublic ? "Public" : "Private"} Meeting</span>
            </div>
          )}
        </div>
      </div>

      {/* Participants Modal (sama seperti sebelumnya) */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowParticipants(false)}>
          <div ref={participantsRef} className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-orange-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg sm:rounded-xl">
                    <Users className="w-5 h-5 text-black-600" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">Participants</h4>
                    <p className="text-xs sm:text-sm text-gray-600">All meeting members</p>
                  </div>
                </div>
                <button onClick={() => setShowParticipants(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" aria-label="Close participants modal">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <Badge className="bg-white text-cyan-700 border border-cyan-200 text-xs sm:text-sm">{uniqueParticipants.length} participants</Badge>
            </div>

            {/* List */}
            <div className="p-4 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
              {uniqueParticipants.map((name, i) => {
                const count = meeting.transcripts?.filter((t) => t.name === name).length || 0;
                const isTop = speakingStats?.topSpeaker === name;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-gray-100">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">{name[0].toUpperCase()}</span>
                      </div>
                      {isTop && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-white text-xs">Star</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{name}</p>
                      {isTop ? <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Most Active</span> : <span className="text-xs text-gray-500">Participant</span>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cyan-600 text-sm">{count}</div>
                      <div className="text-xs text-gray-500">msgs</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl h-11" onClick={() => setShowParticipants(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
