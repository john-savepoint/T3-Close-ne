import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "edge"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // File size validation (25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 25MB allowed." }, { status: 400 })
    }

    // Validate audio file type
    const allowedTypes = [
      "audio/mp3",
      "audio/mp4",
      "audio/mpeg",
      "audio/mpga",
      "audio/m4a",
      "audio/wav",
      "audio/webm",
      "audio/flac",
      "audio/oga",
      "audio/ogg",
    ]

    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        {
          error: "Unsupported audio format. Please use MP3, WAV, WebM, or other supported formats.",
        },
        { status: 400 }
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "json",
      language: "en", // Optional: specify language for better accuracy
    })

    return NextResponse.json({
      text: transcription.text,
    })
  } catch (error: any) {
    console.error("Transcription error:", error)

    // Handle specific OpenAI errors
    if (error.code === "insufficient_quota") {
      return NextResponse.json({ error: "API quota exceeded" }, { status: 429 })
    }

    if (error.code === "rate_limit_exceeded") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    if (error.message?.includes("API key")) {
      return NextResponse.json({ error: "Invalid API key configuration" }, { status: 401 })
    }

    if (error.message?.includes("File size")) {
      return NextResponse.json(
        { error: "Audio file is too large. Maximum size is 25MB." },
        { status: 400 }
      )
    }

    if (error.message?.includes("format")) {
      return NextResponse.json(
        { error: "Unsupported audio format. Please use MP3, WAV, or WebM." },
        { status: 400 }
      )
    }

    // Network errors
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "Network error. Please check your connection and try again." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: "Transcription failed. Please try again.",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
