"use client"

import { GitBranch } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BranchIndicatorProps {
  messageId: string
  branchCount: number
  activeBranchIndex?: number
  onBranchSwitch?: (branchIndex: number) => void
}

export function BranchIndicator({
  messageId,
  branchCount,
  activeBranchIndex = 0,
  onBranchSwitch,
}: BranchIndicatorProps) {
  if (branchCount <= 1) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3 text-mauve-accent" />
            <Badge variant="outline" className="h-5 px-1.5 text-xs">
              {activeBranchIndex + 1}/{branchCount}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="text-xs font-medium">Conversation branches</p>
            <div className="flex gap-1">
              {Array.from({ length: branchCount }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={i === activeBranchIndex ? "default" : "outline"}
                  className="h-6 w-6 p-0 text-xs"
                  onClick={() => onBranchSwitch?.(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
