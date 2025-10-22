/**
 * @fileOverview Join meeting form
 *
 * This component provides a form for users to join an existing meeting.
 */

'use client';

import { useRouter } from 'next/navigation';

import { joinMeeting } from '@/app/meeting-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function JoinMeetingForm() {
  const router = useRouter();

  return (
    <Card>
      <form
        action={async (formData) => {
          const result = await joinMeeting(formData);

          if ('error' in result) {
            alert(result.error);
          } else {
            router.push(`/meeting/${result.id}`);
          }
        }}
      >
        <CardHeader>
          <CardTitle>Join Meeting</CardTitle>
          <CardDescription>Join an existing meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                name="meetingId"
                placeholder="Enter meeting ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password (if required)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Super secret password"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Join Meeting</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
