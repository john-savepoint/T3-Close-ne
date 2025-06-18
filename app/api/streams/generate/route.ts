import { NextRequest, NextResponse } from "next/server"
import { ResumableStream, generateLLMStream } from "@/lib/resumable-streams"

export const dynamic = "force-dynamic"

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const clientData = rateLimitMap.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (clientData.count >= RATE_LIMIT_MAX) {
    return false
  }

  clientData.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting by IP
    const clientId =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { prompt, model = "openai/gpt-4o-mini" } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 })
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: "Prompt too long (max 10,000 characters)" },
        { status: 400 }
      )
    }

    // Create new resumable stream session
    const stream = new ResumableStream()
    await stream.initializeSession(prompt, model)

    // Start generation in background (don't await)
    generateLLMStream(stream, prompt, model).catch((error) => {
      console.error("Background stream generation failed:", error)
    })

    return NextResponse.json({
      sessionId: stream.getSessionId(),
      message: "Stream generation started",
    })
  } catch (error) {
    console.error("Stream generation API error:", error)
    return NextResponse.json({ error: "Failed to start stream generation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const stream = ResumableStream.getSessionById(sessionId)
    const sessionInfo = await stream.getSessionInfo()

    if (!sessionInfo) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const progress = await stream.getProgress()

    return NextResponse.json({
      session: sessionInfo,
      progress: progress,
    })
  } catch (error) {
    console.error("Stream info API error:", error)
    return NextResponse.json({ error: "Failed to get stream info" }, { status: 500 })
  }
}
