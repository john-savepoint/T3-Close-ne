import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextRequest } from "next/server"
import { SupportedModel } from "@/types/models"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { Id } from "@/convex/_generated/dataModel"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { messages, model, apiKey, includeMemory = true, projectId, ...options } = await req.json()

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

    // Create OpenAI client configured for OpenRouter
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterApiKey,
    })

    // Prepare messages with project context and memory
    let contextualMessages = messages

    // Add project context if projectId is provided
    if (projectId) {
      try {
        // Get project data using fetchQuery for Edge runtime compatibility
        const project = await fetchQuery(api.projects.get, {
          projectId: projectId as Id<"projects">,
        })

        if (project) {
          const projectContext = []

          // Add project system prompt if available
          if (project.systemPrompt) {
            projectContext.push({
              role: "system",
              content: project.systemPrompt,
            })
          }

          // Add project attachments if available
          if (project.attachments && project.attachments.length > 0) {
            const attachmentContext = project.attachments
              .filter((att) => att.content)
              .map((att) => `--- FILE: ${att.name} ---\n${att.content || ""}\n--- END FILE ---`)
              .join("\n\n")

            if (attachmentContext) {
              // Basic context size validation - warn if very large
              const estimatedTokens = attachmentContext.length / 4 // rough estimation
              if (estimatedTokens > 50000) {
                contextualMessages = [
                  {
                    role: "system",
                    content: "⚠️ Project context is very large and may affect response quality. Consider reducing file sizes.",
                  },
                  ...contextualMessages,
                ]
              }

              projectContext.push({
                role: "system",
                content: `Project files:\n\n${attachmentContext}`,
              })
            }
          }

          // Prepend project context to messages
          contextualMessages = [...projectContext, ...contextualMessages]
        }
      } catch (error) {
        console.error("Failed to fetch project context:", error)
        // Add user-facing feedback when project context fails to load
        contextualMessages = [
          {
            role: "system",
            content: "⚠️ Unable to load project context. Continuing without project files and prompts.",
          },
          ...contextualMessages,
        ]
      }
    }

    // TODO: If includeMemory is true and memory/context system is implemented,
    // inject user's memory context here before the messages array
    // For now, we just pass through the messages as-is

    const result = streamText({
      model: openrouter(selectedModel),
      messages: contextualMessages.map((msg: any) => ({
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
