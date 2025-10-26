// // 'use server';

// // import {ai} from '@/ai/genkit';
// // import {z} from 'zod';

// // const SummarizeTranscribedTextInputSchema = z.object({
// //   transcribedText: z.string().describe('The transcribed text to summarize.'),
// // });
// // export type SummarizeTranscribedTextInput = z.infer<
// //   typeof SummarizeTranscribedTextInputSchema
// // >;

// // const SummarizeTranscribedTextOutputSchema = z.object({
// //     summary: z.string().describe('The summarized text.'),
// // });
// // export type SummarizeTranscribedTextOutput = z.infer<
// //     typeof SummarizeTranscribedTextOutputSchema
// // >;

// // export const summarizeTranscribedTextFlow = ai.defineFlow(
// //   {
// //     name: 'summarizeTranscribedTextFlow',
// //     inputSchema: SummarizeTranscribedTextInputSchema,
// //     outputSchema: SummarizeTranscribedTextOutputSchema,
// //   },
// //   async (input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> => {

// //     if (!input.transcribedText) {
// //         return {summary: 'No transcripts to summarize.'};
// //     }

// //     const prompt = `Summarize the following meeting transcripts:\n\n${input.transcribedText}`;

// //     const llmResponse = await ai.generate({prompt});
// //     const summary = llmResponse.text;

// //     return {summary};
// //   }
// // );

// // export async function summarizeTranscribedText(
// //     input: SummarizeTranscribedTextInput
// //     ): Promise<SummarizeTranscribedTextOutput> {
// //     return summarizeTranscribedTextFlow(input);
// // }
// 'use server';

// import {ai} from '@/ai/genkit';
// import {z} from 'zod';

// const SummarizeTranscribedTextInputSchema = z.object({
//   transcribedText: z.string().describe('The complete transcribed text from the meeting.'),
// });
// export type SummarizeTranscribedTextInput = z.infer<
//   typeof SummarizeTranscribedTextInputSchema
// >;

// const SummarizeTranscribedTextOutputSchema = z.object({
//     summary: z.string().describe('The comprehensive meeting analysis in JSON format.'),
// });
// export type SummarizeTranscribedTextOutput = z.infer<
//     typeof SummarizeTranscribedTextOutputSchema
// >;

// export const summarizeTranscribedTextFlow = ai.defineFlow(
//   {
//     name: 'summarizeTranscribedTextFlow',
//     inputSchema: SummarizeTranscribedTextInputSchema,
//     outputSchema: SummarizeTranscribedTextOutputSchema,
//   },
//   async (input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> => {

//     if (!input.transcribedText || input.transcribedText.trim().length === 0) {
//         return {summary: 'No transcripts available to analyze.'};
//     }

//     const prompt = `
// # COMPREHENSIVE MEETING ANALYSIS TASK

// You are an expert meeting analyst. Your task is to thoroughly analyze the ENTIRE meeting transcript and extract ALL possible information to create a complete structured summary.

// ## COMPLETE TRANSCRIPT TO ANALYZE:
// ${input.transcribedText}

// ## ANALYSIS INSTRUCTIONS:

// Carefully read through the entire transcript and extract EVERY piece of meaningful information. You MUST:

// ### 1. IDENTIFY ALL PARTICIPANTS
// - List every person who spoke in the meeting
// - Note their roles or departments if mentioned
// - Track who said what throughout the conversation

// ### 2. EXTRACT ALL DISCUSSION TOPICS
// - Map out every subject discussed, no matter how small
// - Note transitions between topics
// - Identify main themes and sub-topics

// ### 3. CAPTURE ALL DECISIONS MADE
// - Every agreement reached
// - Every approval given
// - Every policy change decided
// - Every strategic direction established

// ### 4. DOCUMENT ALL ACTION ITEMS
// - Every task assigned to someone
// - Every deadline mentioned
// - Every responsibility designated
// - Every follow-up required

// ### 5. RECORD ALL IMPORTANT INFORMATION
// - Numbers, dates, metrics mentioned
// - Project names, code names, product names
// - Technical specifications or requirements
// - Budget figures, timelines, milestones

