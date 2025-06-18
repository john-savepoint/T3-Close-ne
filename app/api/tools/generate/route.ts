import { NextRequest } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://z6chat.savepoint.com.au",
    "X-Title": "Z6Chat Tools",
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      toolId,
      systemPrompt,
      userPrompt,
      model = "openai/gpt-4o-mini",
      temperature = 0.7,
    } = body

    if (!systemPrompt || !userPrompt) {
      return new Response("Missing required prompts", { status: 400 })
    }

    // Create completion with OpenRouter
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature,
      max_tokens: toolId === "diagrammer" ? 1500 : 2000,
      stream: false,
    })

    const content = completion.choices[0]?.message?.content || ""

    return new Response(
      JSON.stringify({
        success: true,
        content,
        model,
        usage: completion.usage,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Tool generation error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const status = errorMessage.includes("rate limit") ? 429 : 500

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export const runtime = "edge"
