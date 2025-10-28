// //app/meeting/[meetingId]/join/page.tsx
// 'use client';

// import {useEffect, useState, useCallback, useRef} from 'react';
// import {useRouter, usePathname} from 'next/navigation';
// import {getMeeting} from '@/app/meetings';
// import { analyzeMeeting, shouldAutoAnalyze } from '@/lib/meeting-analysis';
// import { RecordingControls } from '@/components/app/recording-controls';
// import { Header } from '@/components/app/header';
// import { Sidebar } from '@/components/app/sidebar';
// import { 
//   Mic, MessageSquare, BarChart, FileText, Clock, Users, Calendar, 
//   ChevronDown, ChevronUp, Download, Mail, Calendar as CalendarIcon,
//   RefreshCw, CheckCircle, AlertCircle, Heart, Smile, Frown, Meh,
//   TrendingUp, TrendingDown, Minus, Zap
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';

// interface EmotionAnalysis {
//   overall_sentiment: string;
//   overall_confidence: number;
//   participant_emotions: {
//     participant: string;
//     sentiment: string;
//     confidence: number;
//     statements: number;
//     emotionalTone: string;
//   }[];
//   emotional_highlights: string[];
//   tension_points: string[];
// }

// interface MeetingHealthScore {
//   overall_score: number;
//   engagement_score: number;
//   productivity_score: number;
//   collaboration_score: number;
//   clarity_score: number;
//   score_breakdown: {
//     strengths: string[];
//     weaknesses: string[];
//     red_flags: string[];
//   };
//   recommendations: string[];
// }

// interface MeetingSummary {
//   meeting_summary: {
//     title: string;
//     date: string;
//     time: string;
//     participants: string[];
//     key_points: string[];
//     insights_decisions: string[];
//     action_items: {
//       task: string;
//       assigned_to: string;
//       deadline: string;
//       status: 'Not Started' | 'In Progress' | 'Completed' | 'Pending';
//     }[];
//     next_meeting?: {
//       date: string;
//       agenda: string[];
//     };
//     summary_insights: string[];
//     important_metrics?: any[];
//     unresolved_questions?: any[];
//     technical_details?: any[];
//     emotion_analysis?: EmotionAnalysis;
//     meeting_health_score?: MeetingHealthScore;
//   };
// }

// interface Transcript {
//   name: string;
//   transcript: string;
//   createdAt: Date;
// }

// interface MeetingData {
//   id: string;
//   name: string;
//   time: string;
//   transcripts: Transcript[];
//   summary?: any;
//   lastAnalyzed?: Date;
// }

// export default function JoinMeetingPage() {
//   const [meeting, setMeeting] = useState<MeetingData | null>(null);
//   const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'insights' | 'sentiment'>('transcript');
//   const [loading, setLoading] = useState(true);
//   const [isClient, setIsClient] = useState(false);
//   const [showParticipants, setShowParticipants] = useState(false);
//   const [visibleTranscripts, setVisibleTranscripts] = useState(10);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
//   const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
//   const transcriptsContainerRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const meetingId = isClient ? pathname.split('/').slice(-2, -1)[0] : null;

//   const fetchMeetingData = useCallback(async () => {
//     if (!meetingId) return;
    
//     try {
//       const data = await getMeeting({meetingId});
//       if (data) {
//         setMeeting(data);
//         if (data.lastAnalyzed) {
//           setLastAnalysisTime(new Date(data.lastAnalyzed));
//         }
//         setAnalysisStatus(data.summary ? 'success' : 'idle');
//       } else {
//         router.push('/');
//       }
//     } catch (error) {
//       console.error('Error fetching meeting:', error);
//       setAnalysisStatus('error');
//     }
//   }, [meetingId, router]);

//   useEffect(() => {
//     if (meetingId) {
//       fetchMeetingData().finally(() => setLoading(false));
//     }
//   }, [meetingId, fetchMeetingData]);

//   const handleTranscriptAdded = useCallback(() => {
//     fetchMeetingData();
//     setTimeout(() => {
//       if (transcriptsContainerRef.current) {
//         transcriptsContainerRef.current.scrollTop = transcriptsContainerRef.current.scrollHeight;
//       }
//     }, 100);
//   }, [fetchMeetingData]);

//   const handleAutoAnalyze = useCallback(async () => {
//     if (!meetingId || !meeting?.transcripts?.length) return;
    
