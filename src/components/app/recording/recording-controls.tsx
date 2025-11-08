import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { addTranscriptToMeeting, getMeeting } from "@/lib/services/meeting-service";
import { transcribeAudioOpenAI } from "@/ai/flows/transcribe-audio-openai";
import { useSocket } from "@/hooks/use-socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Square, Users, Volume2, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { WaveLoader } from "@/components/ui/wave-loader";

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
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isConnected, isReconnecting, on, sendTranscript, updateStatus } = useSocket({
    meetingId,
    userName: user?.name,
    autoConnect: true,
  });

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

  useEffect(() => {
    if (!isConnected) return;

    const cleanup1 = on("user-joined", ({ userName }) => {
      console.log("User joined:", userName);
      setOnlineUsers((prev) => {
        if (!prev.includes(userName)) {
          return [...prev, userName];
        }
        return prev;
      });
    });

    const cleanup2 = on("user-left", ({ userName }) => {
      console.log("User left:", userName);
      setOnlineUsers((prev) => prev.filter((u) => u !== userName));
      setActiveSpeakers((prev) => prev.filter((u) => u !== userName));
    });

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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);

      if (!dataArrayRef.current) return;

      analyser.getByteFrequencyData(dataArrayRef.current);

      canvasCtx.fillStyle = "transparent";
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

            await addTranscriptToMeeting({
              meetingId,
              transcript,
            });

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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setIsRecording(false);
    setAudioLevel(0);

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        processAudio();
      };
    }
  };

  useEffect(() => {
    return () => {
      handleStopRecording();
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
    if (!showLabels) {
      return (
        <div className="p-2">
          <div className="flex flex-col items-center justify-center gap-4">
            {isRecording && (
              <div className="w-full max-w-xs">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={60}
                    className="w-full h-12 sm:h-14"
                  />
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Volume2 className="w-3 h-3 text-gray-500" />
                    <span className={cn("text-xs font-medium", volumeStatus.color)}>{volumeStatus.text}</span>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              size="icon"
              className={cn(
                "h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center", // Reduced from h-20 w-20
                isRecording
                  ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse"
                  : "bg-gradient-to-br from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              disabled={isProcessing || !isConnected}
            >
              {isProcessing ? <WaveLoader /> : (isRecording ? <Square className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />)} {/* Reduced icon size */}
            </Button>
            
            {isRecording && (
              <Badge variant="destructive" className="px-3 py-1 text-xs border border-red-300 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="font-medium">{formatTime(recordingTime)}</span>
                </div>
              </Badge>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-200 shadow-sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                <div className={cn("flex items-center gap-1", isConnected ? "text-green-600" : "text-red-600")}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                </div>
              </div>
              <p className="text-xs text-gray-500 capitalize">Language: {meetingLanguage}</p>
            </div>
          </div>

          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{onlineUsers.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {isRecording ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="destructive" className="px-3 py-1 border border-red-300 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Recording • {formatTime(recordingTime)}</span>
                    </div>
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className={cn("text-sm font-medium", volumeStatus.color)}>{volumeStatus.text}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <canvas ref={canvasRef} width={300} height={40} className="w-full h-10 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-inner" />
                </div>
              </div>
            ) : (
              !isProcessing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>Ready to record</span>
                </div>
              )
            )}
          </div>

          <div className="flex-shrink-0">
            {isRecording ? (
              <Button onClick={handleStopRecording} size="sm" variant="destructive" className="h-10 px-4 font-semibold shadow-md hover:shadow-lg transition-all animate-pulse">
                <Square className="w-4 h-4" />
                <span className="ml-2">Stop</span>
              </Button>
            ) : (
              <Button
                onClick={handleStartRecording}
                size="sm"
                className="h-10 px-4 bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 font-semibold shadow-md hover:shadow-lg transition-all"
                disabled={isProcessing || !isConnected}
              >
                {isProcessing ? <WaveLoader /> : <Mic className="w-4 h-4" />} 
                <span className="ml-2">{isProcessing ? "Processing..." : "Start"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-200 shadow-sm">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">{getUserInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("flex items-center gap-1", isConnected ? "text-green-600" : "text-red-600")}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
              </div>
              <span className="text-sm text-gray-500 capitalize">
                {isConnected ? "Connected" : "Disconnected"} • {meetingLanguage}
              </span>
            </div>
          </div>
        </div>

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

      <div className="space-y-6">
        <div className="flex justify-center items-center h-32">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            size="lg"
            className={cn(
              "h-20 w-20 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center", // Reduced from h-24 w-24
              isRecording
                ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse"
                : "bg-gradient-to-br from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
            disabled={isProcessing || !isConnected}
          >
            {isProcessing ? <WaveLoader /> : (isRecording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />)} {/* Reduced icon size */}
          </Button>
        </div>

        {isRecording && (
          <div className="text-center space-y-4">
            <Badge variant="destructive" className="px-4 py-2 text-base border border-red-300 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Recording • {formatTime(recordingTime)}</span>
              </div>
            </Badge>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-inner">
              <canvas ref={canvasRef} width={400} height={80} className="w-full h-20" />

              <div className="flex items-center justify-center gap-2 mt-3">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <span className={cn("text-sm font-medium", volumeStatus.color)}>Volume: {volumeStatus.text}</span>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Processing audio...</p>
          </div>
        )}
      </div>
    </div>
  );
}