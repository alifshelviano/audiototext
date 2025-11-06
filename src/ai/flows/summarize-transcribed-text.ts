"use server";


import { ai } from "@/ai/genkit";
import { z } from "zod";
import { analyzeTranscriptEmotions } from "@/ai/models/sentiment-analysis";


const SummarizeTranscribedTextInputSchema = z.object({
  transcribedText: z.string().describe("The complete transcribed text from the meeting."),
  language: z.enum(["english", "indonesian", "korean"]).default("english").describe("The language of the meeting for analysis."),
  meetingDate: z.string().optional().describe("The actual date of the meeting in ISO format"),
  meetingTime: z.string().optional().describe("The actual time of the meeting"),
});
export type SummarizeTranscribedTextInput = z.infer<typeof SummarizeTranscribedTextInputSchema>;


const SummarizeTranscribedTextOutputSchema = z.object({
  summary: z.string().describe("The comprehensive meeting analysis in JSON format."),
});
export type SummarizeTranscribedTextOutput = z.infer<typeof SummarizeTranscribedTextOutputSchema>;


export const summarizeTranscribedTextFlow = ai.defineFlow(
  {
    name: "summarizeTranscribedTextFlow",
    inputSchema: SummarizeTranscribedTextInputSchema,
    outputSchema: SummarizeTranscribedTextOutputSchema,
  },
  async (input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> => {
    // Use the actual meeting date/time or fallback to current date
    const actualMeetingDate = input.meetingDate || new Date().toISOString().split("T")[0];
    const actualMeetingTime = input.meetingTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


    if (!input.transcribedText || input.transcribedText.trim().length === 0) {
      return {
        summary: JSON.stringify(
          {
            meeting_summary: {
              title: "No transcripts available",
              date: actualMeetingDate,
              time: actualMeetingTime,
              participants: [],
              key_points: ["No meeting content to analyze"],
              insights_decisions: [],
              action_items: [],
              summary_insights: ["Meeting transcript is empty"],
              important_metrics: [],
              unresolved_questions: [],
              technical_details: [],
              emotion_analysis: {
                overall_sentiment: "neutral",
                overall_confidence: 0,
                participant_emotions: [],
                emotional_highlights: [],
                tension_points: [],
              },
              meeting_health_score: {
                overall_score: 0,
                engagement_score: 0,
                productivity_score: 0,
                collaboration_score: 0,
                clarity_score: 0,
                score_breakdown: {
                  strengths: [],
                  weaknesses: [],
                  red_flags: [],
                },
                recommendations: ["No meeting content to analyze"],
              },
            },
          },
          null,
          2
        ),
      };
    }


    // Truncate if too long (approximately 15,000 characters to stay under timeout)
    let transcriptToAnalyze = input.transcribedText;
    if (transcriptToAnalyze.length > 15000) {
      console.warn(`Transcript too long (${transcriptToAnalyze.length} chars), truncating to 15000 chars`);
      transcriptToAnalyze = transcriptToAnalyze.substring(0, 15000) + "\n\n[Transcript truncated due to length]";
    }


    // Language-specific prompts
    const languagePrompts = {
      english: {
        analysis: "Analyze the meeting transcript and return ONLY a valid JSON object in the exact structure below.",
        instructions: "Extract information only from the provided transcript and provide the analysis in English.",
      },
      indonesian: {
        analysis: "Analisis transkrip rapat dan kembalikan HANYA objek JSON yang valid dalam struktur yang ditentukan di bawah ini.",
        instructions: "Ekstrak informasi hanya dari transkrip yang diberikan dan berikan analisis dalam Bahasa Indonesia.",
      },
      korean: {
        analysis: "회의 기록을 분석하고 아래의 정확한 구조로 유효한 JSON 객체만 반환하세요.",
        instructions: "제공된 기록에서만 정보를 추출하고 한국어로 분석을 제공하세요.",
      },
    };


    const langPrompt = languagePrompts[input.language] || languagePrompts.english;


    const prompt = `
# COMPREHENSIVE MEETING ANALYSIS TASK


You are an expert meeting analyst. ${langPrompt.analysis}


## MEETING LANGUAGE: ${input.language.toUpperCase()}


## MEETING DATE: ${actualMeetingDate}
## MEETING TIME: ${actualMeetingTime}


## TRANSCRIPT TO ANALYZE:
${transcriptToAnalyze}


## REQUIRED JSON STRUCTURE:
{
  "meeting_summary": {
    "title": "string - main topic from transcript",
    "date": "${actualMeetingDate}",
    "time": "${actualMeetingTime}",
    "participants": ["array of participant names"],
    "key_points": ["array of main discussion points"],
    "insights_decisions": ["array of decisions and insights"],
    "action_items": [
      {
        "task": "string - specific task description",
        "assigned_to": "string - person responsible",
        "deadline": "string - deadline if mentioned",
        "status": "Not Started"
      }
    ],
    "next_meeting": {
      "date": "string - next meeting date if scheduled",
      "agenda": ["array of agenda items"]
    },
    "summary_insights": ["array of overall conclusions"],
    "important_metrics": ["array of numbers/metrics mentioned"],
    "unresolved_questions": ["array of unanswered questions"],
    "technical_details": ["array of technical specifications"],
    "meeting_health_score": {
      "overall_score": "number 0-100 - overall meeting effectiveness",
      "engagement_score": "number 0-100 - how engaged participants were",
      "productivity_score": "number 0-100 - how productive the meeting was",
      "collaboration_score": "number 0-100 - quality of collaboration",
      "clarity_score": "number 0-100 - clarity of communication and decisions",
      "score_breakdown": {
        "strengths": ["array of what went well"],
        "weaknesses": ["array of areas for improvement"],
        "red_flags": ["array of serious issues if any"]
      },
      "recommendations": [
        "string - specific actionable recommendations to improve future meetings"
      ]
    }
  }
}


## MEETING HEALTH SCORE GUIDELINES:


**Engagement Score (0-100):**
- 80-100: Active participation, questions, ideas from all
- 60-79: Most participants engaged, some quiet members
- 40-59: Limited participation, dominated by few people
- 0-39: Minimal engagement, one-way communication


**Productivity Score (0-100):**
- 80-100: Clear outcomes, decisions made, action items assigned
- 60-79: Some progress, partial decisions
- 40-59: Discussion without clear outcomes
- 0-39: Off-topic, circular discussion, no progress


**Collaboration Score (0-100):**
- 80-100: Building on ideas, supportive dialogue, consensus-building
- 60-79: Some collaboration, occasional disagreement
- 40-59: Siloed thinking, limited interaction
- 0-39: Conflict, talking over each other, no teamwork


**Clarity Score (0-100):**
- 80-100: Clear goals, decisions, and next steps
- 60-79: Mostly clear with minor ambiguity
- 40-59: Some confusion, unclear outcomes
- 0-39: Vague, confusing, no clear direction


**Overall Score:** Average of all four scores


## CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object, no additional text
2. Do not wrap the JSON in markdown code blocks
3. Ensure the JSON is valid and properly formatted
4. ${langPrompt.instructions}
5. If information is not available, use empty arrays or appropriate defaults
6. Provide specific evidence for meeting health scores
7. Use the provided meeting date and time: ${actualMeetingDate} at ${actualMeetingTime}
`;


    try {
      // Run AI summary and emotion analysis in parallel
      const [llmResponse, emotionAnalysis] = await Promise.all([ai.generate({ prompt }), analyzeTranscriptEmotions(transcriptToAnalyze, input.language)]);


      let summary = llmResponse.text;


      // Clean up the response to ensure it's valid JSON
      summary = summary.trim();


      // Remove markdown code blocks if present
      summary = summary.replace(/```json\n?/g, "").replace(/```\n?/g, "");


      // Try to parse to validate it's proper JSON
      try {
        const parsed = JSON.parse(summary);


        // Inject the emotion analysis into the parsed summary
        if (parsed.meeting_summary) {
          parsed.meeting_summary.emotion_analysis = emotionAnalysis;
        }


        // If it parses successfully, return it as string
        return { summary: JSON.stringify(parsed, null, 2) };
      } catch (parseError) {
        console.error("AI returned invalid JSON, creating fallback structure:", parseError);


        // Create a fallback structure with the actual meeting date/time
        const fallbackSummary = {
          meeting_summary: {
            title: "Meeting Analysis",
            date: actualMeetingDate,
            time: actualMeetingTime,
            participants: extractParticipants(input.transcribedText),
            key_points: [summary.substring(0, 500) + "..."],
            insights_decisions: ["AI analysis completed with raw response"],
            action_items: [],
            summary_insights: ["Analysis completed but response format was unexpected"],
            important_metrics: [],
            unresolved_questions: [],
            technical_details: [],
            emotion_analysis: emotionAnalysis,
            meeting_health_score: {
              overall_score: 50,
              engagement_score: 50,
              productivity_score: 50,
              collaboration_score: 50,
              clarity_score: 50,
              score_breakdown: {
                strengths: [],
                weaknesses: ["Unable to calculate accurate scores"],
                red_flags: [],
              },
              recommendations: ["Review meeting transcript for better analysis"],
            },
          },
        };


        return { summary: JSON.stringify(fallbackSummary, null, 2) };
      }
    } catch (error) {
      console.error("Error in summarizeTranscribedTextFlow:", error);


      // Try to get emotion analysis even if main analysis fails
      let emotionAnalysis;
      try {
        emotionAnalysis = await analyzeTranscriptEmotions(transcriptToAnalyze, input.language);
      } catch {
        emotionAnalysis = {
          overall_sentiment: "neutral",
          overall_confidence: 0,
          participant_emotions: [],
          emotional_highlights: [],
          tension_points: [],
        };
      }


      // Return a proper error structure with actual meeting date/time
      const errorSummary = {
        meeting_summary: {
          title: "Analysis Error",
          date: actualMeetingDate,
          time: actualMeetingTime,
          participants: [],
          key_points: ["Error processing transcript"],
          insights_decisions: [],
          action_items: [],
          summary_insights: ["Failed to generate analysis"],
          important_metrics: [],
          unresolved_questions: [],
          technical_details: [],
          emotion_analysis: emotionAnalysis,
          meeting_health_score: {
            overall_score: 0,
            engagement_score: 0,
            productivity_score: 0,
            collaboration_score: 0,
            clarity_score: 0,
            score_breakdown: {
              strengths: [],
              weaknesses: [],
              red_flags: ["Analysis failed"],
            },
            recommendations: ["Please try again"],
          },
        },
      };


      return { summary: JSON.stringify(errorSummary, null, 2) };
    }
  }
);


// Helper function to extract participants from transcript
function extractParticipants(transcript: string): string[] {
  const participants = new Set<string>();
  const lines = transcript.split("\n");


  for (const line of lines) {
    // Look for patterns like "Name: text"
    const match = line.match(/^([^:]+):/);
    if (match && match[1].trim()) {
      participants.add(match[1].trim());
    }
  }


  return Array.from(participants);
}


export async function summarizeTranscribedText(input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> {
  return summarizeTranscribedTextFlow(input);
}
