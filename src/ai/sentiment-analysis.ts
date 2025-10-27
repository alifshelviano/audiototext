// // ai/sentiment-analysis.ts
// 'use server';

// interface SentimentResult {
//   label: string;
//   score: number;
// }

// interface ParticipantSentiment {
//   participant: string;
//   sentiment: string;
//   confidence: number;
//   statements: number;
//   emotionalTone: string;
// }

// interface EmotionAnalysisResult {
//   overall_sentiment: string;
//   overall_confidence: number;
//   participant_emotions: ParticipantSentiment[];
//   emotional_highlights: string[];
//   tension_points: string[];
// }

// const HUGGINGFACE_API_URL = 
//   "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

// /**
//  * Analyze sentiment of a text using Hugging Face API
//  */
// async function analyzeSentiment(text: string): Promise<SentimentResult[]> {
//   try {
//     const response = await fetch(HUGGINGFACE_API_URL, {
//       method: "POST",
//       headers: { 
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ inputs: text })
//     });

//     if (!response.ok) {
//       console.error(`Hugging Face API error: ${response.status}`);
//       return [{ label: "neutral", score: 0.5 }];
//     }

//     const result = await response.json();
    
//     // Handle different response formats
//     if (Array.isArray(result) && result.length > 0) {
//       if (Array.isArray(result[0])) {
//         return result[0];
//       }
//       return result;
//     }
    
//     return [{ label: "neutral", score: 0.5 }];
//   } catch (error) {
//     console.error('Error analyzing sentiment:', error);
//     return [{ label: "neutral", score: 0.5 }];
//   }
// }

// /**
//  * Extract participant statements from transcript
//  */
// function extractParticipantStatements(transcript: string): Map<string, string[]> {
//   const participantStatements = new Map<string, string[]>();
//   const lines = transcript.split('\n');
  
//   for (const line of lines) {
//     const match = line.match(/^([^:]+):\s*(.+)$/);
//     if (match && match[1].trim() && match[2].trim()) {
//       const participant = match[1].trim();
//       const statement = match[2].trim();
      
//       if (!participantStatements.has(participant)) {
//         participantStatements.set(participant, []);
//       }
//       participantStatements.get(participant)!.push(statement);
//     }
//   }
  
//   return participantStatements;
// }

// /**
//  * Map sentiment label to emotional tone
//  */
// function mapSentimentToEmotion(label: string, score: number): string {
//   const normalizedLabel = label.toLowerCase();
  
//   if (normalizedLabel.includes('positive')) {
//     if (score > 0.9) return 'enthusiastic';
//     if (score > 0.75) return 'supportive';
//     return 'positive';
//   } else if (normalizedLabel.includes('negative')) {
//     if (score > 0.9) return 'frustrated';
//     if (score > 0.75) return 'concerned';
//     return 'critical';
//   }
  
//   return 'neutral';
// }

// /**
//  * Determine overall sentiment from label
//  */
// function normalizeSentimentLabel(label: string): string {
//   const normalized = label.toLowerCase();
//   if (normalized.includes('positive')) return 'positive';
//   if (normalized.includes('negative')) return 'negative';
//   return 'neutral';
// }

// /**
//  * Identify tension points in the conversation
//  */
// function identifyTensionPoints(
//   participantStatements: Map<string, string[]>,
//   participantSentiments: Map<string, { label: string; score: number }>
// ): string[] {
//   const tensionPoints: string[] = [];
  
//   // Check for participants with negative sentiment
//   const negativeParticipants: string[] = [];
//   participantSentiments.forEach((sentiment, participant) => {
//     if (sentiment.label.toLowerCase().includes('negative') && sentiment.score > 0.7) {
//       negativeParticipants.push(participant);
//     }
//   });
  
//   if (negativeParticipants.length > 0) {
//     tensionPoints.push(
//       `Negative sentiment detected from: ${negativeParticipants.join(', ')}`
//     );
//   }
  
//   // Check for disagreement patterns
//   const statements = Array.from(participantStatements.values()).flat();
//   const disagreementKeywords = ['disagree', 'however', 'but', 'actually', 'wrong', "don't think"];
  
//   statements.forEach(statement => {
//     const lowerStatement = statement.toLowerCase();
//     if (disagreementKeywords.some(keyword => lowerStatement.includes(keyword))) {
//       tensionPoints.push(`Potential disagreement: "${statement.substring(0, 100)}..."`);
//     }
//   });
  
//   return tensionPoints.slice(0, 3); // Limit to top 3
// }

// /**
//  * Identify emotional highlights
//  */
// function identifyEmotionalHighlights(
//   participantStatements: Map<string, string[]>,
//   participantSentiments: Map<string, { label: string; score: number }>
// ): string[] {
//   const highlights: string[] = [];
  
