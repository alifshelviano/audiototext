'use client';

import { Button } from '@/components/ui/button';
import { Download, CalendarIcon, Mail, RefreshCw } from 'lucide-react';
import { SummaryContent } from '@/components/app/meeting/summary-content';
import type { MeetingData } from '@/types/meeting';

interface SummaryTabProps {
  meeting: MeetingData;
  meetingId: string;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onDataRefresh: () => void;
}

export function SummaryTab({ meeting, isAnalyzing, onReanalyze }: SummaryTabProps) {
  const exportToJson = () => {
    if (!meeting?.summary) return;
    
    const dataStr = JSON.stringify(meeting.summary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `meeting-summary-${meeting.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sendToGoogleCalendar = async () => {
    if (!meeting?.summary) return;
    alert('Google Calendar integration would be implemented here');
  };

  const sendEmailNotifications = async () => {
    if (!meeting?.summary) return;
    alert('Email notification integration would be implemented here');
  };

  return (
    <div className="p-6 overflow-y-auto" >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meeting Summary
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={onReanalyze}
            disabled={isAnalyzing || !meeting.transcripts?.length}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 border-blue-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Button>
          <Button
            onClick={exportToJson}
            variant="outline"
            size="sm"
            disabled={!meeting.summary}
            className="hover:bg-green-50 border-green-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={sendToGoogleCalendar}
            variant="outline"
            size="sm"
            disabled={!meeting.summary}
            className="hover:bg-purple-50 border-purple-200"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            onClick={sendEmailNotifications}
            variant="outline"
            size="sm"
            disabled={!meeting.summary}
            className="hover:bg-orange-50 border-orange-200"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>
      <SummaryContent meeting={meeting} />
    </div>
  );
}