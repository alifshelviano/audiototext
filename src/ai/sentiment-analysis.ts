// ai/sentiment-analysis.ts
"use server";

import { pipeline } from "@xenova/transformers";

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

// Cache for the sentiment analysis pipeline
let sentimentClassifier: any = null;

/**
 * Initialize the multilingual sentiment analysis pipeline
 */
async function getSentimentClassifier() {
  if (!sentimentClassifier) {
    console.log("Initializing multilingual sentiment analysis model...");

    try {
      // Use the multilingual sentiment analysis model
      sentimentClassifier = await pipeline(
        "text-classification",
        'Xenova/twitter-roberta-base-sentiment-latest', // Multilingual model
        {
          quantized: true,
          progress_callback: (data: any) => {
            if (data.status === "downloading") {
              console.log(`Downloading multilingual model: ${data.file} (${(data.progress * 100).toFixed(1)}%)`);
            }
          },
        }
      );
      console.log("Multilingual sentiment analysis model loaded successfully");
    } catch (error) {
      console.error("Failed to load multilingual model:", error);
      // Fallback to a different model if this one fails
      try {
        console.log("Trying fallback model...");
        sentimentClassifier = await pipeline("text-classification", "Xenova/distilbert-base-uncased-finetuned-sst-2-english", { quantized: true });
        console.log("Fallback sentiment model loaded successfully");
      } catch (fallbackError) {
        console.error("Failed to load fallback model:", fallbackError);
        sentimentClassifier = null;
      }
    }
  }
  return sentimentClassifier;
}

/**
 * Analyze sentiment using multilingual model
 */
async function analyzeSentiment(text: string): Promise<SentimentResult[]> {
  if (!text?.trim()) {
    return [{ label: "neutral", score: 0.5 }];
  }

  try {
    const classifier = await getSentimentClassifier();

    if (!classifier) {
      return analyzeSentimentFallback(text);
    }

    // Truncate text to avoid performance issues
    const textToAnalyze = text.substring(0, 512);

    const results = await classifier(textToAnalyze);

    if (!results || results.length === 0) {
      return analyzeSentimentFallback(text);
    }

    // Multilingual model typically returns standard sentiment labels
    // Transform to our format and apply meeting context adjustments
    const transformedResults = results.map((result: any) => {
      let label = result.label.toLowerCase();
      let score = result.score;

      // Normalize labels to ensure consistency across different model outputs
      if (label === "positif" || label === "positive" || label === "pos") {
        label = "positive";
      } else if (label === "negatif" || label === "negative" || label === "neg") {
        label = "negative";
      } else if (label === "netral" || label === "neutral" || label === "neu") {
        label = "neutral";
      }

      // Apply confidence adjustments for meeting context
      return adjustSentimentForMeetingContext(label, score, text);
    });

    return transformedResults;
  } catch (error) {
    console.error("Error in multilingual sentiment analysis:", error);
    return analyzeSentimentFallback(text);
  }
}

/**
 * Adjust sentiment results to be more appropriate for meeting contexts
 */