//     setIsAnalyzing(true);
//     setAnalysisStatus('analyzing');
    
//     try {
//       const result = await analyzeMeeting(meetingId);
      
//       if (result.success) {
//         setAnalysisStatus('success');
//         setLastAnalysisTime(new Date());
//         await fetchMeetingData();
//       } else {
//         setAnalysisStatus('error');
//         console.error('Analysis failed:', result.error);
//       }
//     } catch (error) {
//       console.error('Error analyzing meeting:', error);
//       setAnalysisStatus('error');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   }, [meetingId, meeting?.transcripts?.length, fetchMeetingData]);

//   useEffect(() => {
//     const autoAnalyzeIfNeeded = async () => {
//       if (meeting?.transcripts?.length && meeting.transcripts.length > 0 && !meeting.summary) {
//         const shouldAnalyze = await shouldAutoAnalyze(meeting.id);
//         if (shouldAnalyze) {
//           handleAutoAnalyze();
//         }
//       }
//     };

//     autoAnalyzeIfNeeded();
//   }, [meeting?.transcripts?.length, meeting?.summary, meeting?.id, handleAutoAnalyze]);

//   const loadMoreTranscripts = () => {
//     setVisibleTranscripts(prev => prev + 10);
//   };

//   const showLessTranscripts = () => {
//     setVisibleTranscripts(10);
//   };

//   const exportToJson = () => {
//     if (!meeting?.summary) return;
    
//     const dataStr = JSON.stringify(meeting.summary, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
//     const exportFileDefaultName = `meeting-summary-${meeting.name}-${new Date().toISOString().split('T')[0]}.json`;
    
//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const sendToGoogleCalendar = async () => {
//     if (!meeting?.summary) return;
//     alert('Google Calendar integration would be implemented here');
//   };

//   const sendEmailNotifications = async () => {
//     if (!meeting?.summary) return;
//     alert('Email notification integration would be implemented here');
//   };

//   const getStructuredSummary = (): MeetingSummary['meeting_summary'] => {
//     if (meeting?.summary?.meeting_summary) {
//       // Ensure emotion_analysis has proper structure
//       const summary = meeting.summary.meeting_summary;
//       if (summary.emotion_analysis) {
//         summary.emotion_analysis = {
//           overall_sentiment: summary.emotion_analysis.overall_sentiment || 'neutral',
//           overall_confidence: summary.emotion_analysis.overall_confidence || 0,
//           participant_emotions: summary.emotion_analysis.participant_emotions?.map((participant: any) => ({
//             participant: participant.participant || 'Unknown',
//             sentiment: participant.sentiment || 'neutral',
//             confidence: participant.confidence || 0,
//             statements: participant.statements || 0,
//             emotionalTone: participant.emotionalTone || 'neutral'
//           })) || [],
//           emotional_highlights: summary.emotion_analysis.emotional_highlights || [],
//           tension_points: summary.emotion_analysis.tension_points || []
//         };
//       }
//       return summary;
//     }
    
//     const participants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || []));
//     const meetingDate = new Date(meeting?.time || new Date());
    
//     return {
//       title: meeting?.name || 'Untitled Meeting',
//       date: meetingDate.toISOString().split('T')[0],
//       time: `${meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB`,
//       participants,
//       key_points: [
//         "Automatic analysis in progress...",
//         "Please wait for AI to process the transcripts"
//       ],
//       insights_decisions: [],
//       action_items: [],
//       summary_insights: ["Analysis pending"],
//       emotion_analysis: {
//         overall_sentiment: 'neutral',
//         overall_confidence: 0,
//         participant_emotions: [],
//         emotional_highlights: [],
//         tension_points: []
//       }
//     };
//   };

//   const getSentimentIcon = (sentiment: string | undefined) => {
//     if (!sentiment) {
//       return <Minus className="w-5 h-5 text-gray-500" />;
//     }
    
//     switch (sentiment.toLowerCase()) {
//       case 'positive':
//         return <Smile className="w-5 h-5 text-green-500" />;
//       case 'negative':
//         return <Frown className="w-5 h-5 text-red-500" />;
//       case 'mixed':
//         return <Meh className="w-5 h-5 text-yellow-500" />;
//       default:
//         return <Minus className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 80) return 'text-green-600 bg-green-50';
//     if (score >= 60) return 'text-blue-600 bg-blue-50';
//     if (score >= 40) return 'text-yellow-600 bg-yellow-50';
//     return 'text-red-600 bg-red-50';
//   };

