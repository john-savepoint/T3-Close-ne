import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextRequest } from "next/server"
import { SupportedModel } from "@/types/models"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey, memoryContext, ...options } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 })
    }

    let openRouterApiKey = apiKey || process.env.OPENROUTER_API_KEY

    if (!openRouterApiKey) {
      return new Response("OpenRouter API key is required", { status: 401 })
    }

    const selectedModel = (model as SupportedModel) || "openai/gpt-4o-mini"

    // Validate model is supported
    const SUPPORTED_MODELS = [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3-haiku",
      "google/gemini-2.0-flash-exp",
      "meta-llama/llama-3.1-8b-instruct",
      "mistralai/mistral-7b-instruct",
      "cohere/command-r-plus",
    ]

    if (!SUPPORTED_MODELS.includes(selectedModel)) {
      return new Response(
        JSON.stringify({
          error: "Invalid model specified",
          supportedModels: SUPPORTED_MODELS,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Inject memory context if provided
    const enhancedMessages = [...messages]
    if (memoryContext && memoryContext.length > 0) {
      const systemPrompt =
        "--- User Context & Preferences ---\n" + memoryContext + "\n--- End User Context ---\n\n"

      // Check if first message is already a system message
      if (enhancedMessages[0]?.role === "system") {
        // Prepend memories to existing system message
        enhancedMessages[0].content = systemPrompt + enhancedMessages[0].content
      } else {
        // Add new system message with memories
        enhancedMessages.unshift({
          role: "system",
          content: systemPrompt,
        })
      }
    }

    // Create OpenAI client configured for OpenRouter
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterApiKey,
    })

    const result = streamText({
      model: openrouter(selectedModel),
      messages: enhancedMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4096,
      topP: options.topP || 1,
      abortSignal: req.signal, // Forward abort signal for proper cleanup
    })

    // Return AI SDK's optimized data stream response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Handle specific error types for better UX
    if (errorMessage.toLowerCase().includes("rate limit")) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          details: "Please wait a moment before sending another message",
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      )
    }

    if (
      errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("api key")
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid API key",
          details: "Please check your OpenRouter API key configuration",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    if (errorMessage.toLowerCase().includes("timeout")) {
      return new Response(
        JSON.stringify({
          error: "Request timeout",
          details: "The request took too long to process. Please try again.",
        }),
        {
          status: 408,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const apiKey = searchParams.get("apiKey") || process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return new Response("API key is required", { status: 401 })
    }

    // Return available models for OpenRouter
    const models = [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3-haiku",
      "google/gemini-2.0-flash-exp",
      "meta-llama/llama-3.1-8b-instruct",
      "mistralai/mistral-7b-instruct",
      "cohere/command-r-plus",
    ]

    return new Response(JSON.stringify({ models }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Models API error:", error)
    return new Response("Failed to fetch models", { status: 500 })
  }
}
