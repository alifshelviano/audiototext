// // components/app/meeting/floating-recording-controls.tsx
// "use client";

// import { RecordingControls } from "@/components/app/recording/recording-controls";
// import { useState, useEffect } from "react";

// interface FloatingRecordingControlsProps {
//   meetingId: string;
//   onTranscriptAdded?: () => void;
// }

// export function FloatingRecordingControls({ meetingId, onTranscriptAdded }: FloatingRecordingControlsProps) {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener("resize", checkMobile);

//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const handleTranscriptAdded = () => {
//     if (onTranscriptAdded) {
//       onTranscriptAdded();
//     }
//   };

//   return (
//     <>
//       {/* Mobile: Adaptive design */}
//       <div className="fixed bottom-4 right-4 z-50 md:hidden">
//         <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm bg-white/95">
//           <RecordingControls
//             meetingId={meetingId}
//             onTranscriptAdded={handleTranscriptAdded}
//             compact={true}
//             showLabels={isMobile ? false : true} // Minimal labels on mobile
//           />
//         </div>
//       </div>

//       {/* Desktop: Always show full compact version */}
//       <div className="fixed bottom-6 right-6 z-50 hidden md:block">
//         <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-sm bg-white/95">
//           <RecordingControls meetingId={meetingId} onTranscriptAdded={onTranscriptAdded} compact={true} showLabels={true} />
//         </div>
//       </div>
//     </>
//   );
// }

// components/app/meeting/floating-recording-controls.tsx
"use client";

import { RecordingControls } from "@/components/app/recording/recording-controls";
import { useState, useEffect } from "react";

interface FloatingRecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
}

export function FloatingRecordingControls({ meetingId, onTranscriptAdded }: FloatingRecordingControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener with debounce to prevent excessive re-renders
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTranscriptAdded = () => {
    if (onTranscriptAdded) {
      onTranscriptAdded();
    }
  };

  return (
    <>
      {/* Mobile: Minimal version with icon-only buttons */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm bg-white/95 max-w-[90vw]">
          <RecordingControls
            meetingId={meetingId}
            onTranscriptAdded={handleTranscriptAdded}
            compact={true}
            showLabels={!isMobile} // Hide labels on very small screens
          />
        </div>
      </div>

      {/* Desktop: Full compact version with labels */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm bg-white/95 max-w-md">
          <RecordingControls meetingId={meetingId} onTranscriptAdded={onTranscriptAdded} compact={true} showLabels={true} />
        </div>
      </div>
    </>
  );
}
