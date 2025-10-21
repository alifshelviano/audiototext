'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, Upload, StopCircle, FileAudio, Loader2, BrainCircuit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

type AudioInputFormProps = {
  onReset: () => void;
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

export function AudioInputForm({ onReset }: AudioInputFormProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hiddenAudioDataUriInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { pending } = useFormStatus();

  const hasAudio = !!audioBlob || !!audioFile;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  useEffect(() => {
    const fileToProcess = audioFile || (audioBlob ? new File([audioBlob], "recording.webm", { type: "audio/webm" }) : null);

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

  const handleStartRecording = async () => {
    try {
      if (hasAudio) handleLocalReset();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      
      const audioChunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
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
    if(uploadInputRef.current) uploadInputRef.current.value = '';
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>1. Provide Audio</CardTitle>
        <CardDescription>Record a new audio clip or upload an existing file.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
          <input type="hidden" name="audioDataUri" ref={hiddenAudioDataUriInputRef} />
          <Tabs defaultValue="record" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record" disabled={pending}><Mic className="mr-2 h-4 w-4" /> Record</TabsTrigger>
              <TabsTrigger value="upload" disabled={pending}><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
            </TabsList>
            <div className="flex-1 mt-4">
              <TabsContent value="record" className="h-full">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-8 text-center h-full">
                  {isRecording ? (
                    <>
                      <p className="font-mono text-2xl font-semibold text-primary">{formatTime(recordingTime)}</p>
                      <p className="text-sm text-muted-foreground">Recording in progress...</p>
                      <Button onClick={handleStopRecording} variant="destructive"><StopCircle className="mr-2 h-4 w-4" /> Stop Recording</Button>
                    </>
                  ) : audioBlob ? (
                      <>
                          <FileAudio className="h-10 w-10 text-primary" />
                          <p className="text-sm font-medium">Recording complete!</p>
                          <p className="text-xs text-muted-foreground">Ready to be analyzed.</p>
                      </>
                  ) : (
                    <>
                      <Mic className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click the button to start recording.</p>
                      <Button onClick={handleStartRecording}><Mic className="mr-2 h-4 w-4" /> Start Recording</Button>
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="upload" className="h-full">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-8 text-center h-full">
                  {audioFile ? (
                      <>
                          <FileAudio className="h-10 w-10 text-primary" />
                          <p className="text-sm font-medium truncate max-w-full">{audioFile.name}</p>
                          <p className="text-xs text-muted-foreground">Ready to be analyzed.</p>
                      </>
                  ) : (
                      <>
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                          <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" ref={uploadInputRef} />
                          <Button type="button" onClick={() => uploadInputRef.current?.click()}>Select File</Button>
                      </>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <SubmitButton hasAudio={hasAudio} />
            {hasAudio && !pending && (
                <Button type="button" variant="outline" onClick={onReset} className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
