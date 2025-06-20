"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown } from "lucide-react"
import { useModels } from "@/hooks/use-models"
import { ChatModel } from "@/types/models"
import { getModelCategory, MODEL_UI_CONSTANTS } from "@/lib/model-utils"
import { ModelErrorBoundary, ModelErrorFallback } from "@/components/model-error-boundary"
import { useModelFavorites } from "@/hooks/use-model-favorites"
import { useModelFilters } from "@/hooks/use-model-filters"
import { ModelFilters } from "@/components/model-switcher/model-filters"
import { ModelGrid } from "@/components/model-switcher/model-grid"
import { ModelComparison } from "@/components/model-switcher/model-comparison"
import { CostEstimation } from "@/components/model-switcher/cost-estimation"
import { PopularModelsGrid } from "@/components/model-switcher/popular-models-grid"
import { QuickModelSelector } from "@/components/model-switcher/quick-model-selector"
import { estimateTokens } from "@/lib/token-utils"
import { filterAndSortModels } from "@/lib/filter-utils"
import { getPopularModels } from "@/lib/popular-models"

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface EnhancedModelSwitcherProps {
  selectedModel: ChatModel | string | null // Support both formats for backward compatibility
  onModelChange: (model: ChatModel | string) => void // Support both formats
  showCost?: boolean
  estimatedTokens?: number
  temperature?: number
  onTemperatureChange?: (temperature: number) => void
}

