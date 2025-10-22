'use client';

import {useState, useEffect, useTransition} from 'react';
import {getMeeting, summarizeMeeting} from '@/app/meetings';
import {AudioInputForm} from '@/components/app/audio-input-form';
import {SummaryDisplay} from '@/components/app/summary-display';
import {Button} from '@/components/ui/button';
import {ParticipantList} from '@/components/app/participant-list';

interface Transcript {
  name: string;
  text: string;
}

export default function MeetingPage({params}: {params: {meetingId: string}}) {
  const {meetingId} = params;
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(async () => {
        const {transcripts} = await getMeeting({meetingId});
        setTranscripts(transcripts);
      });
    }, 5000); // Poll for updates every 5 seconds

    return () => clearInterval(interval);
  }, [meetingId]);

  const handleNewTranscript = (transcript: Transcript) => {
    setTranscripts(prevTranscripts => [...prevTranscripts, transcript]);
  };

  const handleSummarize = () => {
    startTransition(async () => {
      const {summary} = await summarizeMeeting({meetingId});
      setSummary(summary);
    });
  };

  const formattedTranscripts = transcripts
    .map(t => `${t.name}: ${t.text}`)
    .join('\n\n---\n\n');

  if (summary) {
    return <SummaryDisplay summary={summary} transcribedText={formattedTranscripts} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Meeting: {meetingId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Transcription</h2>
          <AudioInputForm onTranscriptReceived={handleNewTranscript} meetingId={meetingId} />
          <div className="p-4 bg-gray-100 rounded-lg h-96 overflow-y-auto mt-8">
            {transcripts.map((transcript, index) => (
              <div key={index} className="mb-4 p-2 bg-white rounded-lg">
                <p className="font-bold">{transcript.name}</p>
                <p>{transcript.text}</p>
              </div>
            ))}
          </div>
          <Button onClick={handleSummarize} disabled={isPending || transcripts.length === 0} className="mt-4">
            {isPending ? 'Summarizing...' : 'Summarize Meeting'}
          </Button>
        </div>
        <div>
          <ParticipantList meetingId={meetingId} />
        </div>
      </div>
    </div>
  );
}
