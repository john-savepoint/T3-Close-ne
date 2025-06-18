import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { SupportedModel } from "@/types/models"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { Id } from "@/convex/_generated/dataModel"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    // Check authentication with detailed error response
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          message: 'Please sign in to use the chat feature',
          code: 'AUTH_REQUIRED'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { messages, model, apiKey, memoryContext, includeMemory = true, projectId, ...options } = await req.json()

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

<<<<<<< HEAD
    // Inject memory context if provided
    const enhancedMessages = [...messages]
    if (memoryContext && memoryContext.length > 0) {
      try {
        // Validate context length (OpenAI has token limits)
        let contextToUse = memoryContext
        if (contextToUse.length > 8000) {
          console.warn("Memory context exceeds recommended length, truncating...")
          contextToUse =
            contextToUse.substring(0, 8000) + "\n[... additional memories truncated ...]"
        }

        const memoryPrompt = `--- User Context & Preferences ---\n${contextToUse}\n--- End User Context ---\n\n`

        // Find or create system message
        const systemMessageIndex = enhancedMessages.findIndex((msg) => msg.role === "system")

        if (systemMessageIndex >= 0) {
          // Properly format existing system message
          const existingContent = enhancedMessages[systemMessageIndex].content
          enhancedMessages[systemMessageIndex].content = memoryPrompt + existingContent
        } else {
          // Add new system message at the beginning
          enhancedMessages.unshift({
            role: "system",
            content: memoryPrompt,
          })
        }
      } catch (error) {
        console.error("Failed to inject memory context:", error)
        // Continue without memory context if injection fails
      }
    }

    const result = streamText({
      model: openrouter(selectedModel),
      messages: enhancedMessages.map((msg: any) => ({
=======
    // Prepare messages with project context and memory
    let contextualMessages = messages

    // Add project context if projectId is provided
    if (projectId) {
      try {
        // Get project data using Convex's Edge-compatible method
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

          // Validate total context size (rough token estimation: 1 token ≈ 4 characters)
          const totalContextContent = projectContext.map(ctx => ctx.content).join("\n")
          const estimatedTokens = Math.ceil(totalContextContent.length / 4)
          
          if (estimatedTokens > 8000) { // Conservative limit for most models
            console.warn(`Project context is large (${estimatedTokens} estimated tokens). Consider reducing file content.`)
            
            // Add warning to user
            projectContext.unshift({
              role: "system",
              content: "Note: Project context is quite large and may affect response quality. Consider reducing file attachments if you experience issues."
            })
          }

          // Prepend project context to messages
          contextualMessages = [...projectContext, ...contextualMessages]
        }
      } catch (error) {
        console.error("Failed to fetch project context:", error)
        
        // Add a system message to inform user of context loading failure
        contextualMessages = [
          {
            role: "system",
            content: "Note: Project context could not be loaded for this conversation. Continuing without project-specific context."
          },
          ...messages
        ]
      }
    }

    // TODO: If includeMemory is true and memory/context system is implemented,
    // inject user's memory context here before the messages array
    // For now, we just pass through the messages as-is

    const result = streamText({
      model: openrouter(selectedModel),
      messages: contextualMessages.map((msg: any) => ({
>>>>>>> 75cdef9 (feat(projects): implement complete projects system with context integration)
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
