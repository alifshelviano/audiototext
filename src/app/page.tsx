'use client';
/**
 * @fileOverview Home page
 *
 * This file contains the home page of the application.
 * It allows users to create a new meeting or join an existing one.
 */

import { CreateMeetingForm } from '@/components/app/create-meeting-form';
import { JoinMeetingForm } from '@/components/app/join-meeting-form';
import { NotLoggedIn } from '@/components/app/not-logged-in';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';

export default function Home() {
  const session = useSession();

  if (!session.data) {
    return <NotLoggedIn />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Tabs defaultValue="create" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="create">New Meeting</TabsTrigger>
          <TabsTrigger value="join">Join Meeting</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateMeetingForm />
        </TabsContent>
        <TabsContent value="join">
          <JoinMeetingForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
