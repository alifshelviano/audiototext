'use client';

import React from 'react';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processAudio, type FormState } from '@/app/actions';

import { Header } from '@/components/app/header';
import { AudioInputForm } from '@/components/app/audio-input-form';
import { SummaryDisplay } from '@/components/app/summary-display';

const initialState: FormState = {
  summary: undefined,
  transcription: undefined,
  error: undefined,
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(processAudio, initialState);
  const [summaryText, setSummaryText] = React.useState('');
  const [formKey, setFormKey] = React.useState(Date.now());
  const formRef = React.useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  React.useEffect(() => {
    if (state.summary) {
      setSummaryText(state.summary);
    } else {
      setSummaryText('');
    }
  }, [state.summary, state.transcription]);

  const handleReset = () => {
    formRef.current?.reset();
    setSummaryText('');
    // Resetting the form by changing the key is a reliable way to clear its state
    setFormKey(Date.now());
    // We also clear the server action state by calling it with no data.
    // This is a bit of a workaround for the lack of a built-in reset for useActionState.
    formAction(new FormData());
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <form action={formAction} ref={formRef} key={formKey} className="space-y-8">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-6 flex flex-col">
                  <div className="text-center lg:text-left">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-foreground">
                      Record, Transcribe, Summarize
                    </h1>
                    <p className="mt-3 max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                      Turn your spoken words into structured summaries. Record a new memo, upload an existing file, and let AI do the rest.
                    </p>
                  </div>
                  <AudioInputForm onReset={handleReset} isPending={isPending}/>
                </div>
                <SummaryDisplay
                  transcription={state.transcription}
                  summary={summaryText}
                  onSummaryChange={setSummaryText}
                  hasResult={!!state.summary || !!state.transcription}
                  isPending={isPending}
                />
              </div>
          </form>
      </main>
    </div>
  );
}
