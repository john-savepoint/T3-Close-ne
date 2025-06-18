import { NextResponse } from "next/server"
import { streamManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Test basic Redis connection
    const connectionTest = await streamManager.testConnection()

    if (!connectionTest) {
      return NextResponse.json({ error: "Redis connection failed" }, { status: 500 })
    }

    // Test stream operations
    const testSessionId = `test-${Date.now()}`

    // Set metadata
    await streamManager.setStreamMetadata(testSessionId, {
      sessionId: testSessionId,
      prompt: "Test prompt",
      model: "test-model",
      createdAt: Date.now(),
    })

    // Add some chunks
    await streamManager.addStreamChunk(testSessionId, {
      type: "chunk",
      content: "Hello",
      index: 0,
    })

    await streamManager.addStreamChunk(testSessionId, {
      type: "chunk",
      content: " World!",
      index: 1,
    })

    // Set status
    await streamManager.setStreamStatus(testSessionId, "completed")

    // Wait a moment for data to propagate
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Read back data immediately
    const metadata = await streamManager.getStreamMetadata(testSessionId)
    const chunks = await streamManager.getStreamChunks(testSessionId)
    const status = await streamManager.getStreamStatus(testSessionId)

    console.log("Test session ID:", testSessionId)
    console.log("Test data:", { metadata, chunks, status })

    // Cleanup test data
    await streamManager.deleteStream(testSessionId)

    return NextResponse.json({
      success: true,
      connection: connectionTest,
      test: {
        metadata,
        chunks,
        status,
        totalChunks: chunks.length,
      },
    })
  } catch (error) {
    console.error("Redis test error:", error)
    return NextResponse.json(
      {
        error: "Redis test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
