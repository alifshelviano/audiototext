'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {getMeeting} from '@/app/meetings';
import {QRCodeDisplay} from '@/components/app/qr-code-display';
import {Header} from '@/components/app/header';
import {Button} from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSession } from "next-auth/react";

export default function MeetingPage() {
  const pathname = usePathname();
  const router = useRouter();
  const meetingId = pathname.split('/').pop();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (meetingId) {
      getMeeting({meetingId: meetingId as string})
        .then(setMeeting)
        .finally(() => setLoading(false));
    }
  }, [meetingId]);

  const handleDelete = async () => {
    if (!meetingId) return;

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Redirect to a different page after successful deletion
        router.push('/');
      } else {
        // Handle error
        console.error('Failed to delete meeting');
      }
    } catch (error) {
      console.error('An error occurred while deleting the meeting:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!meeting) {
    return <div>Meeting not found.</div>;
  }

  // DEBUGGING: Log session and meeting data to the console
  console.log("Session Data:", session);
  console.log("Meeting Data:", meeting);
  console.log("Session User ID:", session?.user?.id);
  console.log("Meeting Owner ID:", meeting.ownerId);

  const meetingUrl = `${window.location.origin}/meeting/${meetingId}/join`;
  const isOwner = session?.user?.id === meeting.ownerId;

  console.log("Is Owner?", isOwner);

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">{meeting.name}</h1>
          <p className="text-center text-gray-500 mb-6">{new Date(meeting.time).toLocaleString()}</p>
          <div className="flex flex-col items-center">
            <QRCodeDisplay url={meetingUrl} />
            <a href={meetingUrl} className="text-blue-600 hover:underline mt-4">{meetingUrl}</a>
          </div>
          {isOwner && (
            <div className="mt-8 flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Meeting</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the meeting and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
