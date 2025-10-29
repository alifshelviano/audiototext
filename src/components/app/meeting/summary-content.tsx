"use client";

import { FileText, Zap, CheckCircle, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MeetingData } from "@/models/Meeting";

interface SummaryContentProps {
  meeting: MeetingData;
}

export function SummaryContent({ meeting }: SummaryContentProps) {
  const getStructuredSummary = () => {
    if (meeting?.summary?.meeting_summary) {
      const summary = meeting.summary.meeting_summary;
      if (summary.emotion_analysis) {
        summary.emotion_analysis = {
          overall_sentiment: summary.emotion_analysis.overall_sentiment || "neutral",
          overall_confidence: summary.emotion_analysis.overall_confidence || 0,
          participant_emotions:
            summary.emotion_analysis.participant_emotions?.map((participant: any) => ({
              participant: participant.participant || "Unknown",
              sentiment: participant.sentiment || "neutral",
              confidence: participant.confidence || 0,
              statements: participant.statements || 0,
              emotionalTone: participant.emotionalTone || "neutral",
            })) || [],
          emotional_highlights: summary.emotion_analysis.emotional_highlights || [],
          tension_points: summary.emotion_analysis.tension_points || [],
        };
      }
      return summary;
    }

    const participants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || []));
    const meetingDate = new Date(meeting?.time || new Date());

    return {
      title: meeting?.name || "Untitled Meeting",
      date: meetingDate.toISOString().split("T")[0],
      time: `${meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WIB`,
      participants,
      key_points: ["Automatic analysis in progress...", "Please wait for AI to process the transcripts"],
      insights_decisions: [],
      action_items: [],
      summary_insights: ["Analysis pending"],
      emotion_analysis: {
        overall_sentiment: "neutral",
        overall_confidence: 0,
        participant_emotions: [],
        emotional_highlights: [],
        tension_points: [],
      },
    };
  };

  const structuredSummary = getStructuredSummary();

  if (!meeting?.summary) {
    return (
      <div className="text-center py-16">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No analysis yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {meeting?.transcripts?.length && meeting.transcripts.length > 0 ? "Generate AI-powered insights from your meeting transcripts" : "Add some transcripts first to generate analysis"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meeting Overview */}
      <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-blue-900">Meeting Overview</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/60 rounded-xl p-4">
            <span className="font-semibold text-blue-700 block mb-1">Title</span>
            <p className="text-blue-900">{structuredSummary.title}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <span className="font-semibold text-blue-700 block mb-1">Date & Time</span>
            <p className="text-blue-900">
              {structuredSummary.date} • {structuredSummary.time}
            </p>
          </div>
          <div className="col-span-2 bg-white/60 rounded-xl p-4">
            <span className="font-semibold text-blue-700 block mb-1">Participants</span>
            <p className="text-blue-900">{structuredSummary.participants.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Key Discussion Points</h4>
        </div>
        <ul className="space-y-3">
          {structuredSummary.key_points.map((point: string, index: number) => (
            <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
              <span className="pt-0.5">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Action Items</h4>
        </div>
        {structuredSummary.action_items && structuredSummary.action_items.length > 0 ? (
          <div className="space-y-3">
            {structuredSummary.action_items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-gray-100 hover:to-gray-200/50 transition-all border border-gray-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">{item.task}</p>
                  <p className="text-sm text-gray-600">
                    👤 {item.assigned_to} • 📅 {item.deadline}
                  </p>
                </div>
                <Badge
                  className={`ml-4 ${
                    item.status === "Completed" ? "bg-green-100 text-green-800" : item.status === "In Progress" ? "bg-blue-100 text-blue-800" : item.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No action items identified</p>
        )}
      </div>
    </div>
  );
}
