// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { Sidebar } from '@/components/app/sidebar';
// import { Header } from '@/components/app/header';
// import { MeetingForm } from '@/components/app/meeting-form';
// import { QRCodeDisplay } from '@/components/app/qr-code-display';
// import { Mic2, FileText, Users, X, Share2 } from 'lucide-react';

// interface Meeting {
//   id: string;
//   name: string;
//   time: string;
//   transcripts?: any[];
// }

// export default function Page() {
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showMeetingForm, setShowMeetingForm] = useState(false);
//   const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
//   const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');

//   const fetchMeetings = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const res = await fetch('/api/meetings');
      
//       if (!res.ok) {
//         throw new Error('Failed to fetch meetings');
//       }
      
//       const data = await res.json();
//       const meetingsData = Array.isArray(data) ? data : [];
//       setMeetings(meetingsData);
//     } catch (error) {
//       console.error('Error fetching meetings:', error);
//       setMeetings([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMeetings();
//   }, [fetchMeetings]);

//   const handleMeetingCreated = (meetingId: string) => {
//     // Update meetings list
//     fetchMeetings();
    
//     // Generate meeting URL and show QR code
//     const url = `${window.location.origin}/meeting/${meetingId}/join`;
//     setCreatedMeetingId(meetingId);
//     setCreatedMeetingUrl(url);
//   };

//   const handleInviteTeam = () => {
//     setShowMeetingForm(true);
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

//   const handleCloseForm = () => {
//     setShowMeetingForm(false);
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

//   const handleCreateNewMeeting = () => {
//     setCreatedMeetingId(null);
//     setCreatedMeetingUrl('');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header at the top */}
//       <Header />
      
//       <div className="flex">
//         {/* Sidebar under the header */}
//         <Sidebar />
        
//         {/* Main Content */}
//         <main className="flex-1 p-6">
//           {/* Welcome Section */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Welcome to AudioScribe AI
//             </h1>
//             <p className="text-gray-600">
//               Record, transcribe, and summarize your meetings with AI-powered tools.
//             </p>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             {/* ... (your existing quick action buttons) */}
//             <div 
//               className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all duration-200"
//               onClick={handleInviteTeam}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                   <Users className="h-5 w-5" />
//                 </div>
//                 <h3 className="font-semibold">Team Collaboration</h3>
//               </div>
//               <p className="text-green-100 text-sm mb-4">
//                 Create meeting room and invite teammates to collaborate
//               </p>
//               <div className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors text-center">
//                 Invite Team
//               </div>
//             </div>
//           </div>

//           {/* Meeting Form Modal */}
//           {showMeetingForm && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
//                 <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     {createdMeetingId ? 'Share Meeting Room' : 'Create Meeting Room'}
//                   </h2>
//                   <button
//                     onClick={handleCloseForm}
//                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>

//                 <div className="p-6">
//                   {createdMeetingId ? (
//                     <div className="space-y-6">
//                       <div className="text-center">
//                         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                           <Share2 className="h-8 w-8 text-green-600" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           Meeting Room Created!
//                         </h3>
//                         <p className="text-gray-600 text-sm">
//                           Share this QR code or link with your team to join the meeting.
//                         </p>
//                       </div>

//                       <QRCodeDisplay url={createdMeetingUrl} />
                  
//                       <div className="flex gap-3 pt-4">
//                         <button
//                           onClick={handleCreateNewMeeting}
//                           className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                         >
//                           Create Another
//                         </button>
//                         <a
//                           href={`/meeting/${createdMeetingId}/join`}
//                           className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
//                         >
//                           Join Meeting
//                         </a>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       <div className="text-center mb-4">
//                         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                           <Users className="h-8 w-8 text-blue-600" />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                           Create Team Meeting
//                         </h3>
//                         <p className="text-gray-600 text-sm">
//                           Set up a meeting room and invite your team members to collaborate.
//                         </p>
//                       </div>