//   const getScoreIcon = (score: number) => {
//     if (score >= 80) return <TrendingUp className="w-5 h-5" />;
//     if (score >= 40) return <Minus className="w-5 h-5" />;
//     return <TrendingDown className="w-5 h-5" />;
//   };

//   const uniqueParticipants = Array.from(new Set(meeting?.transcripts?.map((t: any) => t.name) || [])) as string[];
//   const displayedTranscripts = meeting?.transcripts?.slice(-visibleTranscripts) || [];
//   const structuredSummary = getStructuredSummary();

//   const getStatusBadge = () => {
//     switch (analysisStatus) {
//       case 'analyzing':
//         return (
//           <Badge variant="secondary" className="bg-blue-100 text-blue-800">
//             <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
//             Analyzing...
//           </Badge>
//         );
//       case 'success':
//         return lastAnalysisTime ? (
//           <Badge variant="secondary" className="bg-green-100 text-green-800">
//             <CheckCircle className="w-3 h-3 mr-1" />
//             Analyzed {lastAnalysisTime.toLocaleTimeString()}
//           </Badge>
//         ) : null;
//       case 'error':
//         return (
//           <Badge variant="secondary" className="bg-red-100 text-red-800">
//             <AlertCircle className="w-3 h-3 mr-1" />
//             Analysis Failed
//           </Badge>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderTranscripts = () => {
//     if (!meeting?.transcripts?.length) {
//       return (
//         <div className="text-center py-16">
//           <div className="text-gray-300 mb-4">
//             <Mic className="w-20 h-20 mx-auto" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-500 mb-2">No transcripts yet</h3>
//           <p className="text-gray-400">Click the recording button to start capturing the conversation</p>
//         </div>
//       );
//     }

//     return (
//       <>
//         {meeting.transcripts.length > visibleTranscripts && (
//           <div className="text-center mb-4">
//             <button
//               onClick={loadMoreTranscripts}
//               className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
//             >
//               <ChevronUp className="w-4 h-4" />
//               Load {meeting.transcripts.length - visibleTranscripts} older messages
//             </button>
//           </div>
//         )}
        
//         {displayedTranscripts.map((transcript, index) => (
//           <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
//             <div className="flex-shrink-0">
//               <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
//                 <span className="text-white text-sm font-bold">
//                   {transcript.name.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-3 mb-2">
//                 <span className="font-semibold text-gray-900">{transcript.name}</span>
//                 <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
//                   {new Date(transcript.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                 </span>
//               </div>
//               <p className="text-gray-700 leading-relaxed text-[15px]">{transcript.transcript}</p>
//             </div>
//           </div>
//         ))}

//         {visibleTranscripts > 10 && (
//           <div className="text-center pt-4">
//             <button
//               onClick={showLessTranscripts}
//               className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1 mx-auto px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
//             >
//               <ChevronDown className="w-4 h-4" />
//               Show less
//             </button>
//           </div>
//         )}
//       </>
//     );
//   };

//   const renderSummaryContent = () => {
//     if (!meeting?.summary) {
//       return (
//         <div className="text-center py-16">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
//               <BarChart className="w-12 h-12 text-blue-600" />
//             </div>
//           </div>
//           <h3 className="text-2xl font-bold text-gray-800 mb-2">No analysis yet</h3>
//           <p className="text-gray-500 mb-6 max-w-md mx-auto">
//             {meeting?.transcripts?.length && meeting.transcripts.length > 0 
//               ? 'Generate AI-powered insights from your meeting transcripts' 
//               : 'Add some transcripts first to generate analysis'
//             }
//           </p>
//           {meeting?.transcripts?.length && meeting.transcripts.length > 0 && (
//             <Button 
//               onClick={handleAutoAnalyze} 
//               disabled={isAnalyzing}
//               className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 text-base"
//             >
//               <RefreshCw className={`w-5 h-5 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
//               {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
//             </Button>
//           )}
//         </div>
//       );
//     }

//     const emotionAnalysis = structuredSummary.emotion_analysis;

