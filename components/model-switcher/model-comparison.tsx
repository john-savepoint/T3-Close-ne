"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatModel } from "@/types/models"
import { getModelCategory, formatPrice, formatTokenCount } from "@/lib/model-utils"

interface ModelComparisonProps {
  compareModels: string[]
  getModelById: (id: string) => ChatModel | undefined
  onRemoveFromComparison: (modelId: string) => void
  onSelectModel: (model: ChatModel) => void
}

export function ModelComparison({
  compareModels,
  getModelById,
  onRemoveFromComparison,
  onSelectModel,
}: ModelComparisonProps) {
  if (compareModels.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Select models to compare them side by side
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {compareModels.map((modelId) => {
        const model = getModelById(modelId)
        if (!model) return null

        const category = getModelCategory(model)

        return (
          <div key={modelId} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{model.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFromComparison(modelId)}
                aria-label={`Remove ${model.name} from comparison`}
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

            <Button size="sm" className="w-full" onClick={() => onSelectModel(model)}>
              Select This Model
            </Button>
          </div>
        )
      })}
    </div>
  )
}
