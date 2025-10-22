/**
 * @fileOverview Meeting page
 *
 * This page displays the details of a specific meeting.
 */

import { AudioInputForm } from '@/components/app/audio-input-form';
import { SummaryDisplay } from '@/components/app/summary-display';

export default function MeetingPage({
  params,
}: {
  params: { meetingId: string };
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Meeting {params.meetingId}</h1>
      <div className="grid gap-8">
        <AudioInputForm />
        <SummaryDisplay />
      </div>
    </div>
  );
}
