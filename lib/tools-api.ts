import { getPromptTemplate } from "./prompt-templates"

interface ToolResponse {
  success: boolean
  content?: string
  error?: string
}

async function callToolsAPI(
  toolId: string,
  systemPrompt: string,
  userPrompt: string,
  model = "openai/gpt-4o-mini"
): Promise<ToolResponse> {
  try {
    const response = await fetch("/api/tools/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        toolId,
        systemPrompt,
        userPrompt,
        model,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error calling ${toolId} tool:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function generateEmailResponse(params: {
  emailHistory: string
  instructions: string
  tone: string
}): Promise<ToolResponse> {
  const { systemPrompt, userPrompt } = getPromptTemplate("email-responder", params)
  return callToolsAPI("email-responder", systemPrompt, userPrompt)
}

export async function generateSocialMediaPost(params: {
  platform: string
  topic: string
  audience: string
  callToAction?: string
  includeHashtags: boolean
  count?: number
}): Promise<ToolResponse> {
  const { systemPrompt, userPrompt } = getPromptTemplate("social-media-generator", params)
  return callToolsAPI("social-media-generator", systemPrompt, userPrompt)
}

export async function generateSummary(params: {
  content: string
  length: string
  format: string
}): Promise<ToolResponse> {
  const { systemPrompt, userPrompt } = getPromptTemplate("summarizer", params)
  return callToolsAPI("summarizer", systemPrompt, userPrompt)
}

export async function generateDiagram(params: {
  description: string
  type: string
}): Promise<ToolResponse> {
  const { systemPrompt, userPrompt } = getPromptTemplate("diagrammer", params)
  return callToolsAPI("diagrammer", systemPrompt, userPrompt, "openai/gpt-4o-mini")
}