// ### 6. NOTE ALL QUESTIONS AND ANSWERS
// - Questions raised by participants
// - Answers provided
// - Unresolved questions that need follow-up

// ### 7. ANALYZE MEETING DYNAMICS
// - Who drove the conversation?
// - Were there any disagreements or debates?
// - What was the overall tone?
// - Any notable emotions or urgency?

// ## REQUIRED OUTPUT FORMAT:

// You MUST return a JSON object with the following structure. Be COMPREHENSIVE and include EVERYTHING you found:

// {
//   "meeting_summary": {
//     "title": "Extract the main topic or project name from the transcript",
//     "date": "Extract the meeting date if mentioned, otherwise use today's date",
//     "time": "Extract start and end time if mentioned",
//     "participants": [
//       "List every participant name found",
//       "Include their roles if mentioned"
//     ],
//     "key_points": [
//       "List EVERY major discussion point",
//       "Include specific details and context",
//       "Be thorough and comprehensive"
//     ],
//     "insights_decisions": [
//       "Every decision made during the meeting",
//       "Every important realization or insight",
//       "Every strategic conclusion reached"
//     ],
//     "action_items": [
//       {
//         "task": "Describe the specific task in detail",
//         "assigned_to": "Name of person responsible",
//         "deadline": "Specific deadline if mentioned",
//         "status": "Inferred status (Not Started/In Progress/Completed/Pending)"
//       }
//     ],
//     "next_meeting": {
//       "date": "Date of next meeting if scheduled",
//       "agenda": [
//         "Topics planned for next discussion"
//       ]
//     },
//     "summary_insights": [
//       "Overall conclusions from the meeting",
//       "Strategic implications",
//       "Key takeaways for the organization"
//     ],
//     "important_metrics": [
//       "Any numbers, statistics, or metrics mentioned",
//       "Budget figures, timelines, targets"
//     ],
//     "unresolved_questions": [
//       "Questions that weren't fully answered",
//       "Topics that need further research"
//     ],
//     "technical_details": [
//       "Any technical specifications discussed",
//       "Tools, technologies, or platforms mentioned"
//     ]
//   }
// }

// ## CRITICAL GUIDELINES:

// 1. **BE EXHAUSTIVE**: Leave nothing out. If it was mentioned in the transcript, include it.
// 2. **BE SPECIFIC**: Use exact numbers, names, and details from the transcript.
// 3. **BE ACCURATE**: Only include information that is actually in the transcript.
// 4. **BE ORGANIZED**: Structure the information logically.
// 5. **BE COMPLETE**: Ensure all sections are filled with relevant data.

// ## SPECIAL INSTRUCTIONS:

// - If participants discuss multiple projects, capture all of them
// - If there are side conversations that contain important information, include them
// - Note any changes in direction or pivots in the discussion
// - Capture both explicit and implicit action items
// - Include emotional tone and urgency where relevant

// Now analyze the complete transcript and provide the comprehensive JSON output:
// `;

//     const llmResponse = await ai.generate({prompt});
//     const summary = llmResponse.text;

//     return {summary};
//   }
// );

// export async function summarizeTranscribedText(
//     input: SummarizeTranscribedTextInput
//     ): Promise<SummarizeTranscribedTextOutput> {
//     return summarizeTranscribedTextFlow(input);
// }

// ai/flows/summarize-transcribed-text.ts
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeTranscribedTextInputSchema = z.object({
  transcribedText: z.string().describe('The complete transcribed text from the meeting.'),
});
export type SummarizeTranscribedTextInput = z.infer<
  typeof SummarizeTranscribedTextInputSchema
>;

