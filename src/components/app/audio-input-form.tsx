'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, Upload, StopCircle, FileAudio, Loader2, BrainCircuit, Trash2, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

type AudioInputFormProps = {
  onReset: () => void;
  isPending: boolean;
};

function SubmitButton({ hasAudio }: { hasAudio: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending || !hasAudio}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <BrainCircuit className="mr-2 h-4 w-4" />
          Analyze Audio
        </>
      )}
    </Button>
  );
}

export function AudioInputForm({ onReset, isPending }: AudioInputFormProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenAudioDataUriInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const waveformRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const hasAudio = !!audioBlob || !!audioFile;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const fileToProcess = audioFile || (audioBlob ? new File([audioBlob], 'recording.webm', { type: 'audio/webm' }) : null);

    if (fileToProcess && hiddenAudioDataUriInputRef.current) {
      const reader = new FileReader();
      reader.readAsDataURL(fileToProcess);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (hiddenAudioDataUriInputRef.current) {
          hiddenAudioDataUriInputRef.current.value = base64data;
        }
      };
    } else {
      if (hiddenAudioDataUriInputRef.current) {
        hiddenAudioDataUriInputRef.current.value = '';
      }
    }
  }, [audioFile, audioBlob]);

  const drawWaveform = () => {
    if (!analyserRef.current || !waveformRef.current) return;

    const canvas = waveformRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current?.getByteTimeDomainData(dataArray);

      if (canvasCtx) {
        canvasCtx.fillStyle = '#333'; // Same as dark background
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#fff';
        canvasCtx.beginPath();

        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }
    };

    draw();
  };

  const handleStartRecording = async () => {
    try {
      if (hasAudio) handleLocalReset();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      const audioChunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.01);
      }, 10);

      drawWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions and ensure you are on a secure (HTTPS) connection.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (hasAudio) handleLocalReset();
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleLocalReset = () => {
    setAudioBlob(null);
    setAudioFile(null);
    setRecordingTime(0);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (waveformRef.current) {
      const canvasCtx = waveformRef.current.getContext('2d');
      if(canvasCtx) canvasCtx.clearRect(0, 0, waveformRef.current.width, waveformRef.current.height);
    }
  };

  const formatTime = (seconds: number) => {
    const wholeSeconds = Math.floor(seconds);
    const hundredths = Math.round((seconds - wholeSeconds) * 100);
    const mins = Math.floor(wholeSeconds / 60);
    const secs = wholeSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(hundredths).padStart(2, '0')}`;
  };

  return (
    <Card className="flex-1 flex flex-col bg-[#333] text-white border-0">
      <CardContent className="flex-1 flex flex-col p-4">
        <input type="hidden" name="audioDataUri" ref={hiddenAudioDataUriInputRef} />
        <Tabs defaultValue="record" className="flex-1 flex flex-col">
          <div className="flex-1 my-4 relative">
            <TabsContent value="record" className="h-full">
              <div className="flex flex-col items-center justify-between rounded-lg h-full">
                <div className="w-full flex justify-between text-xs text-gray-400">
                  <span>00:01.60</span>
                  <span>00:03.20</span>
                  <span>00:04.80</span>
                  <span>00:06.40</span>
                </div>
                <div className="relative w-full h-48 flex items-center justify-center">
                    <canvas ref={waveformRef} className="w-full h-full absolute top-0 left-0" />
                    <div className="absolute h-full w-px bg-red-500 left-1/2"></div>
                </div>
                <div className="w-full flex items-center justify-between p-4 bg-[#222] rounded-lg mt-4">
                    <Mic className="h-6 w-6 text-gray-400" />
                    <div className="flex items-center space-x-4">
                        <Button onClick={isRecording ? handleStopRecording : handleStartRecording} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center">
                            {isRecording ? <StopCircle className="h-8 w-8 text-red-500"/> : <div className="w-8 h-8 rounded-full bg-red-500"></div> }
                        </Button>
                        <p className="font-mono text-2xl font-semibold">{formatTime(recordingTime)}</p>
                    </div>
                    <MoreHorizontal className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
      </CardContent>
    </Card>
  );
}