//     return (
//       <div className="space-y-6">
//         {/* Meeting Overview */}
//         <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//               <FileText className="w-4 h-4 text-white" />
//             </div>
//             <h4 className="text-lg font-bold text-blue-900">Meeting Overview</h4>
//           </div>
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div className="bg-white/60 rounded-xl p-4">
//               <span className="font-semibold text-blue-700 block mb-1">Title</span>
//               <p className="text-blue-900">{structuredSummary.title}</p>
//             </div>
//             <div className="bg-white/60 rounded-xl p-4">
//               <span className="font-semibold text-blue-700 block mb-1">Date & Time</span>
//               <p className="text-blue-900">
//                 {structuredSummary.date} • {structuredSummary.time}
//               </p>
//             </div>
//             <div className="col-span-2 bg-white/60 rounded-xl p-4">
//               <span className="font-semibold text-blue-700 block mb-1">Participants</span>
//               <p className="text-blue-900">{structuredSummary.participants.join(', ')}</p>
//             </div>
//           </div>
//         </div>

//         {/* Key Points */}
//         <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
//               <Zap className="w-4 h-4 text-white" />
//             </div>
//             <h4 className="text-lg font-bold text-gray-900">Key Discussion Points</h4>
//           </div>
//           <ul className="space-y-3">
//             {structuredSummary.key_points.map((point, index) => (
//               <li key={index} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
//                 <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
//                   {index + 1}
//                 </span>
//                 <span className="pt-0.5">{point}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Action Items */}
//         <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
//               <CheckCircle className="w-4 h-4 text-white" />
//             </div>
//             <h4 className="text-lg font-bold text-gray-900">Action Items</h4>
//           </div>
//           {structuredSummary.action_items.length > 0 ? (
//             <div className="space-y-3">
//               {structuredSummary.action_items.map((item, index) => (
//                 <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-gray-100 hover:to-gray-200/50 transition-all border border-gray-200">
//                   <div className="flex-1">
//                     <p className="font-semibold text-gray-900 mb-1">{item.task}</p>
//                     <p className="text-sm text-gray-600">
//                       👤 {item.assigned_to} • 📅 {item.deadline}
//                     </p>
//                   </div>
//                   <Badge className={`ml-4 ${
//                     item.status === 'Completed' ? 'bg-green-100 text-green-800' :
//                     item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
//                     item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-gray-100 text-gray-800'
//                   }`}>
//                     {item.status}
//                   </Badge>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-8">No action items identified</p>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const renderInsightsContent = () => {
//     if (!meeting?.summary) {
//       return (
//         <div className="text-center py-16">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
//               <BarChart className="w-12 h-12 text-purple-600" />
//             </div>
//           </div>
//           <h3 className="text-2xl font-bold text-gray-800 mb-2">No insights yet</h3>
//           <p className="text-gray-500">Generate a meeting summary first to see insights</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-6">
//         {/* Meeting Health Score */}
//         {structuredSummary.meeting_health_score && (
//           <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-6">
//               <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
//                 <Heart className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-indigo-900">Meeting Health Score</h4>
//             </div>
            
//             {/* Overall Score */}
//             <div className="bg-white/70 rounded-xl p-6 mb-6 text-center">
//               <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
//                 {structuredSummary.meeting_health_score.overall_score}
//               </div>
//               <p className="text-gray-600 font-medium">Overall Health Score</p>
//             </div>

//             {/* Score Breakdown */}
//             <div className="grid grid-cols-2 gap-4 mb-6">
//               {[
//                 { label: 'Engagement', score: structuredSummary.meeting_health_score.engagement_score },
//                 { label: 'Productivity', score: structuredSummary.meeting_health_score.productivity_score },
//                 { label: 'Collaboration', score: structuredSummary.meeting_health_score.collaboration_score },
//                 { label: 'Clarity', score: structuredSummary.meeting_health_score.clarity_score }
//               ].map((metric, index) => (
//                 <div key={index} className={`${getScoreColor(metric.score)} rounded-xl p-4`}>
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="font-semibold text-sm">{metric.label}</span>
//                     {getScoreIcon(metric.score)}
//                   </div>
//                   <div className="text-2xl font-bold">{metric.score}</div>
//                 </div>
//               ))}
//             </div>

