'use client';

import {useEffect, useState, useCallback, useRef} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {getMeeting} from '@/app/meetings';
import { analyzeMeeting, shouldAutoAnalyze } from '@/lib/meeting-analysis';
import { RecordingControls } from '@/components/app/recording-controls';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { 
  Mic, MessageSquare, BarChart, FileText, Clock, Users, Calendar, 
  ChevronDown, ChevronUp, Download, Mail, Calendar as CalendarIcon,
  RefreshCw, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MeetingSummary {
  meeting_summary: {
    title: string;
    date: string;
    time: string;
    participants: string[];
    key_points: string[];
    insights_decisions: string[];
    action_items: {
      task: string;
      assigned_to: string;
      deadline: string;
      status: 'Not Started' | 'In Progress' | 'Completed' | 'Pending';
    }[];
    next_meeting?: {
      date: string;
      agenda: string[];
    };
    summary_insights: string[];
    important_metrics?: any[];
    unresolved_questions?: any[];
    technical_details?: any[];
  };
}

interface Transcript {
  name: string;
  transcript: string;
  createdAt: Date;
}

interface MeetingData {
  id: string;
  name: string;
  time: string;
  transcripts: Transcript[];
  summary?: any;
  lastAnalyzed?: Date;
}

export default function JoinMeetingPage() {
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'insights'>('transcript');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [visibleTranscripts, setVisibleTranscripts] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const transcriptsContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const meetingId = isClient ? pathname.split('/').slice(-2, -1)[0] : null;

  const fetchMeetingData = useCallback(async () => {
    if (!meetingId) return;
    
    try {
      const data = await getMeeting({meetingId});
      if (data) {
        setMeeting(data);
        if (data.lastAnalyzed) {
          setLastAnalysisTime(new Date(data.lastAnalyzed));
        }
        setAnalysisStatus(data.summary ? 'success' : 'idle');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
      setAnalysisStatus('error');
    }
  }, [meetingId, router]);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingData().finally(() => setLoading(false));
    }
  }, [meetingId, fetchMeetingData]);

  const handleTranscriptAdded = useCallback(() => {
    fetchMeetingData();
    // Auto-scroll to bottom when new transcript is added
    setTimeout(() => {
      if (transcriptsContainerRef.current) {
        transcriptsContainerRef.current.scrollTop = transcriptsContainerRef.current.scrollHeight;
      }
    }, 100);
  }, [fetchMeetingData]);

// Then update the usage in your component:
const handleAutoAnalyze = useCallback(async () => {
  if (!meetingId || !meeting?.transcripts?.length) return;
  
  setIsAnalyzing(true);
  setAnalysisStatus('analyzing');
  
  try {
    const result = await analyzeMeeting(meetingId);
    
    if (result.success) {
      setAnalysisStatus('success');
      setLastAnalysisTime(new Date());
      await fetchMeetingData();
    } else {
      setAnalysisStatus('error');
      console.error('Analysis failed:', result.error);
    }
  } catch (error) {
    console.error('Error analyzing meeting:', error);
    setAnalysisStatus('error');
  } finally {
    setIsAnalyzing(false);
  }
}, [meetingId, meeting?.transcripts?.length, fetchMeetingData]);

