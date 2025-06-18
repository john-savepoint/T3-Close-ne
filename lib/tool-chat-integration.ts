// Utilities for integrating tool results with chat conversations

interface ToolContext {
  toolId: string
  toolName: string
  input: Record<string, any>
  result: string
}

/**
 * Creates a URL that navigates to the main chat with tool context
 */
export function createChatUrl(context: ToolContext): string {
  const formattedMessage = formatToolResultForChat(context)
  const encodedContext = encodeURIComponent(
    JSON.stringify({
      type: "tool-result",
      tool: context.toolName,
      content: formattedMessage,
    })
  )

  return `/?tool-context=${encodedContext}`
}

/**
 * Formats tool results for display in chat
 */
export function formatToolResultForChat(context: ToolContext): string {
  const { toolName, input, result } = context

  let formattedInput = ""

  // Format input parameters based on tool type
  switch (context.toolId) {
    case "email-responder":
      formattedInput = `**Email History:** ${input.emailHistory.substring(0, 200)}...\n**Instructions:** ${input.instructions}\n**Tone:** ${input.tone}`
      break

    case "social-media-generator":
      formattedInput = `**Platform:** ${input.platform}\n**Topic:** ${input.topic}\n**Audience:** ${input.audience}`
      if (input.callToAction) formattedInput += `\n**Call to Action:** ${input.callToAction}`
      break

    case "summarizer":
      formattedInput = `**Content:** ${input.content.substring(0, 200)}...\n**Length:** ${input.length}\n**Format:** ${input.format}`
      break

    case "diagrammer":
      formattedInput = `**Description:** ${input.description}\n**Type:** ${input.type}`
      break

    default:
      formattedInput = Object.entries(input)
        .map(([key, value]) => `**${key}:** ${value}`)
        .join("\n")
  }

  return `## ${toolName} Result

### Input Parameters:
${formattedInput}

### Generated Output:
${result}

---
*Generated using ${toolName} tool. Continue the conversation to refine or expand on this result.*`
}

/**
 * Extracts tool context from URL parameters
 */
export function extractToolContextFromUrl(searchParams: URLSearchParams): ToolContext | null {
  const toolContextParam = searchParams.get("tool-context")
  if (!toolContextParam) return null

  try {
    const decoded = JSON.parse(decodeURIComponent(toolContextParam))
    if (decoded.type === "tool-result") {
      return {
        toolId: decoded.tool.toLowerCase().replace(/\s+/g, "-"),
        toolName: decoded.tool,
        input: {},
        result: decoded.content,
      }
    }
  } catch (error) {
    console.warn("Failed to parse tool context from URL:", error)
  }

  return null
}