function adjustSentimentForMeetingContext(label: string, score: number, text: string): SentimentResult {
  // Multilingual models can vary in their sensitivity
  // Apply adjustments to make it more suitable for professional meetings

  const lowerText = text.toLowerCase();

  // Check for meeting-specific positive indicators in multiple languages
  const positiveIndicators = [
    // English
    "good",
    "great",
    "excellent",
    "awesome",
    "perfect",
    "agree",
    "support",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "yes",
    "sure",
    "definitely",
    "wonderful",
    "fantastic",
    "brilliant",
    "outstanding",
    "perfect",
    // Indonesian
    "baik",
    "bagus",
    "hebat",
    "mantap",
    "setuju",
    "dukung",
    "support",
    "terima kasih",
    "ok",
    "oke",
    "siap",
    "sepakat",
    "jalan",
    "lanjut",
    "solusi",
    "settle",
    "clear",
    "paham",
    "mengerti",
  ];

  // Check for meeting-specific negative indicators
  const negativeIndicators = [
    // English
    "bad",
    "terrible",
    "awful",
    "disagree",
    "problem",
    "issue",
    "wrong",
    "error",
    "mistake",
    "failed",
    "fail",
    "cannot",
    "can't",
    "won't",
    "difficult",
    "hard",
    "complicated",
    "confusing",
    "unclear",
    // Indonesian
    "tidak setuju",
    "disagree",
    "tidak",
    "no",
    "gak",
    "ga setuju",
    "masalah",
    "kendala",
    "hambatan",
    "susah",
    "sulit",
    "repot",
    "ribet",
    "error",
    "gagal",
    "gak bisa",
    "tidak bisa",
    "belum",
    "batal",
    "cancel",
  ];

  // Check for neutral/professional indicators
  const neutralIndicators = [
    // English
    "maybe",
    "perhaps",
    "possibly",
    "might",
    "could",
    "not sure",
    "think",
    "believe",
    "feel",
    "probably",
    "consider",
    "discuss",
    "review",
    "analyze",
    "evaluate",
    "suggest",
    "propose",
    // Indonesian
    "mungkin",
    "kemungkinan",
    "sepertinya",
    "kira",
    "anggap",
    "pikir",
    "diskusi",
    "bahas",
    "review",
    "analisis",
    "evaluasi",
    "pertimbang",
    "usul",
    "sarankan",
    "ajukan",
  ];

  let adjustment = 0;
  let contextBoost = 0;

  // Apply context-based adjustments
  if (label === "negative") {
    // Check if the negative sentiment might be constructive criticism
    const hasPositiveContext = positiveIndicators.some((indicator) => lowerText.includes(indicator));

    const hasNeutralContext = neutralIndicators.some((indicator) => lowerText.includes(indicator));

    if (hasPositiveContext) {
      // Negative sentiment with positive context -> likely constructive feedback
      adjustment = 0.15;
      contextBoost = 0.1;
    } else if (hasNeutralContext) {
      // Negative sentiment with neutral context -> moderate it
      adjustment = 0.1;
    }

    // Be more conservative with negative labels in meetings
    if (score < 0.6) {
      return { label: "neutral", score: 0.5 + contextBoost };
    } else if (score > 0.9) {
      return { label: "negative", score: 0.85 + contextBoost }; // Cap very high negative scores
    }
  } else if (label === "positive") {
    // Check for strong positive indicators
    const strongPositiveWords = ["excellent", "awesome", "perfect", "hebat", "mantap", "fantastic"];
    const hasStrongPositive = strongPositiveWords.some((word) => lowerText.includes(word));

    if (hasStrongPositive && score < 0.8) {
      adjustment = 0.15;
    } else if (score > 0.6 && score < 0.8) {
      adjustment = 0.1;
    }

    // Check if it's just polite conversation
    const isJustPoliteness = ["terima kasih", "thanks", "ok", "oke", "siap", "thank you"].some((polite) => lowerText.includes(polite));

    if (isJustPoliteness && score < 0.7) {
      return { label: "neutral", score: 0.6 };
    }
  } else if (label === "neutral") {
    // Boost neutral confidence for professional discussions
    if (score > 0.5) {
      adjustment = 0.1;
    }
  }

  return {
    label,
    score: Math.min(score + adjustment, 0.95),
  };
}

/**
 * Enhanced multilingual fallback sentiment analysis
 */
