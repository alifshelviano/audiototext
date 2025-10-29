// // // // 'use client';

// // // // import { useState } from 'react';
// // // // import { Switch } from '@/components/ui/switch';
// // // // import { Label } from '@/components/ui/label';

// // // // interface MeetingFormProps {
// // // //   onMeetingCreated: (meetingId: string) => void;
// // // // }

// // // // export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
// // // //   const [name, setName] = useState('');
// // // //   const [time, setTime] = useState(getDefaultTime());
// // // //   const [isPublic, setIsPublic] = useState(false);
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [error, setError] = useState('');

// // // //   const handleSubmit = async (e: React.FormEvent) => {
// // // //     e.preventDefault();
// // // //     setIsLoading(true);
// // // //     setError('');

// // // //     try {
// // // //       const response = await fetch('/api/meetings', {
// // // //         method: 'POST',
// // // //         headers: {
// // // //           'Content-Type': 'application/json',
// // // //         },
// // // //         body: JSON.stringify({ name, time, isPublic }),
// // // //       });

// // // //       if (!response.ok) {
// // // //         let errorMessage = 'Failed to create meeting';
// // // //         try {
// // // //           const errorData = await response.json();
// // // //           errorMessage = errorData.message || errorMessage;
// // // //         } catch {
// // // //           const errorText = await response.text();
// // // //           errorMessage = errorText || errorMessage;
// // // //         }
// // // //         throw new Error(errorMessage);
// // // //       }

// // // //       const data = await response.json();
// // // //       if (data.meetingId) {
// // // //         onMeetingCreated(data.meetingId);
// // // //       } else if (data.id) {
// // // //         onMeetingCreated(data.id);
// // // //       } else {
// // // //         throw new Error('No meeting ID returned from server');
// // // //       }

// // // //       setName('');
// // // //       setTime(getDefaultTime());
// // // //       setIsPublic(false);