export function EnhancedModelSwitcher({
  selectedModel,
  onModelChange,
  showCost = true,
  estimatedTokens,
  temperature = 0.7,
  onTemperatureChange,
}: EnhancedModelSwitcherProps) {
  const {
    models,
    loading,
    error,
    filteredModels,
    providers,
    calculateCost,
    getModelById,
    refetch,
    retryCount,
  } = useModels()
  const { toggleFavorite, isFavorite, getFavoriteModels } = useModelFavorites()
  const { state: filtersState, actions: filtersActions } = useModelFilters()
  const debouncedSearchQuery = useDebounce(
    filtersState.searchQuery,
    MODEL_UI_CONSTANTS.DEBOUNCE_DELAY
  )

  // Convert string selectedModel to ChatModel for backward compatibility
  const currentSelectedModel =
    typeof selectedModel === "string" ? getModelById(selectedModel) : selectedModel

  // Wrapper function to handle both formats
  const handleModelChange = (model: ChatModel) => {
    // Determine the expected format based on the current selectedModel type
    if (typeof selectedModel === "string") {
      onModelChange(model.id) // Return string ID for backward compatibility
    } else {
      onModelChange(model) // Return ChatModel object
    }
  }

  const quickSelectModels = useMemo(() => {
    const availableModels = models.length > 0 ? models : []
    return {
      fast: availableModels.find((m) => getModelCategory(m) === "fast"),
      balanced: availableModels.find((m) => getModelCategory(m) === "balanced"),
      heavy: availableModels.find((m) => getModelCategory(m) === "heavy"),
    }
  }, [models])

  // Apply all filters using the state from useModelFilters - optimized single pass
  const displayModels = useMemo(() => {
    const baseModels = filteredModels.length > 0 ? filteredModels : models

    // Convert favorites to Set for O(1) lookup
    const favoritesSet = filtersState.showFavoritesOnly
      ? new Set(getFavoriteModels(baseModels).map((m) => m.id))
      : undefined

    return filterAndSortModels(baseModels, {
      searchQuery: debouncedSearchQuery,
      selectedProvider: filtersState.selectedProvider,
      priceRange: filtersState.priceRange,
      minContextLength: filtersState.minContextLength,
      showImageModels: filtersState.showImageModels,
      favoritesSet,
      showFavoritesOnly: filtersState.showFavoritesOnly,
    })
  }, [filteredModels, models, debouncedSearchQuery, filtersState, getFavoriteModels])

  // Get popular models for the Popular tab
  const popularModels = useMemo(() => {
    return getPopularModels(models)
  }, [models])

  if (loading) {
    // Show loading state
    return (
      <ModelErrorBoundary>
        <div className="flex items-center gap-2">
          {/* Loading Model Selector */}
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
      </ModelErrorBoundary>
    )
  }

  if (error) {
    return <ModelErrorFallback error={new Error(error.message)} retry={() => refetch()} />
  }

  const currentModel = currentSelectedModel || (models.length > 0 ? models[0] : null)

  return (
    <ModelErrorBoundary>
      <div className="flex items-center gap-2">
        {/* Quick Model Selector */}
        <div className="hidden md:block">
          <QuickModelSelector
            quickSelectModels={quickSelectModels}
            currentModel={currentModel}
            onModelSelect={handleModelChange}
          />
        </div>

        {/* Enhanced Model Selector Dialog */}
        <Dialog open={filtersState.open} onOpenChange={filtersActions.setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
              onClick={() => {
                console.log('Model selector button clicked, opening dialog')
                filtersActions.setOpen(true)
              }}
            >
              {currentModel?.name || "Select Model"} <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[80vh] max-w-4xl"
            aria-describedby="model-selector-description"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">Select AI Model</DialogTitle>
              <p id="model-selector-description" className="text-sm text-muted-foreground">
                Choose from {displayModels.length} available AI models with real-time pricing and
                filtering options
              </p>
            </DialogHeader>

            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="popular">Popular ({popularModels.length})</TabsTrigger>
                <TabsTrigger value="models">All Models ({displayModels.length})</TabsTrigger>
                <TabsTrigger value="filters">Filters & Settings</TabsTrigger>
                <TabsTrigger value="compare" disabled={filtersState.compareModels.length < 2}>
                  Compare ({filtersState.compareModels.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="space-y-4">
                <PopularModelsGrid
                  models={popularModels}
                  selectedModelId={currentModel?.id}
                  onModelSelect={(model) => {
                    handleModelChange(model)
                    filtersActions.setOpen(false)
                  }}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  isComparing={filtersState.showComparison}
                  onToggleCompare={filtersActions.toggleCompareModel}
                  isInComparison={(modelId) => filtersState.compareModels.includes(modelId)}
                  showCost={showCost}
                  estimatedTokens={estimatedTokens}
                  isLoading={loading}
                />
              </TabsContent>

              <TabsContent value="models" className="space-y-4">
                <ModelFilters
                  searchQuery={filtersState.searchQuery}
                  onSearchChange={filtersActions.setSearchQuery}
                  selectedProvider={filtersState.selectedProvider}
                  onProviderChange={filtersActions.setSelectedProvider}
                  providers={providers}
                  showFavoritesOnly={filtersState.showFavoritesOnly}
                  onToggleFavoritesOnly={filtersActions.setShowFavoritesOnly}
                  showComparison={filtersState.showComparison}
                  onToggleComparison={(show) => {
                    filtersActions.setShowComparison(show)
                    if (!show) {
                      filtersActions.clearComparison()
                    }
                  }}
                  compareCount={filtersState.compareModels.length}
                />

                <ModelGrid
                  models={displayModels}
                  selectedModelId={currentModel?.id}
                  onModelSelect={(model) => {
                    handleModelChange(model)
                    filtersActions.setOpen(false)
                  }}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  isComparing={filtersState.showComparison}
                  onToggleCompare={filtersActions.toggleCompareModel}
                  isInComparison={(modelId) => filtersState.compareModels.includes(modelId)}
                  showCost={showCost}
                  estimatedTokens={estimatedTokens}
                  isLoading={loading}
                />
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price-range-slider">Price Range (per 1K tokens)</Label>
                    <div className="px-2">
                      <input
                        id="price-range-slider"
                        type="range"
                        min={MODEL_UI_CONSTANTS.MIN_PRICE}
                        max={MODEL_UI_CONSTANTS.MAX_PRICE_FILTER}
                        step={MODEL_UI_CONSTANTS.PRICE_STEP}
                        value={filtersState.priceRange[1]}
                        onChange={(e) =>
                          filtersActions.setPriceRange([
                            filtersState.priceRange[0],
                            parseFloat(e.target.value),
                          ])
                        }
                        className="w-full accent-primary"
                        aria-label={`Maximum price per 1K tokens: $${filtersState.priceRange[1].toFixed(3)}`}
                        aria-valuemin={MODEL_UI_CONSTANTS.MIN_PRICE}
                        aria-valuemax={MODEL_UI_CONSTANTS.MAX_PRICE_FILTER}
                        aria-valuenow={filtersState.priceRange[1]}
                        aria-valuetext={`$${filtersState.priceRange[1].toFixed(3)} per 1K tokens`}
                      />
                    </div>
                    <div
                      className="flex justify-between text-xs text-muted-foreground"
                      role="group"
                      aria-label="Price range values"
                    >
                      <span aria-label="Minimum price">$0.000</span>
                      <span aria-label="Maximum price">
                        ${filtersState.priceRange[1].toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-context-length">Minimum Context Length</Label>
                    <Input
                      id="min-context-length"
                      type="number"
                      value={filtersState.minContextLength}
                      onChange={(e) => filtersActions.setMinContextLength(Number(e.target.value))}
                      placeholder="0"
                      aria-label="Minimum context length in tokens"
                      aria-describedby="context-length-help"
                    />
                    <p id="context-length-help" className="text-xs text-muted-foreground">
                      Filter models by minimum number of tokens they can process
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="image-models"
                      checked={filtersState.showImageModels}
                      onCheckedChange={(checked) =>
                        filtersActions.setShowImageModels(checked === true)
                      }
                      aria-describedby="vision-models-help"
                    />
                    <Label htmlFor="image-models">Vision Models Only</Label>
                    <p id="vision-models-help" className="sr-only">
                      Show only models that can process images and text
                    </p>
                  </div>

                  {onTemperatureChange && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="temperature-slider">Temperature</Label>
                        <span className="text-sm text-muted-foreground">
                          {temperature.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        id="temperature-slider"
                        value={[temperature]}
                        onValueChange={(value) => onTemperatureChange(value[0])}
                        min={0}
                        max={2}
                        step={0.01}
                        className="w-full"
                        aria-label="Temperature control for AI creativity"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values make output more focused and deterministic, higher values make
                        it more creative and diverse.
                      </p>
                    </div>
                  )}

                  <CostEstimation
                    currentModel={currentModel}
                    estimatedTokens={estimatedTokens}
                    calculateCost={calculateCost}
                    showCost={showCost}
                  />
                </div>
              </TabsContent>

              <TabsContent value="compare" className="space-y-4">
                <ModelComparison
                  compareModels={filtersState.compareModels}
                  getModelById={getModelById}
                  onRemoveFromComparison={filtersActions.removeFromComparison}
                  onSelectModel={(model) => {
                    handleModelChange(model)
                    filtersActions.setOpen(false)
                  }}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </ModelErrorBoundary>
  )
}
