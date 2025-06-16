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
import { MoreHorizontal, Pin, Archive, Trash2, GitBranch, Edit, Share, RotateCcw, AlertTriangle } from "lucide-react"
import type { Chat } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"

interface EnhancedChatItemProps {
  chat: Chat
  isActive?: boolean
  showParentIcon?: boolean
  onMoveToArchive?: () => void
  onMoveToTrash?: () => void
  onRestore?: () => void
  onDeletePermanently?: () => void
  onRename?: () => void
  onShare?: () => void
  onPin?: () => void
  className?: string
}

export function EnhancedChatItem({
  chat,
  isActive = false,
  showParentIcon = false,
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

  const getStatusBadge = () => {
    switch (chat.status) {
      case "archived":
        return (
          <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/50 text-blue-400">
            Archived
          </Badge>
        )
      case "trashed":
        return (
          <Badge variant="outline" className="text-xs bg-red-500/10 border-red-500/50 text-red-400">
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
        30 - Math.floor((Date.now() - chat.statusChangedAt.getTime()) / (1000 * 60 * 60 * 24)),
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
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDeletePermanently} className="text-red-400">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Delete Permanently
          </DropdownMenuItem>
        </>
      )
    }

    if (chat.status === "archived") {
      return (
        <>
          <DropdownMenuItem onClick={onRestore} className="text-green-400">
            <RotateCcw className="h-4 w-4 mr-2" />
            Unarchive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMoveToTrash}>
            <Trash2 className="h-4 w-4 mr-2" />
            Move to Trash
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRename}>
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
        </>
      )
    }

    // Active chat actions
    return (
      <>
        <DropdownMenuItem onClick={onPin}>
          <Pin className="h-4 w-4 mr-2" />
          Pin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename}>
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMoveToArchive}>
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMoveToTrash}>
          <Trash2 className="h-4 w-4 mr-2" />
          Move to Trash
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShare}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <div
      className={`group flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors ${
        isActive ? "bg-mauve-accent/10" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {showParentIcon && <GitBranch className="inline-block w-4 h-4 text-mauve-subtle/50 flex-shrink-0" />}
          <span className="truncate text-sm text-mauve-subtle">{chat.title}</span>
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

          {chat.status === "trashed" && <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />}
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