function analyzeSentimentFallback(text: string): SentimentResult[] {
  if (!text?.trim()) {
    return [{ label: "neutral", score: 0.5 }];
  }

  const lowerText = text.toLowerCase();

  // Multilingual sentiment indicators
  const positiveIndicators = [
    // English
    "good",
    "great",
    "excellent",
    "awesome",
    "perfect",
    "agree",
    "support",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "yes",
    "sure",
    "definitely",
    "wonderful",
    "fantastic",
    "brilliant",
    "outstanding",
    // Indonesian
    "baik",
    "bagus",
    "hebat",
    "mantap",
    "setuju",
    "dukung",
    "support",
    "terima kasih",
    "ok",
    "oke",
    "siap",
    "sepakat",
    "jalan",
    "lanjut",
    "solusi",
    "settle",
    "clear",
    "paham",
  ];

  const negativeIndicators = [
    // English
    "bad",
    "terrible",
    "awful",
    "disagree",
    "problem",
    "issue",
    "wrong",
    "error",
    "mistake",
    "failed",
    "fail",
    "cannot",
    "can't",
    "won't",
    "difficult",
    "hard",
    "complicated",
    "confusing",
    // Indonesian
    "tidak setuju",
    "disagree",
    "tidak",
    "no",
    "gak",
    "ga setuju",
    "masalah",
    "kendala",
    "hambatan",
    "susah",
    "sulit",
    "repot",
    "ribet",
    "error",
    "gagal",
    "gak bisa",
    "tidak bisa",
    "belum",
    "batal",
    "anjing",
  ];

  const neutralIndicators = [
    // English
    "maybe",
    "perhaps",
    "possibly",
    "might",
    "could",
    "not sure",
    "think",
    "believe",
    "feel",
    "probably",
    "consider",
    "discuss",
    // Indonesian
    "mungkin",
    "kemungkinan",
    "sepertinya",
    "kira",
    "pikir",
    "diskusi",
    "bahas",
    "review",
    "analisis",
    "pertimbang",
  ];

  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  // Check for indicators with language weighting
  positiveIndicators.forEach((indicator) => {
    const count = (lowerText.match(new RegExp(indicator, "g")) || []).length;
    positiveScore += count * 2;
  });

  negativeIndicators.forEach((indicator) => {
    const count = (lowerText.match(new RegExp(indicator, "g")) || []).length;
    negativeScore += count * 2;
  });

  neutralIndicators.forEach((indicator) => {
    const count = (lowerText.match(new RegExp(indicator, "g")) || []).length;
    neutralScore += count * 1.5;
  });

  // Context analysis
  const hasQuestions = (lowerText.match(/\?/g) || []).length > 0;
  const hasExclamations = (lowerText.match(/!/g) || []).length > 0;
  const textLength = lowerText.split(/\s+/).length;

  if (hasExclamations) positiveScore += 1;
  if (hasQuestions) neutralScore += 1;

  // Calculate final sentiment with length normalization
  const totalScore = positiveScore + negativeScore + neutralScore;

  if (totalScore === 0) {
    // No clear indicators - analyze based on text characteristics
    if (textLength < 10) {
      return [{ label: "neutral", score: 0.6 }]; // Short texts are often neutral
    }
    return [{ label: "neutral", score: 0.5 }];
  }

  const positiveRatio = positiveScore / totalScore;
  const negativeRatio = negativeScore / totalScore;
  const neutralRatio = neutralScore / totalScore;

  const maxRatio = Math.max(positiveRatio, negativeRatio, neutralRatio);
  const confidence = Math.min(0.4 + maxRatio * 0.6, 0.9);

  // Apply meeting context bias
  const meetingBias = 0.05; // Slight bias towards positive/neutral in meetings

  if (positiveRatio + meetingBias > negativeRatio && positiveRatio > neutralRatio) {
    return [{ label: "positive", score: confidence }];
  } else if (negativeRatio > positiveRatio + meetingBias && negativeRatio > neutralRatio) {
    return [{ label: "negative", score: Math.max(confidence, 0.6) }];
  } else {
    return [{ label: "neutral", score: Math.max(confidence, 0.5) }];
  }
}

/**
 * Map sentiment to emotional tone (multilingual support)
 */
