import OpenAI from "openai"
import { ChatModel, DEFAULT_MODELS, SupportedModel } from "@/types/models"

export class OpenRouterClient {
  private client: OpenAI
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ""

    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required")
    }

    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: this.apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Z6Chat",
      },
    })
  }

  async *streamChat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    model: SupportedModel = "openai/gpt-4o-mini",
    options: {
      temperature?: number
      maxTokens?: number
      topP?: number
    } = {}
  ) {
    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        stream: true,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        top_p: options.topP ?? 1,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error("OpenRouter streaming error:", error)
      throw new Error("Failed to stream chat completion")
    }
  }

  async createChatCompletion(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    model: SupportedModel = "openai/gpt-4o-mini",
    options: {
      temperature?: number
      maxTokens?: number
      topP?: number
    } = {}
  ) {
    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        top_p: options.topP ?? 1,
      })

      return {
        content: completion.choices[0]?.message?.content || "",
        usage: completion.usage,
        model: completion.model,
      }
    } catch (error) {
      console.error("OpenRouter completion error:", error)
      throw new Error("Failed to create chat completion")
    }
  }

  async listModels() {
    try {
      const response = await this.client.models.list()
      return response.data.map((model) => ({
        id: model.id,
        name: model.id.split("/").pop() || model.id,
        provider: model.id.split("/")[0] || "unknown",
      }))
    } catch (error) {
      console.error("Error fetching models:", error)
      return DEFAULT_MODELS
    }
  }

  getAvailableModels(): ChatModel[] {
    return DEFAULT_MODELS
  }

  getModelById(modelId: string): ChatModel | undefined {
    return DEFAULT_MODELS.find((model) => model.id === modelId)
  }

  isValidModel(modelId: string): boolean {
    return DEFAULT_MODELS.some((model) => model.id === modelId)
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.createChatCompletion([{ role: "user", content: "Hello" }], "openai/gpt-4o-mini")
      return true
    } catch {
      return false
    }
  }
}

export function createOpenRouterClient(apiKey?: string): OpenRouterClient {
  return new OpenRouterClient(apiKey)
}

export function formatModelName(modelId: string): string {
  const model = DEFAULT_MODELS.find((m) => m.id === modelId)
  return model ? `${model.name} (${model.provider})` : modelId
}

export function calculateCost(inputTokens: number, outputTokens: number, modelId: string): number {
  const model = DEFAULT_MODELS.find((m) => m.id === modelId)
  if (!model) return 0

  const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input
  const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output

  return inputCost + outputCost
}
