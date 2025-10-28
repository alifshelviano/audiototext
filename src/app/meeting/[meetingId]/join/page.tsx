'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMeeting } from '@/app/meetings';
import { analyzeMeeting, shouldAutoAnalyze } from '@/lib/meeting-analysis';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { MeetingHeader } from '@/components/app/meeting/meeting-header';
import { TabNavigation } from '@/components/app/meeting/tab-navigation';
import { TranscriptList } from '@/components/app/meeting/transcript-list';
import { SummaryTab } from '@/components/app/meeting/summary-tab';
import { InsightsTab } from '@/components/app/meeting/insights-tab';
import { SentimentTab } from '@/components/app/meeting/sentiment-tab';
import { MeetingChat } from '@/components/app/meeting/meeting-chat';
import { FloatingRecordingControls } from '@/components/app/meeting/floating-recording-controls';
import { useMeetingData } from '@/hooks/use-meeting-data';
import type { MeetingData } from '@/types/meeting';
import { AlertCircle } from 'lucide-react';

export default function JoinMeetingPage() {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'insights' | 'sentiment' | 'chat'>('transcript');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const meetingId = isClient ? pathname.split('/').slice(-2, -1)[0] : null;
  
  const {
    meeting,
    loading,
    analysisStatus,
    lastAnalysisTime,
    isAnalyzing,
    fetchMeetingData,
    handleAutoAnalyze
  } = useMeetingData(meetingId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return <LoadingState />;
  }

  if (!meeting || !meetingId) {
    return <MeetingNotFound router={router} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <MeetingHeader 
              meeting={meeting}
              analysisStatus={analysisStatus}
              lastAnalysisTime={lastAnalysisTime}
            />
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <TabNavigation 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
                
                <TabContent 
                  activeTab={activeTab}
                  meeting={meeting}
                  meetingId={meetingId}
                  isAnalyzing={isAnalyzing}
                  onReanalyze={handleAutoAnalyze}
                  onDataRefresh={fetchMeetingData}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Show recording controls only on transcript tab */}
      {activeTab === 'transcript' && meetingId && (
        <FloatingRecordingControls 
          meetingId={meetingId}
          onTranscriptAdded={fetchMeetingData}
        />
      )}
    </div>
  );
}

// Supporting components for the main page
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading meeting...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingNotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting not found</h1>
            <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist or has been deleted.</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabContent({ 
  activeTab, 
  meeting, 
  meetingId, 
  isAnalyzing, 
  onReanalyze,
  onDataRefresh 
}: { 
  activeTab: string;
  meeting: MeetingData;
  meetingId: string;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onDataRefresh: () => void;
}) {
  const tabContentProps = {
    meeting,
    isAnalyzing,
    onReanalyze
  };

  return (
    <div className="flex flex-col" >
      {activeTab === 'transcript' && <TranscriptList transcripts={meeting.transcripts || []} visibleCount={100} onLoadMore={() => {}} onShowLess={() => {}} />}
      {activeTab === 'summary' && <SummaryTab {...tabContentProps} />}
      {activeTab === 'insights' && <InsightsTab meeting={meeting} />}
      {activeTab === 'sentiment' && <SentimentTab meeting={meeting} meetingId={meetingId} isAnalyzing={isAnalyzing} onReanalyze={onReanalyze} onDataRefresh={onDataRefresh} />}
      {activeTab === 'chat' && <MeetingChat meetingId={meetingId} transcript={meeting.transcripts?.map(t => t.transcript).join('\n') || ''} summary={meeting.summary?.summary_text || ''} />}
    </div>
  );
}