//             {/* Strengths & Weaknesses */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-green-50 rounded-xl p-4 border border-green-100">
//                 <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
//                   <TrendingUp className="w-4 h-4" />
//                   Strengths
//                 </h5>
//                 <ul className="space-y-1 text-sm text-green-700">
//                   {structuredSummary.meeting_health_score.score_breakdown.strengths.map((item, i) => (
//                     <li key={i}>• {item}</li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
//                 <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
//                   <TrendingDown className="w-4 h-4" />
//                   Areas to Improve
//                 </h5>
//                 <ul className="space-y-1 text-sm text-orange-700">
//                   {structuredSummary.meeting_health_score.score_breakdown.weaknesses.map((item, i) => (
//                     <li key={i}>• {item}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Insights & Decisions */}
//         {structuredSummary.insights_decisions && structuredSummary.insights_decisions.length > 0 && (
//           <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
//                 <Zap className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-green-900">Insights & Decisions</h4>
//             </div>
//             <ul className="space-y-3">
//               {structuredSummary.insights_decisions.map((insight, index) => (
//                 <li key={index} className="flex items-start gap-3 text-green-800 bg-white/60 p-4 rounded-xl">
//                   <span className="text-green-600 text-xl mt-0.5">💡</span>
//                   <span>{insight}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Summary Insights */}
//         {structuredSummary.summary_insights && structuredSummary.summary_insights.length > 0 && (
//           <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
//                 <BarChart className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-purple-900">Summary Insights</h4>
//             </div>
//             <ul className="space-y-3">
//               {structuredSummary.summary_insights.map((insight, index) => (
//                 <li key={index} className="flex items-start gap-3 text-purple-800 bg-white/60 p-4 rounded-xl">
//                   <span className="text-purple-600 text-xl mt-0.5">📊</span>
//                   <span>{insight}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Next Meeting */}
//         {structuredSummary.next_meeting && (
//           <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
//                 <CalendarIcon className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-orange-900">Next Meeting</h4>
//             </div>
//             <div className="space-y-3">
//               <p className="text-orange-800 bg-white/60 p-4 rounded-xl">
//                 <span className="font-semibold">Date:</span> {structuredSummary.next_meeting.date}
//               </p>
//               <div className="bg-white/60 p-4 rounded-xl">
//                 <span className="font-semibold text-orange-800 block mb-2">Agenda:</span>
//                 <ul className="space-y-2">
//                   {structuredSummary.next_meeting.agenda.map((item, index) => (
//                     <li key={index} className="flex items-start gap-2 text-orange-700">
//                       <span className="text-orange-500 mt-1">📌</span>
//                       <span>{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderSentimentContent = () => {
//     const emotionAnalysis = structuredSummary.emotion_analysis;
  
//     if (!meeting?.summary || !emotionAnalysis || !emotionAnalysis.overall_sentiment) {
//       return (
//         <div className="text-center py-16">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
//               <Heart className="w-12 h-12 text-pink-600" />
//             </div>
//           </div>
//           <h3 className="text-2xl font-bold text-gray-800 mb-2">No sentiment analysis yet</h3>
//           <p className="text-gray-500">Generate a meeting summary to see emotional insights</p>
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-6">
//         {/* Overall Sentiment */}
//         <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-6 border border-pink-100 shadow-sm">
//           <div className="flex items-center gap-2 mb-6">
//             <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center">
//               <Heart className="w-4 h-4 text-white" />
//             </div>
//             <h4 className="text-lg font-bold text-pink-900">Overall Meeting Sentiment</h4>
//           </div>
          
//           <div className="bg-white/70 rounded-xl p-6 text-center">
//             <div className="flex items-center justify-center gap-4 mb-4">
//               {getSentimentIcon(emotionAnalysis.overall_sentiment)}
//               <div>
//                 <div className="text-3xl font-bold text-gray-900 capitalize">
//                   {emotionAnalysis.overall_sentiment}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   {Math.round(emotionAnalysis.overall_confidence * 100)}% confidence
//                 </div>
//               </div>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-3">
//               <div 
//                 className={`h-3 rounded-full transition-all ${
//                   emotionAnalysis.overall_sentiment === 'positive' ? 'bg-green-500' :
//                   emotionAnalysis.overall_sentiment === 'negative' ? 'bg-red-500' :
//                   emotionAnalysis.overall_sentiment === 'mixed' ? 'bg-yellow-500' :
//                   'bg-gray-500'
//                 }`}
//                 style={{ width: `${emotionAnalysis.overall_confidence * 100}%` }}
//               ></div>
//             </div>
//           </div>
//         </div>

//         {/* Participant Emotions */}
//         {emotionAnalysis.participant_emotions && emotionAnalysis.participant_emotions.length > 0 && (
//           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
//                 <Users className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-gray-900">Participant Emotions</h4>
//             </div>
            