// And in the useEffect:
useEffect(() => {
  const autoAnalyzeIfNeeded = async () => {
    if (meeting?.transcripts?.length && meeting.transcripts.length > 0 && !meeting.summary) {
      const shouldAnalyze = await shouldAutoAnalyze(meeting.id);
      if (shouldAnalyze) {
        handleAutoAnalyze();
      }
    }
  };

  autoAnalyzeIfNeeded();
}, [meeting?.transcripts?.length, meeting?.summary, meeting?.id, handleAutoAnalyze]);

  const loadMoreTranscripts = () => {
    setVisibleTranscripts(prev => prev + 10);
  };

  const showLessTranscripts = () => {
    setVisibleTranscripts(10);
  };

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
    
    try {
      // Implement Google Calendar integration
      console.log('Sending to Google Calendar:', meeting.summary);
      // Add your Google Calendar API integration here
      alert('Google Calendar integration would be implemented here');
    } catch (error) {
      console.error('Error sending to Google Calendar:', error);
      alert('Failed to send to Google Calendar');
    }
  };

  const sendEmailNotifications = async () => {
    if (!meeting?.summary) return;
    
    try {
      // Implement Gmail integration
      console.log('Sending email notifications:', meeting.summary);
      // Add your Gmail API integration here
      alert('Email notification integration would be implemented here');
    } catch (error) {
      console.error('Error sending email notifications:', error);
      alert('Failed to send email notifications');
    }
  };

  const getStructuredSummary = (): MeetingSummary['meeting_summary'] => {
    if (meeting?.summary?.meeting_summary) {
      return meeting.summary.meeting_summary;
    }
    
    // Fallback structure if no AI analysis yet
    const participants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || []));
    const meetingDate = new Date(meeting?.time || new Date());
    
    return {
      title: meeting?.name || 'Untitled Meeting',
      date: meetingDate.toISOString().split('T')[0],
      time: `${meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB`,
      participants,
      key_points: [
        "Automatic analysis in progress...",
        "Please wait for AI to process the transcripts"
      ],
      insights_decisions: [],
      action_items: [],
      summary_insights: ["Analysis pending"]
    };
  };

  const uniqueParticipants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || [])) as string[];
  const displayedTranscripts = meeting?.transcripts?.slice(-visibleTranscripts) || [];
  const structuredSummary = getStructuredSummary();

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case 'analyzing':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Analyzing...
          </Badge>
        );
      case 'success':
        return lastAnalysisTime ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Analyzed {lastAnalysisTime.toLocaleTimeString()}
          </Badge>
        ) : null;
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Analysis Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderTranscripts = () => {
    if (!meeting?.transcripts?.length) {
      return (
        <div className="text-center py-16">
          <div className="text-gray-300 mb-4">
            <Mic className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No transcripts yet</h3>
          <p className="text-gray-400">Start recording to see the conversation appear here</p>
        </div>
      );
    }

    return (
      <>
        {meeting.transcripts.length > visibleTranscripts && (
          <div className="text-center">
            <button
              onClick={loadMoreTranscripts}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              <ChevronUp className="w-4 h-4" />
              Load older messages ({meeting.transcripts.length - visibleTranscripts} more)
            </button>
          </div>
        )}
        
        {displayedTranscripts.map((transcript, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-semibold">
                  {transcript.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900">{transcript.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(transcript.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-[15px]">{transcript.transcript}</p>
            </div>
          </div>
        ))}

        {visibleTranscripts > 10 && (
          <div className="text-center pt-4">
            <button
              onClick={showLessTranscripts}
              className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              <ChevronDown className="w-4 h-4" />
              Show less
            </button>
          </div>
        )}
      </>
    );
  };

  const renderSummaryContent = () => {
    if (!meeting?.summary) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-300 mb-4">
            <BarChart className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No analysis yet</h3>
          <p className="text-gray-400 mb-4">
            {meeting?.transcripts?.length && meeting.transcripts.length > 0 
              ? 'Click "Re-analyze" to generate meeting insights' 
              : 'Add some transcripts first to generate analysis'
            }
          </p>
          {meeting?.transcripts?.length && meeting.transcripts.length > 0 && (
            <Button onClick={handleAutoAnalyze} disabled={isAnalyzing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Meeting Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 Meeting Overview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Title:</span>
              <p className="text-blue-800">{structuredSummary.title}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Date & Time:</span>
              <p className="text-blue-800">
                {structuredSummary.date} • {structuredSummary.time}
              </p>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-blue-700">Participants:</span>
              <p className="text-blue-800">{structuredSummary.participants.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Key Discussion Points</h4>
          <ul className="space-y-2">
            {structuredSummary.key_points.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-500 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">✅ Action Items</h4>
          <div className="space-y-3">
            {structuredSummary.action_items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.task}</p>
                  <p className="text-sm text-gray-600">
                    Assigned to: {item.assigned_to} • Deadline: {item.deadline}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInsightsContent = () => {
    if (!meeting?.summary) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-300 mb-4">
            <BarChart className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No insights yet</h3>
          <p className="text-gray-400">Generate a meeting summary first to see insights</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Insights & Decisions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <h4 className="text-lg font-semibold text-green-800 mb-4">💡 Insights & Decisions</h4>
          <ul className="space-y-2">
            {structuredSummary.insights_decisions.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 text-green-700">
                <span className="text-green-500 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <h4 className="text-lg font-semibold text-purple-800 mb-4">📊 Summary Insights</h4>
          <ul className="space-y-2">
            {structuredSummary.summary_insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3 text-purple-700">
                <span className="text-purple-500 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Meeting */}
        {structuredSummary.next_meeting && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <h4 className="text-lg font-semibold text-orange-800 mb-4">➡️ Next Meeting</h4>
            <div className="space-y-3">
              <p className="text-orange-700">
                <span className="font-medium">Date:</span> {structuredSummary.next_meeting.date}
              </p>
              <div>
                <span className="font-medium text-orange-700">Agenda:</span>
                <ul className="mt-2 space-y-1">
                  {structuredSummary.next_meeting.agenda.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-orange-700">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Additional Insights */}
        {structuredSummary.important_metrics && structuredSummary.important_metrics.length > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
            <h4 className="text-lg font-semibold text-cyan-800 mb-4">📈 Important Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              {structuredSummary.important_metrics.map((metric, index) => (
                <div key={index} className="bg-white/50 p-3 rounded-lg">
                  <p className="font-medium text-cyan-700">{metric.metric_name}</p>
                  <p className="text-cyan-800">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading meeting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting || !meetingId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting not found</h1>
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Compact Meeting Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{meeting.name}</h1>
                    {getStatusBadge()}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(meeting.time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(meeting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{meeting.transcripts?.length || 0} messages</span>
                    </div>
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors relative"
                      onMouseEnter={() => setShowParticipants(true)}
                      onMouseLeave={() => setShowParticipants(false)}
                    >
                      <Users className="w-4 h-4" />
                      <span>{uniqueParticipants.length} participants</span>
                      
                      {showParticipants && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {uniqueParticipants.map((participant, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">
                                      {participant.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-700">{participant}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Main Content */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                  <div className="flex">
                    <button
                      className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'transcript'
                          ? 'text-blue-600 border-blue-600 bg-white'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => setActiveTab('transcript')}
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Transcript
                    </button>
                    <button
                      className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'summary'
                          ? 'text-blue-600 border-blue-600 bg-white'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => setActiveTab('summary')}
                    >
                      <BarChart className="w-4 h-4 mr-3" />
                      Summary
                    </button>
                    <button
                      className={`flex items-center px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === 'insights'
                          ? 'text-blue-600 border-blue-600 bg-white'
                          : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/50'
                      }`}
                      onClick={() => setActiveTab('insights')}
                    >
                      <BarChart className="w-4 h-4 mr-3" />
                      Insights
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex flex-col" style={{ minHeight: '500px' }}>
                  {activeTab === 'transcript' && (
                    <div className="flex-1 flex flex-col relative">
                      {/* Transcripts Area */}
                      <div 
                        ref={transcriptsContainerRef}
                        className="flex-1 p-6 space-y-4 overflow-y-auto"
                        style={{ maxHeight: 'calc(100vh - 300px)' }}
                      >
                        {renderTranscripts()}
                      </div>

                      {/* Floating Recording Controls */}
                      <div className="sticky bottom-6 mx-6 mb-6">
                        {meetingId && (
                          <RecordingControls 
                            meetingId={meetingId}
                            onTranscriptAdded={handleTranscriptAdded}
                            compact={true}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'summary' && (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800">Meeting Summary</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAutoAnalyze}
                            disabled={isAnalyzing || !meeting.transcripts?.length}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                          </Button>
                          <Button
                            onClick={exportToJson}
                            variant="outline"
                            size="sm"
                            disabled={!meeting.summary}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON
                          </Button>
                          <Button
                            onClick={sendToGoogleCalendar}
                            variant="outline"
                            size="sm"
                            disabled={!meeting.summary}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Google Calendar
                          </Button>
                          <Button
                            onClick={sendEmailNotifications}
                            variant="outline"
                            size="sm"
                            disabled={!meeting.summary}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Emails
                          </Button>
                        </div>
                      </div>
                      {renderSummaryContent()}
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Meeting Insights</h3>
                      {renderInsightsContent()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}