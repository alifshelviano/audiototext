'use client';

import { useRef, useState } from 'react';
import { TranscriptList } from '@/components/app/meeting/transcript-list';
import type { MeetingData } from '@/types/meeting';

interface TranscriptTabProps {
  meeting: MeetingData;
  meetingId: string;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onDataRefresh: () => void;
}

export function TranscriptTab({ meeting, onDataRefresh }: TranscriptTabProps) {
  const [visibleTranscripts, setVisibleTranscripts] = useState(10);
  const transcriptsContainerRef = useRef<HTMLDivElement>(null);

  const loadMoreTranscripts = () => {
    setVisibleTranscripts(prev => prev + 10);
  };

  const showLessTranscripts = () => {
    setVisibleTranscripts(10);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <div 
        ref={transcriptsContainerRef}
        className="flex-1 p-6 space-y-2 overflow-y-auto"
      >
        <TranscriptList 
          transcripts={meeting.transcripts || []}
          visibleCount={visibleTranscripts}
          onLoadMore={loadMoreTranscripts}
          onShowLess={showLessTranscripts}
        />
      </div>
    </div>
  );
}