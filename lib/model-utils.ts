import { ChatModel } from "@/types/models"

// Model categorization constants
export const MODEL_CATEGORIES = {
  FAST_THRESHOLD: 0.001,
  BALANCED_THRESHOLD: 0.01,
} as const

export const MODEL_PRICE_RANGES = {
  FREE: 0,
  LOW: 0.001,
  MEDIUM: 0.01,
  HIGH: 0.1,
} as const

// Performance and retry constants
export const MODEL_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
} as const

// Model categorization logic
export function getModelCategory(model: ChatModel): "fast" | "balanced" | "heavy" {
  const avgCost = (model.costPer1kTokens.input + model.costPer1kTokens.output) / 2

  if (avgCost < MODEL_CATEGORIES.FAST_THRESHOLD) return "fast"
  if (avgCost < MODEL_CATEGORIES.BALANCED_THRESHOLD) return "balanced"
  return "heavy"
}

// Price formatting utility
export function formatPrice(price: number): string {
  if (price === MODEL_PRICE_RANGES.FREE) return "Free"
  if (price < MODEL_PRICE_RANGES.LOW) return `$${(price * 1000).toFixed(3)}/1K`
  return `$${price.toFixed(3)}/1K`
}

// Token formatting utility
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${Math.round(tokens / 1000000)}M`
  }
  return `${Math.round(tokens / 1000)}K`
}

// Model sorting utility
export function sortModelsByPreference(models: ChatModel[]): ChatModel[] {
  const providerOrder = ["openai", "anthropic", "google", "meta-llama", "mistralai"]
  
  return models.sort((a: ChatModel, b: ChatModel) => {
    const aIndex = providerOrder.indexOf(a.provider.toLowerCase())
    const bIndex = providerOrder.indexOf(b.provider.toLowerCase())

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    return a.name.localeCompare(b.name)
  })
}

// Cost calculation utility
export function calculateModelCost(
  inputTokens: number,
  outputTokens: number,
  model: ChatModel
): number {
  const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input
  const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output
  return inputCost + outputCost
}

// Model filtering utility
export function filterModelsByCapabilities(
  models: ChatModel[],
  filters: {
    supportsVision?: boolean
    minContextLength?: number
    maxCost?: number
    provider?: string
  }
): ChatModel[] {
  return models.filter((model) => {
    if (filters.supportsVision && !model.architecture?.input_modalities?.includes("image")) {
      return false
    }

    if (filters.minContextLength && model.maxTokens < filters.minContextLength) {
      return false
    }

    if (filters.maxCost) {
      const avgCost = (model.costPer1kTokens.input + model.costPer1kTokens.output) / 2
      if (avgCost > filters.maxCost) {
        return false
      }
    }

    if (filters.provider && model.provider.toLowerCase() !== filters.provider.toLowerCase()) {
      return false
    }

    return true
  })
}

// Search utility
export function searchModels(models: ChatModel[], query: string): ChatModel[] {
  if (!query.trim()) return models

  const lowercaseQuery = query.toLowerCase()
  return models.filter(
    (model) =>
      model.name.toLowerCase().includes(lowercaseQuery) ||
      model.provider.toLowerCase().includes(lowercaseQuery) ||
      model.id.toLowerCase().includes(lowercaseQuery) ||
      (model.description && model.description.toLowerCase().includes(lowercaseQuery))
  )
}