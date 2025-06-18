"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  MessageSquare,
  User,
  Bot,
  GitBranch,
  Clock,
  Edit3,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

import { useConversationTree } from "@/hooks/use-conversation-tree"
import type { ConversationBranch } from "@/types/chat"

interface ThreadMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  branches?: ThreadMessage[]
  title?: string
}

interface ThreadNavigatorProps {
  messages: ThreadMessage[]
  currentMessageId?: string
  onMessageSelect: (messageId: string) => void
  onBranchSelect?: (branchId: string) => void
  onBranchRename?: (messageId: string, newName: string) => void
}

export function ThreadNavigator({
  messages,
  currentMessageId,
  onMessageSelect,
  onBranchSelect,
  onBranchRename,
}: ThreadNavigatorProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"standard" | "tree">("standard")
  const { conversationTree, renameBranch } = useConversationTree({
    messages,
    activeLeafId: currentMessageId,
  })

  const toggleBranch = (messageId: string) => {
    const newExpanded = new Set(expandedBranches)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedBranches(newExpanded)
  }

  const renderMessage = (message: ThreadMessage, depth = 0) => {
    const isExpanded = expandedBranches.has(message.id)
    const hasBranches = message.branches && message.branches.length > 0
    const isActive = message.id === currentMessageId

    return (
      <div key={message.id} className="space-y-1">
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
            isActive ? "bg-mauve-accent/20" : "hover:bg-mauve-dark/30"
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => onMessageSelect(message.id)}
        >
          {hasBranches && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleBranch(message.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          {message.type === "user" ? (
            <User className="h-4 w-4 text-blue-400" />
          ) : (
            <Bot className="h-4 w-4 text-mauve-accent" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {editingTitle === message.id ? (
                <input
                  type="text"
                  defaultValue={message.title || message.content.substring(0, 30)}
                  className="flex-1 rounded border border-mauve-dark bg-mauve-dark/50 px-2 py-1 text-xs"
                  onBlur={() => setEditingTitle(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingTitle(null)
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span className="truncate text-sm">
                  {message.title || message.content.substring(0, 30)}
                  {message.content.length > 30 && "..."}
                </span>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTitle(message.id)
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <Clock className="h-3 w-3 text-mauve-subtle/50" />
              <span className="text-xs text-mauve-subtle/70">
                {message.timestamp.toLocaleTimeString()}
              </span>

              {hasBranches && (
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="mr-1 h-3 w-3" />
                  {message.branches!.length}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {hasBranches && isExpanded && (
          <div className="space-y-1">
            {message.branches!.map((branch) => renderMessage(branch, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderStandardView = () => {
    // Keep the existing renderMessage logic here
    return <div className="space-y-2 pr-4">{messages.map((message) => renderMessage(message))}</div>
  }

  const renderTreeView = () => {
    // Add the tree rendering logic here
    const branches = Array.isArray(conversationTree.branches)
      ? conversationTree.branches
      : Array.from(conversationTree.branches.values())

    return <div className="space-y-2 pr-4">{branches.map(renderBranch)}</div>
  }

  const renderBranch = (branch: ConversationBranch) => {
    const isExpanded = expandedBranches.has(branch.id)
    const isEditing = editingTitle === branch.id

    return (
      <div key={branch.id} className="space-y-1">
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
            branch.isActive
              ? "border border-mauve-accent/50 bg-mauve-accent/20"
              : "hover:bg-mauve-dark/30"
          }`}
          style={{ marginLeft: `${branch.depth * 16}px` }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              toggleBranch(branch.id)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>

          <GitBranch className="h-4 w-4 text-mauve-accent" />

          {isEditing ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                defaultValue={branch.name || ""}
                className="flex-1 rounded border border-mauve-dark bg-mauve-dark/50 px-2 py-1 text-xs"
                onBlur={(e) => {
                  if (e.target.value.trim() && onBranchRename) {
                    onBranchRename(branch.messages[0].id, e.target.value.trim())
                  }
                  setEditingTitle(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (e.currentTarget.value.trim() && onBranchRename) {
                      onBranchRename(branch.messages[0].id, e.currentTarget.value.trim())
                    }
                    setEditingTitle(null)
                  }
                }}
                autoFocus
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <span
                className="cursor-pointer truncate text-sm"
                onClick={() => onBranchSelect?.(branch.id)}
              >
                {branch.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {branch.messages.length}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingTitle(branch.id)
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {branch.messages.map((message) => renderMessage(message, 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 border-mauve-dark bg-mauve-surface">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">Thread Navigator</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "standard" ? "tree" : "standard")}
            >
              {viewMode === "standard" ? (
                <GitBranch className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              {viewMode === "standard" ? "Tree" : "Standard"}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="mt-4 h-full">
          {viewMode === "standard" ? renderStandardView() : renderTreeView()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