//             <div className="space-y-4">
//               {/* {emotionAnalysis.participant_emotions.map((participant, index) => (
//                 <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
//                         <span className="text-white text-sm font-bold">
//                           {participant.participant.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <h5 className="font-semibold text-gray-900">{participant.participant}</h5>
//                         <p className="text-xs text-gray-500">{participant.statements} statements</p>
//                       </div>
//                     </div>
//                     {getSentimentIcon(participant.sentiment)}
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-3 text-sm">
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Sentiment</span>
//                       <span className="font-semibold text-gray-900 capitalize">{participant.sentiment}</span>
//                     </div>
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Tone</span>
//                       <span className="font-semibold text-gray-900 capitalize">{participant.emotionalTone}</span>
//                     </div>
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Confidence</span>
//                       <span className="font-semibold text-gray-900">{Math.round(participant.confidence * 100)}%</span>
//                     </div>
//                   </div>
//                 </div>
//               ))} */}
//               {emotionAnalysis.participant_emotions?.map((participant, index) => (
//                 <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
//                         <span className="text-white text-sm font-bold">
//                           {(participant.participant || 'Unknown').charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <h5 className="font-semibold text-gray-900">{participant.participant || 'Unknown'}</h5>
//                         <p className="text-xs text-gray-500">{participant.statements || 0} statements</p>
//                       </div>
//                     </div>
//                     {getSentimentIcon(participant.sentiment)}
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-3 text-sm">
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Sentiment</span>
//                       <span className="font-semibold text-gray-900 capitalize">{participant.sentiment || 'neutral'}</span>
//                     </div>
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Tone</span>
//                       <span className="font-semibold text-gray-900 capitalize">{participant.emotionalTone || 'neutral'}</span>
//                     </div>
//                     <div className="bg-white rounded-lg p-3">
//                       <span className="text-gray-600 text-xs block mb-1">Confidence</span>
//                       <span className="font-semibold text-gray-900">{Math.round((participant.confidence || 0) * 100)}%</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Emotional Highlights */}
//         {emotionAnalysis.emotional_highlights && emotionAnalysis.emotional_highlights.length > 0 && (
//           <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
//                 <Smile className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-green-900">Emotional Highlights</h4>
//             </div>
//             <ul className="space-y-3">
//               {emotionAnalysis.emotional_highlights.map((highlight, index) => (
//                 <li key={index} className="flex items-start gap-3 text-green-800 bg-white/60 p-4 rounded-xl">
//                   <span className="text-green-600 text-xl mt-0.5">✨</span>
//                   <span>{highlight}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Tension Points */}
//         {emotionAnalysis.tension_points && emotionAnalysis.tension_points.length > 0 && (
//           <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
//                 <AlertCircle className="w-4 h-4 text-white" />
//               </div>
//               <h4 className="text-lg font-bold text-red-900">Tension Points</h4>
//             </div>
//             <ul className="space-y-3">
//               {emotionAnalysis.tension_points.map((tension, index) => (
//                 <li key={index} className="flex items-start gap-3 text-red-800 bg-white/60 p-4 rounded-xl">
//                   <span className="text-red-600 text-xl mt-0.5">⚠️</span>
//                   <span>{tension}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (!isClient || loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
//         <Header />
//         <div className="flex">
//           <Sidebar />
//           <div className="flex-1 flex items-center justify-center p-8">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-600 font-medium">Loading meeting...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!meeting || !meetingId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
//         <Header />
//         <div className="flex">
//           <Sidebar />
//           <div className="flex-1 flex items-center justify-center p-8">
//             <div className="text-center">
//               <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
//                 <AlertCircle className="w-10 h-10 text-red-600" />
//               </div>
//               <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting not found</h1>
//               <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist or has been deleted.</p>
//               <button 
//                 onClick={() => router.push('/')}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
//               >
//                 Return Home
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
//       <Header />
//       <div className="flex">
//         <Sidebar />
        
//         <main className="flex-1 p-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Enhanced Meeting Header */}
//             <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 relative overflow-hidden">
//               {/* Decorative gradient background */}
//               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>
              