//   // Find highly positive moments
//   participantSentiments.forEach((sentiment, participant) => {
//     if (sentiment.label.toLowerCase().includes('positive') && sentiment.score > 0.85) {
//       const statements = participantStatements.get(participant) || [];
//       if (statements.length > 0) {
//         highlights.push(
//           `${participant} showed strong enthusiasm: "${statements[0].substring(0, 80)}..."`
//         );
//       }
//     }
//   });
  
//   return highlights.slice(0, 3); // Limit to top 3
// }

// /**
//  * Main function to analyze emotions in meeting transcript
//  */
// export async function analyzeTranscriptEmotions(
//   transcript: string
// ): Promise<EmotionAnalysisResult> {
//   if (!transcript || transcript.trim().length === 0) {
//     return {
//       overall_sentiment: "neutral",
//       overall_confidence: 0,
//       participant_emotions: [],
//       emotional_highlights: [],
//       tension_points: []
//     };
//   }

//   try {
//     // Extract statements per participant
//     const participantStatements = extractParticipantStatements(transcript);
    
//     if (participantStatements.size === 0) {
//       return {
//         overall_sentiment: "neutral",
//         overall_confidence: 0,
//         participant_emotions: [],
//         emotional_highlights: ["No participant statements detected"],
//         tension_points: []
//       };
//     }

//     // Analyze sentiment for each participant
//     const participantEmotions: ParticipantSentiment[] = [];
//     const participantSentiments = new Map<string, { label: string; score: number }>();
//     let totalPositive = 0;
//     let totalNegative = 0;
//     let totalNeutral = 0;

//     for (const [participant, statements] of participantStatements.entries()) {
//       // Combine all statements for this participant
//       const combinedText = statements.join(' ');
      
//       // Truncate if too long (max 512 characters for better performance)
//       const textToAnalyze = combinedText.substring(0, 512);
      
//       const sentimentResults = await analyzeSentiment(textToAnalyze);
      
//       // Get the highest confidence result
//       const topSentiment = sentimentResults.reduce((prev, current) => 
//         (current.score > prev.score) ? current : prev
//       );

//       const normalizedLabel = normalizeSentimentLabel(topSentiment.label);
//       participantSentiments.set(participant, { 
//         label: topSentiment.label, 
//         score: topSentiment.score 
//       });

//       // Count sentiments for overall calculation
//       if (normalizedLabel === 'positive') totalPositive++;
//       else if (normalizedLabel === 'negative') totalNegative++;
//       else totalNeutral++;

//       participantEmotions.push({
//         participant,
//         sentiment: normalizedLabel,
//         confidence: Math.round(topSentiment.score * 100) / 100,
//         statements: statements.length,
//         emotionalTone: mapSentimentToEmotion(topSentiment.label, topSentiment.score)
//       });

//       // Add small delay to avoid rate limiting
//       await new Promise(resolve => setTimeout(resolve, 100));
//     }

//     // Calculate overall sentiment
//     let overallSentiment = 'neutral';
//     let overallConfidence = 0;
    
//     const total = totalPositive + totalNegative + totalNeutral;
//     if (total > 0) {
//       const positiveRatio = totalPositive / total;
//       const negativeRatio = totalNegative / total;
      
//       if (positiveRatio > 0.6) {
//         overallSentiment = 'positive';
//         overallConfidence = positiveRatio;
//       } else if (negativeRatio > 0.6) {
//         overallSentiment = 'negative';
//         overallConfidence = negativeRatio;
//       } else if (positiveRatio > 0.3 && negativeRatio > 0.3) {
//         overallSentiment = 'mixed';
//         overallConfidence = 1 - (Math.abs(positiveRatio - negativeRatio));
//       } else {
//         overallSentiment = 'neutral';
//         overallConfidence = totalNeutral / total;
//       }
//     }

//     // Identify tension points and highlights
//     const tensionPoints = identifyTensionPoints(participantStatements, participantSentiments);
//     const emotionalHighlights = identifyEmotionalHighlights(participantStatements, participantSentiments);

//     return {
//       overall_sentiment: overallSentiment,
//       overall_confidence: Math.round(overallConfidence * 100) / 100,
//       participant_emotions: participantEmotions,
//       emotional_highlights: emotionalHighlights.length > 0 
//         ? emotionalHighlights 
//         : ["Meeting maintained a professional tone throughout"],
//       tension_points: tensionPoints.length > 0 
//         ? tensionPoints 
//         : []
//     };

