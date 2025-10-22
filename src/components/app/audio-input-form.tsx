'use client';

import {useState, useRef, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {addTranscript} from '@/app/meetings';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(2, {message: 'Name must be at least 2 characters.'}),
});

interface AudioInputFormProps {
  meetingId: string;
  onTranscriptReceived: (transcript: {name: string; text: string}) => void;
}

export function AudioInputForm({meetingId, onTranscriptReceived}: AudioInputFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioData = reader.result as string;
          const name = form.getValues('name');
          if (name) {
            onSubmit({name}, base64AudioData);
          } else {
            form.trigger('name');
          }
        };
        audioChunksRef.current = [];
      };
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>, audioDataUri: string) {
    startTransition(async () => {
      const {transcript} = await addTranscript({
        meetingId,
        userName: values.name,
        audioUrl: audioDataUri, // The backend expects a data URI here
      });
      onTranscriptReceived({name: values.name, text: transcript});
    });
  }

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
          {isPending && <p>Transcribing...</p>}
        </div>
      </div>
    </Form>
  );
}
