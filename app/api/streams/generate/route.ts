import { NextRequest, NextResponse } from 'next/server';
import { ResumableStream, generateLLMStream } from '@/lib/resumable-streams';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, model = 'openai/gpt-4o-mini' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Create new resumable stream session
    const stream = new ResumableStream();
    await stream.initializeSession(prompt, model);

    // Start generation in background (don't await)
    generateLLMStream(stream, prompt, model).catch(error => {
      console.error('Background stream generation failed:', error);
    });

    return NextResponse.json({
      sessionId: stream.getSessionId(),
      message: 'Stream generation started'
    });

  } catch (error) {
    console.error('Stream generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to start stream generation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const stream = ResumableStream.getSessionById(sessionId);
    const sessionInfo = await stream.getSessionInfo();

    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const progress = await stream.getProgress();

    return NextResponse.json({
      session: sessionInfo,
      progress: progress
    });

  } catch (error) {
    console.error('Stream info API error:', error);
    return NextResponse.json(
      { error: 'Failed to get stream info' },
      { status: 500 }
    );
  }
}