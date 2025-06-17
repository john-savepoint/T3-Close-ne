import { NextRequest, NextResponse } from 'next/server';
import { ResumableStream } from '@/lib/resumable-streams';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: sessionId } = params;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  const stream = ResumableStream.getSessionById(sessionId);
  const consumerName = `consumer:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  
  const encoder = new TextEncoder();

  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        // Send initial connection confirmation
        const connectMessage = JSON.stringify({ 
          type: 'connected', 
          sessionId,
          timestamp: Date.now() 
        });
        controller.enqueue(encoder.encode(`data: ${connectMessage}\n\n`));

        // First, send any existing chunks for resumption
        try {
          for await (const chunk of stream.readAllChunks()) {
            const message = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
            
            // If we've reached completion or error, we can stop here
            if (chunk.type === 'complete' || chunk.type === 'error') {
              controller.close();
              return;
            }
          }
        } catch (error) {
          console.error('Error reading existing chunks:', error);
        }

        // Then monitor for new chunks in real-time
        let isComplete = false;
        let retryCount = 0;
        const maxRetries = 30; // 30 seconds with 1-second intervals

        while (!isComplete && retryCount < maxRetries) {
          try {
            // Use Redis streams to get new messages
            const messages = await stream.readAllChunks();
            let hasNewData = false;
            
            // This is a simplified approach - in production you'd want to track the last seen message ID
            for await (const chunk of messages) {
              // Skip metadata chunks we've already sent
              if (chunk.type === 'metadata') continue;
              
              hasNewData = true;
              const message = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${message}\n\n`));

              if (chunk.type === 'complete' || chunk.type === 'error') {
                isComplete = true;
                break;
              }
            }

            if (!hasNewData) {
              // No new messages, wait before checking again
              await new Promise(resolve => setTimeout(resolve, 1000));
              retryCount++;
            } else {
              retryCount = 0; // Reset retry count if we got data
            }

          } catch (error) {
            console.error('Error in stream monitoring:', error);
            const errorMessage = JSON.stringify({
              type: 'error',
              error: 'Stream monitoring error',
              timestamp: Date.now()
            });
            controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`));
            break;
          }
        }

        if (retryCount >= maxRetries) {
          const timeoutMessage = JSON.stringify({
            type: 'timeout',
            message: 'Stream monitoring timeout',
            timestamp: Date.now()
          });
          controller.enqueue(encoder.encode(`data: ${timeoutMessage}\n\n`));
        }

        controller.close();
      },

      cancel() {
        console.log('Stream cancelled by client');
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('Stream endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to establish stream connection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const stream = ResumableStream.getSessionById(sessionId);
    const streamKey = stream.getStreamKey();
    
    // Delete the stream from Redis
    await stream.markComplete(); // Mark as complete first
    // Note: We're not actually deleting the stream immediately to allow for recovery
    // In production, you might want a cleanup job to delete old streams

    return NextResponse.json({
      message: 'Stream marked for cleanup',
      sessionId
    });

  } catch (error) {
    console.error('Stream deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete stream' },
      { status: 500 }
    );
  }
}