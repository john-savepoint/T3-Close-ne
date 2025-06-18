"use client"

import { Separator } from "@/components/ui/separator"
import { ChatModel } from "@/types/models"
import { formatPrice } from "@/lib/model-utils"

interface CostEstimationProps {
  currentModel?: ChatModel | null
  estimatedTokens?: number
  calculateCost: (inputTokens: number, outputTokens: number, modelId: string) => number
  showCost: boolean
}

export function CostEstimation({
  currentModel,
  estimatedTokens,
  calculateCost,
  showCost,
}: CostEstimationProps) {
  if (!showCost) return null

  return (
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
              {currentModel?.id
                ? calculateCost(estimatedTokens / 2, estimatedTokens / 2, currentModel.id).toFixed(
                    4
                  )
                : "0.0000"}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      )}
    </div>
  )
}
