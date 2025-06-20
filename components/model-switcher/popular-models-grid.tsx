"use client"

import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatModel } from "@/types/models"
import { ModelCard } from "./model-card"
import { ModelGridSkeleton } from "./model-grid-skeleton"
import { getPopularModelsByProvider, getProviderDisplayName } from "@/lib/popular-models"
import { Badge } from "@/components/ui/badge"
import { MODEL_UI_CONSTANTS } from "@/lib/model-utils"
import { Star, TrendingUp } from "lucide-react"

interface PopularModelsGridProps {
  models: ChatModel[]
  selectedModelId?: string
  onModelSelect: (model: ChatModel) => void
  onToggleFavorite: (modelId: string) => void
  isFavorite: (modelId: string) => boolean
  isComparing?: boolean
  onToggleCompare?: (modelId: string) => void
  isInComparison?: (modelId: string) => boolean
  showCost?: boolean
  estimatedTokens?: number
  isLoading?: boolean
}

export function PopularModelsGrid({
  models,
  selectedModelId,
  onModelSelect,
  onToggleFavorite,
  isFavorite,
  isComparing = false,
  onToggleCompare,
  isInComparison,
  showCost = true,
  estimatedTokens,
  isLoading = false,
}: PopularModelsGridProps) {
  const popularModelsByProvider = useMemo(() => {
    return getPopularModelsByProvider(models)
  }, [models])

  const totalPopularModels = useMemo(() => {
    return Object.values(popularModelsByProvider).reduce((total, providerModels) => total + providerModels.length, 0)
  }, [popularModelsByProvider])

  if (isLoading) {
    return <ModelGridSkeleton />
  }

  if (totalPopularModels === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Popular Models Found</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't find any of the popular models in the current model list. This might be temporary while models are loading.
        </p>
      </div>
    )
  }

  // Sort providers by number of models (descending) and then alphabetically
  const sortedProviders = Object.entries(popularModelsByProvider)
    .sort(([providerA, modelsA], [providerB, modelsB]) => {
      const countDiff = modelsB.length - modelsA.length
      if (countDiff !== 0) return countDiff
      return getProviderDisplayName(providerA).localeCompare(getProviderDisplayName(providerB))
    })

  return (
    <div className="space-y-4">
      <ScrollArea
        className="pr-4"
        style={{ height: MODEL_UI_CONSTANTS.SCROLL_AREA_HEIGHT }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span>Showing {totalPopularModels} popular models across {Object.keys(popularModelsByProvider).length} providers</span>
          </div>

          {/* Popular Models by Provider */}
          {sortedProviders.map(([provider, providerModels]) => (
            <div key={provider} className="space-y-3">
              {/* Provider Header */}
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {getProviderDisplayName(provider)}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {providerModels.length} model{providerModels.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Provider Models Grid */}
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {providerModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    isSelected={selectedModelId === model.id}
                    onSelect={() => onModelSelect(model)}
                    onToggleFavorite={() => onToggleFavorite(model.id)}
                    isFavorite={isFavorite(model.id)}
                    isComparing={isComparing}
                    onToggleCompare={onToggleCompare ? () => onToggleCompare(model.id) : undefined}
                    isInComparison={isInComparison ? isInComparison(model.id) : false}
                    showCost={showCost}
                    estimatedTokens={estimatedTokens}
                    showPopularBadge={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}