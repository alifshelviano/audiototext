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
      // Use a proper multilingual sentiment analysis model
      sentimentClassifier = await pipeline(
        "text-classification",
        // "Xenova/multilingual-sentiment-analysis", // Proper multilingual sentiment model
        // "Xenova/roberta-base-go_emotions",
        // "Xenova/emotion_text_classifier",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
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
        console.log("Fallback multilingual sentiment model loaded successfully");
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
async function analyzeSentiment(text: string, language: "english" | "indonesian" | "korean" = "english"): Promise<SentimentResult[]> {
  if (!text?.trim()) {
    return [{ label: "neutral", score: 0.5 }];
  }

  try {
    const classifier = await getSentimentClassifier();

    if (!classifier) {
      return analyzeSentimentFallback(text, language);
    }

    // Truncate text to avoid performance issues
    const textToAnalyze = text.substring(0, 512);

    const results = await classifier(textToAnalyze);

    if (!results || results.length === 0) {
      return analyzeSentimentFallback(text, language);
    }

    // Multilingual model typically returns standard sentiment labels
    // Transform to our format and apply meeting context adjustments
    const transformedResults = results.map((result: any) => {
      let label = result.label.toLowerCase();
      let score = result.score;

      // Normalize labels to ensure consistency across different model outputs
      if (label === "positif" || label === "positive" || label === "pos" || label === "labur" || label === "긍정") {
        label = "positive";
      } else if (label === "negatif" || label === "negative" || label === "neg" || label === "negatib" || label === "부정") {
        label = "negative";
      } else if (label === "netral" || label === "neutral" || label === "neu" || label === "중립") {
        label = "neutral";
      }

      // Apply confidence adjustments for meeting context
      return adjustSentimentForMeetingContext(label, score, text, language);
    });

    return transformedResults;
  } catch (error) {
    console.error("Error in multilingual sentiment analysis:", error);
    return analyzeSentimentFallback(text, language);
  }
}

/**
 * Adjust sentiment results to be more appropriate for meeting contexts
 */
function adjustSentimentForMeetingContext(label: string, score: number, text: string, language: "english" | "indonesian" | "korean"): SentimentResult {
  const lowerText = text.toLowerCase();

  // Language-specific sentiment indicators
  const languageIndicators = {
    english: {
      positive: [
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
        "amazing",
        "nice",
        "cool",
        "love",
        "happy",
        "pleased",
        "satisfied",
      ],
      negative: [
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
        "hate",
        "angry",
        "frustrated",
        "disappointed",
        "upset",
        "annoyed",
        "stupid",
      ],
      neutral: ["maybe", "perhaps", "possibly", "might", "could", "not sure", "think", "believe", "feel", "probably", "consider", "discuss", "review", "analyze", "evaluate", "suggest", "propose"],
    },
    indonesian: {
      positive: [
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
        "senang",
        "puas",
        "luar biasa",
        "keren",
        "bagus sekali",
        "sempurna",
        "setuju sekali",
      ],
      negative: [
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
        "jelek",
        "buruk",
        "menyedihkan",
        "kesal",
        "marah",
        "frustasi",
        "kecewa",
      ],
      neutral: ["mungkin", "kemungkinan", "sepertinya", "kira", "anggap", "pikir", "diskusi", "bahas", "review", "analisis", "evaluasi", "pertimbang", "usul", "sarankan", "ajukan", "rasanya", "kayaknya"],
    },
    korean: {
      positive: ["좋아", "좋다", "대박", "최고", "완벽", "동의", "찬성", "지지", "감사", "고마워", "네", "예", "물론", "확실", "훌륭", "멋지", "기뻐", "행복", "만족", "완벽해", "좋아요", "잘했", "수고"],
      negative: ["안 좋아", "나쁘", "끔찍", "끔찍해", "반대", "문제", "이슈", "틀렸", "에러", "실패", "못하", "안 되", "어렵", "복잡", "혼란", "불분명", "싫어", "화나", "짜증", "실망", "답답"],
      neutral: ["아마", "어쩌면", "가능성", "생각", "믿어", "느껴", "아마도", "검토", "분석", "평가", "제안", "제의", "토론", "논의", "고려", "검토해", "생각해"],
    },
  };

  const indicators = languageIndicators[language] || languageIndicators.english;

  let adjustment = 0;
  let contextBoost = 0;

  // Apply context-based adjustments
  if (label === "negative") {
    // Check if the negative sentiment might be constructive criticism
    const hasPositiveContext = indicators.positive.some((indicator) => lowerText.includes(indicator));
    const hasNeutralContext = indicators.neutral.some((indicator) => lowerText.includes(indicator));

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
    const strongPositiveWords = language === "english" ? ["excellent", "awesome", "perfect", "fantastic"] : language === "indonesian" ? ["luar biasa", "sempurna", "hebat sekali"] : ["대박", "최고", "완벽해"];

    const hasStrongPositive = strongPositiveWords.some((word) => lowerText.includes(word));

    if (hasStrongPositive && score < 0.8) {
      adjustment = 0.15;
    } else if (score > 0.6 && score < 0.8) {
      adjustment = 0.1;
    }

    // Check if it's just polite conversation
    const politenessWords = language === "english" ? ["terima kasih", "thanks", "ok", "oke", "thank you"] : language === "indonesian" ? ["terima kasih", "ok", "oke", "siap"] : ["감사", "고마워", "네", "예"];

    const isJustPoliteness = politenessWords.some((polite) => lowerText.includes(polite));

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
function analyzeSentimentFallback(text: string, language: "english" | "indonesian" | "korean" = "english"): SentimentResult[] {
  if (!text?.trim()) {
    return [{ label: "neutral", score: 0.5 }];
  }

  const lowerText = text.toLowerCase();

  // Language-specific sentiment indicators
  const languageIndicators = {
    english: {
      positive: [
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
        "amazing",
        "nice",
        "cool",
        "love",
        "happy",
        "pleased",
        "satisfied",
      ],
      negative: [
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
        "hate",
        "angry",
        "frustrated",
        "disappointed",
        "upset",
        "annoyed",
        "stupid",
      ],
      neutral: ["maybe", "perhaps", "possibly", "might", "could", "not sure", "think", "believe", "feel", "probably", "consider", "discuss", "review", "analyze", "evaluate", "suggest", "propose"],
    },
    indonesian: {
      positive: [
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
        "senang",
        "puas",
        "luar biasa",
        "keren",
        "bagus sekali",
        "sempurna",
        "setuju sekali",
      ],
      negative: [
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
        "jelek",
        "buruk",
        "menyedihkan",
        "kesal",
        "marah",
        "frustasi",
        "kecewa",
      ],
      neutral: ["mungkin", "kemungkinan", "sepertinya", "kira", "anggap", "pikir", "diskusi", "bahas", "review", "analisis", "evaluasi", "pertimbang", "usul", "sarankan", "ajukan", "rasanya", "kayaknya"],
    },
    korean: {
      positive: ["좋아", "좋다", "대박", "최고", "완벽", "동의", "찬성", "지지", "감사", "고마워", "네", "예", "물론", "확실", "훌륭", "멋지", "기뻐", "행복", "만족", "완벽해", "좋아요", "잘했", "수고"],
      negative: ["안 좋아", "나쁘", "끔찍", "끔찍해", "반대", "문제", "이슈", "틀렸", "에러", "실패", "못하", "안 되", "어렵", "복잡", "혼란", "불분명", "싫어", "화나", "짜증", "실망", "답답"],
      neutral: ["아마", "어쩌면", "가능성", "생각", "믿어", "느껴", "아마도", "검토", "분석", "평가", "제안", "제의", "토론", "논의", "고려", "검토해", "생각해"],
    },
  };

  const indicators = languageIndicators[language] || languageIndicators.english;

  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  // Check for indicators with language weighting
  indicators.positive.forEach((indicator) => {
    const count = (lowerText.match(new RegExp(indicator, "g")) || []).length;
    positiveScore += count * 2;
  });

  indicators.negative.forEach((indicator) => {
    const count = (lowerText.match(new RegExp(indicator, "g")) || []).length;
    negativeScore += count * 2;
  });

  indicators.neutral.forEach((indicator) => {
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
function mapSentimentToEmotion(label: string, score: number, language: "english" | "indonesian" | "korean" = "english"): string {
  if (!label) return "neutral";

  const normalizedLabel = label.toLowerCase().trim();

  // Language-specific emotional tone mappings
  const emotionMappings = {
    english: {
      positive: {
        high: "enthusiastic",
        medium: "supportive",
        low: "positive",
      },
      negative: {
        high: "frustrated",
        medium: "concerned",
        low: "critical",
      },
    },
    indonesian: {
      positive: {
        high: "antusias",
        medium: "mendukung",
        low: "positif",
      },
      negative: {
        high: "frustasi",
        medium: "khawatir",
        low: "kritis",
      },
    },
    korean: {
      positive: {
        high: "열정적",
        medium: "지지하는",
        low: "긍정적",
      },
      negative: {
        high: "좌절한",
        medium: "걱정되는",
        low: "비판적인",
      },
    },
  };

  const mappings = emotionMappings[language] || emotionMappings.english;

  if (normalizedLabel.includes("positive")) {
    if (score > 0.85) return mappings.positive.high;
    if (score > 0.7) return mappings.positive.medium;
    if (score > 0.6) return mappings.positive.low;
    return "neutral";
  } else if (normalizedLabel.includes("negative")) {
    if (score > 0.85) return mappings.negative.high;
    if (score > 0.75) return mappings.negative.medium;
    if (score > 0.65) return mappings.negative.low;
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
  if (normalized.includes("positive") || normalized.includes("positif") || normalized.includes("긍정")) return "positive";
  if (normalized.includes("negative") || normalized.includes("negatif") || normalized.includes("부정")) return "negative";
  return "neutral";
}

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
function identifyTensionPoints(participantStatements: Map<string, string[]>, participantSentiments: Map<string, { label: string; score: number }>, language: "english" | "indonesian" | "korean" = "english"): string[] {
  const tensionPoints: string[] = [];

  if (!participantSentiments.size) return tensionPoints;

  // Language-specific tension indicators
  const tensionKeywords = {
    english: ["disagree", "no", "not", "don't", "can't", "won't", "against", "problem", "issue", "wrong", "error", "mistake", "hate", "angry"],
    indonesian: ["tidak setuju", "tidak", "gak", "ga", "masalah", "susah", "sulit", "repot", "ribet", "error", "gagal", "batal", "marah", "kesal"],
    korean: ["반대", "안", "못", "문제", "이슈", "틀렸", "에러", "실패", "어렵", "복잡", "혼란", "싫어", "화나", "짜증"],
  };

  const keywords = tensionKeywords[language] || tensionKeywords.english;

  // Check for strong negative sentiment
  const negativeParticipants: string[] = [];
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes("negative") && sentiment.score > 0.75) {
      negativeParticipants.push(participant);
    }
  });

  if (negativeParticipants.length > 0) {
    const message =
      language === "english"
        ? `Concerns raised by: ${negativeParticipants.join(", ")}`
        : language === "indonesian"
        ? `Kekhawatiran disampaikan oleh: ${negativeParticipants.join(", ")}`
        : `우려 사항 제기자: ${negativeParticipants.join(", ")}`;
    tensionPoints.push(message);
  }

  // Check for disagreement patterns
  const statements = Array.from(participantStatements.values()).flat();
  let disagreementCount = 0;

  statements.forEach((statement) => {
    if (!statement) return;

    const lowerStatement = statement.toLowerCase();
    if (keywords.some((keyword) => lowerStatement.includes(keyword))) {
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
function identifyEmotionalHighlights(participantStatements: Map<string, string[]>, participantSentiments: Map<string, { label: string; score: number }>, language: "english" | "indonesian" | "korean" = "english"): string[] {
  const highlights: string[] = [];

  if (!participantSentiments.size) return highlights;

  // Language-specific highlight messages
  const highlightMessages = {
    english: {
      positive: (participant: string) => `${participant} contributed positively to the discussion`,
      collaborative: (participant: string) => `${participant} showed collaborative spirit`,
    },
    indonesian: {
      positive: (participant: string) => `${participant} memberikan kontribusi positif dalam diskusi`,
      collaborative: (participant: string) => `${participant} menunjukkan semangat kolaboratif`,
    },
    korean: {
      positive: (participant: string) => `${participant} 님이 논의에 긍정적으로 기여함`,
      collaborative: (participant: string) => `${participant} 님이 협력적인 태도를 보임`,
    },
  };

  const messages = highlightMessages[language] || highlightMessages.english;

  // Find positive engagement
  participantSentiments.forEach((sentiment, participant) => {
    if (sentiment?.label?.toLowerCase().includes("positive") && sentiment.score > 0.65) {
      const statements = participantStatements.get(participant) || [];
      if (statements.length > 0) {
        highlights.push(messages.positive(participant));
      }
    }
  });

  // Look for collaborative moments
  const collaborativeWords = {
    english: ["agree", "support", "help", "collaborate", "team", "together", "we can"],
    indonesian: ["setuju", "dukung", "support", "bantu", "kolaborasi", "tim", "bersama"],
    korean: ["동의", "지지", "도움", "협력", "팀", "함께", "우리"],
  };

  const words = collaborativeWords[language] || collaborativeWords.english;

  participantStatements.forEach((statements, participant) => {
    const hasCollaboration = statements.some((statement) => words.some((word) => statement.toLowerCase().includes(word)));

    if (hasCollaboration && !highlights.some((h) => h.includes(participant))) {
      highlights.push(messages.collaborative(participant));
    }
  });

  return highlights.slice(0, 3);
}

/**
 * Main function to analyze emotions in meeting transcript
 */
export async function analyzeTranscriptEmotions(transcript: string, language: "english" | "indonesian" | "korean" = "english"): Promise<EmotionAnalysisResult> {
  const defaultMessages = {
    english: {
      noStatements: "No participant statements detected",
      professional: "Professional discussion maintained throughout",
      analysis: "Using multilingual sentiment analysis model",
    },
    indonesian: {
      noStatements: "Tidak ada pernyataan peserta yang terdeteksi",
      professional: "Diskusi profesional terjaga sepanjang rapat",
      analysis: "Menggunakan model analisis sentimen multibahasa",
    },
    korean: {
      noStatements: "참가자 발언이 감지되지 않음",
      professional: "전체적으로 전문적인 논의가 유지됨",
      analysis: "다국어 감정 분석 모델 사용 중",
    },
  };

  const messages = defaultMessages[language] || defaultMessages.english;

  const defaultResult: EmotionAnalysisResult = {
    overall_sentiment: "neutral",
    overall_confidence: 0,
    participant_emotions: [],
    emotional_highlights: [messages.analysis],
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
        emotional_highlights: [messages.noStatements],
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
        const sentimentResults = await analyzeSentiment(combinedText, language);

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
          emotionalTone: mapSentimentToEmotion(topSentiment.label, topSentiment.score, language),
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

    const tensionPoints = identifyTensionPoints(participantStatements, participantSentiments, language);
    const emotionalHighlights = identifyEmotionalHighlights(participantStatements, participantSentiments, language);

    return {
      overall_sentiment: overallSentiment,
      overall_confidence: Math.round(overallConfidence * 100) / 100,
      participant_emotions: participantEmotions,
      emotional_highlights: emotionalHighlights.length > 0 ? emotionalHighlights : [messages.professional],
      tension_points: tensionPoints.length > 0 ? tensionPoints : [],
    };
  } catch (error) {
    console.error("Error in analyzeTranscriptEmotions:", error);
    return defaultResult;
  }
}

// Optional: Pre-load the model
getSentimentClassifier().catch(console.error);
