'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Briefcase, Key, ArrowRight, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from "@/components/app/dashboard-layout";
import { CreateMeetingDialog } from '@/components/app/create-meeting-dialog';

interface Meeting {
  id: string;
  name: string;
  time: string;
  transcripts?: any[];
}

export default function Page() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const { data: session, status } = useSession();

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings');

      if (!res.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setJoinError('');

    try {
      const findMeetingRes = await fetch(`/api/meetings/find-by-passkey?passkey=${passkey}`);

      if (!findMeetingRes.ok) {
        throw new Error('Invalid passkey or meeting not found');
      }

      const meetingData = await findMeetingRes.json();

      if (!meetingData.meetingId) {
        throw new Error('Meeting not found');
      }

      window.location.href = `/meeting/${meetingData.meetingId}/join`;
    } catch (error: any) {
      console.error('Error joining meeting:', error);
      setJoinError(error.message || 'Failed to join meeting. Please check the passkey.');
    } finally {
      setIsJoining(false);
    }
  };

  const resetJoinForm = () => {
    setMeetingId('');
    setPasskey('');
    setJoinError('');
    setShowJoinModal(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Here is a summary of your meetings and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Total Meetings</h3>
          </div>
          <p className="text-purple-100 text-3xl font-bold mb-4">{isLoading ? '...' : meetings.length}</p>
        </div>

        {status === 'authenticated' && (
            <Link href="/create-meetings">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">Create New Meeting</h3>
                </div>
                <p className="text-green-100 text-sm mb-4">Create meeting room and invite teammates to collaborate</p>
                <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">Create</div>
              </div>
            </Link>
          )}

        <div onClick={() => setShowJoinModal(true)} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 h-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Join Meeting</h3>
          </div>
          <p className="text-blue-100 text-sm mb-4">Join existing meeting with meeting ID and passkey</p>
          <div className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-2">
            Join Meeting <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Join Meeting</h3>
              <button onClick={resetJoinForm} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-4">
              {joinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{joinError}</p>
                </div>
              )}

              <div>
                <label htmlFor="passkey" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Passkey *
                </label>
                <input
                  id="passkey"
                  type="text"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                  placeholder="Enter meeting passkey (e.g., ABC123)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase text-center text-lg tracking-widest"
                  required
                  disabled={isJoining}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1 text-center">Enter the 6-character passkey provided by the meeting organizer</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetJoinForm} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium" disabled={isJoining}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining || !passkey || passkey.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isJoining ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    'Join Meeting'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                How to get the passkey?
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Ask the meeting organizer for the passkey</li>
                <li>• The passkey is a 6-character code (letters and numbers)</li>
                <li>• Example: ABC123, XYZ789, etc.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="space-y-3">
            <Link href="/public-meetings">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Browse Public Meetings</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>

            {status === 'authenticated' && (
              <Link href="/history">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-700">My Meeting History</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Join a Meeting</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              <p>Get the Meeting ID from the meeting organizer</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              <p>If it's a private meeting, ask for the passkey</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">3</span>
              </div>
              <p>Enter both in the join form and start collaborating</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
