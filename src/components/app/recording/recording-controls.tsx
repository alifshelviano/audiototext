"use client";


import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { addTranscriptToMeeting, getMeeting } from "@/lib/services/meeting-service";
import { transcribeAudioOpenAI } from "@/ai/flows/transcribe-audio-openai";
import { useSocket } from "@/hooks/use-socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Square, Users, Volume2, MessageSquare, Wifi, WifiOff } from "lucide-react";


interface RecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
  compact?: boolean;
  showLabels?: boolean;
}


export function RecordingControls({ meetingId, onTranscriptAdded, compact = false, showLabels = true }: RecordingControlsProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [meetingLanguage, setMeetingLanguage] = useState<"english" | "indonesian" | "korean">("english");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  // Initialize Socket.IO
  const { isConnected, isReconnecting, on, sendTranscript, updateStatus } = useSocket({
    meetingId,
    userName: user?.name,
    autoConnect: true,
  });


  // Fetch meeting language
  useEffect(() => {
    const fetchMeetingLanguage = async () => {
      try {
        const meeting = await getMeeting({ meetingId });
        if (meeting) {
          setMeetingLanguage(meeting.language);
        }
      } catch (error) {
        console.error("Error fetching meeting language:", error);
      }
    };


    if (meetingId) {
      fetchMeetingLanguage();
    }
  }, [meetingId]);


  // Socket event listeners
  useEffect(() => {
    if (!isConnected) return;


    // Handle user joined
    const cleanup1 = on("user-joined", ({ userName }) => {
      console.log("User joined:", userName);
      setOnlineUsers((prev) => {
        if (!prev.includes(userName)) {
          return [...prev, userName];
        }
        return prev;
      });
    });


    // Handle user left
    const cleanup2 = on("user-left", ({ userName }) => {
      console.log("User left:", userName);
      setOnlineUsers((prev) => prev.filter((u) => u !== userName));
      setActiveSpeakers((prev) => prev.filter((u) => u !== userName));
    });


    // Handle status updates for active speakers
    const cleanup3 = on("status-update", ({ userName, status }) => {
      if (status === "recording") {
        setActiveSpeakers((prev) => {
          if (!prev.includes(userName)) {
            return [...prev, userName];
          }
          return prev;
        });
      } else {
        setActiveSpeakers((prev) => prev.filter((u) => u !== userName));
      }
    });


    // Handle new transcripts from other users
    const cleanup4 = on("transcript-added", (transcript) => {
      console.log("New transcript received:", transcript);
      if (onTranscriptAdded) {
        onTranscriptAdded();
      }
    });


    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
      cleanup4();
    };
  }, [isConnected, on, onTranscriptAdded]);


  // Update status when recording state changes
  useEffect(() => {
    if (!user || !isConnected) return;


    if (isRecording) {
      updateStatus(meetingId, user.name, "recording");
    } else {
      updateStatus(meetingId, user.name, "online");
    }
  }, [isRecording, isConnected, meetingId, user, updateStatus]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };


  const visualize = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;


    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const analyser = analyserRef.current;


    if (!canvasCtx) return;


    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !canvasCtx) {
        // Clean up if references are lost
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }


      animationFrameRef.current = requestAnimationFrame(draw);


      // Re-check dataArrayRef since it might become null during cleanup
      if (!dataArrayRef.current) return;


      analyser.getByteFrequencyData(dataArrayRef.current);


      canvasCtx.fillStyle = "#f8fafc";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);


      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;
      setAudioLevel(average);


      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let x = 0;


      for (let i = 0; i < dataArrayRef.current.length; i++) {
        if (i % 2 === 0) {
          const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;


          // Create gradient based on audio level
          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);


          if (average > 60) {
            gradient.addColorStop(0, "#dc2626");
            gradient.addColorStop(1, "#ef4444");
          } else if (average > 30) {
            gradient.addColorStop(0, "#2563eb");
            gradient.addColorStop(1, "#3b82f6");
          } else {
            gradient.addColorStop(0, "#059669");
            gradient.addColorStop(1, "#10b981");
          }


          canvasCtx.fillStyle = gradient;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        }
        x += barWidth;
      }
    };


    draw();
  }, []);


  const processAudio = useCallback(async () => {
    if (processingRef.current || audioChunksRef.current.length === 0) return;


    processingRef.current = true;
    setIsProcessing(true);


    try {
      const audioBlob = new Blob([...audioChunksRef.current], { type: "audio/webm" });
      audioChunksRef.current = [];


      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64AudioData = reader.result as string;


        if (base64AudioData.length > 1000 && user) {
          const { transcription } = await transcribeAudioOpenAI({
            audioDataUri: base64AudioData,
            language: meetingLanguage,
          });


          if (transcription && transcription.trim().length > 0) {
            const transcript = {
              name: user.name,
              transcript: transcription,
              createdAt: new Date(),
            };


            // Save to database
            await addTranscriptToMeeting({
              meetingId,
              transcript,
            });


            // Broadcast via Socket.IO to other users
            sendTranscript(meetingId, transcript);


            if (onTranscriptAdded) {
              onTranscriptAdded();
            }
          }
        }


        processingRef.current = false;
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [meetingId, user, onTranscriptAdded, meetingLanguage, sendTranscript]);


  const handleStartRecording = async () => {
    if (!user) {
      alert("Please join the meeting to start recording");
      return;
    }


    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;


      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);


      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;


      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };


      mediaRecorder.start(2000);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioLevel(0);


      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);


      // Start visualization with a small delay to ensure everything is set up
      setTimeout(() => {
        if (canvasRef.current && analyserRef.current && dataArrayRef.current) {
          visualize();
        }
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };


  const handleStopRecording = () => {
    // Stop animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }


    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }


    // Stop media recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }


    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }


    // Clear references
    analyserRef.current = null;
    dataArrayRef.current = null;


    setIsRecording(false);
    setAudioLevel(0);


    // Process audio if media recorder is set up
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        processAudio();
      };
    }
  };


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStopRecording(); // Use the same cleanup logic
    };
  }, []);


  const getVolumeStatus = () => {
    if (audioLevel > 60) return { text: "Loud", color: "text-red-600", bgColor: "bg-red-100" };
    if (audioLevel > 30) return { text: "Good", color: "text-green-600", bgColor: "bg-green-100" };
    if (audioLevel > 10) return { text: "Medium", color: "text-blue-600", bgColor: "bg-blue-100" };
    return { text: "Low", color: "text-gray-600", bgColor: "bg-gray-100" };
  };


  const volumeStatus = getVolumeStatus();


  if (!user) {
    return null;
  }


  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
        {/* Header with connection status and user info */}
        {showLabels && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-blue-200 shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>


              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                  <div className={`flex items-center gap-1 ${isConnected ? "text-green-600" : "text-red-600"}`}>
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 capitalize">Language: {meetingLanguage}</p>
              </div>
            </div>


            {/* Online users counter */}
            {onlineUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{onlineUsers.length}</span>
              </div>
            )}
          </div>
        )}


        {/* Recording status and controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {isRecording ? (
              <div className="space-y-2">
                {showLabels && (
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="px-3 py-1 border border-red-300 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording • {formatTime(recordingTime)}</span>
                      </div>
                    </Badge>


                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm font-medium ${volumeStatus.color}`}>{volumeStatus.text}</span>
                    </div>
                  </div>
                )}


                {/* Audio visualization */}
                {showLabels && (
                  <div className="mt-2">
                    <canvas ref={canvasRef} width={300} height={40} className="w-full h-10 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-inner" />
                  </div>
                )}
              </div>
            ) : (
              showLabels &&
              !isProcessing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Ready to record</span>
                </div>
              )
            )}
          </div>


          {/* Control button */}
          <div className="flex-shrink-0">
            {isRecording ? (
              <Button onClick={handleStopRecording} size="sm" variant="destructive" className={`h-10 ${showLabels ? "px-4" : "px-3"} font-semibold shadow-md hover:shadow-lg transition-all`}>
                <Square className="w-4 h-4" />
                {showLabels && <span className="ml-2">Stop</span>}
              </Button>
            ) : (
              <Button
                onClick={handleStartRecording}
                size="sm"
                className={`h-10 ${showLabels ? "px-4" : "px-3"} bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-md hover:shadow-lg transition-all`}
                disabled={isProcessing || !isConnected}
              >
                <Mic className="w-4 h-4" />
                {showLabels && <span className="ml-2">{isProcessing ? "Processing..." : "Start"}</span>}
              </Button>
            )}
          </div>
        </div>


     
      </div>
    );
  }


  // Full version
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-200 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>


          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 ${isConnected ? "text-green-600" : "text-red-600"}`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              <span className="text-sm text-gray-500 capitalize">
                {isConnected ? "Connected" : "Disconnected"} • {meetingLanguage}
              </span>
            </div>
          </div>
        </div>


        {/* Online users */}
        <div className="flex items-center gap-4">
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="w-4 h-4 text-blue-600" />
              <div className="text-center">
                <div className="font-semibold text-blue-700">{onlineUsers.length}</div>
                <div className="text-xs text-blue-600">Online</div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Main content */}
      <div className="space-y-6">
        {/* Recording button */}
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            size="lg"
            className={`h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all ${
              isRecording ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" : "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            }`}
            disabled={isProcessing || !isConnected}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>


        {/* Recording status */}
        {isRecording && (
          <div className="text-center space-y-4">
            <Badge variant="destructive" className="px-4 py-2 text-base border border-red-300 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Recording • {formatTime(recordingTime)}</span>
              </div>
            </Badge>


            {/* Audio visualization */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-inner">
              <canvas ref={canvasRef} width={400} height={80} className="w-full h-20" />


              {/* Volume indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <span className={`text-sm font-medium ${volumeStatus.color}`}>Volume: {volumeStatus.text}</span>
              </div>
            </div>
          </div>
        )}


        {/* Processing state */}
        {isProcessing && (
          <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-medium">Processing audio...</div>
            <div className="text-sm text-blue-600 mt-1">Please wait while we transcribe your recording</div>
          </div>
        )}


        
      </div>
    </div>
  );
}



