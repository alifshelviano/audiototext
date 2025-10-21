'use server';

/**
 * @fileOverview Summarizes transcribed text using Gemini.
 *
 * - summarizeTranscribedText - A function that takes transcribed text as input and returns a summary.
 * - SummarizeTranscribedTextInput - The input type for the summarizeTranscribedText function.
 * - SummarizeTranscribedTextOutput - The return type for the summarizeTranscribedText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscribedTextInputSchema = z.object({
  transcribedText: z
    .string()
    .describe('The transcribed text to be summarized.'),
});
export type SummarizeTranscribedTextInput = z.infer<
  typeof SummarizeTranscribedTextInputSchema
>;

const SummarizeTranscribedTextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the transcribed text.'),
});
export type SummarizeTranscribedTextOutput = z.infer<
  typeof SummarizeTranscribedTextOutputSchema
>;

export async function summarizeTranscribedText(
  input: SummarizeTranscribedTextInput
): Promise<SummarizeTranscribedTextOutput> {
  return summarizeTranscribedTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscribedTextPrompt',
  input: {schema: SummarizeTranscribedTextInputSchema},
  output: {schema: SummarizeTranscribedTextOutputSchema},
  prompt: `Summarize the following text: {{{transcribedText}}}`,
});

const summarizeTranscribedTextFlow = ai.defineFlow(
  {
    name: 'summarizeTranscribedTextFlow',
    inputSchema: SummarizeTranscribedTextInputSchema,
    outputSchema: SummarizeTranscribedTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
