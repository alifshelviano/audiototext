'use server';
/**
 * @fileOverview Transcribes audio to text using the OpenAI Whisper API.
 *
 * - transcribeAudioOpenAI - A function that transcribes audio to text.
 * - TranscribeAudioOpenAIInput - The input type for the transcribeAudioOpenAI function.
 * - TranscribeAudioOpenAIOutput - The return type for the transcribeAudioOpenAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioOpenAIInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type TranscribeAudioOpenAIInput = z.infer<typeof TranscribeAudioOpenAIInputSchema>;

const TranscribeAudioOpenAIOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text.'),
});
export type TranscribeAudioOpenAIOutput = z.infer<typeof TranscribeAudioOpenAIOutputSchema>;

export async function transcribeAudioOpenAI(
  input: TranscribeAudioOpenAIInput
): Promise<TranscribeAudioOpenAIOutput> {
  return transcribeAudioOpenAIFlow(input);
}

const transcribeAudioOpenAIFlow = ai.defineFlow(
  {
    name: 'transcribeAudioOpenAIFlow',
    inputSchema: TranscribeAudioOpenAIInputSchema,
    outputSchema: TranscribeAudioOpenAIOutputSchema,
  },
  async input => {
    const {audioDataUri} = input;
    const eliceApiKey = process.env.ELICE_API_KEY;

    if (!eliceApiKey) {
      throw new Error('Elice API key is not configured. Please set the ELICE_API_KEY environment variable.');
    }

    // Extract base64 audio data
    const base64Audio = audioDataUri.split(',')[1];
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    // Determine mime type and file extension
    const mimeType = audioDataUri.substring(audioDataUri.indexOf(':') + 1, audioDataUri.indexOf(';'));
    const fileExtension = mimeType.split('/')[1] || 'wav';

    // Create FormData according to Elice API documentation
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: mimeType }), `audio.${fileExtension}`);
    formData.append('model', 'whisper-large-v3');
    formData.append('return_timestamps', 'true'); // Required for long audio
    formData.append('language', 'indonesian'); // change language auto ? indonesian/english/korean

    console.log('Sending audio to Elice Whisper with timestamps enabled...');

    const response = await fetch(
      'https://mlapi.run/805a20fb-b66b-4b7c-84fb-079c12b76937/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${eliceApiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Elice API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    
    // Debug: log the full response to see the actual structure
    console.log('Full Elice API response:', JSON.stringify(data, null, 2));
    
    // Extract transcription from chunked long-form response
    let transcription = '';
    
    if (data.chunks && Array.isArray(data.chunks)) {
      // Chunked long-form response - extract text from each chunk
      console.log(`Processing ${data.chunks.length} audio chunks`);
      transcription = data.chunks
        .map((chunk: any) => {
          // Handle different possible chunk structures
          if (chunk.text) {
            return chunk.text;
          } else if (chunk.transcript) {
            return chunk.transcript;
          } else if (typeof chunk === 'string') {
            return chunk;
          }
          return '';
        })
        .filter((text: string) => text.trim().length > 0)
        .join(' ')
        .replace(/\s+/g, ' ') // Clean up extra spaces
        .trim();
        
    } else if (data.text) {
      // Direct text response (for short audio)
      transcription = data.text;
    } else if (data.transcript && data.transcript.text) {
      // Nested transcript structure
      transcription = data.transcript.text;
    } else if (Array.isArray(data)) {
      // Response is an array of segments
      transcription = data
        .map((segment: any) => segment.text || segment.transcript || '')
        .join(' ')
        .trim();
    } else if (typeof data === 'string') {
      // Plain string response
      transcription = data;
    } else {
      // Fallback: try to find any text in the response
      console.warn('Unexpected response structure, searching for text:', data);
      
      // Recursively search for text fields
      const findTextFields = (obj: any): string[] => {
        const texts: string[] = [];
        if (typeof obj === 'string') {
          texts.push(obj);
        } else if (Array.isArray(obj)) {
          obj.forEach(item => texts.push(...findTextFields(item)));
        } else if (typeof obj === 'object' && obj !== null) {
          Object.values(obj).forEach(value => texts.push(...findTextFields(value)));
        }
        return texts.filter(text => text.trim().length > 0 && text.length < 1000); // Filter out very long strings
      };
      
      const foundTexts = findTextFields(data);
      transcription = foundTexts.join(' ').trim() || JSON.stringify(data);
    }

    // Clean up the transcription - remove any repeated phrases or artifacts
    if (transcription) {
      // Basic cleaning for repeated phrases 
      const words = transcription.split(' ');
      const uniqueWords: string[] = [];
      let repeatCount = 0;
      
      for (let i = 0; i < words.length; i++) {
        if (i > 0 && words[i] === words[i-1]) {
          repeatCount++;
          if (repeatCount < 3) { // Allow up to 2 repeats, remove beyond that
            uniqueWords.push(words[i]);
          }
        } else {
          repeatCount = 0;
          uniqueWords.push(words[i]);
        }
      }
      
      transcription = uniqueWords.join(' ');
    }

    console.log('Final transcription length:', transcription.length);
    console.log('Transcription preview:', transcription.substring(0, 200) + '...');

    return {transcription: transcription || ''};
  }
);
