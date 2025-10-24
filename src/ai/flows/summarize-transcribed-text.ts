'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeTranscribedTextInputSchema = z.object({
  transcribedText: z.string().describe('The transcribed text to summarize.'),
});
export type SummarizeTranscribedTextInput = z.infer<
  typeof SummarizeTranscribedTextInputSchema
>;

const SummarizeTranscribedTextOutputSchema = z.object({
    summary: z.string().describe('The summarized text.'),
});
export type SummarizeTranscribedTextOutput = z.infer<
    typeof SummarizeTranscribedTextOutputSchema
>;

export const summarizeTranscribedTextFlow = ai.defineFlow(
  {
    name: 'summarizeTranscribedTextFlow',
    inputSchema: SummarizeTranscribedTextInputSchema,
    outputSchema: SummarizeTranscribedTextOutputSchema,
  },
  async (input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> => {

    if (!input.transcribedText) {
        return {summary: 'No transcripts to summarize.'};
    }

    const prompt = `Summarize the following meeting transcripts:\n\n${input.transcribedText}`;

    const llmResponse = await ai.generate({prompt});
    const summary = llmResponse.text;

    return {summary};
  }
);

export async function summarizeTranscribedText(
    input: SummarizeTranscribedTextInput
    ): Promise<SummarizeTranscribedTextOutput> {
    return summarizeTranscribedTextFlow(input);
}