const SummarizeTranscribedTextOutputSchema = z.object({
    summary: z.string().describe('The comprehensive meeting analysis in JSON format.'),
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

    if (!input.transcribedText || input.transcribedText.trim().length === 0) {
        return {summary: JSON.stringify({
          meeting_summary: {
            title: "No transcripts available",
            date: new Date().toISOString().split('T')[0],
            time: "",
            participants: [],
            key_points: ["No meeting content to analyze"],
            insights_decisions: [],
            action_items: [],
            summary_insights: ["Meeting transcript is empty"],
            important_metrics: [],
            unresolved_questions: [],
            technical_details: []
          }
        }, null, 2)};
    }

    const prompt = `
# COMPREHENSIVE MEETING ANALYSIS TASK

You are an expert meeting analyst. Your task is to analyze the meeting transcript and return ONLY a valid JSON object in the exact structure below.

## TRANSCRIPT TO ANALYZE:
${input.transcribedText}

## REQUIRED JSON STRUCTURE:
{
  "meeting_summary": {
    "title": "string - main topic from transcript",
    "date": "string - meeting date in YYYY-MM-DD format",
    "time": "string - meeting time if mentioned",
    "participants": ["array of participant names"],
    "key_points": ["array of main discussion points"],
    "insights_decisions": ["array of decisions and insights"],
    "action_items": [
      {
        "task": "string - specific task description",
        "assigned_to": "string - person responsible",
        "deadline": "string - deadline if mentioned",
        "status": "Not Started/In Progress/Completed/Pending"
      }
    ],
    "next_meeting": {
      "date": "string - next meeting date if scheduled",
      "agenda": ["array of agenda items"]
    },
    "summary_insights": ["array of overall conclusions"],
    "important_metrics": ["array of numbers/metrics mentioned"],
    "unresolved_questions": ["array of unanswered questions"],
    "technical_details": ["array of technical specifications"]
  }
}

## CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object, no additional text
2. Do not wrap the JSON in markdown code blocks
3. Ensure the JSON is valid and properly formatted
4. Extract information only from the provided transcript
5. If information is not available, use empty arrays or appropriate defaults

## ANALYSIS FOCUS:
- Identify all speakers and their contributions
- Extract main discussion topics and decisions
- Note any action items with assignments
- Capture deadlines and technical details
- Document unresolved questions

Now provide the JSON analysis:
`;

    try {
      const llmResponse = await ai.generate({prompt});
      let summary = llmResponse.text;

      // Clean up the response to ensure it's valid JSON
      summary = summary.trim();
      
      // Remove markdown code blocks if present
      summary = summary.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to parse to validate it's proper JSON
      try {
        const parsed = JSON.parse(summary);
        // If it parses successfully, return it as string
        return {summary: JSON.stringify(parsed, null, 2)};
      } catch (parseError) {
        console.error('AI returned invalid JSON, creating fallback structure:', parseError);
        
        // Create a fallback structure with the raw text
        const fallbackSummary = {
          meeting_summary: {
            title: "Meeting Analysis",
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            participants: extractParticipants(input.transcribedText),
            key_points: [summary.substring(0, 500) + "..."], // Truncate if too long
            insights_decisions: ["AI analysis completed with raw response"],
            action_items: [],
            summary_insights: ["Analysis completed but response format was unexpected"],
            important_metrics: [],
            unresolved_questions: [],
            technical_details: []
          }
        };
        
        return {summary: JSON.stringify(fallbackSummary, null, 2)};
      }
    } catch (error) {
      console.error('Error in summarizeTranscribedTextFlow:', error);
      
      // Return a proper error structure
      const errorSummary = {
        meeting_summary: {
          title: "Analysis Error",
          date: new Date().toISOString().split('T')[0],
          time: "",
          participants: [],
          key_points: ["Error processing transcript"],
          insights_decisions: [],
          action_items: [],
          summary_insights: ["Failed to generate analysis"],
          important_metrics: [],
          unresolved_questions: [],
          technical_details: []
        }
      };
      
      return {summary: JSON.stringify(errorSummary, null, 2)};
    }
  }
);

// Helper function to extract participants from transcript
function extractParticipants(transcript: string): string[] {
  const participants = new Set<string>();
  const lines = transcript.split('\n');
  
  for (const line of lines) {
    // Look for patterns like "Name: text"
    const match = line.match(/^([^:]+):/);
    if (match && match[1].trim()) {
      participants.add(match[1].trim());
    }
  }
  
  return Array.from(participants);
}

export async function summarizeTranscribedText(
    input: SummarizeTranscribedTextInput
    ): Promise<SummarizeTranscribedTextOutput> {
    return summarizeTranscribedTextFlow(input);
}