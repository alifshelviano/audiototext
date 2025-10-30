"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { MeetingHeader } from "@/components/app/meeting/meeting-header";
import { TabNavigation } from "@/components/app/meeting/tab-navigation";
import { TranscriptList } from "@/components/app/meeting/transcript-list";
import { SummaryTab } from "@/components/app/meeting/summary-tab";
import { InsightsTab } from "@/components/app/meeting/insights-tab";
import { SentimentTab } from "@/components/app/meeting/sentiment-tab";
import { MeetingChat } from "@/components/app/meeting/meeting-chat";
import { FloatingRecordingControls } from "@/components/app/meeting/floating-recording-controls";
import { useMeetingData } from "@/hooks/use-meeting-data";
import type { MeetingData } from "@/models/Meeting";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the specific tab types for type safety
type Tab = "transcript" | "summary" | "insights" | "sentiment" | "chat";

// Custom hook to check if the screen is desktop size
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 1024);
    if (typeof window !== 'undefined') {
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);
  return isDesktop;
};

export default function JoinMeetingPage() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [isOpen, setIsOpen] = useState(false);

  const meetingId = isClient ? pathname.split("/").slice(-2, -1)[0] : null;
  const { meeting, loading, analysisStatus, lastAnalysisTime, isAnalyzing, fetchMeetingData, handleAutoAnalyze } = useMeetingData(meetingId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

  const renderContent = () => {
    if (!isClient || loading) {
      return <LoadingState />;
    }
    if (!meeting || !meetingId) {
      return <MeetingNotFound />;
    }
    return <MeetingContent meeting={meeting} meetingId={meetingId} isAnalyzing={isAnalyzing} analysisStatus={analysisStatus} lastAnalysisTime={lastAnalysisTime} onDataRefresh={fetchMeetingData} onAutoAnalyze={handleAutoAnalyze} />;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar isOpen={isOpen} isDesktop={isDesktop} toggleSidebar={() => setIsOpen(!isOpen)} />
      <div className={cn("relative flex flex-col flex-1 w-full min-h-screen transition-all duration-300 ease-in-out", isOpen && isDesktop ? "lg:ml-64" : "ml-0")}>
        <Header toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Child components for rendering different states
function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading meeting...</p>
      </div>
    </div>
  );
}

function MeetingNotFound() {
  const router = useRouter();
  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting not found</h1>
        <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => router.push("/")} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
          Return Home
        </button>
      </div>
    </div>
  );
}

function MeetingContent({ meeting, meetingId, isAnalyzing, analysisStatus, lastAnalysisTime, onDataRefresh, onAutoAnalyze }: any) {
  const [activeTab, setActiveTab] = useState<Tab>("transcript");

  return (
    <div className="max-w-7xl mx-auto">
      <MeetingHeader meeting={meeting} analysisStatus={analysisStatus} lastAnalysisTime={lastAnalysisTime} />
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <TabContent activeTab={activeTab} meeting={meeting} meetingId={meetingId} isAnalyzing={isAnalyzing} onReanalyze={onAutoAnalyze} onDataRefresh={onDataRefresh} />
      </div>
      {activeTab === "transcript" && <FloatingRecordingControls meetingId={meetingId} onTranscriptAdded={onDataRefresh} />}
    </div>
  );
}

function TabContent({ activeTab, meeting, meetingId, isAnalyzing, onReanalyze, onDataRefresh }: any) {
  const tabContentProps = { meeting, isAnalyzing, onReanalyze };
  return (
    <div className="flex flex-col">
      {activeTab === "transcript" && <TranscriptList transcripts={meeting.transcripts || []} visibleCount={100} onLoadMore={() => {}} onShowLess={() => {}} />}
      {activeTab === "summary" && <SummaryTab {...tabContentProps} />}
      {activeTab === "insights" && <InsightsTab meeting={meeting} />}
      {activeTab === "sentiment" && <SentimentTab meeting={meeting} meetingId={meetingId} isAnalyzing={isAnalyzing} onReanalyze={onReanalyze} onDataRefresh={onDataRefresh} />}
      {activeTab === "chat" && <MeetingChat meetingId={meetingId} transcript={meeting.transcripts?.map((t: any) => t.transcript).join("\n") || ""} summary={meeting.summary?.summary_text || ""} />}
    </div>
  );
}
