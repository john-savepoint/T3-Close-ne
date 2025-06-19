"use client"

import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { ChatModel } from "@/types/models"
import { getModelCategory, formatPrice, formatTokenCount } from "@/lib/model-utils"

interface ModelCardProps {
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
}

function getModelIcon(category: string) {
  const icons = {
    fast: "⚡",
    balanced: "⚖️",
    heavy: "🧠",
  }
  return icons[category as keyof typeof icons] || "💬"
}

export function ModelCard({
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
}: ModelCardProps) {
  const category = getModelCategory(model)
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Select ${model.name} model from ${model.provider}${
        isSelected ? " (currently selected)" : ""
      }`}
      tabIndex={0}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getModelIcon(category)}</span>
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
              className="rounded p-1 transition-colors hover:bg-muted/50"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
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
              className="rounded p-1 transition-colors hover:bg-muted/50"
              aria-label={isInComparison ? "Remove from comparison" : "Add to comparison"}
            >
              <div
                className={`h-4 w-4 rounded border-2 ${
                  isInComparison
                    ? "border-blue-500 bg-blue-500"
                    : "border-muted-foreground hover:border-blue-500"
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
            🖼️ Vision
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