function mapSentimentToEmotion(label: string, score: number): string {
  if (!label) return "neutral";

  const normalizedLabel = label.toLowerCase().trim();

  if (normalizedLabel.includes("positive")) {
    if (score > 0.85) return "enthusiastic";
    if (score > 0.7) return "supportive";
    if (score > 0.6) return "positive";
    return "neutral";
  } else if (normalizedLabel.includes("negative")) {
    if (score > 0.85) return "frustrated";
    if (score > 0.75) return "concerned";
    if (score > 0.65) return "critical";
    return "neutral";
  }

  return "neutral";
}

/**
 * Normalize sentiment labels for consistency
 */
function normalizeSentimentLabel(label: string): string {
  if (!label) return "neutral";

  const normalized = label.toLowerCase().trim();
  if (normalized.includes("positive") || normalized.includes("positif")) return "positive";
  if (normalized.includes("negative") || normalized.includes("negatif")) return "negative";
  return "neutral";
}

// The rest of the functions (extractParticipantStatements, identifyTensionPoints,
// identifyEmotionalHighlights, analyzeTranscriptEmotions) remain the same as previous versions

/**
 * Extract participant statements from transcript
 */
function extractParticipantStatements(transcript: string): Map<string, string[]> {
  const participantStatements = new Map<string, string[]>();

  if (!transcript?.trim()) {
    return participantStatements;
  }

  const lines = transcript.split("\n");

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
 * Identify tension points in the conversation
 */
function identifyTensionPoints(participantStatements: Map<string, string[]>, participantSentiments: Map<string, { label: string; score: number }>): string[] {
  const tensionPoints: string[] = [];

  if (!participantSentiments.size) return tensionPoints;

  // Check for strong negative sentiment
  const negativeParticipants: string[] = [];
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes("negative") && sentiment.score > 0.75) {
      negativeParticipants.push(participant);
    }
  });

  if (negativeParticipants.length > 0) {
    tensionPoints.push(`Concerns raised by: ${negativeParticipants.join(", ")}`);
  }

  // Check for disagreement patterns in multiple languages
  const statements = Array.from(participantStatements.values()).flat();
  const disagreementKeywords = [
    // English
    "disagree",
    "no",
    "not",
    "don't",
    "can't",
    "won't",
    "against",
    "problem",
    "issue",
    "wrong",
    "error",
    "mistake",
    // Indonesian
    "tidak setuju",
    "tidak",
    "gak",
    "ga",
    "masalah",
    "susah",
    "sulit",
  ];

  let disagreementCount = 0;
  statements.forEach((statement) => {
    if (!statement) return;

    const lowerStatement = statement.toLowerCase();
    if (disagreementKeywords.some((keyword) => lowerStatement.includes(keyword))) {
      disagreementCount++;
      if (disagreementCount <= 2) {
        tensionPoints.push(`Discussion point: "${statement.substring(0, 100)}..."`);
      }
    }
  });

  return tensionPoints.slice(0, 3);
}

/**
 * Identify emotional highlights
 */
function identifyEmotionalHighlights(participantStatements: Map<string, string[]>, participantSentiments: Map<string, { label: string; score: number }>): string[] {
  const highlights: string[] = [];

  if (!participantSentiments.size) return highlights;

  // Find positive engagement
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes("positive") && sentiment.score > 0.65) {
      const statements = participantStatements.get(participant) || [];
      if (statements.length > 0) {
        highlights.push(`${participant} contributed positively to the discussion`);
      }
    }
  });

  // Look for collaborative moments in multiple languages
  participantStatements.forEach((statements, participant) => {
    const collaborativeWords = [
      // English
      "agree",
      "support",
      "help",
      "collaborat",
      "team",
      "together",
      "we can",
      // Indonesian
      "setuju",
      "dukung",
      "support",
      "bantu",
      "kolaborasi",
      "tim",
      "bersama",
    ];

    const hasCollaboration = statements.some((statement) => collaborativeWords.some((word) => statement.toLowerCase().includes(word)));

    if (hasCollaboration && !highlights.some((h) => h.includes(participant))) {
      highlights.push(`${participant} showed collaborative spirit`);
    }
  });

  return highlights.slice(0, 3);
}

