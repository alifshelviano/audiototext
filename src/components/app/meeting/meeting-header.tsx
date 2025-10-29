"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import type { MeetingData } from "@/models/Meeting";
import { ShareMeetingDialog } from "./share-meeting-dialog";

interface MeetingHeaderProps {
  meeting: MeetingData;
  analysisStatus: "idle" | "analyzing" | "success" | "error";
  lastAnalysisTime: Date | null;
}

export function MeetingHeader({ meeting, analysisStatus, lastAnalysisTime }: MeetingHeaderProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const participantsRef = useRef<HTMLDivElement>(null);
  const uniqueParticipants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || [])) as string[];

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
  }, [participantsRef]);

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case "analyzing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Analyzing...
          </Badge>
        );
      case "success":
        return lastAnalysisTime ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Analyzed {lastAnalysisTime.toLocaleTimeString()}
          </Badge>
        ) : null;
      case "error":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Analysis Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{meeting.name}</h1>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <ShareMeetingDialog meetingId={meeting.id} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 font-medium">{new Date(meeting.time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 font-medium">{new Date(meeting.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 font-medium">{meeting.transcripts?.length || 0} messages</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors relative" ref={participantsRef}>
                <div onClick={() => setShowParticipants(!showParticipants)} className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700 font-medium">{uniqueParticipants.length} participants</span>
                </div>

                {showParticipants && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {uniqueParticipants.map((participant, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-semibold">{participant.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{participant}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
