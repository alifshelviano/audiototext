"use server";


import { ai } from "@/ai/genkit";
import { z } from "zod";
import { analyzeTranscriptEmotions } from "@/ai/models/sentiment-analysis";


const SummarizeTranscribedTextInputSchema = z.object({
  transcribedText: z.string().describe("The complete transcribed text from the meeting."),
  language: z.enum(["english", "indonesian", "korean"]).default("english").describe("The language of the meeting for analysis."),
  meetingDate: z.string().optional().describe("The actual date of the meeting in ISO format"),
  meetingTime: z.string().optional().describe("The actual time of the meeting"),
  maxTranscriptLength: z.number().default(12000).describe("Maximum characters to process to avoid timeout"),
});


export type SummarizeTranscribedTextInput = z.infer<typeof SummarizeTranscribedTextInputSchema>;


const SummarizeTranscribedTextOutputSchema = z.object({
  summary: z.string().describe("The comprehensive meeting analysis in JSON format."),
  success: z.boolean().describe("Whether the analysis was successful"),
  errorMessage: z.string().optional().describe("Error message if analysis failed"),
});


export type SummarizeTranscribedTextOutput = z.infer<typeof SummarizeTranscribedTextOutputSchema>;


// Helper function to extract participants from transcript
function extractParticipants(transcript: string): string[] {
  const participants = new Set<string>();
  const lines = transcript.split("\n");


  for (const line of lines) {
    // Look for patterns like "Name: text" or "Name - text"
    const match = line.match(/^([^:]+)[:-]\s*.+/);
    if (match && match[1].trim()) {
      const participant = match[1].trim();
      // Filter out common non-participant patterns
      if (!participant.match(/^(timestamp|time|date|speaker|participant)$/i)) {
        participants.add(participant);
      }
    }
  }


  return Array.from(participants).slice(0, 20); // Limit to reasonable number
}


// Helper function to create error response
function createErrorResponse(message: string, actualMeetingDate: string, actualMeetingTime: string, emotionAnalysis?: any): SummarizeTranscribedTextOutput {
  const errorSummary = {
    meeting_summary: {
      title: "Analysis Error",
      date: actualMeetingDate,
      time: actualMeetingTime,
      participants: [],
      key_points: ["Error processing transcript"],
      insights_decisions: [],
      action_items: [],
      summary_insights: [message],
      important_metrics: [],
      unresolved_questions: [],
      technical_details: [],
      emotion_analysis: emotionAnalysis || {
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
          red_flags: ["Analysis failed"],
        },
        recommendations: ["Please try again with a shorter transcript"],
      },
    },
  };


  return {
    summary: JSON.stringify(errorSummary, null, 2),
    success: false,
    errorMessage: message,
  };
}


// Helper function to create empty transcript response
function createEmptyTranscriptResponse(actualMeetingDate: string, actualMeetingTime: string): SummarizeTranscribedTextOutput {
  const emptySummary = {
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
  };


  return {
    summary: JSON.stringify(emptySummary, null, 2),
    success: false,
    errorMessage: "Empty transcript provided",
  };
}


