import type { ChatMessage } from "@/types/chat"

export interface ExportOptions {
  includeTimestamps?: boolean
  includeModelInfo?: boolean
  includeUserPrompts?: boolean
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid filename characters
  return (
    filename
      .replace(/[<>:"/\\|?*]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100) || // Limit length
    "chat-export"
  )
}

export function formatAsMarkdown(
  messages: ChatMessage[],
  title?: string,
  options: ExportOptions = {}
): string {
  const { includeTimestamps = false, includeModelInfo = false, includeUserPrompts = true } = options

  let markdown = ""

  // Add title if provided
  if (title) {
    markdown += `# ${title}\n\n`
  }

  // Add export metadata
  markdown += `*Exported from T3Chat on ${new Date().toLocaleDateString()}*\n\n`
  markdown += "---\n\n"

  messages.forEach((message, index) => {
    // Skip user prompts if option is disabled
    if (!includeUserPrompts && message.type === "user") {
      return
    }

    const role = message.type === "user" ? "User" : "Assistant"
    const timestamp = includeTimestamps ? ` (${message.timestamp.toLocaleString()})` : ""
    const model = includeModelInfo && message.model ? ` [${message.model}]` : ""

    // Add role header
    markdown += `## ${role}${timestamp}${model}\n\n`

    // Add message content
    markdown += `${message.content}\n\n`

    // Add separator between messages (except for last message)
    if (index < messages.length - 1) {
      markdown += "---\n\n"
    }
  })

  return markdown
}

export function formatAsPlainText(
  messages: ChatMessage[],
  title?: string,
  options: ExportOptions = {}
): string {
  const { includeTimestamps = false, includeModelInfo = false, includeUserPrompts = true } = options

  let text = ""

  // Add title if provided
  if (title) {
    text += `${title}\n`
    text += "=".repeat(title.length) + "\n\n"
  }

  // Add export metadata
  text += `Exported from T3Chat on ${new Date().toLocaleDateString()}\n\n`
  text += "-".repeat(50) + "\n\n"

  messages.forEach((message, index) => {
    // Skip user prompts if option is disabled
    if (!includeUserPrompts && message.type === "user") {
      return
    }

    const role = message.type === "user" ? "USER" : "AI"
    const timestamp = includeTimestamps ? ` (${message.timestamp.toLocaleString()})` : ""
    const model = includeModelInfo && message.model ? ` [${message.model}]` : ""

    // Add role header
    text += `${role}${timestamp}${model}:\n`

    // Add message content with proper indentation for readability
    const content = message.content
      .split("\n")
      .map((line) => (line.trim() ? `  ${line}` : ""))
      .join("\n")

    text += `${content}\n\n`

    // Add separator between messages (except for last message)
    if (index < messages.length - 1) {
      text += "-".repeat(30) + "\n\n"
    }
  })

  return text
}

export function formatAsJSON(
  messages: ChatMessage[],
  title?: string,
  options: ExportOptions = {}
): string {
  const exportData = {
    title: title || "Untitled Chat",
    exportedAt: new Date().toISOString(),
    exportedFrom: "T3Chat",
    options,
    messageCount: messages.length,
    messages: messages.map((message) => ({
      id: message.id,
      type: message.type,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      model: message.model || null,
    })),
  }

  return JSON.stringify(exportData, null, 2)
}

// Placeholder for future PDF export
export function formatAsPDF(
  messages: ChatMessage[],
  title?: string,
  options: ExportOptions = {}
): Promise<Blob> {
  // This would be implemented as a server-side operation
  throw new Error("PDF export not yet implemented - requires server-side processing")
}
