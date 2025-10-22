'use client';

import {useEffect, useState} from 'react';
import {getMeetingParticipants} from '@/app/meetings';

interface ParticipantListProps {
  meetingId: string;
}

export function ParticipantList({meetingId}: ParticipantListProps) {
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const {participants} = await getMeetingParticipants({meetingId});
      setParticipants(participants);
    };

    const intervalId = setInterval(fetchParticipants, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [meetingId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Participants ({participants.length})</h3>
      <ul className="space-y-2">
        {participants.map((name, index) => (
          <li key={index} className="text-gray-700">{name}</li>
        ))}
      </ul>
    </div>
  );
}
