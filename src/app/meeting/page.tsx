/**
 * @fileOverview Meeting page
 *
 * This page allows users to create and join meetings.
 */

import { CreateMeetingForm } from '@/components/app/create-meeting-form';
import { JoinMeetingForm } from '@/components/app/join-meeting-form';

export default function MeetingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CreateMeetingForm />
        <JoinMeetingForm />
      </div>
    </div>
  );
}
