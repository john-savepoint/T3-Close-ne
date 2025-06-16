import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { createOpenRouterClient } from '@/lib/openrouter';
import { SupportedModel } from '@/types/models';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey, ...options } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages are required', { status: 400 });
    }

    let openRouterApiKey = apiKey || process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      return new Response('OpenRouter API key is required', { status: 401 });
    }

    const selectedModel = (model as SupportedModel) || 'openai/gpt-4o-mini';
    
    const openRouterClient = createOpenRouterClient(openRouterApiKey);

    if (!openRouterClient.isValidModel(selectedModel)) {
      return new Response('Invalid model specified', { status: 400 });
    }

    const stream = openRouterClient.streamChat(
      messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      selectedModel,
      {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 4096,
        topP: options.topP || 1
      }
    );

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(readableStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: errorMessage 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get('apiKey') || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return new Response('API key is required', { status: 401 });
    }

    const client = createOpenRouterClient(apiKey);
    const models = client.getAvailableModels();
    
    return new Response(JSON.stringify({ models }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Models API error:', error);
    return new Response('Failed to fetch models', { status: 500 });
  }
}