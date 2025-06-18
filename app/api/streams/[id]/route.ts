import { NextRequest, NextResponse } from "next/server"
import { ResumableStream } from "@/lib/resumable-streams"
import { streamManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

function validateSessionId(sessionId: string): boolean {
  // Session ID should be alphanumeric with dashes/underscores, 8-50 chars
  const sessionIdRegex = /^[a-zA-Z0-9_-]{8,50}$/
  return sessionIdRegex.test(sessionId)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  if (!validateSessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 })
  }

  // Check if stream exists
  const streamExists = await streamManager.streamExists(sessionId)
  if (!streamExists) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 })
  }

  const encoder = new TextEncoder()

  try {
    const readableStream = new ReadableStream({
      async start(controller) {
        // Send initial connection confirmation
        const connectMessage = JSON.stringify({
          type: "connected",
          sessionId,
          timestamp: Date.now(),
        })
        controller.enqueue(encoder.encode(`data: ${connectMessage}\n\n`))

        // Get current stream status
        const status = await streamManager.getStreamStatus(sessionId)
        let lastChunkCount = 0
        let isComplete = status?.status === "completed" || status?.status === "error"

        // Send any existing chunks first
        const existingChunks = await streamManager.getStreamChunks(sessionId)
        for (const chunk of existingChunks) {
          const message = JSON.stringify(chunk)
          controller.enqueue(encoder.encode(`data: ${message}\n\n`))

          if (chunk.type === "complete" || chunk.type === "error") {
            isComplete = true
          }
        }
        lastChunkCount = existingChunks.length

        // If already complete, close the stream
        if (isComplete) {
          controller.close()
          return
        }

        // Poll for new chunks while generation is in progress
        let retryCount = 0
        const maxRetries = 60 // 60 seconds max wait

        while (!isComplete && retryCount < maxRetries) {
          try {
            // Check for new chunks
            const currentChunks = await streamManager.getStreamChunks(sessionId)

            // Send any new chunks
            if (currentChunks.length > lastChunkCount) {
              const newChunks = currentChunks.slice(lastChunkCount)
              for (const chunk of newChunks) {
                const message = JSON.stringify(chunk)
                controller.enqueue(encoder.encode(`data: ${message}\n\n`))

                if (chunk.type === "complete" || chunk.type === "error") {
                  isComplete = true
                  break
                }
              }
              lastChunkCount = currentChunks.length
              retryCount = 0 // Reset retry count when we get new data
            }

            // Check status
            const currentStatus = await streamManager.getStreamStatus(sessionId)
            if (currentStatus?.status === "completed" || currentStatus?.status === "error") {
              if (!isComplete) {
                // Send final status message
                const statusMessage = JSON.stringify({
                  type: currentStatus.status,
                  timestamp: currentStatus.timestamp,
                  ...(currentStatus.error && { error: currentStatus.error }),
                })
                controller.enqueue(encoder.encode(`data: ${statusMessage}\n\n`))
              }
              isComplete = true
              break
            }

            if (!isComplete) {
              // Wait before polling again
              await new Promise((resolve) => setTimeout(resolve, 1000))
              retryCount++
            }
          } catch (error) {
            console.error("Error polling for chunks:", error)
            const errorMessage = JSON.stringify({
              type: "error",
              error: "Stream monitoring error",
              timestamp: Date.now(),
            })
            controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`))
            break
          }
        }

        if (retryCount >= maxRetries && !isComplete) {
          const timeoutMessage = JSON.stringify({
            type: "timeout",
            message: "Stream monitoring timeout - generation may still be in progress",
            timestamp: Date.now(),
          })
          controller.enqueue(encoder.encode(`data: ${timeoutMessage}\n\n`))
        }

        controller.close()
      },

      cancel() {
        console.log("Stream cancelled by client")
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    })
  } catch (error) {
    console.error("Stream endpoint error:", error)
    return NextResponse.json({ error: "Failed to establish stream connection" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    if (!validateSessionId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 })
    }

    // Check if stream exists
    const streamExists = await streamManager.streamExists(sessionId)
    if (!streamExists) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 })
    }

    // Delete the stream from Redis
    await streamManager.deleteStream(sessionId)

    return NextResponse.json({
      message: "Stream deleted successfully",
      sessionId,
    })
  } catch (error) {
    console.error("Stream deletion error:", error)
    return NextResponse.json({ error: "Failed to delete stream" }, { status: 500 })
  }
}
