'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QRCodeDisplay } from '@/components/app/qr-code-display';
import { Share2 } from 'lucide-react';

interface ShareMeetingDialogProps {
  meetingId: string;
}

export function ShareMeetingDialog({ meetingId }: ShareMeetingDialogProps) {
  const meetingUrl = `${window.location.origin}/meeting/${meetingId}/join`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Meeting</DialogTitle>
        </DialogHeader>
        <QRCodeDisplay url={meetingUrl} />
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Meeting Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={meetingUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(meetingUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
