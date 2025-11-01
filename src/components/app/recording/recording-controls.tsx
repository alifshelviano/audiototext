"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { addTranscriptToMeeting, getMeeting } from "@/lib/services/meeting-service";
import { transcribeAudioOpenAI } from "@/ai/flows/transcribe-audio-openai";
import { useSocket } from "@/hooks/use-socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Square, Users, Volume2, MessageSquare } from "lucide-react";

interface RecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
  compact?: boolean;
  showLabels?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function RecordingControls({ meetingId, onTranscriptAdded, compact = false, showLabels = true, onRecordingStateChange }: RecordingControlsProps) {
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
  const { isConnected, isReconnecting, on, sendTranscript, updateStatus, joinMeeting } = useSocket({
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
    const dataArray = dataArrayRef.current;

    if (!canvasCtx) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !canvasCtx) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "#f8fafc";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setAudioLevel(average);

      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        if (i % 2 === 0) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

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
      onRecordingStateChange?.(true); // Notify parent component
      setRecordingTime(0);
      setAudioLevel(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      setTimeout(() => {
        visualize();
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      onRecordingStateChange?.(false); // Notify parent component
      setAudioLevel(0);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      mediaRecorderRef.current.onstop = () => {
        processAudio();
      };
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && streamRef.current) {
        mediaRecorderRef.current.stop();
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        {/* Header with connection status and user info - conditionally show based on showLabels */}
        {showLabels && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                </div>
                <p className="text-xs text-gray-500">Language: {meetingLanguage}</p>
              </div>
            </div>

            {/* Online users counter */}
            {onlineUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
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
                    <Badge variant="destructive" className="px-3 py-1">
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
                    <canvas ref={canvasRef} width={300} height={40} className="w-full h-10 rounded-lg bg-gray-50 border border-gray-200" />
                  </div>
                )}
              </div>
            ) : (
              showLabels && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Ready to record {isProcessing && "(Processing...)"}</span>
                </div>
              )
            )}
          </div>

          {/* Control button */}
          <div className="flex-shrink-0">
            {isRecording ? (
              <Button onClick={handleStopRecording} size="sm" variant="destructive" className={`h-10 ${showLabels ? "px-4" : "px-3"} font-semibold`}>
                <Square className="w-4 h-4" />
                {showLabels && <span className="ml-2">Stop</span>}
              </Button>
            ) : (
              <Button onClick={handleStartRecording} size="sm" className={`h-10 ${showLabels ? "px-4" : "px-3"} bg-blue-600 hover:bg-blue-700 font-semibold`} disabled={isProcessing || !isConnected}>
                <Mic className="w-4 h-4" />
                {showLabels && <span className="ml-2">{isProcessing ? "Processing..." : "Start"}</span>}
              </Button>
            )}
          </div>
        </div>

        {/* Active speakers */}
        {showLabels && activeSpeakers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>Active: {activeSpeakers.join(", ")}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full version (unchanged)
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-500">
                {isConnected ? "Connected" : "Disconnected"} • {meetingLanguage}
              </span>
            </div>
          </div>
        </div>

        {/* Online users */}
        <div className="flex items-center gap-4">
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
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
            className={`h-16 w-16 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={isProcessing || !isConnected}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>

        {/* Recording status */}
        {isRecording && (
          <div className="text-center space-y-4">
            <Badge variant="destructive" className="px-4 py-2 text-base">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Recording • {formatTime(recordingTime)}</span>
              </div>
            </Badge>

            {/* Audio visualization */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
          <div className="text-center py-4">
            <div className="text-gray-600 font-medium">Processing audio...</div>
            <div className="text-sm text-gray-500 mt-1">Please wait while we transcribe your recording</div>
          </div>
        )}

        {/* Active speakers */}
        {activeSpeakers.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Active Speakers</span>
            </div>
            <div className="text-sm text-blue-700">{activeSpeakers.join(", ")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
