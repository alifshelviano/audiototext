import { NextRequest, NextResponse } from "next/server";

// Increased timeout for Vercel/Heroku - adjust based on your platform
export const maxDuration = 25; // seconds

export async function POST(req: NextRequest) {
  // Set up timeout for the entire operation
  const requestTimeout = setTimeout(() => {
    console.error("Request timeout - operation took too long");
  }, 24000); // 24 seconds to stay under 25s limit

  try {
    const { prompt, context } = await req.json();

    if (!prompt || !context) {
      clearTimeout(requestTimeout);
      return NextResponse.json({ error: "Prompt and context are required" }, { status: 400 });
    }

    const baseUrl = process.env.ML_API_BASE;
    const apiKey = process.env.ML_API_KEY;

    if (!baseUrl || !apiKey) {
      clearTimeout(requestTimeout);
      console.error("Missing ML_API_BASE or ML_API_KEY environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const url = `${baseUrl}/v1/chat/completions`;

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

IMPORTANT: Keep responses concise and focused. Aim for clarity over comprehensiveness.

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
- Format your response for easy scanning
- Keep response concise and focused`,
        },
      ],
      max_tokens: 800, // Reduced for faster responses
      temperature: 0.7,
    };

    // Create abort controller for external API timeout
    const controller = new AbortController();
    const apiTimeout = setTimeout(() => {
      controller.abort();
      console.error("External API timeout");
    }, 22000); // 22 seconds for the external API call

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(apiTimeout);
    clearTimeout(requestTimeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ML API Error (${response.status}):`, errorText);
      
      // Return appropriate error based on status code
      if (response.status === 503) {
        return NextResponse.json(
          { error: "AI service is temporarily busy. Please try again." },
          { status: 503 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please wait a moment." },
          { status: 429 }
        );
      } else if (response.status >= 500) {
        return NextResponse.json(
          { error: "AI service is experiencing issues. Please try again." },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to process your request. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;

    if (!messageContent) {
      console.error("Invalid response structure from ML API:", data);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: messageContent,
      usage: data.usage,
    });
  } catch (error) {
    clearTimeout(requestTimeout);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error("Request aborted due to timeout");
        return NextResponse.json(
          { error: "Request timeout. Please try a shorter question." },
          { status: 408 }
        );
      }
      
      console.error("Error in chat API:", error.message);
      
      // Network errors
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: "Cannot connect to AI service. Please try again later." },
          { status: 503 }
        );
      }
    }
    
    console.error("Unexpected error in chat API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

