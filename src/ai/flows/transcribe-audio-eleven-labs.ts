'use server';
/**
 * @fileOverview Transcribes audio to text using the ElevenLabs API.
 *
 * - transcribeAudioElevenLabs - A function that transcribes audio to text.
 * - TranscribeAudioElevenLabsInput - The input type for the transcribeAudioElevenLabs function.
 * - TranscribeAudioElevenLabsOutput - The return type for the transcribeAudioElevenLabs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranscribeAudioElevenLabsInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type TranscribeAudioElevenLabsInput = z.infer<typeof TranscribeAudioElevenLabsInputSchema>;

const TranscribeAudioElevenLabsOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text.'),
});
export type TranscribeAudioElevenLabsOutput = z.infer<typeof TranscribeAudioElevenLabsOutputSchema>;

export async function transcribeAudioElevenLabs(
  input: TranscribeAudioElevenLabsInput
): Promise<TranscribeAudioElevenLabsOutput> {
  return transcribeAudioElevenLabsFlow(input);
}

export const transcribeAudioElevenLabsFlow = ai.defineFlow(
  {
    name: 'transcribeAudioElevenLabsFlow',
    inputSchema: TranscribeAudioElevenLabsInputSchema,
    outputSchema: TranscribeAudioElevenLabsOutputSchema,
  },
  async input => {
    const {audioDataUri} = input;
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key is not configured. Please set the ELEVENLABS_API_KEY environment variable.');
    }

    // Extract base64 audio data
    const base64Audio = audioDataUri.split(',')[1];
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    // Determine mime type
    const mimeType = audioDataUri.substring(audioDataUri.indexOf(':') + 1, audioDataUri.indexOf(';'));

    // Call ElevenLabs API to transcribe audio
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: mimeType }), `audio.${mimeType.split('/')[1]}`);
    formData.append('model_id', 'scribe_v1');

    const response = await fetch(
      'https://api.elevenlabs.io/v1/speech-to-text',
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
       const errorText = await response.text();
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    const transcription = data.text;

    return {transcription};
  }
);
