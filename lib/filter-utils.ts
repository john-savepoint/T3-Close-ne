import { ChatModel } from "@/types/models"
import { getModelCategory } from "./model-utils"

interface FilterCriteria {
  searchQuery?: string
  selectedProvider?: string
  priceRange?: [number, number]
  minContextLength?: number
  showImageModels?: boolean
  favoritesSet?: Set<string>
  showFavoritesOnly?: boolean
}

/**
 * Optimized single-pass filter function for models
 * Processes all filter criteria in one iteration for better performance
 */
export function filterModelsOptimized(models: ChatModel[], criteria: FilterCriteria): ChatModel[] {
  const {
    searchQuery,
    selectedProvider,
    priceRange,
    minContextLength,
    showImageModels,
    favoritesSet,
    showFavoritesOnly,
  } = criteria

  // Pre-process search query once
  const lowerSearchQuery = searchQuery?.toLowerCase()

  // Single pass filter
  return models.filter((model) => {
    // Favorites filter (early exit if not in favorites)
    if (showFavoritesOnly && favoritesSet && !favoritesSet.has(model.id)) {
      return false
    }

    // Search filter
    if (lowerSearchQuery) {
      const nameMatch = model.name.toLowerCase().includes(lowerSearchQuery)
      const providerMatch = model.provider.toLowerCase().includes(lowerSearchQuery)
      const descriptionMatch = model.description?.toLowerCase().includes(lowerSearchQuery) || false

      if (!nameMatch && !providerMatch && !descriptionMatch) {
        return false
      }
    }

    // Provider filter
    if (selectedProvider && selectedProvider !== "all" && model.provider !== selectedProvider) {
      return false
    }

    // Price range filter
    if (priceRange) {
      const avgCost = (model.costPer1kTokens.input + model.costPer1kTokens.output) / 2
      if (avgCost < priceRange[0] || avgCost > priceRange[1]) {
        return false
      }
    }

    // Context length filter
    if (minContextLength && minContextLength > 0 && model.maxTokens < minContextLength) {
      return false
    }

    // Vision models filter
    if (showImageModels && !model.architecture?.input_modalities?.includes("image")) {
      return false
    }

    // All filters passed
    return true
  })
}

/**
 * Optimized sorting function for filtered models
 */
export function sortModelsOptimized(models: ChatModel[]): ChatModel[] {
  // Pre-calculate categories to avoid repeated calls
  const modelCategories = new Map<string, "fast" | "balanced" | "heavy">()
  models.forEach((model) => {
    modelCategories.set(model.id, getModelCategory(model))
  })

  const categoryOrder = { fast: 0, balanced: 1, heavy: 2 }

  return models.sort((a, b) => {
    const aCat = modelCategories.get(a.id)!
    const bCat = modelCategories.get(b.id)!

    if (aCat !== bCat) {
      return categoryOrder[aCat] - categoryOrder[bCat]
    }

    return a.name.localeCompare(b.name)
  })
}

/**
 * Combined filter and sort operation for maximum efficiency
 */
export function filterAndSortModels(models: ChatModel[], criteria: FilterCriteria): ChatModel[] {
  const filtered = filterModelsOptimized(models, criteria)
  return sortModelsOptimized(filtered)
}
