"use client"

/**
 * Thread Navigator Component
 * 
 * BRANCHING STRUCTURE DESIGN:
 * - Branch 1: Label is the first user prompt, content shows the initial chat exchange
 * - Branch 2: Label is the second user prompt, content shows that conversation branch
 * - Branch 3+: Labels are subsequent user prompts, content shows those exchanges
 * 
 * Each branch represents a different conversation path from a specific point.
 * Within each branch, AI responses can have multiple variations (not yet implemented).
 * 
 * TODO: Implement multiple AI response variations within each branch
 * - Each AI response could have alternative generations
 * - User can switch between different AI responses
 * - This creates a true conversation tree with multiple paths
 */

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
  Maximize2,
  Minimize2,
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
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
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

  const toggleMessageExpanded = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newExpanded = new Set(expandedMessages)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedMessages(newExpanded)
  }

  const handleMessageClick = (messageId: string) => {
    onMessageSelect(messageId)
    // Scroll to the message in the main chat view
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        // Add a highlight effect
        element.classList.add("ring-2", "ring-mauve-accent", "ring-opacity-50")
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-mauve-accent", "ring-opacity-50")
        }, 2000)
      }
    }, 100)
  }

  const renderMessage = (message: ThreadMessage, depth = 0) => {
    const isExpanded = expandedBranches.has(message.id)
    const isMessageExpanded = expandedMessages.has(message.id)
    const hasBranches = message.branches && message.branches.length > 0
    const isActive = message.id === currentMessageId

    // Truncate content for preview
    const previewLength = 80
    const needsTruncation = message.content.length > previewLength
    const displayContent = isMessageExpanded 
      ? message.content 
      : message.content.substring(0, previewLength) + (needsTruncation ? "..." : "")

    return (
      <div key={message.id} className="space-y-1">
        <div
          className={`group flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-all ${
            isActive ? "bg-mauve-accent/20 ring-1 ring-mauve-accent/50" : "hover:bg-mauve-dark/30"
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => handleMessageClick(message.id)}
        >
          {hasBranches && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 flex-shrink-0"
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
            <User className="h-4 w-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Bot className="h-4 w-4 text-mauve-accent flex-shrink-0" />
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
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className={`text-sm ${isMessageExpanded ? "" : "truncate"}`}>
                  {displayContent}
                </span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {needsTruncation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={(e) => toggleMessageExpanded(message.id, e)}
                    title={isMessageExpanded ? "Collapse" : "Expand"}
                  >
                    {isMessageExpanded ? (
                      <Minimize2 className="h-3 w-3" />
                    ) : (
                      <Maximize2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTitle(message.id)
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
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
    return <div className="space-y-2 pr-4">{messages.map((message) => renderMessage(message))}</div>
  }

  const renderTreeView = () => {
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
      <SheetContent side="right" className="w-80 border-mauve-dark bg-mauve-surface flex flex-col">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-foreground">Thread Navigator</SheetTitle>
        </SheetHeader>

        {/* View Mode Toggle - Moved below header with proper spacing from close button */}
        <div className="border-t border-mauve-dark pt-4 pb-2">
          <div className="px-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "standard" ? "tree" : "standard")}
              className="w-full justify-center gap-2"
            >
              {viewMode === "standard" ? (
                <>
                  <GitBranch className="h-4 w-4" />
                  Switch to Tree View
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Switch to Standard View
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help text for tree view */}
        {viewMode === "tree" && (
          <div className="px-4 py-2 border-b border-mauve-dark">
            <p className="text-xs text-mauve-subtle">
              Branches represent conversation paths. Each branch starts with a user prompt. Click messages to navigate.
            </p>
          </div>
        )}

        {/* Scrollable content area */}
        <ScrollArea className="flex-1 mt-2">
          {viewMode === "standard" ? renderStandardView() : renderTreeView()}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}