/**
 * Main function to analyze emotions in meeting transcript
 */
export async function analyzeTranscriptEmotions(transcript: string): Promise<EmotionAnalysisResult> {
  const defaultResult: EmotionAnalysisResult = {
    overall_sentiment: "neutral",
    overall_confidence: 0,
    participant_emotions: [],
    emotional_highlights: ["Using multilingual sentiment analysis model"],
    tension_points: [],
  };

  if (!transcript || transcript.trim().length === 0) {
    return defaultResult;
  }

  try {
    const participantStatements = extractParticipantStatements(transcript);

    if (participantStatements.size === 0) {
      return {
        ...defaultResult,
        emotional_highlights: ["No participant statements detected"],
      };
    }

    const participantEmotions: ParticipantSentiment[] = [];
    const participantSentiments = new Map<string, { label: string; score: number }>();
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;

    const participants = Array.from(participantStatements.entries());

    for (const [participant, statements] of participants) {
      if (!participant || statements.length === 0) continue;

      try {
        const combinedText = statements.join(" ");
        const sentimentResults = await analyzeSentiment(combinedText);

        const topSentiment = sentimentResults.reduce((prev, current) => (current.score > prev.score ? current : prev), sentimentResults[0]);

        const normalizedLabel = normalizeSentimentLabel(topSentiment.label);
        participantSentiments.set(participant, {
          label: topSentiment.label,
          score: topSentiment.score,
        });

        if (normalizedLabel === "positive") totalPositive++;
        else if (normalizedLabel === "negative") totalNegative++;
        else totalNeutral++;

        participantEmotions.push({
          participant,
          sentiment: normalizedLabel,
          confidence: Math.round(topSentiment.score * 100) / 100,
          statements: statements.length,
          emotionalTone: mapSentimentToEmotion(topSentiment.label, topSentiment.score),
        });
      } catch (error) {
        console.error(`Error analyzing sentiment for ${participant}:`, error);
        // Mark as neutral if analysis fails
        participantEmotions.push({
          participant,
          sentiment: "neutral",
          confidence: 0.5,
          statements: statements.length,
          emotionalTone: "neutral",
        });
        totalNeutral++;
      }
    }

    // Calculate overall sentiment
    let overallSentiment = "neutral";
    let overallConfidence = 0;

    const total = totalPositive + totalNegative + totalNeutral;
    if (total > 0) {
      const positiveRatio = totalPositive / total;
      const negativeRatio = totalNegative / total;

      if (positiveRatio > 0.5) {
        overallSentiment = "positive";
        overallConfidence = positiveRatio;
      } else if (negativeRatio > 0.6) {
        overallSentiment = "negative";
        overallConfidence = negativeRatio;
      } else if (positiveRatio > 0.3 && negativeRatio > 0.3) {
        overallSentiment = "mixed";
        overallConfidence = 0.7;
      } else {
        overallSentiment = "neutral";
        overallConfidence = 0.6 + (totalNeutral / total) * 0.3;
      }
    }

    const tensionPoints = identifyTensionPoints(participantStatements, participantSentiments);
    const emotionalHighlights = identifyEmotionalHighlights(participantStatements, participantSentiments);

    return {
      overall_sentiment: overallSentiment,
      overall_confidence: Math.round(overallConfidence * 100) / 100,
      participant_emotions: participantEmotions,
      emotional_highlights: emotionalHighlights.length > 0 ? emotionalHighlights : ["Professional discussion maintained throughout"],
      tension_points: tensionPoints.length > 0 ? tensionPoints : [],
    };
  } catch (error) {
    console.error("Error in analyzeTranscriptEmotions:", error);
    return defaultResult;
  }
}

// Optional: Pre-load the model
getSentimentClassifier().catch(console.error);
