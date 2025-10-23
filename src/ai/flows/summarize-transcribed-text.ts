'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {getMeeting} from '@/app/meetings';

const SummarizeTranscribedTextInputSchema = z.object({
  meetingId: z.string().describe('The ID of the meeting to summarize.'),
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
    const meeting = await getMeeting({meetingId: input.meetingId});
    const transcribedText = meeting?.transcripts
      ?.map((t: any) => `${t.name}: ${t.transcript}`)
      .join('\n');

    if (!transcribedText) {
        return {summary: 'No transcripts to summarize.'};
    }

    const prompt = `Summarize the following meeting transcripts:\n\n${transcribedText}`;

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