//   } catch (error) {
//     console.error('Error in analyzeTranscriptEmotions:', error);
//     return {
//       overall_sentiment: "neutral",
//       overall_confidence: 0,
//       participant_emotions: [],
//       emotional_highlights: ["Error analyzing emotions"],
//       tension_points: []
//     };
//   }
// }

// ai/sentiment-analysis.ts
// ai/sentiment-analysis.ts
'use server';

// Enhanced interfaces
interface SentimentResult {
  label: string;
  score: number;
}

interface ParticipantSentiment {
  participant: string;
  sentiment: string;
  confidence: number;
  statements: number;
  emotionalTone: string;
}

interface EmotionAnalysisResult {
  overall_sentiment: string;
  overall_confidence: number;
  participant_emotions: ParticipantSentiment[];
  emotional_highlights: string[];
  tension_points: string[];
}

// Corrected interface definition
type HuggingFaceResponse = Array<Array<{
  label: string;
  score: number;
}>>;

// Alternative interface syntax:
// interface HuggingFaceResponse {
//   [index: number]: Array<{
//     label: string;
//     score: number;
//   }>;
// }

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // Add to your environment variables

// Add retry mechanism
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 503) { // Model loading
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Analyze sentiment of a text using Hugging Face API
 */
async function analyzeSentiment(text: string): Promise<SentimentResult[]> {
  if (!text?.trim()) {
    return [{ label: "neutral", score: 0.5 }];
  }

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Add API key if available
    if (HF_API_KEY) {
      headers["Authorization"] = `Bearer ${HF_API_KEY}`;
    }

    const response = await fetchWithRetry(HUGGINGFACE_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: text.substring(0, 512) }) // Ensure length limit
    });

    const result = await response.json() as HuggingFaceResponse | SentimentResult[];
    
    // Handle different response formats more safely
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return [{ label: "neutral", score: 0.5 }];
      }
      
      // Handle nested array format
      if (Array.isArray(result[0])) {
        const nestedResult = result[0] as SentimentResult[];
        return nestedResult.length > 0 ? nestedResult : [{ label: "neutral", score: 0.5 }];
      }
      
      // Handle flat array format
      return result as SentimentResult[];
    }
    
    return [{ label: "neutral", score: 0.5 }];
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return [{ label: "neutral", score: 0.5 }];
  }
}

/**
 * Extract participant statements from transcript with better parsing
 */
function extractParticipantStatements(transcript: string): Map<string, string[]> {
  const participantStatements = new Map<string, string[]>();
  
  if (!transcript?.trim()) {
    return participantStatements;
  }

  const lines = transcript.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match?.[1]?.trim() && match[2]?.trim()) {
      const participant = match[1].trim();
      const statement = match[2].trim();
      
      if (!participantStatements.has(participant)) {
        participantStatements.set(participant, []);
      }
      participantStatements.get(participant)!.push(statement);
    }
  }
  
  return participantStatements;
}

/**
 * Map sentiment label to emotional tone with better type safety
 */
function mapSentimentToEmotion(label: string, score: number): string {
  if (!label) return 'neutral';
  
  const normalizedLabel = label.toLowerCase().trim();
  
  if (normalizedLabel.includes('positive')) {
    if (score > 0.9) return 'enthusiastic';
    if (score > 0.75) return 'supportive';
    return 'positive';
  } else if (normalizedLabel.includes('negative')) {
    if (score > 0.9) return 'frustrated';
    if (score > 0.75) return 'concerned';
    return 'critical';
  }
  
  return 'neutral';
}

/**
 * Determine overall sentiment from label with safety checks
 */
function normalizeSentimentLabel(label: string): string {
  if (!label) return 'neutral';
  
  const normalized = label.toLowerCase().trim();
  if (normalized.includes('positive')) return 'positive';
  if (normalized.includes('negative')) return 'negative';
  return 'neutral';
}

/**
 * Identify tension points in the conversation
 */
function identifyTensionPoints(
  participantStatements: Map<string, string[]>,
  participantSentiments: Map<string, { label: string; score: number }>
): string[] {
  const tensionPoints: string[] = [];
  
  if (!participantSentiments.size) return tensionPoints;

  // Check for participants with negative sentiment
  const negativeParticipants: string[] = [];
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes('negative') && sentiment.score > 0.7) {
      negativeParticipants.push(participant);
    }
  });
  
  if (negativeParticipants.length > 0) {
    tensionPoints.push(
      `Negative sentiment detected from: ${negativeParticipants.join(', ')}`
    );
  }

  // Check for disagreement patterns
  const statements = Array.from(participantStatements.values()).flat();
  const disagreementKeywords = ['disagree', 'however', 'but', 'actually', 'wrong', "don't think", 'not sure', 'concerned', 'problem'];
  
  statements.forEach(statement => {
    if (!statement) return;
    
    const lowerStatement = statement.toLowerCase();
    if (disagreementKeywords.some(keyword => lowerStatement.includes(keyword))) {
      tensionPoints.push(`Potential disagreement: "${statement.substring(0, 100)}..."`);
    }
  });
  
  return tensionPoints.slice(0, 3);
}

