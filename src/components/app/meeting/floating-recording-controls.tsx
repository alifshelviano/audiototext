// components/app/meeting/floating-recording-controls.tsx
"use client";

import { RecordingControls } from "@/components/app/recording-controls";

interface FloatingRecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
}

export function FloatingRecordingControls({ meetingId, onTranscriptAdded }: FloatingRecordingControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all">
        <RecordingControls meetingId={meetingId} onTranscriptAdded={onTranscriptAdded} compact={true} />
      </div>
    </div>
  );
}
