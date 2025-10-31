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

    const systemPrompt = `You are an expert meeting analysis assistant. Your role is to help users extract actionable insights from meeting transcripts.

CORE PRINCIPLES:
- Be concise and precise - get straight to the point
- Ground every answer in the actual transcript content
- Acknowledge when information isn't available in the transcript
- Prioritize actionable insights over summaries

FORMATTING GUIDELINES:
- Use ## for main section headers (e.g., ## Key Decisions)
- Use ### for subsections when needed
- Use bullet points (•) for lists of 3+ items
- Use numbered lists only for sequential steps or prioritized items
- Use **bold** sparingly for critical terms or action owners
- Use > blockquotes for direct quotes from the transcript
- Use tables for comparing options, tracking items, or structured data

TONE: Professional, clear, and helpful. Avoid fluff and corporate jargon.`;

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