/**
 * Identify emotional highlights
 */
function identifyEmotionalHighlights(
  participantStatements: Map<string, string[]>,
  participantSentiments: Map<string, { label: string; score: number }>
): string[] {
  const highlights: string[] = [];
  
  if (!participantSentiments.size) return highlights;

  // Find highly positive moments
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes('positive') && sentiment.score > 0.85) {
      const statements = participantStatements.get(participant) || [];
      if (statements.length > 0 && statements[0]) {
        highlights.push(
          `${participant} showed strong enthusiasm: "${statements[0].substring(0, 80)}..."`
        );
      }
    }
  });
  
  return highlights.slice(0, 3);
}

/**
 * Main function to analyze emotions in meeting transcript
 */
export async function analyzeTranscriptEmotions(
  transcript: string
): Promise<EmotionAnalysisResult> {
  const defaultResult: EmotionAnalysisResult = {
    overall_sentiment: "neutral",
    overall_confidence: 0,
    participant_emotions: [],
    emotional_highlights: [],
    tension_points: []
  };

  if (!transcript || transcript.trim().length === 0) {
    return defaultResult;
  }

  try {
    // Extract statements per participant
    const participantStatements = extractParticipantStatements(transcript);
    
    if (participantStatements.size === 0) {
      return {
        ...defaultResult,
        emotional_highlights: ["No participant statements detected"]
      };
    }

    // Analyze sentiment for each participant
    const participantEmotions: ParticipantSentiment[] = [];
    const participantSentiments = new Map<string, { label: string; score: number }>();
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;

    for (const [participant, statements] of participantStatements.entries()) {
      if (!participant || statements.length === 0) continue;

      // Combine all statements for this participant
      const combinedText = statements.join(' ');
      const textToAnalyze = combinedText.substring(0, 512);
      
      const sentimentResults = await analyzeSentiment(textToAnalyze);
      
      // Get the highest confidence result safely
      const topSentiment = sentimentResults.reduce((prev, current) => 
        (current.score > prev.score) ? current : prev, sentimentResults[0]
      );

      const normalizedLabel = normalizeSentimentLabel(topSentiment.label);
      participantSentiments.set(participant, { 
        label: topSentiment.label, 
        score: topSentiment.score 
      });

      // Count sentiments for overall calculation
      if (normalizedLabel === 'positive') totalPositive++;
      else if (normalizedLabel === 'negative') totalNegative++;
      else totalNeutral++;

      participantEmotions.push({
        participant,
        sentiment: normalizedLabel,
        confidence: Math.round(topSentiment.score * 100) / 100,
        statements: statements.length,
        emotionalTone: mapSentimentToEmotion(topSentiment.label, topSentiment.score)
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculate overall sentiment
    let overallSentiment = 'neutral';
    let overallConfidence = 0;
    
    const total = totalPositive + totalNegative + totalNeutral;
    if (total > 0) {
      const positiveRatio = totalPositive / total;
      const negativeRatio = totalNegative / total;
      
      if (positiveRatio > 0.6) {
        overallSentiment = 'positive';
        overallConfidence = positiveRatio;
      } else if (negativeRatio > 0.6) {
        overallSentiment = 'negative';
        overallConfidence = negativeRatio;
      } else if (positiveRatio > 0.3 && negativeRatio > 0.3) {
        overallSentiment = 'mixed';
        overallConfidence = 1 - (Math.abs(positiveRatio - negativeRatio));
      } else {
        overallSentiment = 'neutral';
        overallConfidence = totalNeutral / total;
      }
    }

    // Identify tension points and highlights
    const tensionPoints = identifyTensionPoints(participantStatements, participantSentiments);
    const emotionalHighlights = identifyEmotionalHighlights(participantStatements, participantSentiments);

    return {
      overall_sentiment: overallSentiment,
      overall_confidence: Math.round(overallConfidence * 100) / 100,
      participant_emotions: participantEmotions,
      emotional_highlights: emotionalHighlights.length > 0 
        ? emotionalHighlights 
        : ["Meeting maintained a professional tone throughout"],
      tension_points: tensionPoints.length > 0 
        ? tensionPoints 
        : []
    };

  } catch (error) {
    console.error('Error in analyzeTranscriptEmotions:', error);
    return defaultResult;
  }
}