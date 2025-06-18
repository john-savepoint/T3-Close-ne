"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { OpenRouterModel, ChatModel } from "@/types/models"
import { DEFAULT_MODELS, getDefaultModel } from "@/lib/default-models"
import { MODEL_CONFIG, sortModelsByPreference, calculateModelCost } from "@/lib/model-utils"

interface ModelError {
  type: "network" | "auth" | "parsing" | "ratelimit" | "unknown"
  message: string
  retryable: boolean
  statusCode?: number
}

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
  error: ModelError | null
  refetch: () => Promise<void>
  filter: (filters: ModelFilters) => void
  filteredModels: ChatModel[]
  selectedModel: ChatModel | null
  setSelectedModel: (model: ChatModel) => void
  calculateCost: (inputTokens: number, outputTokens: number, modelId: string) => number
  getModelById: (id: string) => ChatModel | undefined
  categories: string[]
  providers: string[]
  retryCount: number
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


function createError(type: ModelError["type"], message: string, statusCode?: number): ModelError {
  const retryable = type === "network" || type === "ratelimit" || type === "unknown"
  return { type, message, retryable, statusCode }
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<ChatModel[]>(DEFAULT_MODELS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ModelError | null>(null)
  const [filters, setFilters] = useState<ModelFilters>({})
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(getDefaultModel())
  const [retryCount, setRetryCount] = useState(0)

  const fetchModels = useCallback(
    async (attempt: number = 0): Promise<void> => {
      setLoading(true)
      if (attempt === 0) {
        setError(null)
        setRetryCount(0)
      }

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), MODEL_CONFIG.REQUEST_TIMEOUT)

        const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
          headers: {
            "HTTP-Referer":
              typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
            "X-Title": "Z6Chat",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorType =
            response.status === 401
              ? "auth"
              : response.status === 429
                ? "ratelimit"
                : response.status >= 500
                  ? "network"
                  : "unknown"

          throw createError(
            errorType,
            `Failed to fetch models: ${response.status} ${response.statusText}`,
            response.status
          )
        }

        const data = await response.json()

        if (!data.data || !Array.isArray(data.data)) {
          throw createError("parsing", "Invalid response format from OpenRouter API")
        }

        const convertedModels = data.data.map(convertOpenRouterModel)
        const sortedModels = sortModelsByPreference(convertedModels)

        setModels(sortedModels)
        setRetryCount(0) // Reset retry count on success

        // Set default selected model if none selected
        if (!selectedModel && sortedModels.length > 0) {
          const defaultModel =
            sortedModels.find((m: ChatModel) => m.id === "openai/gpt-4o-mini") || sortedModels[0]
          setSelectedModel(defaultModel)
        }
      } catch (err) {
        let modelError: ModelError

        if (err && typeof err === "object" && "type" in err) {
          modelError = err as ModelError
        } else if (err instanceof Error) {
          if (err.name === "AbortError") {
            modelError = createError("network", "Request timeout - please check your connection")
          } else {
            modelError = createError("unknown", err.message)
          }
        } else {
          modelError = createError("unknown", "An unexpected error occurred")
        }

        // Retry logic for retryable errors
        if (modelError.retryable && attempt < MODEL_CONFIG.MAX_RETRIES) {
          setRetryCount(attempt + 1)
          setTimeout(
            () => {
              fetchModels(attempt + 1)
            },
            MODEL_CONFIG.RETRY_DELAY * Math.pow(2, attempt)
          ) // Exponential backoff
          return
        }

        setError(modelError)
        console.error("Error fetching models:", err)
        
        // Fallback to default models if all retries failed
        if (attempt >= MODEL_CONFIG.MAX_RETRIES) {
          console.warn("Using default models as fallback")
          setModels(DEFAULT_MODELS)
          if (!selectedModel) {
            setSelectedModel(getDefaultModel())
          }
        }
      } finally {
        setLoading(false)
      }
    },
    [selectedModel]
  )

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

      return calculateModelCost(inputTokens, outputTokens, model)
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

    return () => {
      // Cleanup any pending timeouts or aborts
    }
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
    retryCount,
  }
}