// // // //     } catch (err: any) {
// // // //       console.error('Meeting creation error:', err);
// // // //       setError(err.message || 'Failed to create meeting. Please try again.');
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   function getDefaultTime() {
// // // //     const now = new Date();
// // // //     now.setHours(now.getHours() + 1);
// // // //     return now.toISOString().slice(0, 16);
// // // //   }

// // // //   return (
// // // //     <form onSubmit={handleSubmit} className="space-y-4">
// // // //       {error && (
// // // //         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
// // // //           <p className="text-red-800 text-sm">{error}</p>
// // // //         </div>
// // // //       )}

// // // //       <div>
// // // //         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
// // // //           Meeting Name *
// // // //         </label>
// // // //         <input
// // // //           id="name"
// // // //           type="text"
// // // //           value={name}
// // // //           onChange={(e) => setName(e.target.value)}
// // // //           placeholder="e.g., Team Standup, Project Review..."
// // // //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // // //           required
// // // //           disabled={isLoading}
// // // //         />
// // // //       </div>

// // // //       <div>
// // // //         <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
// // // //           Meeting Time *
// // // //         </label>
// // // //         <input
// // // //           id="time"
// // // //           type="datetime-local"
// // // //           value={time}
// // // //           onChange={(e) => setTime(e.target.value)}
// // // //           min={new Date().toISOString().slice(0, 16)}
// // // //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // // //           required
// // // //           disabled={isLoading}
// // // //         />
// // // //       </div>

// // // //       <div className="flex items-center justify-between">
// // // //         <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
// // // //           <Switch
// // // //             id="is-public"
// // // //             checked={isPublic}
// // // //             onCheckedChange={setIsPublic}
// // // //             disabled={isLoading}
// // // //           />
// // // //           <span>Make this a public meeting</span>
// // // //         </Label>
// // // //       </div>

// // // //       <button
// // // //         type="submit"
// // // //         disabled={isLoading || !name || !time}
// // // //         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
// // // //       >
// // // //         {isLoading ? (
// // // //           <span className="flex items-center justify-center gap-2">
// // // //             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
// // // //             Creating Meeting Room...
// // // //           </span>
// // // //         ) : (
// // // //           'Create Meeting Room'
// // // //         )}
// // // //       </button>
// // // //     </form>
// // // //   );
// // // // }

// // // "use client";

// // // import { useState } from "react";
// // // import { Switch } from "@/components/ui/switch";
// // // import { Label } from "@/components/ui/label";

// // // interface MeetingFormProps {
// // //   onMeetingCreated: (meetingId: string) => void;
// // // }

// // // export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
// // //   const [name, setName] = useState("");
// // //   const [time, setTime] = useState(getDefaultTime());
// // //   const [isPublic, setIsPublic] = useState(true); // Default to public
// // //   const [language, setLanguage] = useState("english");
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [error, setError] = useState("");

// // //   const handleSubmit = async (e: React.FormEvent) => {
// // //     e.preventDefault();
// // //     setIsLoading(true);
// // //     setError("");

// // //     try {
// // //       const response = await fetch("/api/meetings", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify({
// // //           name,
// // //           time,
// // //           isPublic,
// // //           language,
// // //         }),
// // //       });

// // //       if (!response.ok) {
// // //         let errorMessage = "Failed to create meeting";
// // //         try {
// // //           const errorData = await response.json();
// // //           errorMessage = errorData.message || errorMessage;
// // //         } catch {
// // //           const errorText = await response.text();
// // //           errorMessage = errorText || errorMessage;
// // //         }
// // //         throw new Error(errorMessage);
// // //       }

// // //       const data = await response.json();
// // //       if (data.meetingId) {
// // //         onMeetingCreated(data.meetingId);
// // //       } else if (data.id) {
// // //         onMeetingCreated(data.id);
// // //       } else {
// // //         throw new Error("No meeting ID returned from server");
// // //       }

// // //       // Reset form
// // //       setName("");
// // //       setTime(getDefaultTime());
// // //       setIsPublic(true);
// // //       setLanguage("english");
// // //     } catch (err: any) {
// // //       console.error("Meeting creation error:", err);
// // //       setError(err.message || "Failed to create meeting. Please try again.");
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   function getDefaultTime() {
// // //     const now = new Date();
// // //     now.setHours(now.getHours() + 1);
// // //     return now.toISOString().slice(0, 16);
// // //   }

// // //   return (
// // //     <form onSubmit={handleSubmit} className="space-y-4">
// // //       {error && (
// // //         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
// // //           <p className="text-red-800 text-sm">{error}</p>
// // //         </div>
// // //       )}

// // //       <div>
// // //         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
// // //           Meeting Name *
// // //         </label>
// // //         <input
// // //           id="name"
// // //           type="text"
// // //           value={name}
// // //           onChange={(e) => setName(e.target.value)}
// // //           placeholder="e.g., Team Standup, Project Review..."
// // //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //           required
// // //           disabled={isLoading}
// // //         />
// // //       </div>

// // //       <div>
// // //         <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
// // //           Meeting Time *
// // //         </label>
// // //         <input
// // //           id="time"
// // //           type="datetime-local"
// // //           value={time}
// // //           onChange={(e) => setTime(e.target.value)}
// // //           min={new Date().toISOString().slice(0, 16)}
// // //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //           required
// // //           disabled={isLoading}
// // //         />
// // //       </div>

// // //       {/* Language Selection */}
// // //       <div>
// // //         <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
// // //           Discussion Language *
// // //         </label>
// // //         <select
// // //           id="language"
// // //           value={language}
// // //           onChange={(e) => setLanguage(e.target.value)}
// // //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// // //           required
// // //           disabled={isLoading}
// // //         >
// // //           <option value="english">English</option>
// // //           <option value="indonesian">Indonesian</option>
// // //           <option value="korean">Korean</option>
// // //         </select>
// // //         <p className="text-xs text-gray-500 mt-1">This will affect transcription and summary language</p>
// // //       </div>

// // //       {/* Privacy Settings */}
// // //       <div className="space-y-3">
// // //         <div className="flex items-center justify-between">
// // //           <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
// // //             <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isLoading} />
// // //             <span>Public Meeting</span>
// // //           </Label>
// // //         </div>

// // //         {!isPublic && (
// // //           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
// // //             <p className="text-yellow-800 text-sm">
// // //               <strong>Private Meeting:</strong> Participants will need a passkey to join this meeting. A unique passkey will be generated when you create the meeting.
// // //             </p>
// // //           </div>
// // //         )}

// // //         {isPublic && (
// // //           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
// // //             <p className="text-blue-800 text-sm">
// // //               <strong>Public Meeting:</strong> Anyone with the meeting link can join without a passkey.
// // //             </p>
// // //           </div>
// // //         )}
// // //       </div>

// // //       <button
// // //         type="submit"
// // //         disabled={isLoading || !name || !time}
// // //         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
// // //       >
// // //         {isLoading ? (
// // //           <span className="flex items-center justify-center gap-2">
// // //             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
// // //             Creating Meeting Room...
// // //           </span>
// // //         ) : (
// // //           "Create Meeting Room"
// // //         )}
// // //       </button>
// // //     </form>
// // //   );
// // // }

// // "use client";

// // import { useState } from "react";
// // import { Switch } from "@/components/ui/switch";
// // import { Label } from "@/components/ui/label";

// // interface MeetingFormProps {
// //   onMeetingCreated: (meetingId: string) => void;
// // }

// // type Language = "english" | "indonesian" | "korean";

// // export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
// //   const [name, setName] = useState("");
// //   const [time, setTime] = useState(getDefaultTime());
// //   const [isPublic, setIsPublic] = useState(true); // Default to public
// //   const [language, setLanguage] = useState<Language>("english");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   // components/app/meeting-form.tsx
// //   // Add this to your existing handleSubmit function:

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setIsLoading(true);
// //     setError("");

// //     try {
// //       const response = await fetch("/api/meetings", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           name,
// //           time,
// //           isPublic,
// //           language,
// //         }),
// //       });

// //       if (!response.ok) {
// //         let errorMessage = "Failed to create meeting";
// //         try {
// //           const errorData = await response.json();
// //           errorMessage = errorData.message || errorMessage;
// //         } catch {
// //           const errorText = await response.text();
// //           errorMessage = errorText || errorMessage;
// //         }
// //         throw new Error(errorMessage);
// //       }

// //       const data = await response.json();

// //       // Debug log to see the actual response structure
// //       console.log("API Response:", data);

// //       // Call the callback with the entire response data
// //       onMeetingCreated(data);

// //       // Reset form
// //       setName("");
// //       setTime(getDefaultTime());
// //       setIsPublic(true);
// //       setLanguage("english");
// //     } catch (err: any) {
// //       console.error("Meeting creation error:", err);
// //       setError(err.message || "Failed to create meeting. Please try again.");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   function getDefaultTime() {
// //     const now = new Date();
// //     now.setHours(now.getHours() + 1);
// //     return now.toISOString().slice(0, 16);
// //   }

// //   const languageOptions = [
// //     { value: "english", label: "English", flag: "🇺🇸" },
// //     { value: "indonesian", label: "Indonesian", flag: "🇮🇩" },
// //     { value: "korean", label: "Korean", flag: "🇰🇷" },
// //   ];

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-4">
// //       {error && (
// //         <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
// //           <p className="text-red-800 text-sm">{error}</p>
// //         </div>
// //       )}

// //       <div>
// //         <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
// //           Meeting Name *
// //         </label>
// //         <input
// //           id="name"
// //           type="text"
// //           value={name}
// //           onChange={(e) => setName(e.target.value)}
// //           placeholder="e.g., Team Standup, Project Review..."
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //           required
// //           disabled={isLoading}
// //         />
// //       </div>

// //       <div>
// //         <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
// //           Meeting Time *
// //         </label>
// //         <input
// //           id="time"
// //           type="datetime-local"
// //           value={time}
// //           onChange={(e) => setTime(e.target.value)}
// //           min={new Date().toISOString().slice(0, 16)}
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //           required
// //           disabled={isLoading}
// //         />
// //       </div>

// //       <div>
// //         <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
// //           Discussion Language *
// //         </label>
// //         <select
// //           id="language"
// //           value={language}
// //           onChange={(e) => setLanguage(e.target.value as Language)}
// //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //           required
// //           disabled={isLoading}
// //         >
// //           {languageOptions.map((option) => (
// //             <option key={option.value} value={option.value}>
// //               {option.flag} {option.label}
// //             </option>
// //           ))}
// //         </select>
// //         <p className="text-xs text-gray-500 mt-1">This will be used for transcription and summary generation</p>
// //       </div>

// //       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
// //         <div className="flex-1">
// //           <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
// //             <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isLoading} />
// //             <span>{isPublic ? "Public Meeting" : "Private Meeting"}</span>
// //           </Label>
// //           <p className="text-xs text-gray-500 mt-1 ml-10">{isPublic ? "Anyone with the link can join" : "Participants need a passkey to join"}</p>
// //         </div>
// //       </div>

// //       {!isPublic && (
// //         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
// //           <div className="flex items-center gap-2 mb-2">
// //             <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
// //               <span className="text-yellow-800 text-sm">🔒</span>
// //             </div>
// //             <span className="text-sm font-medium text-yellow-800">Private Meeting</span>
// //           </div>
// //           <p className="text-xs text-yellow-700">A passkey will be automatically generated for this meeting. Share it only with intended participants.</p>
// //         </div>
// //       )}

// //       <button
// //         type="submit"
// //         disabled={isLoading || !name || !time}
// //         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
// //       >
// //         {isLoading ? (
// //           <span className="flex items-center justify-center gap-2">
// //             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //             Creating Meeting Room...
// //           </span>
// //         ) : (
// //           "Create Meeting Room"
// //         )}
// //       </button>
// //     </form>
// //   );
// // }

// // components/app/meeting-form.tsx
// "use client";

// import { useState } from "react";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";

// interface MeetingFormProps {
//   onMeetingCreated: (meetingData: any) => void; // Updated to accept full meeting data
// }

// type Language = "english" | "indonesian" | "korean";

// export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
//   const [name, setName] = useState("");
//   const [time, setTime] = useState(getDefaultTime());
//   const [isPublic, setIsPublic] = useState(true);
//   const [language, setLanguage] = useState<Language>("english");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       console.log("Submitting meeting data:", { name, time, isPublic, language });

//       const response = await fetch("/api/meetings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           time,
//           isPublic,
//           language,
//         }),
//       });

//       const responseText = await response.text();
//       console.log("Raw API response:", responseText);

//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error("Failed to parse JSON response:", parseError);
//         throw new Error("Invalid response from server");
//       }

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create meeting");
//       }

//       console.log("API Response data:", data);

//       // Call the callback with the entire response data
//       onMeetingCreated(data);

//       // Reset form
//       setName("");
//       setTime(getDefaultTime());
//       setIsPublic(true);
//       setLanguage("english");
//     } catch (err: any) {
//       console.error("Meeting creation error:", err);
//       setError(err.message || "Failed to create meeting. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   function getDefaultTime() {
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     return now.toISOString().slice(0, 16);
//   }

//   const languageOptions = [
//     { value: "english", label: "English", flag: "🇺🇸" },
//     { value: "indonesian", label: "Indonesian", flag: "🇮🇩" },
//     { value: "korean", label: "Korean", flag: "🇰🇷" },
//   ];

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

//       <div>
//         <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
//           Discussion Language *
//         </label>
//         <select
//           id="language"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value as Language)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//           disabled={isLoading}
//         >
//           {languageOptions.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.flag} {option.label}
//             </option>
//           ))}
//         </select>
//         <p className="text-xs text-gray-500 mt-1">This will be used for transcription and summary generation</p>
//       </div>

//       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//         <div className="flex-1">
//           <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
//             <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isLoading} />
//             <span>{isPublic ? "Public Meeting" : "Private Meeting"}</span>
//           </Label>
//           <p className="text-xs text-gray-500 mt-1 ml-10">{isPublic ? "Anyone with the link can join" : "Participants need a passkey to join"}</p>
//         </div>
//       </div>

//       {!isPublic && (
//         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
//               <span className="text-yellow-800 text-sm">🔒</span>
//             </div>
//             <span className="text-sm font-medium text-yellow-800">Private Meeting</span>
//           </div>
//           <p className="text-xs text-yellow-700">A passkey will be automatically generated for this meeting. Share it only with intended participants.</p>
//         </div>
//       )}

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
//           "Create Meeting Room"
//         )}
//       </button>
//     </form>
//   );
// }

// components/app/meeting-form.tsx
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MeetingFormProps {
  onMeetingCreated: (meetingData: any) => void;
}

type Language = "english" | "indonesian" | "korean";

export function MeetingForm({ onMeetingCreated }: MeetingFormProps) {
  const [name, setName] = useState("");
  const [time, setTime] = useState(getDefaultTime());
  const [isPublic, setIsPublic] = useState(true);
  const [language, setLanguage] = useState<Language>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Submitting meeting data:", { name, time, isPublic, language });

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          time,
          isPublic,
          language,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create meeting";
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
      console.log("API Response data:", data);

      // Ensure we have a valid meeting ID
      if (!data.meetingId && !data.id) {
        throw new Error("No meeting ID returned from server");
      }

      // Call the callback with the entire response data
      onMeetingCreated(data);

      // Reset form
      setName("");
      setTime(getDefaultTime());
      setIsPublic(true);
      setLanguage("english");
    } catch (err: any) {
      console.error("Meeting creation error:", err);
      setError(err.message || "Failed to create meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  function getDefaultTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  }

  const languageOptions = [
    { value: "english", label: "English", flag: "🇺🇸" },
    { value: "indonesian", label: "Indonesian", flag: "🇮🇩" },
    { value: "korean", label: "Korean", flag: "🇰🇷" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Team Standup, Project Review..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Time *
        </label>
        <input
          id="time"
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Discussion Language *
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.flag} {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">This will be used for transcription and summary generation</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="is-public" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} disabled={isLoading} />
            <span>{isPublic ? "Public Meeting" : "Private Meeting"}</span>
          </Label>
          <p className="text-xs text-gray-500 mt-1 ml-10">{isPublic ? "Anyone with the link can join" : "Participants need a passkey to join"}</p>
        </div>
      </div>

      {!isPublic && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-800 text-sm">🔒</span>
            </div>
            <span className="text-sm font-medium text-yellow-800">Private Meeting</span>
          </div>
          <p className="text-xs text-yellow-700">A passkey will be automatically generated for this meeting. Share it only with intended participants.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !name || !time}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Meeting Room...
          </span>
        ) : (
          "Create Meeting Room"
        )}
      </button>
    </form>
  );
}
