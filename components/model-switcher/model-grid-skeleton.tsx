"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MODEL_UI_CONSTANTS } from "@/lib/model-utils"

interface ModelGridSkeletonProps {
  itemCount?: number
}

export function ModelGridSkeleton({ itemCount = 6 }: ModelGridSkeletonProps) {
  return (
    <ScrollArea className={`h-[${MODEL_UI_CONSTANTS.SCROLL_AREA_HEIGHT}px] pr-4`}>
      <div className="grid gap-3" role="status" aria-label="Loading models">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-3">
            {/* Header with icon and title */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-2 w-2 rounded-full" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>

            {/* Cost information */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading model information...</span>
    </ScrollArea>
  )
}
