'use client';

import { Button } from '@/components/ui/button';
import { Download, CalendarIcon, Mail, RefreshCw, FileText, ChevronDown } from 'lucide-react';
import { SummaryContent } from '@/components/app/meeting/summary-content';
import { ExportService } from '@/lib/export-service';
import type { MeetingData, MeetingSummary, EmotionAnalysis } from '@/types/meeting';
import { useState } from 'react';

interface SummaryTabProps {
  meeting: MeetingData;
  isAnalyzing: boolean;
  onReanalyze: () => void;
}

export function SummaryTab({ meeting, isAnalyzing, onReanalyze }: SummaryTabProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const getStructuredSummary = (): MeetingSummary['meeting_summary'] => {
    if (meeting?.summary?.meeting_summary) {
      const summary = meeting.summary.meeting_summary;
      if (summary.emotion_analysis) {
        summary.emotion_analysis = {
          overall_sentiment: summary.emotion_analysis.overall_sentiment || 'neutral',
          overall_confidence: summary.emotion_analysis.overall_confidence || 0,
          participant_emotions: summary.emotion_analysis.participant_emotions?.map((participant) => ({
            participant: participant.participant || 'Unknown',
            sentiment: participant.sentiment || 'neutral',
            confidence: participant.confidence || 0,
            statements: participant.statements || 0,
            emotionalTone: participant.emotionalTone || 'neutral'
          })) || [],
          emotional_highlights: summary.emotion_analysis.emotional_highlights || [],
          tension_points: summary.emotion_analysis.tension_points || []
        };
      }
      return summary;
    }
    
    const participants = Array.from(new Set(meeting?.transcripts?.map((t) => t.name) || []));
    const meetingDate = new Date(meeting?.time || new Date());
    
    return {
      title: meeting?.name || 'Untitled Meeting',
      date: meetingDate.toISOString().split('T')[0],
      time: `${meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB`,
      participants,
      key_points: ["Automatic analysis in progress..."],
      insights_decisions: [],
      action_items: [],
      summary_insights: ["Analysis pending"],
      emotion_analysis: {
        overall_sentiment: 'neutral',
        overall_confidence: 0,
        participant_emotions: [],
        emotional_highlights: [],
        tension_points: []
      }
    };
  };

  const exportToPDF = async () => {
    if (!meeting?.summary) return;

    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const structuredSummary = getStructuredSummary();
      const htmlContent = ExportService.generateDocumentHTML(meeting, structuredSummary);
      
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      const success = await ExportService.exportToPDF(
        tempDiv, 
        `meeting-documentation-${meeting.name}`
      );

      if (!success) {
        alert('Failed to generate PDF document. Please try again.');
      }

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    if (!meeting?.summary) return;

    setShowExportMenu(false);
    const structuredSummary = getStructuredSummary();
    const htmlContent = ExportService.generateDocumentHTML(meeting, structuredSummary);
    
    // Convert HTML to Word document
    const blob = new Blob([`
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Meeting Documentation - ${meeting.name}</title>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-documentation-${meeting.name}-${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <div className="p-6 overflow-y-auto">
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
          
          {/* Enhanced Export Dropdown - Only PDF and Word */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              disabled={!meeting.summary || isExporting}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="hover:bg-green-50 border-green-200"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Document'}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-3 text-red-500" />
                    <div className="text-left">
                      <div className="font-medium">Export as PDF</div>
                      <div className="text-xs text-gray-500">Professional document with all meeting details</div>
                    </div>
                  </button>
                  <button
                    onClick={exportToWord}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">Export as Word</div>
                      <div className="text-xs text-gray-500">Editable document format</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

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
