import { generateFullPrompt } from "./prompt-templates"

export interface ToolGenerationOptions {
  toolId: string
  variables: Record<string, any>
  model?: string
  temperature?: number
}

export interface ToolGenerationResult {
  success: boolean
  content?: string
  error?: string
}

export async function generateToolResponse(
  options: ToolGenerationOptions
): Promise<ToolGenerationResult> {
  try {
    const prompt = generateFullPrompt(options.toolId, options.variables)
    if (!prompt) {
      return {
        success: false,
        error: "Tool template not found",
      }
    }

    const response = await fetch("/api/tools/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolId: options.toolId,
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        model: options.model || "openai/gpt-4o-mini",
        temperature: options.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        error: `API error: ${error}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      content: data.content,
    }
  } catch (error) {
    console.error("Tool generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Specific tool generation functions with proper typing
export async function generateEmailResponse(options: {
  emailHistory: string
  instructions: string
  tone: "formal" | "professional" | "casual" | "friendly"
  model?: string
}): Promise<ToolGenerationResult> {
  return generateToolResponse({
    toolId: "email-responder",
    variables: options,
    model: options.model,
  })
}

export async function generateSocialMediaPost(options: {
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok"
  topic: string
  audience: string
  callToAction?: string
  includeHashtags?: boolean
  count?: number
  model?: string
}): Promise<ToolGenerationResult> {
  return generateToolResponse({
    toolId: "social-media-generator",
    variables: {
      ...options,
      count: options.count || 3,
      includeHashtags: options.includeHashtags !== false,
    },
    model: options.model,
  })
}

export async function generateSummary(options: {
  content: string
  length: "short" | "medium" | "detailed"
  format: "paragraph" | "bullet-points"
  model?: string
}): Promise<ToolGenerationResult> {
  return generateToolResponse({
    toolId: "summarizer",
    variables: {
      ...options,
      format: options.format === "bullet-points" ? "bullet points" : options.format,
    },
    model: options.model,
  })
}

export async function generateDiagram(options: {
  description: string
  type: "flowchart" | "sequence" | "class" | "entity-relationship"
  model?: string
}): Promise<ToolGenerationResult> {
  return generateToolResponse({
    toolId: "diagrammer",
    variables: options,
    model: options.model,
  })
}