//               <div className="relative z-10">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between mb-3">
//                       <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                         {meeting.name}
//                       </h1>
//                       {getStatusBadge()}
//                     </div>
//                     <div className="flex flex-wrap items-center gap-4 text-sm">
//                       <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
//                         <Calendar className="w-4 h-4 text-blue-600" />
//                         <span className="text-gray-700 font-medium">
//                           {new Date(meeting.time).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
//                         <Clock className="w-4 h-4 text-blue-600" />
//                         <span className="text-gray-700 font-medium">
//                           {new Date(meeting.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
//                         <MessageSquare className="w-4 h-4 text-blue-600" />
//                         <span className="text-gray-700 font-medium">
//                           {meeting.transcripts?.length || 0} messages
//                         </span>
//                       </div>
//                       <div 
//                         className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors relative"
//                         onMouseEnter={() => setShowParticipants(true)}
//                         onMouseLeave={() => setShowParticipants(false)}
//                       >
//                         <Users className="w-4 h-4 text-blue-600" />
//                         <span className="text-gray-700 font-medium">
//                           {uniqueParticipants.length} participants
//                         </span>
                        
//                         {showParticipants && (
//                           <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
//                             <div className="p-4">
//                               <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
//                               <div className="space-y-2 max-h-60 overflow-y-auto">
//                                 {uniqueParticipants.map((participant, index) => (
//                                   <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
//                                     <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
//                                       <span className="text-white text-xs font-semibold">
//                                         {participant.charAt(0).toUpperCase()}
//                                       </span>
//                                     </div>
//                                     <span className="text-sm text-gray-700 font-medium">{participant}</span>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-6">
//               {/* Main Content */}
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//                 {/* Tab Navigation */}
//                 <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
//                   <div className="flex overflow-x-auto">
//                     <button
//                       className={`flex items-center px-6 py-4 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
//                         activeTab === 'transcript'
//                           ? 'text-blue-600 border-blue-600 bg-white shadow-sm'
//                           : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70'
//                       }`}
//                       onClick={() => setActiveTab('transcript')}
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Transcript
//                     </button>
//                     <button
//                       className={`flex items-center px-6 py-4 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
//                         activeTab === 'summary'
//                           ? 'text-blue-600 border-blue-600 bg-white shadow-sm'
//                           : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70'
//                       }`}
//                       onClick={() => setActiveTab('summary')}
//                     >
//                       <BarChart className="w-4 h-4 mr-2" />
//                       Summary
//                     </button>
//                     <button
//                       className={`flex items-center px-6 py-4 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
//                         activeTab === 'insights'
//                           ? 'text-blue-600 border-blue-600 bg-white shadow-sm'
//                           : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70'
//                       }`}
//                       onClick={() => setActiveTab('insights')}
//                     >
//                       <Zap className="w-4 h-4 mr-2" />
//                       Insights
//                     </button>
//                     <button
//                       className={`flex items-center px-6 py-4 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
//                         activeTab === 'sentiment'
//                           ? 'text-blue-600 border-blue-600 bg-white shadow-sm'
//                           : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70'
//                       }`}
//                       onClick={() => setActiveTab('sentiment')}
//                     >
//                       <Heart className="w-4 h-4 mr-2" />
//                       Sentiment
//                     </button>
//                   </div>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="flex flex-col" style={{ minHeight: '500px' }}>
//                   {activeTab === 'transcript' && (
//                     <div className="flex-1 flex flex-col relative">
//                       {/* Transcripts Area */}
//                       <div 
//                         ref={transcriptsContainerRef}
//                         className="flex-1 p-6 space-y-2 overflow-y-auto"
//                         style={{ maxHeight: 'calc(100vh - 380px)', paddingBottom: '80px' }}
//                       >
//                         {renderTranscripts()}
//                       </div>
//                     </div>
//                   )}

//                   {activeTab === 'summary' && (
//                     <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
//                       <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                           Meeting Summary
//                         </h3>
//                         <div className="flex gap-2">
//                           <Button
//                             onClick={handleAutoAnalyze}
//                             disabled={isAnalyzing || !meeting.transcripts?.length}
//                             variant="outline"
//                             size="sm"
//                             className="hover:bg-blue-50 border-blue-200"
//                           >
//                             <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
//                             {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
//                           </Button>
//                           <Button
//                             onClick={exportToJson}
//                             variant="outline"
//                             size="sm"
//                             disabled={!meeting.summary}
//                             className="hover:bg-green-50 border-green-200"
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             Export
//                           </Button>
//                           <Button
//                             onClick={sendToGoogleCalendar}
//                             variant="outline"
//                             size="sm"
//                             disabled={!meeting.summary}
//                             className="hover:bg-purple-50 border-purple-200"
//                           >
//                             <CalendarIcon className="w-4 h-4 mr-2" />
//                             Calendar
//                           </Button>
//                           <Button
//                             onClick={sendEmailNotifications}
//                             variant="outline"
//                             size="sm"
//                             disabled={!meeting.summary}
//                             className="hover:bg-orange-50 border-orange-200"
//                           >
//                             <Mail className="w-4 h-4 mr-2" />
//                             Email
//                           </Button>
//                         </div>
//                       </div>
//                       {renderSummaryContent()}
//                     </div>
//                   )}

