"use client"

import React, { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  Active,
  Over,
} from "@dnd-kit/core"
import {
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

interface DndProviderProps {
  children: React.ReactNode
  onDragEnd: (event: DragEndEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  renderDragOverlay?: (active: Active) => React.ReactNode
}

export function DndProvider({
  children,
  onDragEnd,
  onDragOver,
  renderDragOverlay,
}: DndProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    onDragEnd(event)
  }

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(event)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      modifiers={[restrictToVerticalAxis]}
    >
      {children}
      <DragOverlay>
        {activeId && renderDragOverlay && renderDragOverlay({ id: activeId } as Active)}
      </DragOverlay>
    </DndContext>
  )
}