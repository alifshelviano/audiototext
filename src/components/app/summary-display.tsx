'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PenSquare, Users, BrainCircuit } from 'lucide-react';

type SummaryDisplayProps = {
  transcription?: string;
  summary: string;
  onSummaryChange: (value: string) => void;
  hasResult: boolean;
  isPending: boolean;
};

function ProcessingState() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-2"><Skeleton className="h-6 w-1/4" /></h3>
        <div className="space-y-2 rounded-md border bg-muted/50 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold flex items-center mb-2"><Skeleton className="h-6 w-1/3" /></h3>
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function InitialState() {
    return (
        <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-muted p-8 text-center">
            <BrainCircuit className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your Summary Awaits</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Record or upload an audio file to get started. The transcribed text and its AI-powered summary will appear here.
            </p>
        </div>
    );
}

export function SummaryDisplay({
  transcription,
  summary,
  onSummaryChange,
  hasResult,
  isPending
}: SummaryDisplayProps) {

    const showInitialState = !isPending && !hasResult;
    const showResults = !isPending && hasResult;
    
    return (
        <Card className="h-full">
        <CardHeader>
            <CardTitle>2. AI Analysis</CardTitle>
            <CardDescription>Transcription and summary of your audio.</CardDescription>
        </CardHeader>
        <CardContent>
            {isPending && <ProcessingState />}
            {showInitialState && <InitialState />}
            {showResults && (
                <div className="space-y-6 animate-in fade-in-50">
                {transcription && (
                    <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Full Transcription
                    </h3>
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm">
                        <p className="whitespace-pre-wrap">{transcription}</p>
                    </div>
                    </div>
                )}
                {summary && (
                    <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        <PenSquare className="mr-2 h-5 w-5" />
                        Editable Summary
                    </h3>
                    <Textarea
                        value={summary}
                        onChange={(e) => onSummaryChange(e.target.value)}
                        className="min-h-[200px] text-base"
                        placeholder="Your summary will appear here..."
                    />
                    <p className="text-xs text-muted-foreground">You can edit this summary before saving or exporting.</p>
                    </div>
                )}
                </div>
            )}
        </CardContent>
        </Card>
    );
}
