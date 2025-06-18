import { NextResponse } from "next/server"
import { streamManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Use the secure streamManager instead of direct Redis client
    const connectionTest = await streamManager.testConnection()

    if (!connectionTest) {
      return NextResponse.json({ error: "Redis connection failed" }, { status: 500 })
    }

    // Test stream operations with debug data
    const debugSessionId = `debug-${Date.now()}`

    // Test metadata storage
    const testMetadata = {
      sessionId: debugSessionId,
      debug: true,
      timestamp: Date.now(),
    }
    await streamManager.setStreamMetadata(debugSessionId, testMetadata)

    // Test chunk storage
    await streamManager.addStreamChunk(debugSessionId, {
      type: "debug",
      content: "Debug chunk test",
      index: 0,
    })

    // Test status storage
    await streamManager.setStreamStatus(debugSessionId, "completed")

    // Retrieve all test data
    const retrievedMetadata = await streamManager.getStreamMetadata(debugSessionId)
    const retrievedChunks = await streamManager.getStreamChunks(debugSessionId)
    const retrievedStatus = await streamManager.getStreamStatus(debugSessionId)

    // Cleanup debug data
    await streamManager.deleteStream(debugSessionId)

    return NextResponse.json({
      success: true,
      connection: connectionTest,
      tests: {
        metadata: {
          original: testMetadata,
          retrieved: retrievedMetadata,
        },
        chunks: {
          count: retrievedChunks.length,
          data: retrievedChunks,
        },
        status: {
          retrieved: retrievedStatus,
        },
      },
    })
  } catch (error) {
    console.error("Debug Redis error:", error)
    return NextResponse.json(
      {
        error: "Redis debug test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
