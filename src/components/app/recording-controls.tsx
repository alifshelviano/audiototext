'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from "@/app/AuthProvider";
import { addTranscriptToMeeting, getMeeting } from "@/app/meetings";
import { transcribeAudioOpenAI } from "@/ai/flows/transcribe-audio-openai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Square, Circle, User, Volume2, Pause, Play } from "lucide-react";

interface RecordingControlsProps {
  meetingId: string;
  onTranscriptAdded?: () => void;
  compact?: boolean;
}

export function RecordingControls({ meetingId, onTranscriptAdded, compact = false }: RecordingControlsProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [meetingLanguage, setMeetingLanguage] = useState<"english" | "indonesian" | "korean">("english");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      if (!analyserRef.current || !dataArrayRef.current || !canvasCtx || isPaused) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = "#f9fafb";
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
          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);

          if (average > 60) {
            gradient.addColorStop(0, "#ef4444");
            gradient.addColorStop(0.7, "#f97316");
            gradient.addColorStop(1, "#f59e0b");
          } else if (average > 30) {
            gradient.addColorStop(0, "#3b82f6");
            gradient.addColorStop(0.7, "#06b6d4");
            gradient.addColorStop(1, "#22d3ee");
          } else {
            gradient.addColorStop(0, "#10b981");
            gradient.addColorStop(0.7, "#059669");
            gradient.addColorStop(1, "#34d399");
          }

          canvasCtx.fillStyle = gradient;
          const barY = canvas.height - barHeight;
          const borderRadius = 2;

          canvasCtx.beginPath();
          canvasCtx.moveTo(x + borderRadius, barY);
          canvasCtx.lineTo(x + barWidth - borderRadius, barY);
          canvasCtx.quadraticCurveTo(x + barWidth, barY, x + barWidth, barY + borderRadius);
          canvasCtx.lineTo(x + barWidth, canvas.height);
          canvasCtx.lineTo(x, canvas.height);
          canvasCtx.lineTo(x, barY + borderRadius);
          canvasCtx.quadraticCurveTo(x, barY, x + borderRadius, barY);
          canvasCtx.closePath();
          canvasCtx.fill();
        }

        x += barWidth;
      }
    };

    draw();
  }, [isPaused]);

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
            await addTranscriptToMeeting({
              meetingId,
              transcript: {
                name: user.name,
                transcript: transcription,
                createdAt: new Date(),
              },
            });

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
  }, [meetingId, user, onTranscriptAdded, meetingLanguage]);

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
      setIsPaused(false);
      setRecordingTime(0);
      setAudioLevel(0);

      timerRef.current = setInterval(() => {
        if (!isPaused) {
          setRecordingTime((prev) => prev + 1);
        }
      }, 1000);

      setTimeout(() => {
        visualize();
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        visualize();
      } else {
        mediaRecorderRef.current.pause();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setIsPaused(false);
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
    return null; // Don't render if no user/guest
  }

  if (compact) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10 border border-blue-200">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                {isRecording && (
                  <Badge variant={isPaused ? "secondary" : "destructive"} className="px-2 py-1 text-xs">
                    <div className="flex items-center gap-1">
                      {!isPaused && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                      <span>
                        {isPaused ? "Paused" : "Recording"} • {formatTime(recordingTime)}
                      </span>
                    </div>
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs font-medium ${volumeStatus.color}`}>{volumeStatus.text}</span>
                    </div>
                    <div className="text-xs text-gray-500">{isPaused ? "⏸️ Paused" : audioLevel > 60 ? "🎤 Speaking clearly" : audioLevel > 30 ? "🎤 Good volume" : "🎤 Speak louder"}</div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    <span className="text-xs text-gray-500">Ready to record ({meetingLanguage})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isRecording && !isPaused && (
            <div className="flex-1 max-w-md">
              <canvas ref={canvasRef} width={300} height={50} className="w-full h-12 rounded-lg border border-gray-200 bg-gray-50" />
            </div>
          )}

          {isRecording && isPaused && (
            <div className="flex-1 max-w-md flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Pause className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Recording Paused</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <Button onClick={handleStopRecording} size="sm" variant="destructive" className="h-9 px-3">
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </>
            ) : (
              <Button onClick={handleStartRecording} size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-4" disabled={isProcessing}>
                <Mic className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Start"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12 border-2 border-blue-200">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-blue-600 text-white font-semibold">{getUserInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">Ready to record ({meetingLanguage})</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Button onClick={isRecording ? handleStopRecording : handleStartRecording} size="lg" className={`h-14 w-14 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>

        {isRecording && (
          <div className="text-center">
            <Badge variant="destructive" className="mb-2">
              Recording • {formatTime(recordingTime)}
            </Badge>
            <canvas ref={canvasRef} width={400} height={80} className="w-full h-20 rounded-lg border border-gray-200" />
          </div>
        )}
      </div>
    </div>
  );
}