//                   {activeTab === 'insights' && (
//                     <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
//                       <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
//                         Meeting Insights
//                       </h3>
//                       {renderInsightsContent()}
//                     </div>
//                   )}

//                   {activeTab === 'sentiment' && (
//                     <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
//                       <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-6">
//                         Sentiment Analysis
//                       </h3>
//                       {renderSentimentContent()}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Floating Recording Controls */}
//       {meetingId && (
//         <div className="fixed bottom-8 right-8 z-50 shadow-2xl">
//           <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 hover:shadow-3xl transition-all">
//             <RecordingControls 
//               meetingId={meetingId}
//               onTranscriptAdded={handleTranscriptAdded}
//               compact={true}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMeeting } from '@/app/meetings';
import { analyzeMeeting, shouldAutoAnalyze } from '@/lib/meeting-analysis';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { MeetingHeader } from '@/components/app/meeting/meeting-header';
import { TabNavigation } from '@/components/app/meeting/tab-navigation';
import { TranscriptTab } from '@/components/app/meeting/transcript-tab';
import { SummaryTab } from '@/components/app/meeting/summary-tab';
import { InsightsTab } from '@/components/app/meeting/insights-tab';
import { SentimentTab } from '@/components/app/meeting/sentiment-tab';
import { FloatingRecordingControls } from '@/components/app/meeting/floating-recording-controls';
import { useMeetingData } from '@/hooks/use-meeting-data';
import type { MeetingData } from '@/types/meeting';
import { AlertCircle } from 'lucide-react';

export default function JoinMeetingPage() {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'insights' | 'sentiment'>('transcript');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const meetingId = isClient ? pathname.split('/').slice(-2, -1)[0] : null;
  
  const {
    meeting,
    loading,
    analysisStatus,
    lastAnalysisTime,
    isAnalyzing,
    fetchMeetingData,
    handleAutoAnalyze
  } = useMeetingData(meetingId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || loading) {
    return <LoadingState />;
  }

  if (!meeting || !meetingId) {
    return <MeetingNotFound router={router} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <MeetingHeader 
              meeting={meeting}
              analysisStatus={analysisStatus}
              lastAnalysisTime={lastAnalysisTime}
            />
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <TabNavigation 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
                
                <TabContent 
                  activeTab={activeTab}
                  meeting={meeting}
                  meetingId={meetingId}
                  isAnalyzing={isAnalyzing}
                  onReanalyze={handleAutoAnalyze}
                  onDataRefresh={fetchMeetingData}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Show recording controls only on transcript tab */}
      {activeTab === 'transcript' && meetingId && (
        <FloatingRecordingControls 
          meetingId={meetingId}
          onTranscriptAdded={fetchMeetingData}
        />
      )}
    </div>
  );
}

// Supporting components for the main page
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading meeting...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingNotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Meeting not found</h1>
            <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist or has been deleted.</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabContent({ 
  activeTab, 
  meeting, 
  meetingId, 
  isAnalyzing, 
  onReanalyze,
  onDataRefresh 
}: { 
  activeTab: string;
  meeting: MeetingData;
  meetingId: string;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  onDataRefresh: () => void;
}) {
  const tabContentProps = {
    meeting,
    meetingId,
    isAnalyzing,
    onReanalyze,
    onDataRefresh
  };

  return (
    <div className="flex flex-col" >
      {activeTab === 'transcript' && <TranscriptTab {...tabContentProps} />}
      {activeTab === 'summary' && <SummaryTab {...tabContentProps} />}
      {activeTab === 'insights' && <InsightsTab {...tabContentProps} />}
      {activeTab === 'sentiment' && <SentimentTab {...tabContentProps} />}
    </div>
  );
}