//                       <MeetingForm onMeetingCreated={handleMeetingCreated} />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/app/sidebar';
import { Header } from '@/components/app/header';
import { MeetingForm } from '@/components/app/meeting-form';
import { QRCodeDisplay } from '@/components/app/qr-code-display';
import { 
  Mic2, 
  FileText, 
  Users, 
  X, 
  Share2, 
  Calendar,
  Clock,
  Video,
  MessageSquare,
  BarChart3,
  Plus,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Meeting {
  id: string;
  name: string;
  time: string;
  transcripts?: any[];
  participants?: string[];
  createdBy?: string;
}

export default function Page() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState<string | null>(null);
  const [createdMeetingUrl, setCreatedMeetingUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'recent' | 'upcoming'>('recent');

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings');
      
      if (!res.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await res.json();
      const meetingsData = Array.isArray(data) ? data : [];
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleMeetingCreated = (meetingId: string) => {
    fetchMeetings();
    const url = `${window.location.origin}/meeting/${meetingId}/join`;
    setCreatedMeetingId(meetingId);
    setCreatedMeetingUrl(url);
  };

  const handleInviteTeam = () => {
    setShowMeetingForm(true);
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  const handleCloseForm = () => {
    setShowMeetingForm(false);
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  const handleCreateNewMeeting = () => {
    setCreatedMeetingId(null);
    setCreatedMeetingUrl('');
  };

  const formatMeetingTime = (timeString: string) => {
    const date = new Date(timeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getRecentMeetings = () => {
    const now = new Date();
    return meetings.filter(meeting => new Date(meeting.time) <= now)
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 5);
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings.filter(meeting => new Date(meeting.time) > now)
                  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                  .slice(0, 5);
  };

  const getMeetingStats = () => {
    const totalMeetings = meetings.length;
    const totalTranscripts = meetings.reduce((acc, meeting) => 
      acc + (meeting.transcripts?.length || 0), 0
    );
    const upcomingCount = getUpcomingMeetings().length;

    return { totalMeetings, totalTranscripts, upcomingCount };
  };

  const stats = getMeetingStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 lg:p-8">
          {/* Hero Section */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Welcome to AudioScribe AI
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Transform your meetings with AI-powered transcription, analysis, and insights
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalMeetings}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transcripts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTranscripts}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Start a new meeting or manage existing ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className="group cursor-pointer"
                      onClick={handleInviteTeam}
                    >
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Team Meeting</h3>
                            <p className="text-blue-100 text-sm opacity-90">Create room & invite team</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-100 text-sm">Get started</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Mic2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Quick Record</h3>
                            <p className="text-gray-600 text-sm">Start instant recording</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Mic2 className="h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI-Powered Features
                  </CardTitle>
                  <CardDescription>
                    Smart tools to enhance your meeting experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Live Transcription</h4>
                        <p className="text-gray-600 text-sm">Real-time speech to text conversion</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Smart Analysis</h4>
                        <p className="text-gray-600 text-sm">AI-powered insights and summaries</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Action Items</h4>
                        <p className="text-gray-600 text-sm">Automatically track decisions & tasks</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Sentiment Analysis</h4>
                        <p className="text-gray-600 text-sm">Understand participant emotions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Meetings List */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Your Meetings</CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {meetings.length} total
                    </Badge>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'recent'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Recent
                    </button>
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'upcoming'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upcoming
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {(activeTab === 'recent' ? getRecentMeetings() : getUpcomingMeetings()).map((meeting) => {
                        const { date, time } = formatMeetingTime(meeting.time);
                        return (
                          <div
                            key={meeting.id}
                            className="group p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                            onClick={() => window.open(`/meeting/${meeting.id}/join`, '_blank')}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                                {meeting.name}
                              </h4>
                              <Badge 
                                variant={activeTab === 'upcoming' ? "default" : "secondary"}
                                className={`${
                                  activeTab === 'upcoming' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {activeTab === 'upcoming' ? 'Upcoming' : 'Completed'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{time}</span>
                              </div>
                            </div>
                            {meeting.transcripts && meeting.transcripts.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <FileText className="h-3 w-3" />
                                <span>{meeting.transcripts.length} transcripts</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {((activeTab === 'recent' && getRecentMeetings().length === 0) || 
                        (activeTab === 'upcoming' && getUpcomingMeetings().length === 0)) && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">
                            {activeTab === 'recent' 
                              ? 'No recent meetings found' 
                              : 'No upcoming meetings scheduled'
                            }
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-3"
                            onClick={handleInviteTeam}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Meeting
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Meeting Form Modal */}
          {showMeetingForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {createdMeetingId ? 'Share Meeting Room' : 'Create Meeting Room'}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  {createdMeetingId ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Share2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Meeting Room Created!
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Share this QR code or link with your team to join the meeting.
                        </p>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                        <div className="flex-1 max-w-sm">
                          <QRCodeDisplay url={createdMeetingUrl} />
                        </div>
                        <div className="flex-1 max-w-md space-y-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">Meeting Link</h4>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={createdMeetingUrl}
                                readOnly
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                              />
                              <Button
                                onClick={() => navigator.clipboard.writeText(createdMeetingUrl)}
                                size="sm"
                                variant="outline"
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p>📧 Share via email or messaging apps</p>
                            <p>📱 Scan QR code with mobile devices</p>
                            <p>🔗 Direct link for quick access</p>
                          </div>
                        </div>
                      </div>
                  
                      <div className="flex gap-3 pt-6">
                        <Button
                          onClick={handleCreateNewMeeting}
                          variant="outline"
                          className="flex-1 h-12 text-lg"
                        >
                          Create Another Meeting
                        </Button>
                        <a
                          href={`/meeting/${createdMeetingId}/join`}
                          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg text-center flex items-center justify-center gap-2"
                        >
                          <Video className="h-5 w-5" />
                          Join Meeting Now
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <MeetingForm onMeetingCreated={handleMeetingCreated} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}