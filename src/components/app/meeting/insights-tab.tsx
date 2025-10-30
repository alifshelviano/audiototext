"use client";

import { BarChart, Zap, Heart, CheckCircle, CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import type { MeetingData, Transcript } from "@/models/Meeting";

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

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5" />;
    if (score >= 40) return <span className="text-lg">➖</span>;
    return <TrendingDown className="w-5 h-5" />;
  };

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
      <div className="space-y-6">
        {/* Meeting Health Score */}
        {structuredSummary.meeting_health_score && (
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-indigo-900">Meeting Health Score</h4>
            </div>

            {/* Overall Score */}
            <div className="bg-white/70 rounded-xl p-6 mb-6 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{structuredSummary.meeting_health_score.overall_score}</div>
              <p className="text-gray-600 font-medium">Overall Health Score</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Engagement", score: structuredSummary.meeting_health_score.engagement_score },
                { label: "Productivity", score: structuredSummary.meeting_health_score.productivity_score },
                { label: "Collaboration", score: structuredSummary.meeting_health_score.collaboration_score },
                { label: "Clarity", score: structuredSummary.meeting_health_score.clarity_score },
              ].map((metric, index) => (
                <div key={index} className={`${getScoreColor(metric.score)} rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{metric.label}</span>
                    {getScoreIcon(metric.score)}
                  </div>
                  <div className="text-2xl font-bold">{metric.score}</div>
                </div>
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

        {/* Insights & Decisions */}
        {structuredSummary.insights_decisions && structuredSummary.insights_decisions.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-green-900">Insights & Decisions</h4>
            </div>
            <ul className="space-y-3">
              {structuredSummary.insights_decisions.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-green-800 bg-white/60 p-4 rounded-xl">
                  <span className="text-green-600 text-xl mt-0.5">💡</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Insights */}
        {structuredSummary.summary_insights && structuredSummary.summary_insights.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <BarChart className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-purple-900">Summary Insights</h4>
            </div>
            <ul className="space-y-3">
              {structuredSummary.summary_insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-purple-800 bg-white/60 p-4 rounded-xl">
                  <span className="text-purple-600 text-xl mt-0.5">📊</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Meeting - Only show if there's actual content */}
        {structuredSummary.next_meeting && hasNextMeetingContent(structuredSummary.next_meeting) && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-orange-900">Next Meeting</h4>
            </div>
            <div className="space-y-3">
              {/* Only show date if it exists */}
              {structuredSummary.next_meeting.date && structuredSummary.next_meeting.date !== null && (
                <p className="text-orange-800 bg-white/60 p-4 rounded-xl">
                  <span className="font-semibold">Date:</span> {structuredSummary.next_meeting.date}
                </p>
              )}

              {/* Only show agenda if it has items */}
              {structuredSummary.next_meeting.agenda && Array.isArray(structuredSummary.next_meeting.agenda) && structuredSummary.next_meeting.agenda.length > 0 && (
                <div className="bg-white/60 p-4 rounded-xl">
                  <span className="font-semibold text-orange-800 block mb-2">Agenda:</span>
                  <ul className="space-y-2">
                    {structuredSummary.next_meeting.agenda.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-orange-700">
                        <span className="text-orange-500 mt-1">📌</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 overflow-y-auto">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Meeting Insights</h3>
      {renderInsightsContent()}
    </div>
  );
}
