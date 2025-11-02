"use client";

import { Heart, Users, Smile, Frown, Meh, Minus, AlertCircle } from "lucide-react";
import type { MeetingData } from "@/types/models/Meeting";

interface SentimentTabProps {
  meeting: MeetingData;
  meetingId: string;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onDataRefresh: () => void;
}

export function SentimentTab({ meeting }: SentimentTabProps) {
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

    return {
      emotion_analysis: {
        overall_sentiment: "neutral",
        overall_confidence: 0,
        participant_emotions: [],
        emotional_highlights: [],
        tension_points: [],
      },
    };
  };

  const getSentimentIcon = (sentiment: string | undefined) => {
    if (!sentiment) {
      return <Minus className="w-5 h-5 text-gray-500" />;
    }

    switch (sentiment.toLowerCase()) {
      case "positive":
        return <Smile className="w-5 h-5 text-green-500" />;
      case "negative":
        return <Frown className="w-5 h-5 text-red-500" />;
      case "mixed":
        return <Meh className="w-5 h-5 text-yellow-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) {
      return {
        text: "text-gray-600",
        bg: "bg-gray-100",
        border: "border-gray-200",
        gradient: "from-gray-50 to-gray-100/50",
      };
    }

    switch (sentiment.toLowerCase()) {
      case "positive":
        return {
          text: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          gradient: "from-green-50 to-emerald-50",
        };
      case "negative":
        return {
          text: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          gradient: "from-red-50 to-orange-50",
        };
      case "mixed":
        return {
          text: "text-yellow-700",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          gradient: "from-yellow-50 to-amber-50",
        };
      default:
        return {
          text: "text-gray-600",
          bg: "bg-gray-100",
          border: "border-gray-200",
          gradient: "from-gray-50 to-gray-100/50",
        };
    }
  };

  const getEmotionalToneColor = (tone: string | undefined) => {
    if (!tone) {
      return "text-gray-600";
    }

    const toneLower = tone.toLowerCase();

    if (toneLower.includes("happy") || toneLower.includes("excited") || toneLower.includes("enthusiastic") || toneLower.includes("joyful")) {
      return "text-green-600";
    } else if (toneLower.includes("angry") || toneLower.includes("frustrated") || toneLower.includes("annoyed") || toneLower.includes("irritated")) {
      return "text-red-600";
    } else if (toneLower.includes("sad") || toneLower.includes("disappointed") || toneLower.includes("upset") || toneLower.includes("unhappy")) {
      return "text-blue-600";
    } else if (toneLower.includes("confused") || toneLower.includes("uncertain") || toneLower.includes("unsure") || toneLower.includes("mixed")) {
      return "text-yellow-600";
    } else if (toneLower.includes("neutral") || toneLower.includes("calm") || toneLower.includes("balanced")) {
      return "text-gray-600";
    } else if (toneLower.includes("surprised") || toneLower.includes("shocked") || toneLower.includes("amazed")) {
      return "text-purple-600";
    } else if (toneLower.includes("anxious") || toneLower.includes("nervous") || toneLower.includes("worried")) {
      return "text-orange-600";
    } else {
      return "text-gray-600";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-blue-600";
    if (confidence >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const structuredSummary = getStructuredSummary();
  const emotionAnalysis = structuredSummary.emotion_analysis;

  const renderSentimentContent = () => {
    if (!meeting?.summary || !emotionAnalysis || !emotionAnalysis.overall_sentiment) {
      return (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No sentiment analysis yet</h3>
          <p className="text-gray-500">Generate a meeting summary to see emotional insights</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overall Sentiment */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-6 border border-pink-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-pink-900">Overall Meeting Sentiment</h4>
          </div>

          <div className="bg-white/70 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              {getSentimentIcon(emotionAnalysis.overall_sentiment)}
              <div>
                <div className={`text-3xl font-bold capitalize ${getSentimentColor(emotionAnalysis.overall_sentiment).text}`}>{emotionAnalysis.overall_sentiment}</div>
                <div className="text-sm text-gray-600">{Math.round(emotionAnalysis.overall_confidence * 100)}% confidence</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  emotionAnalysis.overall_sentiment === "positive" ? "bg-green-500" : emotionAnalysis.overall_sentiment === "negative" ? "bg-red-500" : emotionAnalysis.overall_sentiment === "mixed" ? "bg-yellow-500" : "bg-gray-500"
                }`}
                style={{ width: `${emotionAnalysis.overall_confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Participant Emotions */}
        {emotionAnalysis.participant_emotions && emotionAnalysis.participant_emotions.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Participant Emotions</h4>
            </div>

            <div className="space-y-4">
              {emotionAnalysis.participant_emotions.map((participant: any, index: number) => {
                const sentimentColor = getSentimentColor(participant.sentiment);
                const toneColor = getEmotionalToneColor(participant.emotionalTone);
                const confidenceColor = getConfidenceColor(participant.confidence || 0);

                return (
                  <div key={index} className={`bg-gradient-to-r ${sentimentColor.gradient} rounded-xl p-5 border ${sentimentColor.border}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white text-sm font-bold">{(participant.participant || "Unknown").charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{participant.participant || "Unknown"}</h5>
                          <p className="text-xs text-gray-500">{participant.statements || 0} statements</p>
                        </div>
                      </div>
                      {getSentimentIcon(participant.sentiment)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-white/80 rounded-lg p-3">
                        <span className="text-gray-600 text-xs block mb-1">Sentiment</span>
                        <span className={`font-semibold capitalize ${sentimentColor.text}`}>{participant.sentiment || "neutral"}</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3">
                        <span className="text-gray-600 text-xs block mb-1">Tone</span>
                        <span className={`font-semibold capitalize ${toneColor}`}>{participant.emotionalTone || "neutral"}</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-3">
                        <span className="text-gray-600 text-xs block mb-1">AI Accuracy</span>
                        <span className={`font-semibold ${confidenceColor}`}>{Math.round((participant.confidence || 0) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Emotional Highlights */}
        {emotionAnalysis.emotional_highlights && emotionAnalysis.emotional_highlights.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Smile className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-green-900">Emotional Highlights</h4>
            </div>
            <ul className="space-y-3">
              {emotionAnalysis.emotional_highlights.map((highlight: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-green-800 bg-white/60 p-4 rounded-xl">
                  <span className="text-green-600 text-xl mt-0.5">✨</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tension Points */}
        {emotionAnalysis.tension_points && emotionAnalysis.tension_points.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-red-900">Tension Points</h4>
            </div>
            <ul className="space-y-3">
              {emotionAnalysis.tension_points.map((tension: string, index: number) => (
                <li key={index} className="flex items-start gap-3 text-red-800 bg-white/60 p-4 rounded-xl">
                  <span className="text-red-600 text-xl mt-0.5">⚠️</span>
                  <span>{tension}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 overflow-y-auto">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">Sentiment Analysis</h3>
      {renderSentimentContent()}
    </div>
  );
}
