import { NextRequest, NextResponse } from "next/server";

// Use the edge runtime for optimal streaming performance
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt || !context) {
      return NextResponse.json({ error: "Prompt and context are required" }, { status: 400 });
    }

    const baseUrl = process.env.ML_API_BASE;
    const apiKey = process.env.ML_API_KEY;

    if (!baseUrl || !apiKey) {
      console.error("ML_API_BASE or ML_API_KEY environment variables are not set.");
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
          content: `MEETING CONTEXT:\n${context}\n\nQUESTION: ${prompt}\n\nInstructions:\n- Answer the question directly using information from the transcript\n- Quote specific statements when relevant (use > blockquotes)\n- If the transcript doesn't contain the answer, say so clearly\n- Highlight any action items, decisions, or risks related to this topic\n- Format your response for easy scanning`,
        },
      ],
      stream: true,
    };

    // Create a streaming response that fetches from the ML API in the background
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
            // Duplex streaming allows us to start sending our response while the fetch is ongoing
            // @ts-expect-error
            duplex: "half",
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error:`, errorText);
            const errorMessage = encoder.encode(`data: ${JSON.stringify({ error: "Service temporarily unavailable" })}\n\n`);
            controller.enqueue(errorMessage);
            controller.close();
            return;
          }

          if (!response.body) {
            throw new Error("The response body is empty.");
          }

          // Pipe the response stream from the ML API to our controller
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          console.error("Error fetching from ML API:", error);
          const errorMessage = encoder.encode(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
          controller.enqueue(errorMessage);
        } finally {
          controller.close();
        }
      },
    });

    // Return the stream immediately to the client
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering in proxies
      },
    });

  } catch (error) {
    // This catches errors from the initial setup (e.g., req.json())
    console.error("Error in chat API setup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
