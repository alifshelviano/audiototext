'use client';

import { useState } from 'react';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { MeetingForm } from '@/components/app/meeting-form';
import { QRCodeDisplay } from '@/components/app/qr-code-display';
import { Share2, Users } from 'lucide-react';

export default function MeetingsPage() {
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');

  const handleMeetingCreated = (meetingId: string) => {
    const url = `${window.location.origin}/meeting/${meetingId}/join`;
    setCreatedMeetingId(meetingId);
    setCreatedMeetingUrl(url);
  };
  
  const handleCreateNewMeeting = () => {
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create a New Meeting
            </h1>
            <p className="text-gray-600">
              Fill out the form below to create a new meeting room.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            {createdMeetingId ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Meeting Room Created!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Share this QR code or link with your team to join the meeting.
                  </p>
                </div>

                <QRCodeDisplay url={createdMeetingUrl} />

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Meeting Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={createdMeetingUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(createdMeetingUrl)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateNewMeeting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Create Another
                  </button>
                  <a
                    href={`/meeting/${createdMeetingId}/join`}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                  >
                    Join Meeting
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Create Team Meeting
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Set up a meeting room and invite your team members to collaborate.
                  </p>
                </div>

                <MeetingForm onMeetingCreated={handleMeetingCreated} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
