// 'use client';

// import { useState } from 'react';

// interface MeetingFormProps {
//   onMeetingCreated: (meetingId: string) => void;
// }

// export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
//   const [name, setName] = useState('');
//   const [time, setTime] = useState(getDefaultTime());
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/meetings', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, time }),
//       });

//       // Check if response is OK
//       if (!response.ok) {
//         let errorMessage = 'Failed to create meeting';
        
//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.message || errorMessage;
//         } catch {
//           // If response is not JSON, get text
//           const errorText = await response.text();
//           errorMessage = errorText || errorMessage;
//         }
        
//         throw new Error(errorMessage);
//       }

//       // Parse successful response
//       const data = await response.json();

//       // Call the callback with the meeting ID
//       if (data.meetingId) {
//         onMeetingCreated(data.meetingId);
//       } else if (data.id) {
//         onMeetingCreated(data.id);
//       } else {
//         throw new Error('No meeting ID returned from server');
//       }

//       // Reset form
//       setName('');
//       setTime(getDefaultTime());

//     } catch (err: any) {
//       console.error('Meeting creation error:', err);
//       setError(err.message || 'Failed to create meeting. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Generate default time (current time + 1 hour)
//   function getDefaultTime() {
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     return now.toISOString().slice(0, 16);
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-800 text-sm">{error}</p>
//         </div>
//       )}
      
//       <div>
//         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//           Meeting Name *
//         </label>
//         <input
//           id="name"
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="e.g., Team Standup, Project Review..."
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//           disabled={isLoading}
//         />
//       </div>
      
//       <div>
//         <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
//           Meeting Time *
//         </label>
//         <input
//           id="time"
//           type="datetime-local"
//           value={time}
//           onChange={(e) => setTime(e.target.value)}
//           min={new Date().toISOString().slice(0, 16)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//           disabled={isLoading}
//         />
//       </div>
      
//       <button
//         type="submit"
//         disabled={isLoading || !name || !time}
//         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
//       >
//         {isLoading ? (
//           <span className="flex items-center justify-center gap-2">
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//             Creating Meeting Room...
//           </span>
//         ) : (
//           'Create Meeting Room'
//         )}
//       </button>
//     </form>
//   );
// }

'use client';

import { useState } from 'react';
import { Calendar, Users, Globe, Lock, Video, Settings, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface MeetingFormProps {
  onMeetingCreated: (meetingId: string) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface MeetingSettings {
  language: string;
  visibility: 'public' | 'private';
  autoRecord: boolean;
  allowGuests: boolean;
}

const SUPPORTED_LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

export function MeetingForm({ onMeetingCreated, currentUser }: MeetingFormProps) {
  const [name, setName] = useState('');
  const [time, setTime] = useState(getDefaultJakartaTime());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<MeetingSettings>({
    language: 'id',
    visibility: 'public',
    autoRecord: false,
    allowGuests: true,
  });

  // Get current Jakarta time (UTC+7)
  function getDefaultJakartaTime(): string {
    const now = new Date();
    // Convert to Jakarta time (UTC+7)
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    // Add 1 hour
    jakartaTime.setHours(jakartaTime.getHours() + 1);
    return jakartaTime.toISOString().slice(0, 16);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          time,
          settings,
          createdBy: currentUser?.id || 'anonymous',
          creatorName: currentUser?.name || 'Anonymous User'
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create meeting';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.meetingId) {
        onMeetingCreated(data.meetingId);
      } else if (data.id) {
        onMeetingCreated(data.id);
      } else {
        throw new Error('No meeting ID returned from server');
      }

      // Reset form
      setName('');
      setTime(getDefaultJakartaTime());
      setSettings({
        language: 'id',
        visibility: 'public',
        autoRecord: false,
        allowGuests: true,
      });

    } catch (err: any) {
      console.error('Meeting creation error:', err);
      setError(err.message || 'Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof MeetingSettings>(key: K, value: MeetingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.flag || '🌐';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Video className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Meeting Room
        </CardTitle>
        <CardDescription className="text-lg text-gray-600 mt-2">
          Set up your virtual meeting space with custom settings
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-red-800 text-sm flex-1">{error}</p>
          </div>
        )}

        {currentUser && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">{currentUser.name}</p>
              <p className="text-sm text-blue-700">Room Creator</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Meeting Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Standup, Project Review, Client Meeting..."
                className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                Meeting Time (Jakarta Time) *
              </Label>
              <div className="relative">
                <Input
                  id="time"
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  min={getDefaultJakartaTime()}
                  className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pl-12"
                  required
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-gray-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                All times are displayed in Jakarta time (UTC+7)
              </p>
            </div>
          </div>

          {/* Meeting Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Meeting Settings</h3>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
              <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                Meeting Language
              </Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger className="w-full h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLanguageFlag(settings.language)}</span>
                      <span>{getLanguageName(settings.language)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visibility Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Room Visibility
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('visibility', 'public')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                      settings.visibility === 'public'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('visibility', 'private')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                      settings.visibility === 'private'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Guest Access
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('allowGuests', true)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                      settings.allowGuests
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Allowed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('allowGuests', false)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all ${
                      !settings.allowGuests
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Restricted</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <Label htmlFor="autoRecord" className="font-medium text-gray-900 cursor-pointer">
                    Auto-record Meeting
                  </Label>
                  <p className="text-sm text-gray-600">Automatically start recording when meeting begins</p>
                </div>
              </div>
              <Switch
                id="autoRecord"
                checked={settings.autoRecord}
                onCheckedChange={(checked) => updateSetting('autoRecord', checked)}
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">Room Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium">{getLanguageName(settings.language)} {getLanguageFlag(settings.language)}</span>
              </div>
              <div className="flex justify-between">
                <span>Visibility:</span>
                <span className="font-medium capitalize">{settings.visibility}</span>
              </div>
              <div className="flex justify-between">
                <span>Guest Access:</span>
                <span className="font-medium">{settings.allowGuests ? 'Allowed' : 'Restricted'}</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-record:</span>
                <span className="font-medium">{settings.autoRecord ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !name || !time}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Your Meeting Room...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Video className="w-5 h-5" />
                Create Meeting Room
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
