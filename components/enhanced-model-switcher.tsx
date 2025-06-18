"use client"

import { useState, useMemo, useEffect } from "react"

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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  Zap,
  Brain,
  Gauge,
  MessageSquare,
  Image as ImageIcon,
  Search,
  Star,
  Heart,
} from "lucide-react"
import { useModels } from "@/hooks/use-models"
import { ChatModel } from "@/types/models"
import { getModelCategory, formatPrice, formatTokenCount, searchModels, filterModelsByCapabilities, MODEL_CONFIG } from "@/lib/model-utils"
import { ModelErrorBoundary, ModelErrorFallback } from "@/components/model-error-boundary"
import { useModelFavorites } from "@/hooks/use-model-favorites"

interface EnhancedModelSwitcherProps {
  selectedModel: ChatModel | string | null // Support both formats for backward compatibility
  onModelChange: (model: ChatModel | string) => void // Support both formats
  showCost?: boolean
  estimatedTokens?: number
}


function getModelIcon(category: string) {
  switch (category) {
    case "fast":
      return Zap
    case "balanced":
      return Gauge
    case "heavy":
      return Brain
    default:
      return MessageSquare
  }
}

function ModelCard({
  model,
  isSelected,
  onSelect,
  showCost = true,
  estimatedTokens,
  onToggleFavorite,
  isFavorite,
  isComparing,
  onToggleCompare,
  isInComparison,
}: {
  model: ChatModel
  isSelected: boolean
  onSelect: () => void
  showCost?: boolean
  estimatedTokens?: number
  onToggleFavorite?: (modelId: string) => void
  isFavorite?: boolean
  isComparing?: boolean
  onToggleCompare?: (modelId: string) => void
  isInComparison?: boolean
}) {
  const category = getModelCategory(model)
  const Icon = getModelIcon(category)
  const estimatedCost =
    showCost && estimatedTokens && model.costPer1kTokens
      ? (estimatedTokens / 1000) * (model.costPer1kTokens.input + model.costPer1kTokens.output)
      : 0

  return (
    <button
      className={`group w-full cursor-pointer rounded-lg border p-3 text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isSelected ? "border-primary bg-primary/10" : "border-border"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Select ${model.name} model from ${model.provider}${isSelected ? ' (currently selected)' : ''}`}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <div>
            <h4 className="font-medium text-foreground">{model.name}</h4>
            <p className="text-xs text-muted-foreground">{model.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(model.id)
              }}
              className="rounded p-1 hover:bg-muted/50 transition-colors"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                }`} 
              />
            </button>
          )}
          {isComparing && onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleCompare(model.id)
              }}
              className="rounded p-1 hover:bg-muted/50 transition-colors"
              aria-label={isInComparison ? "Remove from comparison" : "Add to comparison"}
            >
              <div 
                className={`h-4 w-4 rounded border-2 ${
                  isInComparison ? "bg-blue-500 border-blue-500" : "border-muted-foreground hover:border-blue-500"
                }`} 
              />
            </button>
          )}
          {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {formatTokenCount(model.maxTokens)} tokens
        </Badge>

        {model.architecture?.input_modalities?.includes("image") && (
          <Badge variant="outline" className="text-xs">
            <ImageIcon className="mr-1 h-3 w-3" />
            Vision
          </Badge>
        )}

        <Badge
          variant="outline"
          className={`text-xs ${
            category === "fast"
              ? "border-green-500/50 text-green-400"
              : category === "balanced"
                ? "border-yellow-500/50 text-yellow-400"
                : "border-red-500/50 text-red-400"
          }`}
        >
          {category}
        </Badge>
      </div>

      {showCost && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatPrice(model.costPer1kTokens.input)} input
          </span>
          <span className="text-muted-foreground">
            {formatPrice(model.costPer1kTokens.output)} output
          </span>
          {estimatedCost > 0 && (
            <span className="font-medium text-primary">~${estimatedCost.toFixed(4)}</span>
          )}
        </div>
      )}

      {model.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground/70">{model.description}</p>
      )}
    </button>
  )
}

export function EnhancedModelSwitcher({
  selectedModel,
  onModelChange,
  showCost = true,
  estimatedTokens,
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

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, MODEL_CONFIG.DEBOUNCE_DELAY)
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0.1])
  const [minContextLength, setMinContextLength] = useState<number>(0)
  const [showImageModels, setShowImageModels] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [compareModels, setCompareModels] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const quickSelectModels = useMemo(() => {
    const availableModels = models.length > 0 ? models : []
    return {
      fast: availableModels.find((m) => getModelCategory(m) === "fast"),
      balanced: availableModels.find((m) => getModelCategory(m) === "balanced"),
      heavy: availableModels.find((m) => getModelCategory(m) === "heavy"),
    }
  }, [models])

  // Split filtering into smaller memoized functions for better performance
  const searchFilteredModels = useMemo(() => {
    const baseModels = filteredModels.length > 0 ? filteredModels : models
    return searchModels(baseModels, debouncedSearchQuery)
  }, [filteredModels, models, debouncedSearchQuery])

  const providerFilteredModels = useMemo(() => {
    if (selectedProvider === "all") return searchFilteredModels
    return searchFilteredModels.filter((model) => model.provider === selectedProvider)
  }, [searchFilteredModels, selectedProvider])

  const capabilityFilteredModels = useMemo(() => {
    let filtered = filterModelsByCapabilities(providerFilteredModels, {
      supportsVision: showImageModels,
      minContextLength: minContextLength > 0 ? minContextLength : undefined,
      maxCost: priceRange[1],
    })

    // Apply favorites filter if enabled
    if (showFavoritesOnly) {
      filtered = getFavoriteModels(filtered)
    }

    return filtered
  }, [providerFilteredModels, showImageModels, minContextLength, priceRange, showFavoritesOnly, getFavoriteModels])

  const displayModels = useMemo(() => {
    const [minPrice] = priceRange
    const finalFiltered = capabilityFilteredModels.filter((model) => {
      const avgCost = (model.costPer1kTokens.input + model.costPer1kTokens.output) / 2
      return avgCost >= minPrice
    })

    return finalFiltered.sort((a, b) => {
      const categoryOrder = { fast: 0, balanced: 1, heavy: 2 }
      const aCat = getModelCategory(a)
      const bCat = getModelCategory(b)

      if (aCat !== bCat) {
        return categoryOrder[aCat] - categoryOrder[bCat]
      }

      return a.name.localeCompare(b.name)
    })
  }, [capabilityFilteredModels, priceRange])

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (error) {
    return <ModelErrorFallback error={new Error(error.message)} retry={() => refetch()} />
  }

  const currentModel = currentSelectedModel || (models.length > 0 ? models[0] : null)

  return (
    <ModelErrorBoundary>
      <div className="flex items-center gap-2">
        {/* Quick Select Buttons */}
        <div className="hidden items-center gap-1 md:flex">
          {quickSelectModels.fast && (
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${quickSelectModels.fast.id === currentModel?.id ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => handleModelChange(quickSelectModels.fast!)}
            >
              <Zap className="mr-1 h-3 w-3" />
              Fast
            </Button>
          )}
          {quickSelectModels.balanced && (
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${quickSelectModels.balanced.id === currentModel?.id ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => handleModelChange(quickSelectModels.balanced!)}
            >
              <Gauge className="mr-1 h-3 w-3" />
              Balanced
            </Button>
          )}
          {quickSelectModels.heavy && (
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${quickSelectModels.heavy.id === currentModel?.id ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => handleModelChange(quickSelectModels.heavy!)}
            >
              <Brain className="mr-1 h-3 w-3" />
              Heavy
            </Button>
          )}
        </div>

        {/* Enhanced Model Selector Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
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

            <Tabs defaultValue="models" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="models">All Models ({displayModels.length})</TabsTrigger>
                <TabsTrigger value="filters">Filters & Settings</TabsTrigger>
                <TabsTrigger value="compare" disabled={compareModels.length < 2}>
                  Compare ({compareModels.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="models" className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="flex items-center gap-1"
                  >
                    <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    Favorites
                  </Button>
                  <Button
                    variant={showComparison ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowComparison(!showComparison)
                      if (!showComparison) {
                        setCompareModels([])
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    Compare ({compareModels.length})
                  </Button>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-3" role="listbox" aria-label="Available AI models">
                    {displayModels.map((model, index) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        isSelected={model.id === currentModel?.id}
                        onSelect={() => {
                          handleModelChange(model)
                          setOpen(false)
                        }}
                        showCost={showCost}
                        estimatedTokens={estimatedTokens}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite(model.id)}
                        isComparing={showComparison}
                        onToggleCompare={(modelId) => {
                          setCompareModels(prev => 
                            prev.includes(modelId) 
                              ? prev.filter(id => id !== modelId)
                              : prev.length < 3 ? [...prev, modelId] : prev
                          )
                        }}
                        isInComparison={compareModels.includes(model.id)}
                      />
                    ))}
                    {displayModels.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground" role="status">
                        No models found matching your criteria
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price-range-slider">Price Range (per 1K tokens)</Label>
                    <div className="px-2">
                      <input
                        id="price-range-slider"
                        type="range"
                        min={0}
                        max={0.1}
                        step={0.001}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                        className="w-full accent-primary"
                        aria-label={`Maximum price per 1K tokens: $${priceRange[1].toFixed(3)}`}
                        aria-valuemin={0}
                        aria-valuemax={0.1}
                        aria-valuenow={priceRange[1]}
                        aria-valuetext={`$${priceRange[1].toFixed(3)} per 1K tokens`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground" role="group" aria-label="Price range values">
                      <span aria-label="Minimum price">$0.000</span>
                      <span aria-label="Maximum price">${priceRange[1].toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-context-length">Minimum Context Length</Label>
                    <Input
                      id="min-context-length"
                      type="number"
                      value={minContextLength}
                      onChange={(e) => setMinContextLength(Number(e.target.value))}
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
                      checked={showImageModels}
                      onCheckedChange={(checked) => setShowImageModels(checked === true)}
                      aria-describedby="vision-models-help"
                    />
                    <Label htmlFor="image-models">Vision Models Only</Label>
                    <p id="vision-models-help" className="sr-only">
                      Show only models that can process images and text
                    </p>
                  </div>

                  {showCost && (
                    <div className="rounded-lg border bg-muted/20 p-4">
                      <h4 className="mb-2 font-medium text-foreground">Cost Estimation</h4>
                      {currentModel && estimatedTokens ? (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Input cost:</span>
                            <span>{formatPrice(currentModel.costPer1kTokens.input)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Output cost:</span>
                            <span>{formatPrice(currentModel.costPer1kTokens.output)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Estimated ({estimatedTokens} tokens):</span>
                            <span className="text-primary">
                              $
                              {currentModel?.id ? calculateCost(
                                estimatedTokens / 2,
                                estimatedTokens / 2,
                                currentModel.id
                              ).toFixed(4) : "0.0000"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 animate-pulse bg-muted rounded" />
                          <div className="h-4 animate-pulse bg-muted rounded w-3/4" />
                          <div className="h-4 animate-pulse bg-muted rounded w-1/2" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compare" className="space-y-4">
                <div className="grid gap-4">
                  {compareModels.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Select models to compare them side by side
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {compareModels.map((modelId) => {
                        const model = getModelById(modelId)
                        if (!model) return null
                        const category = getModelCategory(model)
                        return (
                          <div key={modelId} className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{model.name}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCompareModels(prev => prev.filter(id => id !== modelId))}
                              >
                                ×
                              </Button>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider:</span>
                                <span>{model.provider}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <Badge variant="outline" className={`text-xs ${
                                  category === "fast" ? "border-green-500/50 text-green-400" :
                                  category === "balanced" ? "border-yellow-500/50 text-yellow-400" :
                                  "border-red-500/50 text-red-400"
                                }`}>
                                  {category}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Context:</span>
                                <span>{formatTokenCount(model.maxTokens)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Input cost:</span>
                                <span>{formatPrice(model.costPer1kTokens.input)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Output cost:</span>
                                <span>{formatPrice(model.costPer1kTokens.output)}</span>
                              </div>
                              {model.architecture?.input_modalities?.includes("image") && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Vision:</span>
                                  <span className="text-green-400">Yes</span>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                handleModelChange(model)
                                setOpen(false)
                              }}
                            >
                              Select This Model
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </ModelErrorBoundary>
  )
}
