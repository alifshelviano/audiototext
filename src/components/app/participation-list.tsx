"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getMeeting } from "@/app/meetings";

interface ParticipantListProps {
  meetingId: string;
}

export function ParticipantList({ meetingId }: ParticipantListProps) {
  const [participants, setParticipants] = useState<string[]>([]);

  const fetchParticipants = async () => {
    try {
      const meetingData = await getMeeting({ meetingId });
      if (meetingData && meetingData.transcripts) {
        // Get unique participant names from transcripts
        const uniqueParticipants = Array.from(new Set(meetingData.transcripts.map((transcript: any) => transcript.name))) as string[];
        setParticipants(uniqueParticipants);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      setParticipants([]);
    }
  };

  useEffect(() => {
    fetchParticipants();
    const intervalId = setInterval(fetchParticipants, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [meetingId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Participants</h3>
        <span className="bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">{participants.length}</span>
      </div>
      <div className="space-y-3">
        {participants.map((name, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-gray-700 font-medium">{name}</span>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2">
              <Users className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
