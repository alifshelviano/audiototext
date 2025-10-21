'use server';

import { summarizeTranscribedText } from '@/ai/flows/summarize-transcribed-text';
import { transcribeAudioElevenLabs } from '@/ai/flows/transcribe-audio-eleven-labs';
import { z } from 'zod';

const elevenLabsApiKey = 'sk_c2e70bd2315899aa49a41a6faf0e0dfd4fe2c49092bafdc4';

const processAudioSchema = z.object({
  audioDataUri: z.string().refine(val => val.startsWith('data:audio/'), {
    message: 'Invalid audio data URI',
  }),
});

export type FormState = {
  transcription?: string;
  summary?: string;
  error?: string;
};

export async function processAudio(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const audioDataUri = formData.get('audioDataUri');
    const validatedFields = processAudioSchema.safeParse({ audioDataUri });

    if (!validatedFields.success || !validatedFields.data.audioDataUri) {
      return { error: 'Invalid or missing audio data. Please record or upload again.' };
    }

    // 1. Transcribe Audio
    const transcriptionResult = await transcribeAudioElevenLabs({
      audioDataUri: validatedFields.data.audioDataUri,
      elevenLabsApiKey,
    });

    if (!transcriptionResult.transcription || transcriptionResult.transcription.trim() === '') {
      return { error: 'Failed to transcribe audio. The recording might be silent or in an unsupported format.' };
    }

    // 2. Summarize Transcription
    const summaryResult = await summarizeTranscribedText({
      transcribedText: transcriptionResult.transcription,
    });

    if (!summaryResult.summary) {
      return { error: 'Failed to generate summary from the transcription.' };
    }

    return {
      transcription: transcriptionResult.transcription,
      summary: summaryResult.summary,
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      error: `Processing failed: ${errorMessage}`,
    };
  }
}
