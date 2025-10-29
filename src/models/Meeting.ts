import { ObjectId } from "mongodb";

export interface Transcript {
  name: string;
  transcript: string;
  createdAt: Date;
}

export interface MeetingData {
  id: string;
  name: string;
  time: string;
  transcripts: Transcript[];
  summary?: {
    summary_text?: string;
    meeting_summary?: MeetingSummary["meeting_summary"];
  };
  lastAnalyzed?: Date;
}

export interface EmotionAnalysis {
  overall_sentiment: string;
  overall_confidence: number;
  participant_emotions: {
    participant: string;
    sentiment: string;
    confidence: number;
    statements: number;
    emotionalTone: string;
  }[];
  emotional_highlights: string[];
  tension_points: string[];
}

export interface MeetingHealthScore {
  overall_score: number;
  engagement_score: number;
  productivity_score: number;
  collaboration_score: number;
  clarity_score: number;
  score_breakdown: {
    strengths: string[];
    weaknesses: string[];
    red_flags: string[];
  };
  recommendations: string[];
}

export interface MeetingSummary {
  meeting_summary: {
    title: string;
    date: string;
    time: string;
    participants: string[];
    key_points: string[];
    insights_decisions: string[];
    action_items: {
      task: string;
      assigned_to: string;
      deadline: string;
      status: "Not Started" | "In Progress" | "Completed" | "Pending";
    }[];
    next_meeting?: {
      date: string;
      agenda: string[];
    };
    summary_insights: string[];
    important_metrics?: any[];
    unresolved_questions?: any[];
    technical_details?: any[];
    emotion_analysis?: EmotionAnalysis;
    meeting_health_score?: MeetingHealthScore;
  };
}
