"use client"

import { useState, useMemo, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ChatModel } from "@/types/models"
import { ModelCard } from "./model-card"
import { MODEL_UI_CONSTANTS } from "@/lib/model-utils"

interface ModelGridProps {
  models: ChatModel[]
  selectedModelId?: string
  onModelSelect: (model: ChatModel) => void
  onToggleFavorite?: (modelId: string) => void
  isFavorite?: (modelId: string) => boolean
  isComparing?: boolean
  onToggleCompare?: (modelId: string) => void
  isInComparison?: (modelId: string) => boolean
  showCost?: boolean
  estimatedTokens?: number
}

export function ModelGrid({
  models,
  selectedModelId,
  onModelSelect,
  onToggleFavorite,
  isFavorite,
  isComparing,
  onToggleCompare,
  isInComparison,
  showCost = true,
  estimatedTokens,
}: ModelGridProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Pagination logic
  const totalPages = Math.ceil(models.length / MODEL_UI_CONSTANTS.ITEMS_PER_PAGE)
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * MODEL_UI_CONSTANTS.ITEMS_PER_PAGE
    const endIndex = startIndex + MODEL_UI_CONSTANTS.ITEMS_PER_PAGE
    return models.slice(startIndex, endIndex)
  }, [models, currentPage])

  // Reset to first page when models change
  useEffect(() => {
    setCurrentPage(1)
  }, [models.length])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <div className="space-y-4">
      <ScrollArea className={`h-[${MODEL_UI_CONSTANTS.SCROLL_AREA_HEIGHT}px] pr-4`}>
        <div className="grid gap-3" role="listbox" aria-label="Available AI models">
          {paginatedModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={model.id === selectedModelId}
              onSelect={() => onModelSelect(model)}
              showCost={showCost}
              estimatedTokens={estimatedTokens}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite?.(model.id)}
              isComparing={isComparing}
              onToggleCompare={onToggleCompare}
              isInComparison={isInComparison?.(model.id)}
            />
          ))}
          {paginatedModels.length === 0 && (
            <div className="py-8 text-center text-muted-foreground" role="status">
              No models found matching your criteria
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({models.length} models)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
