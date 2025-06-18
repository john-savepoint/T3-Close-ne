"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { OpenRouterModel, ChatModel } from "@/types/models"

interface ModelFilters {
  category?: string
  priceRange?: [number, number]
  minContextLength?: number
  inputModalities?: string[]
  provider?: string
}

interface UseModelsReturn {
  models: ChatModel[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  filter: (filters: ModelFilters) => void
  filteredModels: ChatModel[]
  selectedModel: ChatModel | null
  setSelectedModel: (model: ChatModel) => void
  calculateCost: (inputTokens: number, outputTokens: number, modelId: string) => number
  getModelById: (id: string) => ChatModel | undefined
  categories: string[]
  providers: string[]
}

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"

function convertOpenRouterModel(orModel: OpenRouterModel): ChatModel {
  const promptPrice = parseFloat(orModel.pricing.prompt) * 1000 // Convert to per 1k tokens
  const completionPrice = parseFloat(orModel.pricing.completion) * 1000

  return {
    id: orModel.id,
    name: orModel.name,
    provider: orModel.id.split("/")[0] || "unknown",
    maxTokens: orModel.context_length,
    supportsStreaming: true, // Most OpenRouter models support streaming
    costPer1kTokens: {
      input: promptPrice,
      output: completionPrice,
    },
    description: orModel.description || "",
    architecture: orModel.architecture,
    topProvider: orModel.top_provider,
    perRequestLimits: orModel.per_request_limits,
  }
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<ChatModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ModelFilters>({})
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
        headers: {
          "HTTP-Referer":
            typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          "X-Title": "Z6Chat",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      const convertedModels = data.data.map(convertOpenRouterModel)

      // Sort by popularity/provider preference
      const sortedModels = convertedModels.sort((a: ChatModel, b: ChatModel) => {
        const providerOrder = ["openai", "anthropic", "google", "meta-llama", "mistralai"]
        const aIndex = providerOrder.indexOf(a.provider.toLowerCase())
        const bIndex = providerOrder.indexOf(b.provider.toLowerCase())

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }
        if (aIndex !== -1) return -1
        if (bIndex !== -1) return 1

        return a.name.localeCompare(b.name)
      })

      setModels(sortedModels)

      // Set default selected model if none selected
      if (!selectedModel && sortedModels.length > 0) {
        const defaultModel =
          sortedModels.find((m: ChatModel) => m.id === "openai/gpt-4o-mini") || sortedModels[0]
        setSelectedModel(defaultModel)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch models")
      console.error("Error fetching models:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedModel])

  const filteredModels = useMemo(() => {
    return models.filter((model: ChatModel) => {
      if (filters.category && !model.id.toLowerCase().includes(filters.category.toLowerCase())) {
        return false
      }

      if (filters.provider && model.provider.toLowerCase() !== filters.provider.toLowerCase()) {
        return false
      }

      if (filters.priceRange) {
        const avgCost = (model.costPer1kTokens.input + model.costPer1kTokens.output) / 2
        if (avgCost < filters.priceRange[0] || avgCost > filters.priceRange[1]) {
          return false
        }
      }

      if (filters.minContextLength && model.maxTokens < filters.minContextLength) {
        return false
      }

      if (filters.inputModalities && filters.inputModalities.length > 0) {
        const modelModalities = model.architecture?.input_modalities || ["text"]
        const hasRequiredModalities = filters.inputModalities.every((modality) =>
          modelModalities.includes(modality)
        )
        if (!hasRequiredModalities) {
          return false
        }
      }

      return true
    })
  }, [models, filters])

  const categories = useMemo(() => {
    const allCategories = models.map((model) => model.provider)
    return Array.from(new Set(allCategories)).sort()
  }, [models])

  const providers = useMemo(() => {
    const allProviders = models.map((model) => model.provider)
    return Array.from(new Set(allProviders)).sort()
  }, [models])

  const filter = useCallback((newFilters: ModelFilters) => {
    setFilters(newFilters)
  }, [])

  const calculateCost = useCallback(
    (inputTokens: number, outputTokens: number, modelId: string): number => {
      const model = models.find((m) => m.id === modelId)
      if (!model) return 0

      const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input
      const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output

      return inputCost + outputCost
    },
    [models]
  )

  const getModelById = useCallback(
    (id: string): ChatModel | undefined => {
      return models.find((model) => model.id === id)
    },
    [models]
  )

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  return {
    models,
    loading,
    error,
    refetch: fetchModels,
    filter,
    filteredModels,
    selectedModel,
    setSelectedModel,
    calculateCost,
    getModelById,
    categories,
    providers,
  }
}
