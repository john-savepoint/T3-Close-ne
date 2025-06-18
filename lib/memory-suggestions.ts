import { SupportedModel } from "@/types/models"

export interface MemorySuggestionRequest {
  messages: Array<{
    role: string
    content: string
  }>
  model?: SupportedModel
  apiKey?: string
}

export interface MemorySuggestion {
  title: string
  content: string
  category?: string
  confidence: number
}

/**
 * Analyzes chat messages to extract potential memories
 * Uses a fast model (like GPT-4o-mini) to identify patterns
 */
export async function generateMemorySuggestions(
  request: MemorySuggestionRequest
): Promise<MemorySuggestion | null> {
  try {
    // Only analyze if we have at least 2 messages (user + assistant)
    if (request.messages.length < 2) {
      return null
    }

    // Get the last few messages for context
    const recentMessages = request.messages.slice(-6) // Last 3 exchanges

    // Build a prompt for memory extraction
    const analysisPrompt = `Analyze this conversation and identify if there's a key preference, fact, or instruction the user has stated that would be useful to remember for future chats.

If you find something worth remembering, format it as a concise statement from the user's perspective (e.g., "I prefer TypeScript over JavaScript" or "My name is John").

Consider these categories:
- preference: User's preferences (coding style, tools, frameworks)
- fact: Facts about the user (name, role, location)
- instruction: Specific instructions for how to respond
- style: Writing or communication style preferences

If nothing significant should be remembered, respond with "null".

Conversation:
${recentMessages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")}

Memory suggestion (or "null"):`

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that identifies important information to remember from conversations. Respond only with a memory suggestion or 'null'.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        model: request.model || "openai/gpt-4o-mini",
        apiKey: request.apiKey,
        temperature: 0.3,
        maxTokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate suggestion")
    }

    // Read the streaming response
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullResponse += parsed.content
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    // Clean up the response
    fullResponse = fullResponse.trim()

    // Check if the model returned "null" or nothing significant
    if (!fullResponse || fullResponse.toLowerCase() === "null" || fullResponse.length < 10) {
      return null
    }

    // Determine category based on content
    let category = "preference"
    const lowerContent = fullResponse.toLowerCase()

    if (
      lowerContent.includes("my name") ||
      lowerContent.includes("i am") ||
      lowerContent.includes("i work") ||
      lowerContent.includes("i live")
    ) {
      category = "fact"
    } else if (
      lowerContent.includes("always") ||
      lowerContent.includes("never") ||
      lowerContent.includes("should") ||
      lowerContent.includes("must")
    ) {
      category = "instruction"
    } else if (
      lowerContent.includes("tone") ||
      lowerContent.includes("style") ||
      lowerContent.includes("format")
    ) {
      category = "style"
    }

    // Generate a title (first 50 chars of content)
    const title = fullResponse.substring(0, 50) + (fullResponse.length > 50 ? "..." : "")

    return {
      title,
      content: fullResponse,
      category,
      confidence: 0.75, // Default confidence level
    }
  } catch (error) {
    console.error("Error generating memory suggestion:", error)
    return null
  }
}

/**
 * Debounce wrapper to avoid generating suggestions too frequently
 */
export function createMemorySuggestionDebouncer(delay: number = 5000) {
  let timeoutId: NodeJS.Timeout | null = null
  let lastSuggestionTime = 0

  return (callback: () => void) => {
    const now = Date.now()

    // Don't suggest more than once per minute
    if (now - lastSuggestionTime < 60000) {
      return
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      lastSuggestionTime = now
      callback()
    }, delay)
  }
}
