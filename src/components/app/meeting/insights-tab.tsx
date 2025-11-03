"use client";

import { BarChart, Zap, Heart, CheckCircle, CalendarIcon, TrendingUp, TrendingDown, Users, Handshake, Sparkles } from "lucide-react";
import type { MeetingData, Transcript } from "@/types/models/Meeting";

interface InsightsTabProps {
  meeting: MeetingData;
}

export function InsightsTab({ meeting }: InsightsTabProps) {
  const getStructuredSummary = () => {
    if (meeting?.summary?.meeting_summary) {
      return meeting.summary.meeting_summary;
    }

    const participants = Array.from(new Set(meeting?.transcripts?.map((t: Transcript) => t.name) || []));
    const meetingDate = new Date(meeting?.time || new Date());

    return {
      title: meeting?.name || "Untitled Meeting",
      date: meetingDate.toISOString().split("T")[0],
      time: `${meetingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WIB`,
      participants,
      key_points: ["Automatic analysis in progress..."],
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
      meeting_health_score: undefined,
      next_meeting: undefined,
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (label: string, score: number) => {
    if (label === "Engagement") return <Users className="w-4 h-4 text-blue-600" />;
    if (label === "Collaboration") return <Handshake className="w-4 h-4 text-indigo-600" />;
    if (label === "Productivity") return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (label === "Clarity") return <Sparkles className="w-4 h-4 text-emerald-600" />;
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (score < 40) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <span className="text-sm text-gray-500">–</span>;
  };

  //   if (score >= 80) return <TrendingUp className="w-5 h-5" />;
  //   if (score >= 40) return <span className="text-lg"></span>;
  //   return <TrendingDown className="w-5 h-5" />;
  // };

  const hasNextMeetingContent = (nextMeeting: any) => {
    if (!nextMeeting) return false;

    // Check if date exists and is not null/empty
    const hasDate = nextMeeting.date && nextMeeting.date !== null && nextMeeting.date !== "";

    // Check if agenda exists and has items
    const hasAgenda = nextMeeting.agenda && Array.isArray(nextMeeting.agenda) && nextMeeting.agenda.length > 0;

    return hasDate || hasAgenda;
  };

  const structuredSummary = getStructuredSummary();

  const renderInsightsContent = () => {
    if (!meeting?.summary) {
      return (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <BarChart className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No insights yet</h3>
          <p className="text-gray-500">Generate a meeting summary first to see insights</p>
        </div>
      );
    }

    return (
      <>
        {/* Meeting Health Score */}
        {structuredSummary.meeting_health_score && (
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-indigo-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-indigo-900">Meeting Health Score</h4>
            </div>

            {/* Overall Score */}
            <div className="bg-white/70 rounded-xl p-4 sm:p-6 mb-5 sm:mb-6 text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{structuredSummary.meeting_health_score.overall_score}</div>
              <p className="text-gray-600 text-sm sm:text-base font-medium">Overall Health Score</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
              {[
                { label: "Engagement", score: structuredSummary.meeting_health_score.engagement_score },
                { label: "Collaboration", score: structuredSummary.meeting_health_score.collaboration_score },
                { label: "Productivity", score: structuredSummary.meeting_health_score.productivity_score },
                { label: "Clarity", score: structuredSummary.meeting_health_score.clarity_score },
              ].map((metric, index) => (
                <div key={index} className={`${getScoreColor(metric.score)} rounded-xl p-3 sm:p-4`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="font-semibold text-xs sm:text-sm">{metric.label}</span>
                    {getScoreIcon(metric.label, metric.score)}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">{metric.score}</div>
                </div>
                // <div key={index} className={`${getScoreColor(metric.score)} rounded-xl p-3 sm:p-4`}>
                //   <div className="flex items-center justify-between mb-1 sm:mb-2">
                //     <span className="font-semibold text-xs sm:text-sm">{metric.label}</span>
                //     {getScoreIcon(metric.score)}
                //   </div>
                //   <div className="text-xl sm:text-2xl font-bold">{metric.score}</div>
                // </div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Strengths
                </h5>
                <ul className="space-y-1 text-sm text-green-700">
                  {structuredSummary.meeting_health_score.score_breakdown.strengths.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Areas to Improve
                </h5>
                <ul className="space-y-1 text-sm text-orange-700">
                  {structuredSummary.meeting_health_score.score_breakdown.weaknesses.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-6 overflow-y-auto">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Meeting Insights</h3>
      {renderInsightsContent()}
    </div>
  );
}
