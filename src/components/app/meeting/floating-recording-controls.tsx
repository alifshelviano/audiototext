// components/app/meeting/floating-recording-controls.tsx
"use client";

import { RecordingControls } from "@/components/app/recording/recording-controls";
import { useState } from "react";

interface FloatingRecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
}

export function FloatingRecordingControls({ meetingId, onTranscriptAdded }: FloatingRecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleTranscriptAdded = () => {
    if (onTranscriptAdded) {
      onTranscriptAdded();
    }
  };

  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  return (
    <>
      {/* Mobile: Show full labels when recording, minimal when not */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <div
          className={`
          ${isRecording ? "rounded-2xl border-2 border-blue-200 shadow-2xl min-w-[280px]" : "rounded-full border-2 border-blue-200 shadow-2xl"} bg-white transition-all duration-300
        `}
        >
          <RecordingControls
            meetingId={meetingId}
            onTranscriptAdded={handleTranscriptAdded}
            compact={true}
            showLabels={isRecording} // Show labels only when recording
            onRecordingStateChange={handleRecordingStateChange}
          />
        </div>
      </div>

      {/* Desktop: Always show full compact version */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all">
          <RecordingControls meetingId={meetingId} onTranscriptAdded={onTranscriptAdded} compact={true} showLabels={true} />
        </div>
      </div>
    </>
  );
}
