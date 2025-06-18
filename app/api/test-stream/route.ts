import { NextRequest, NextResponse } from "next/server"
import { ResumableStream } from "@/lib/resumable-streams"

export const dynamic = "force-dynamic"

// Simulate LLM streaming without external API
async function simulateLLMStream(stream: ResumableStream, prompt: string): Promise<void> {
  try {
    const words = [
      "Artificial",
      "intelligence",
      "flows",
      "through",
      "digital",
      "streams,",
      "Processing",
      "thoughts",
      "at",
      "lightning",
      "speed.",
      "Silicon",
      "dreams",
      "and",
      "neural",
      "pathways",
      "weave",
      "complex",
      "patterns",
      "of",
      "understanding.",
      "In",
      "this",
      "realm",
      "of",
      "code",
      "and",
      "consciousness,",
      "machines",
      "learn",
      "to",
      "speak",
      "the",
      "language",
      "of",
      "humanity.",
    ]

    // Simulate streaming by sending words one by one
    for (let i = 0; i < words.length; i++) {
      const content = i === 0 ? words[i] : ` ${words[i]}`
      await stream.addChunk(content, i)

      // Random delay between 100-500ms to simulate realistic streaming
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 100))
    }

    // Mark as complete
    await stream.markComplete(words.length)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await stream.markError(errorMessage)
    console.error("Simulated LLM Stream generation error:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    // Create new resumable stream session
    const stream = new ResumableStream()
    await stream.initializeSession(prompt, "test-model")

    // Start generation in background (don't await)
    simulateLLMStream(stream, prompt).catch((error) => {
      console.error("Background stream generation failed:", error)
    })

    return NextResponse.json({
      sessionId: stream.getSessionId(),
      message: "Test stream generation started",
    })
  } catch (error) {
    console.error("Test stream generation API error:", error)
    return NextResponse.json({ error: "Failed to start test stream generation" }, { status: 500 })
  }
}
