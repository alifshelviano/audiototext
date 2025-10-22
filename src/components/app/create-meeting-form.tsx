/**
 * @fileOverview Create meeting form
 *
 * This component provides a form for users to create a new meeting.
 */

'use client';

import { useRouter } from 'next/navigation';

import { createMeeting } from '@/app/meeting-actions';
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

export function CreateMeetingForm() {
  const router = useRouter();

  return (
    <Card>
      <form
        action={async (formData) => {
          const meeting = await createMeeting(formData);
          router.push(`/meeting/${meeting.id}`);
        }}
      >
        <CardHeader>
          <CardTitle>Create Meeting</CardTitle>
          <CardDescription>Create a new meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password (optional)</Label>
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
          <Button type="submit" className="w-full">Create Meeting</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
