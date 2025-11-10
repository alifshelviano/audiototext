"use server";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt || !context) {
      return new Response(
        JSON.stringify({ error: "Prompt and context are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const baseUrl = process.env.ML_API_BASE;
    const apiKey = process.env.ML_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error("ML_API_BASE or ML_API_KEY environment variables are not set.");
    }

    const url = `${baseUrl}/v1/chat/completions`;

    const systemPrompt = `You are an expert meeting analysis assistant. Your goal is to provide concise and accurate answers based on the provided meeting transcript.

ANALYSIS APPROACH:
1. Ground all responses directly in the transcript.
2. Prioritize actionable items (decisions, tasks).
3. Be direct and avoid speculation.

RESPONSE STRUCTURE:
- Provide a direct and concise answer to the question.
- Use bullet points for key details, if necessary.
- Keep the entire response as brief as possible.

FORMATTING:
- Use bullet points (•) for lists.
- Use **bold** for emphasis on key terms or action items.

TONE: Clear, concise, and professional. Get straight to the point. Avoid filler phrases.

QUALITY CHECKS:
✓ The answer is directly from the transcript.
✓ The response is concise and easy to read.`;

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
- Answer the question concisely based on the transcript.
- Highlight key action items or decisions.`,
        },
      ],
      stream: true, // Enable streaming
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
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a ReadableStream to forward the streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
