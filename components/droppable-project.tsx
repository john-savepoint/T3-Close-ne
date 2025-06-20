"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableProjectProps {
  projectId: string
  children: React.ReactNode
  isExpanded?: boolean
}

export function DroppableProject({ projectId, children, isExpanded }: DroppableProjectProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `project-${projectId}`,
    data: {
      type: "project",
      projectId,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-all duration-200",
        isOver && "ring-2 ring-purple-500 ring-offset-2 ring-offset-mauve-dark rounded-lg",
        isOver && isExpanded && "bg-purple-500/10"
      )}
    >
      {children}
      {isOver && !isExpanded && (
        <div className="absolute inset-0 rounded-lg bg-purple-500/20 pointer-events-none" />
      )}
    </div>
  )
}