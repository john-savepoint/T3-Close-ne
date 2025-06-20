"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Pin,
  Archive,
  Trash2,
  GitBranch,
  Edit,
  Share,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import type { Chat } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { InlineEdit } from "@/components/inline-edit"

interface EnhancedChatItemProps {
  chat: Chat
  isActive?: boolean
  showParentIcon?: boolean
  onClick?: () => void
  onMoveToArchive?: () => void
  onMoveToTrash?: () => void
  onRestore?: () => void
  onDeletePermanently?: () => void
  onRename?: (newTitle: string) => void
  onShare?: () => void
  onPin?: () => void
  className?: string
}

export function EnhancedChatItem({
  chat,
  isActive = false,
  showParentIcon = false,
  onClick,
  onMoveToArchive,
  onMoveToTrash,
  onRestore,
  onDeletePermanently,
  onRename,
  onShare,
  onPin,
  className = "",
}: EnhancedChatItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getStatusBadge = () => {
    switch (chat.status) {
      case "archived":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/50 bg-blue-500/10 text-xs text-blue-400"
          >
            Archived
          </Badge>
        )
      case "trashed":
        return (
          <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-xs text-red-400">
            Trashed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTimeDisplay = () => {
    if (chat.status === "trashed" && chat.statusChangedAt) {
      const daysLeft = Math.max(
        0,
        30 - Math.floor((Date.now() - chat.statusChangedAt.getTime()) / (1000 * 60 * 60 * 24))
      )
      return `${daysLeft} days left`
    }

    if (chat.statusChangedAt && chat.status !== "active") {
      return formatDistanceToNow(chat.statusChangedAt, { addSuffix: true })
    }

    return formatDistanceToNow(chat.updatedAt, { addSuffix: true })
  }

  const renderActions = () => {
    if (chat.status === "trashed") {
      return (
        <>
          <DropdownMenuItem onClick={onRestore} className="text-green-400">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeletePermanently} className="text-red-400">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete Permanently
          </DropdownMenuItem>
        </>
      )
    }

    if (chat.status === "archived") {
      return (
        <>
          <DropdownMenuItem onClick={onRestore} className="text-green-400">
            <RotateCcw className="mr-2 h-4 w-4" />
            Unarchive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveToTrash}>
            <Trash2 className="mr-2 h-4 w-4" />
            Move to Trash
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
        </>
      )
    }

    // Active chat actions
    return (
      <>
        <DropdownMenuItem onClick={onPin}>
          <Pin className="mr-2 h-4 w-4" />
          {chat.isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMoveToArchive}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveToTrash}>
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <div
      className={`group flex items-center rounded-lg p-2 transition-colors hover:bg-white/5 ${
        isActive ? "bg-mauve-accent/10" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mb-1 flex items-center gap-2">
          {showParentIcon && (
            <GitBranch className="inline-block h-4 w-4 flex-shrink-0 text-mauve-subtle/50" />
          )}
          <InlineEdit
            value={chat.title}
            onSave={(newTitle) => onRename?.(newTitle)}
            placeholder="Chat title..."
            disabled={!onRename}
            editTrigger="click"
            className="flex-1 min-w-0"
          />
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between">
          <div
            className={`text-xs transition-opacity ${
              chat.status === "trashed" ? "text-red-400" : "text-mauve-subtle/50"
            } ${isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {getTimeDisplay()}
          </div>

          {chat.status === "trashed" && (
            <AlertTriangle className="h-3 w-3 flex-shrink-0 text-red-400" />
          )}
        </div>
      </div>

      <div
        className={`flex items-center gap-1 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {renderActions()}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
