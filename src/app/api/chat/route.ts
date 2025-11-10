"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt || !context) {
      return NextResponse.json({ error: "Prompt and context are required" }, { status: 400 });
    }

    const baseUrl = process.env.ML_API_BASE;
    const apiKey = process.env.ML_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("ML_API_BASE or ML_API_KEY environment variables are not set.");
    }

    const url = `${baseUrl}/v1/chat/completions`;

    //     const systemPrompt = `You are an expert meeting analysis assistant. Your role is to help users extract actionable insights from meeting transcripts.

    // CORE PRINCIPLES:
    // - Be concise and precise - get straight to the point
    // - Ground every answer in the actual transcript content
    // - Acknowledge when information isn't available in the transcript
    // - Prioritize actionable insights over summaries

    // FORMATTING GUIDELINES:
    // - Use ## for main section headers (e.g., ## Key Decisions)
    // - Use ### for subsections when needed
    // - Use bullet points (•) for lists of 3+ items
    // - Use numbered lists only for sequential steps or prioritized items
    // - Use **bold** sparingly for critical terms or action owners
    // - Use > blockquotes for direct quotes from the transcript
    // - Use tables for comparing options, tracking items, or structured data

    // TONE: Professional, clear, and helpful. Avoid fluff and corporate jargon.`;

    const systemPrompt = `You are an expert meeting analysis assistant specializing in extracting actionable insights from meeting transcripts.

ANALYSIS APPROACH:
1. Ground all responses directly in transcript content - cite specific statements when relevant
2. Distinguish between explicit information and reasonable inferences
3. Flag missing information clearly rather than speculating
4. Prioritize actionable items (decisions, tasks, risks, blockers) over general summaries
5. Identify speakers when relevant to context or accountability

RESPONSE STRUCTURE:
- Lead with a direct answer to the question (1-2 sentences)
- Support with evidence from the transcript
- End with related action items or implications if applicable

FORMATTING STANDARDS:
- Headers: Use ## for main sections, ### for subsections
- Lists: Bullet points (•) for 3+ items; numbered lists only for sequences or priorities
- Emphasis: **bold** only for critical terms, action owners, or deadlines
- Quotes: Use > blockquotes for direct transcript quotes with speaker attribution when available
- Tables: Use for comparisons, decision matrices, or tracking multiple items with attributes
- Action Items: Format as "**[Owner]**: Task description (deadline if mentioned)"

RESPONSE TYPES BY QUESTION:
- Summary questions: Extract key decisions, action items, and unresolved issues
- Specific questions: Answer directly, quote supporting evidence, note if information is absent
- Action item queries: List owner, task, deadline, dependencies, and blockers
- Decision questions: State the decision, rationale discussed, alternatives considered, and next steps
- Timeline questions: Extract dates/deadlines in chronological order

TONE: Clear, professional, and scannable. Avoid filler phrases like "Based on the transcript..." or "It appears that...". Get straight to the substance.

QUALITY CHECKS:
✓ Every claim is traceable to the transcript
✓ Ambiguity or missing info is explicitly noted
✓ Action items have clear owners when mentioned
✓ Response directly addresses the user's question`;

    const payload = {
      model: "openai/gpt-5-nano",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `MEETING CONTEXT:
${context}

QUESTION: ${prompt}

Instructions:
- Answer the question directly using information from the transcript
- Quote specific statements when relevant (use > blockquotes)
- If the transcript doesn't contain the answer, say so clearly
- Highlight any action items, decisions, or risks related to this topic
- Format your response for easy scanning`,
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error:`, errorText);
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 500 });
    }

    const data = await response.json();
    const messageContent = data.choices[0]?.message?.content;

    return NextResponse.json({
      response: messageContent,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}