export const summarizeTranscribedTextFlow = ai.defineFlow(
  {
    name: "summarizeTranscribedTextFlow",
    inputSchema: SummarizeTranscribedTextInputSchema,
    outputSchema: SummarizeTranscribedTextOutputSchema,
  },
  async (input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> => {
    // Use the actual meeting date/time or fallback to current date
    const actualMeetingDate = input.meetingDate || new Date().toISOString().split("T")[0];
    const actualMeetingTime =
      input.meetingTime ||
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });


    // Validate transcript
    if (!input.transcribedText || input.transcribedText.trim().length === 0) {
      return createEmptyTranscriptResponse(actualMeetingDate, actualMeetingTime);
    }


    // Truncate if too long (with configurable limit)
    let transcriptToAnalyze = input.transcribedText;
    const maxLength = input.maxTranscriptLength || 12000;


    if (transcriptToAnalyze.length > maxLength) {
      console.warn(`Transcript too long (${transcriptToAnalyze.length} chars), truncating to ${maxLength} chars`);
      transcriptToAnalyze = transcriptToAnalyze.substring(0, maxLength) + "\n\n[Transcript truncated due to length]";
    }


    // Language-specific prompts
    const languagePrompts = {
      english: {
        analysis: "Analyze the meeting transcript and return ONLY a valid JSON object in the exact structure below.",
        instructions: "Extract information only from the provided transcript and provide the analysis in English.",
        systemRole: "You are an expert meeting analyst specializing in extracting key insights, decisions, and action items from meeting transcripts.",
      },
      indonesian: {
        analysis: "Analisis transkrip rapat dan kembalikan HANYA objek JSON yang valid dalam struktur yang ditentukan di bawah ini.",
        instructions: "Ekstrak informasi hanya dari transkrip yang diberikan dan berikan analisis dalam Bahasa Indonesia.",
        systemRole: "Anda adalah analis rapat ahli yang khusus mengekstrak wawasan utama, keputusan, dan item tindakan dari transkrip rapat.",
      },
      korean: {
        analysis: "회의 기록을 분석하고 아래의 정확한 구조로 유효한 JSON 객체만 반환하세요.",
        instructions: "제공된 기록에서만 정보를 추출하고 한국어로 분석을 제공하세요.",
        systemRole: "당신은 회의 기록에서 주요 통찰력, 결정 사항, 그리고 실행 항목을 추출하는 전문 회의 분석가입니다.",
      },
    };


    const langPrompt = languagePrompts[input.language] || languagePrompts.english;


    const prompt = `
# COMPREHENSIVE MEETING ANALYSIS TASK


${langPrompt.systemRole}


${langPrompt.analysis}


## MEETING LANGUAGE: ${input.language.toUpperCase()}


## MEETING DATE: ${actualMeetingDate}
## MEETING TIME: ${actualMeetingTime}


## TRANSCRIPT TO ANALYZE:
${transcriptToAnalyze}


## REQUIRED JSON STRUCTURE:
{
  "meeting_summary": {
    "title": "string - concise main topic extracted from transcript",
    "date": "${actualMeetingDate}",
    "time": "${actualMeetingTime}",
    "participants": ["array of participant names extracted from transcript"],
    "key_points": ["array of 3-7 main discussion points with specific details"],
    "insights_decisions": ["array of important decisions and insights made"],
    "action_items": [
      {
        "task": "string - specific, actionable task description",
        "assigned_to": "string - person responsible (extract from transcript)",
        "deadline": "string - deadline if mentioned, otherwise empty",
        "status": "Not Started"
      }
    ],
    "next_meeting": {
      "date": "string - next meeting date if scheduled, otherwise empty",
      "agenda": ["array of agenda items discussed for next meeting"]
    },
    "summary_insights": ["array of 2-4 overall conclusions and takeaways"],
    "important_metrics": ["array of numbers, metrics, or KPIs mentioned"],
    "unresolved_questions": ["array of questions that need follow-up"],
    "technical_details": ["array of technical specifications or requirements"],
    "meeting_health_score": {
      "overall_score": "number 0-100 - overall meeting effectiveness based on content",
      "engagement_score": "number 0-100 - how engaged participants were",
      "productivity_score": "number 0-100 - how productive the meeting was",
      "collaboration_score": "number 0-100 - quality of collaboration",
      "clarity_score": "number 0-100 - clarity of communication and decisions",
      "score_breakdown": {
        "strengths": ["array of 2-3 specific things that went well"],
        "weaknesses": ["array of 2-3 specific areas for improvement"],
        "red_flags": ["array of any serious issues identified"]
      },
      "recommendations": [
        "string - specific, actionable recommendations to improve future meetings"
      ]
    }
  }
}


## CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object, no additional text or explanations
2. Do not wrap the JSON in markdown code blocks
3. Ensure the JSON is valid and properly formatted
4. ${langPrompt.instructions}
5. If information is not available in the transcript, use empty arrays or appropriate defaults
6. Base all scores and analysis ONLY on the provided transcript content
7. Be specific and evidence-based in your analysis
8. Use the provided meeting date and time: ${actualMeetingDate} at ${actualMeetingTime}
9. Extract participant names from the transcript pattern "Name: text"
10. Focus on actionable insights and concrete next steps
`;


    try {
      // Add timeout protection for both operations
      const timeoutMs = 45000; // 45 second timeout


      const analysisPromise = Promise.all([
        ai.generate({
          prompt,
          config: {
            maxOutputTokens: 4096,
            temperature: 0.1, // Lower temperature for more consistent JSON
          },
        }),
        analyzeTranscriptEmotions(transcriptToAnalyze, input.language),
      ]);


      // Race between analysis and timeout
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Analysis timeout after 45 seconds")), timeoutMs));


      const [llmResponse, emotionAnalysis] = await Promise.race([analysisPromise, timeoutPromise]);


      let summary = llmResponse.text.trim();


      // Clean up the response to ensure it's valid JSON
      summary = summary
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();


      // Try to parse to validate it's proper JSON
      try {
        const parsed = JSON.parse(summary);


        // Validate basic structure
        if (!parsed.meeting_summary) {
          throw new Error("Missing meeting_summary in response");
        }


        // Inject the emotion analysis and ensure all required fields
        const enhancedSummary = {
          meeting_summary: {
            ...parsed.meeting_summary,
            date: actualMeetingDate,
            time: actualMeetingTime,
            emotion_analysis: emotionAnalysis,
            // Ensure arrays exist
            participants: parsed.meeting_summary.participants || extractParticipants(transcriptToAnalyze),
            key_points: parsed.meeting_summary.key_points || [],
            insights_decisions: parsed.meeting_summary.insights_decisions || [],
            action_items: parsed.meeting_summary.action_items || [],
            summary_insights: parsed.meeting_summary.summary_insights || [],
            important_metrics: parsed.meeting_summary.important_metrics || [],
            unresolved_questions: parsed.meeting_summary.unresolved_questions || [],
            technical_details: parsed.meeting_summary.technical_details || [],
          },
        };


        return {
          summary: JSON.stringify(enhancedSummary, null, 2),
          success: true,
        };
      } catch (parseError) {
        console.error("AI returned invalid JSON, creating enhanced fallback structure:", parseError);


        // Create a more informative fallback structure
        const participants = extractParticipants(transcriptToAnalyze);
        const fallbackSummary = {
          meeting_summary: {
            title: "Meeting Analysis",
            date: actualMeetingDate,
            time: actualMeetingTime,
            participants: participants,
            key_points: ["Analysis completed but response format was unexpected"],
            insights_decisions: ["Please review the raw transcript for details"],
            action_items: [],
            summary_insights: ["AI analysis completed with formatting issues"],
            important_metrics: [],
            unresolved_questions: [],
            technical_details: [],
            emotion_analysis: emotionAnalysis,
            meeting_health_score: {
              overall_score: 50,
              engagement_score: participants.length > 2 ? 60 : 40,
              productivity_score: 50,
              collaboration_score: 50,
              clarity_score: 50,
              score_breakdown: {
                strengths: ["Meeting was documented"],
                weaknesses: ["Unable to calculate accurate scores from AI response"],
                red_flags: [],
              },
              recommendations: ["Review meeting transcript manually for accurate analysis"],
            },
          },
        };


        return {
          summary: JSON.stringify(fallbackSummary, null, 2),
          success: false,
          errorMessage: "AI response format error",
        };
      }
    } catch (error) {
      console.error("Error in summarizeTranscribedTextFlow:", error);


      // Try to get emotion analysis even if main analysis fails
      let emotionAnalysis;
      try {
        emotionAnalysis = await analyzeTranscriptEmotions(transcriptToAnalyze, input.language);
      } catch (emotionError) {
        console.error("Emotion analysis also failed:", emotionError);
        emotionAnalysis = {
          overall_sentiment: "neutral",
          overall_confidence: 0,
          participant_emotions: [],
          emotional_highlights: [],
          tension_points: [],
        };
      }


      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return createErrorResponse(errorMessage, actualMeetingDate, actualMeetingTime, emotionAnalysis);
    }
  }
);


export async function summarizeTranscribedText(input: SummarizeTranscribedTextInput): Promise<SummarizeTranscribedTextOutput> {
  return summarizeTranscribedTextFlow(input);
}



