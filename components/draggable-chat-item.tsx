"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EnhancedChatItem } from "@/components/enhanced-chat-item"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableChatItemProps {
  chat: any
  isActive?: boolean
  onMoveToTrash: () => Promise<void>
  onMoveToArchive: () => Promise<void>
  onRename: (newTitle: string) => Promise<void>
  onTogglePin: (chatId: string, isPinned: boolean) => Promise<void>
  onShare: (chatId: string) => void
  onMoveToProject?: () => void
  onClick: () => void
}

export function DraggableChatItem({
  chat,
  isActive,
  onMoveToTrash,
  onMoveToArchive,
  onRename,
  onTogglePin,
  onShare,
  onMoveToProject,
  onClick,
}: DraggableChatItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chat._id,
    data: {
      type: "chat",
      chat,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group relative",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-mauve-subtle hover:text-mauve-bright transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="pl-6">
        <EnhancedChatItem
          chat={{
            ...chat,
            id: chat._id,
            timestamp: formatTimestamp(chat.lastActivity || chat.updatedAt),
          }}
          isActive={isActive}
          onClick={onClick}
          onMoveToTrash={onMoveToTrash}
          onMoveToArchive={onMoveToArchive}
          onRename={onRename}
          onRestore={() => {}}
          onDeletePermanently={() => {}}
          onPin={async () => await onTogglePin(chat._id, chat.isPinned)}
          onShare={() => onShare(chat._id)}
          onMoveToProject={onMoveToProject}
          showParentIcon={false}
        />
      </div>
    </div>
  )
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}