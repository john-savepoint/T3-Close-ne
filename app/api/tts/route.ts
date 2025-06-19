import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "edge"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
})

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "alloy", speed = 1.0 } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "Text is too long. Maximum 4096 characters allowed." },
        { status: 400 }
      )
    }

    // Validate voice option
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
    if (!validVoices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Must be one of: ${validVoices.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate speed
    if (speed < 0.25 || speed > 4.0) {
      return NextResponse.json({ error: "Speed must be between 0.25 and 4.0" }, { status: 400 })
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as any,
      input: text,
      response_format: "mp3",
      speed: speed,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error: any) {
    console.error("TTS Error:", error)

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error.status === 401) {
      return NextResponse.json({ error: "Invalid API key configuration" }, { status: 401 })
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please check your billing." },
        { status: 429 }
      )
    }

    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "Network error. Please check your connection and try again." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to generate speech",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
