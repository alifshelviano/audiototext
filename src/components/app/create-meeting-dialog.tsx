'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, Lock, Loader2, Share2, Check, Copy, ArrowRight, Link as LinkIcon } from 'lucide-react';

interface CreateMeetingDialogProps {
  children: ReactNode;
}

export function CreateMeetingDialog({ children }: CreateMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [newMeetingId, setNewMeetingId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const router = useRouter();

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      // Add a small delay to prevent content flicker while closing
      setTimeout(() => {
        setMeetingName('');
        setMeetingTime('');
        setIsPublic(false);
        setIsCreating(false);
        setCreationSuccess(false);
        setNewMeetingId('');
      }, 200);
    }
  }, [open]);

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    console.log('Creating meeting...', { meetingName, meetingTime, isPublic });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const fakeMeetingId = `meet-${Math.random().toString(36).substr(2, 9)}`;
    setNewMeetingId(fakeMeetingId);
    setIsCreating(false);
    setCreationSuccess(true);
  };

  const handleGoToMeeting = () => {
    router.push(`/meeting/${newMeetingId}/share`);
    setOpen(false);
  }

  const meetingLink = typeof window !== 'undefined' ? `${window.location.origin}/meeting/${newMeetingId}/join` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const isButtonDisabled = !meetingName.trim() || !meetingTime || isCreating;

  const SuccessView = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="inline-block bg-green-100 p-3 rounded-full mb-3">
          <Share2 className="h-7 w-7 text-green-700" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Meeting Created Successfully!</h1>
        <p className="text-gray-500 mt-2 text-sm">Your meeting room is ready. Share the link with your team.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h2 className="font-semibold text-gray-800 text-base mb-3">Meeting Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 font-medium">{meetingName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{new Date(meetingTime).toLocaleString()}</span>
          </div>
           <div className="flex items-center gap-3">
              <div className={`h-4 w-4 flex items-center justify-center ${isPublic ? 'text-green-600' : 'text-yellow-700'}`}>
                {isPublic ? <Users /> : <Lock />}
              </div>
              <span className={`font-medium ${isPublic ? 'text-green-700' : 'text-yellow-800'}`}>
                {isPublic ? 'Public Meeting' : 'Private Meeting'}
              </span>
            </div>
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="meeting-link" className="font-medium text-gray-700 text-sm">Meeting Link</Label>
        <div className="flex items-center gap-2 mt-1">
          <div className="relative flex-grow">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="meeting-link" type="text" value={meetingLink} readOnly className="pl-10 bg-gray-100" />
          </div>
          <Button onClick={handleCopy} variant="outline" className="flex-shrink-0">
            {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{isCopied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>
      
      <DialogFooter className="gap-2 sm:justify-between">
         <DialogClose asChild>
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
         </DialogClose>
         <Button onClick={handleGoToMeeting} className="w-full">
            Go to Meeting Room <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </DialogFooter>
    </div>
  );

  const CreateView = () => (
    <>
      <DialogHeader className="relative text-center p-6 border-b">
        <DialogTitle className="text-xl font-bold text-gray-800">Create Meeting Room</DialogTitle>
      </DialogHeader>
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="meeting-name" className="font-medium text-gray-700">
              Meeting Name <span className="text-red-500">*</span>
            </Label>
            <Input id="meeting-name" placeholder="e.g., Team Standup..." className="mt-1" value={meetingName} onChange={(e) => setMeetingName(e.target.value)} disabled={isCreating} />
          </div>
          <div>
            <Label htmlFor="meeting-time" className="font-medium text-gray-700">
              Meeting Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <Input id="meeting-time" type="datetime-local" className="pl-10" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} disabled={isCreating} />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <Label htmlFor="discussion-language" className="font-medium text-gray-700">
              Discussion Language <span className="text-red-500">*</span>
            </Label>
            <Select defaultValue="english" disabled={isCreating}>
              <SelectTrigger id="discussion-language" className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="indonesian">Indonesian</SelectItem>
                <SelectItem value="korean">Korean</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">This will be used for transcription and summary generation.</p>
          </div>
          <div className="flex items-center justify-between mt-4 bg-gray-50 p-3 rounded-lg">
            <div>
              <Label htmlFor="public-meeting" className="font-medium text-gray-800">Public Meeting</Label>
              <p className="text-xs text-gray-500">Anyone with the link can join.</p>
            </div>
            <Switch id="public-meeting" checked={isPublic} onCheckedChange={setIsPublic} disabled={isCreating} />
          </div>
          {!isPublic && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-50 border border-yellow-200">
              <Lock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-800">This is a <span className="font-semibold">Private Meeting</span>. Only members you invite will be able to join.</p>
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="p-6 border-t">
        <Button onClick={handleCreateMeeting} disabled={isButtonDisabled} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCreating ? 'Creating...' : 'Create Meeting Room'}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-md bg-white rounded-lg shadow-2xl p-0">
        {creationSuccess ? <SuccessView /> : <CreateView />}
      </DialogContent>
    </Dialog>
  );
}
