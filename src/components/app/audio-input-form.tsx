'use client';

import {useState, useRef, useTransition, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {addTranscriptToMeeting, addSummaryToMeeting} from '@/app/meetings';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {summarizeTranscribedText} from '@/ai/flows/summarize-transcribed-text';
import {transcribeAudioElevenLabs} from '@/ai/flows/transcribe-audio-eleven-labs';

const formSchema = z.object({
  name: z.string().min(2, {message: 'Name must be at least 2 characters.'}),
});

interface AudioInputFormProps {
  meetingId: string;
}

export function AudioInputForm({meetingId}: AudioInputFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const visualize = () => {
    if (canvasRef.current && analyserRef.current && dataArrayRef.current) {
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        if (canvasCtx) {
          canvasCtx.fillStyle = 'rgb(243 244 246)';
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'rgb(31 41 55)';
          canvasCtx.beginPath();

          const sliceWidth = (canvas.width * 1.0) / analyser.frequencyBinCount;
          let x = 0;

          for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

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
    }
  };

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
        visualize();
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioData = reader.result as string;
          onSubmit(base64AudioData);
        };
        audioChunksRef.current = [];
      };
    }
  };

  async function onSubmit(audioDataUri: string) {
    startTransition(async () => {
      const {transcription} = await transcribeAudioElevenLabs({audioDataUri});
      await addTranscriptToMeeting({
        meetingId,
        transcript: transcription,
        name: form.getValues('name'),
      });
    });
  }

  const handleSummarize = () => {
    startTransition(async () => {
      const {summary} = await summarizeTranscribedText({meetingId});
      await addSummaryToMeeting({meetingId, summary});
    });
  };

  return (
    <Form {...form}>
      <div className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <canvas ref={canvasRef} className="w-full h-20 bg-gray-200 rounded-lg"></canvas>
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <Button onClick={handleStartRecording} disabled={isPending || !form.watch('name')}>
              Start Recording
            </Button>
          ) : (
            <Button onClick={handleStopRecording} disabled={isPending} variant="destructive">
              Stop Recording
            </Button>
          )}
          <Button onClick={handleSummarize} disabled={isPending}>
            Summarize
          </Button>
          {isPending && <p>Processing...</p>}
        </div>
      </div>
    </Form>
  );
}
