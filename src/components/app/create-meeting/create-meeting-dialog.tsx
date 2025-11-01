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
import { Calendar, Users, Lock, Globe, Loader2, Check, Copy, ArrowRight, Video, Sparkles } from 'lucide-react';

interface CreateMeetingDialogProps {
  children: ReactNode;
}

export function CreateMeetingDialog({ children }: CreateMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [language, setLanguage] = useState('english');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [newMeetingId, setNewMeetingId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const router = useRouter();

  // Set default time to next hour
  useEffect(() => {
    if (open && !meetingTime) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
      now.setSeconds(0);
      setMeetingTime(now.toISOString().slice(0, 16));
    }
  }, [open, meetingTime]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setMeetingName('');
        setMeetingTime('');
        setLanguage('english');
        setIsPublic(true);
        setIsCreating(false);
        setCreationSuccess(false);
        setNewMeetingId('');
        setIsCopied(false);
      }, 300);
    }
  }, [open]);

  const handleCreateMeeting = async () => {
    if (isButtonDisabled) return;
    
    setIsCreating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      const fakeMeetingId = `meet-${Math.random().toString(36).substr(2, 9)}`;
      setNewMeetingId(fakeMeetingId);
      setCreationSuccess(true);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoToMeeting = () => {
    router.push(`/meeting/${newMeetingId}`);
    setOpen(false);
  };

  const meetingLink = typeof window !== 'undefined' ? `${window.location.origin}/meeting/${newMeetingId}/join` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isButtonDisabled = !meetingName.trim() || !meetingTime || isCreating;

  const SuccessView = () => (
    <div className="p-6 space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Created!</h2>
          <p className="text-gray-500 mt-1">Your meeting room is ready for participants</p>
        </div>
      </div>

      {/* Meeting Details */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-blue-900 text-sm">Meeting Details</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Video className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-medium">{meetingName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">{new Date(meetingTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className={`h-4 w-4 ${isPublic ? 'text-green-600' : 'text-amber-600'}`}>
              {isPublic ? <Globe /> : <Lock />}
            </div>
            <span className={`font-medium ${isPublic ? 'text-green-700' : 'text-amber-700'}`}>
              {isPublic ? 'Public Meeting' : 'Private Meeting'}
            </span>
          </div>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Share Meeting Link</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input 
              value={meetingLink} 
              readOnly 
              className="pr-20 bg-gray-50 border-gray-200" 
            />
          </div>
          <Button 
            onClick={handleCopy} 
            variant={isCopied ? "default" : "outline"}
            className={`whitespace-nowrap ${isCopied ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Share this link with participants to join the meeting
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <DialogClose asChild>
          <Button variant="outline" className="flex-1">
            Close
          </Button>
        </DialogClose>
        <Button onClick={handleGoToMeeting} className="flex-1 gap-2">
          Enter Meeting
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const CreateView = () => (
    <div className="space-y-6">
      {/* Header */}
      <DialogHeader className="text-center pt-6 px-6">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
          <Video className="h-6 w-6 text-blue-600" />
        </div>
        <DialogTitle className="text-xl font-bold text-gray-900">
          Create New Meeting
        </DialogTitle>
        <p className="text-gray-500 text-sm mt-1">
          Set up your meeting room in seconds
        </p>
      </DialogHeader>

      {/* Form */}
      <div className="px-6 space-y-5">
        {/* Meeting Name */}
        <div className="space-y-2">
          <Label htmlFor="meeting-name" className="text-sm font-medium text-gray-700">
            Meeting Name
          </Label>
          <Input
            id="meeting-name"
            placeholder="Team standup, Client call, Project review..."
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            className="focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <Label htmlFor="meeting-time" className="text-sm font-medium text-gray-700">
            Date & Time
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="meeting-time"
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium text-gray-700">
            Meeting Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language" className="focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">🇺🇸 English</SelectItem>
              <SelectItem value="indonesian">🇮🇩 Indonesian</SelectItem>
              <SelectItem value="korean">🇰🇷 Korean</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Used for transcription and AI analysis
          </p>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
          <div className="space-y-1">
            <Label htmlFor="privacy" className="text-sm font-medium text-gray-800">
              {isPublic ? 'Public Meeting' : 'Private Meeting'}
            </Label>
            <p className="text-xs text-gray-600">
              {isPublic 
                ? 'Anyone with the link can join' 
                : 'Only invited participants can join'
              }
            </p>
          </div>
          <Switch
            id="privacy"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* AI Features Badge */}
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">
            AI-powered transcription & summary included
          </span>
        </div>
      </div>

      {/* Create Button */}
      <DialogFooter className="px-6 pb-6 pt-2">
        <Button 
          onClick={handleCreateMeeting} 
          disabled={isButtonDisabled}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Meeting...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Create Meeting Room
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
        {creationSuccess ? <SuccessView /> : <CreateView />}
      </DialogContent>
    </Dialog>
  );
}