export interface ToolContext {
  toolId: string
  toolName: string
  input: Record<string, any>
  result: string
}

export function encodeToolContext(context: ToolContext): string {
  return encodeURIComponent(JSON.stringify(context))
}

export function decodeToolContext(encoded: string): ToolContext | null {
  try {
    return JSON.parse(decodeURIComponent(encoded))
  } catch {
    return null
  }
}

export function formatToolResultMessage(context: ToolContext): string {
  const { toolName, input, result } = context
  
  let message = `## ${toolName} Result\n\n`
  
  // Add context about the input
  if (toolName === "Email Responder") {
    message += `**Tone:** ${input.tone}\n\n`
    message += `**Instructions:** ${input.instructions}\n\n`
    message += `---\n\n`
  } else if (toolName === "Social Media Generator") {
    message += `**Platform:** ${input.platform}\n`
    message += `**Audience:** ${input.audience}\n`
    message += `**Topic:** ${input.topic}\n\n`
    message += `---\n\n`
  } else if (toolName === "Summarizer") {
    message += `**Length:** ${input.length}\n`
    message += `**Format:** ${input.format}\n\n`
    message += `---\n\n`
  }
  
  message += result
  
  return message
}

export function createChatUrl(context: ToolContext): string {
  return `/chat/new?tool=${encodeToolContext(context)}`
}