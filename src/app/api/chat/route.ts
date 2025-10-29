'use server';

import { NextRequest, NextResponse } from 'next/server';

// This route uses a direct `fetch` call to communicate with the proxy,
// as the `openai` library was causing authentication and URL issues.

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt || !context) {
      return NextResponse.json({ error: 'Prompt and context are required' }, { status: 400 });
    }

    // The base URL is taken from an environment variable.
    const baseUrl = process.env.ML_API_BASE;
    const apiKey = process.env.ML_API_KEY;

    if (!baseUrl || !apiKey) {
        throw new Error('ML_API_BASE or ML_API_KEY environment variables are not set. Please check your .env.local file.');
    }

    // The full API endpoint is constructed by appending the correct path.
    const url = `${baseUrl}/v1/chat/completions`;

    const payload = {
      model: 'openai/gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions about meeting transcripts.'
        },
        {
          role: 'user',
          content: `Here is the meeting transcript:\n\n${context}\n\n---\n\nMy question is: ${prompt}`
        }
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from proxy API (status: ${response.status}):`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: 'The AI service returned a non-JSON response.', details: errorText };
        }

        return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    const messageContent = data.choices[0]?.message?.content;

    return NextResponse.json({ response: messageContent });

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
