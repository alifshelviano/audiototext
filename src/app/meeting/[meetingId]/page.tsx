"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMeeting, addParticipantToMeeting } from "@/app/meetings";
import { DashboardLayout } from "@/components/app/dashboard-layout";
import { MeetingHeader } from "@/components/app/meeting/meeting-header";
import { TabNavigation } from "@/components/app/meeting/tab-navigation";
import { TranscriptList } from "@/components/app/meeting/transcript-list";
import { SummaryTab } from "@/components/app/meeting/summary-tab";
import { InsightsTab } from "@/components/app/meeting/insights-tab";
import { SentimentTab } from "@/components/app/meeting/sentiment-tab";
import { MeetingChat } from "@/components/app/meeting/meeting-chat";
import type { MeetingData } from "@/models/Meeting";

export default function MeetingPage() {
  const pathname = usePathname();
  const meetingId = pathname ? (pathname.split("/").pop() as string) : "";
  const { data: session } = useSession();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "success" | "error">("idle");
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary" | "insights" | "sentiment" | "chat">("transcript");

  const fetchMeetingData = () => {
    if (meetingId) {
      setLoading(true);
      getMeeting({ meetingId })
        .then(setMeeting)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  useEffect(() => {
    if (meetingId && session?.user?.email && session?.user?.name) {
      addParticipantToMeeting({
        meetingId,
        participant: {
          name: session.user.name,
          email: session.user.email,
        },
      });
    }
  }, [meetingId, session]);

  const handleTabChange = (tab: "transcript" | "summary" | "insights" | "sentiment" | "chat") => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (!meeting) return null;

    switch (activeTab) {
      case "transcript":
        return <TranscriptList transcripts={meeting.transcripts || []} visibleCount={100} onLoadMore={() => {}} onShowLess={() => {}} />;
      case "summary":
        return <SummaryTab meeting={meeting} isAnalyzing={analysisStatus === "analyzing"} onReanalyze={() => {}} />;
      case "insights":
        return <InsightsTab meeting={meeting} />;
      case "sentiment":
        return <SentimentTab meeting={meeting} meetingId={meetingId} isAnalyzing={analysisStatus === "analyzing"} onReanalyze={() => {}} onDataRefresh={fetchMeetingData} />;
      case "chat":
        return <MeetingChat meetingId={meetingId} transcript={meeting.transcripts?.map((t) => t.transcript).join("\n") || ""} summary={meeting.summary?.summary_text || ""} />;
      default:
        return null;
    }
  };

  let content;
  if (loading) {
    content = <div>Loading...</div>;
  } else if (!meeting) {
    content = <div>Meeting not found.</div>;
  } else {
    content = (
      <>
        <MeetingHeader meeting={meeting} analysisStatus={analysisStatus} lastAnalysisTime={lastAnalysisTime} />
        <div className="mt-6 bg-white rounded-lg shadow-md">
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </>
    );
  }

  return <DashboardLayout>{content}</DashboardLayout>;
}
