"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import { QRCodeDisplay } from "@/components/app/create-meeting/qr-code-display";

interface ShareMeetingDialogProps {
  meetingId: string;
}

export function ShareMeetingDialog({ meetingId }: ShareMeetingDialogProps) {
  const meetingUrl = `${window.location.origin}/meeting/${meetingId}/join`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-none">
        <DialogTitle className="sr-only">Share Meeting QR Code</DialogTitle>
        <QRCodeDisplay url={meetingUrl} />
      </DialogContent>
    </Dialog>
  );
}
