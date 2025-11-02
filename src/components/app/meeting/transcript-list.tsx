"use client";

import { ChevronUp, ChevronDown, Mic } from "lucide-react";
import type { Transcript } from "@/types/models/Meeting";

interface TranscriptListProps {
  transcripts: Transcript[];
  visibleCount: number;
  onLoadMore: () => void;
  onShowLess: () => void;
}

export function TranscriptList({ transcripts, visibleCount, onLoadMore, onShowLess }: TranscriptListProps) {
  if (!transcripts?.length) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-300 mb-4">
          <Mic className="w-20 h-20 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-500 mb-2">No transcripts yet</h3>
        <p className="text-gray-400">Click the recording button to start capturing the conversation</p>
      </div>
    );
  }

  // Calculate which transcripts to show
  // We want to show the most recent transcripts first
  const totalTranscripts = transcripts.length;
  const startIndex = Math.max(0, totalTranscripts - visibleCount);
  const displayedTranscripts = transcripts.slice(startIndex);

  const canLoadMore = visibleCount < totalTranscripts;
  const canShowLess = visibleCount > 10;

  console.log("Transcripts debug:", {
    total: totalTranscripts,
    visibleCount,
    startIndex,
    displayed: displayedTranscripts.length,
    canLoadMore,
    canShowLess,
  });

  return (
    <div className="p-6">
      {canLoadMore && (
        <div className="text-center mb-4">
          <button onClick={onLoadMore} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
            <ChevronUp className="w-4 h-4" />
            Load {totalTranscripts - visibleCount} older messages
          </button>
        </div>
      )}

      <div className="space-y-4">
        {displayedTranscripts.map((transcript, index) => (
          <div key={`${transcript.createdAt}-${index}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
            <div className="flex-shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
                <span className="text-white text-sm font-bold">{transcript.name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900">{transcript.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                  {new Date(transcript.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-[15px]">{transcript.transcript}</p>
            </div>
          </div>
        ))}
      </div>

      {canShowLess && (
        <div className="text-center pt-4">
          <button onClick={onShowLess} className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
            <ChevronDown className="w-4 h-4" />
            Show less
          </button>
        </div>
      )}
    </div>
  );
}
