"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  GitBranch,
  MessageSquare,
  User,
  Bot,
  ChevronRight,
  ChevronDown,
  Edit3,
  Check,
  X,
} from "lucide-react"
import type { ChatMessage } from "@/types/chat"
import { useConversationTree } from "@/hooks/use-conversation-tree"

interface ConversationTreeViewProps {
  messages: ChatMessage[]
  currentMessageId?: string | null
  onMessageSelect: (messageId: string) => void
  onBranchSwitch?: (messageId: string) => void
}

interface TreeNode {
  message: ChatMessage
  children: TreeNode[]
  isActivePath: boolean
}

export function ConversationTreeView({
  messages,
  currentMessageId,
  onMessageSelect,
  onBranchSwitch,
}: ConversationTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [nodeNames, setNodeNames] = useState<Map<string, string>>(new Map())

  const { getMessagePath, getBranchingPoints } = useConversationTree({
    messages,
    activeLeafId: currentMessageId,
  })

  // Build tree structure
  const buildTree = (): TreeNode[] => {
    const activePath = currentMessageId ? getMessagePath(currentMessageId) : []
    const activePathIds = new Set(activePath.map((m) => m.id))
    const branchingPoints = new Set(getBranchingPoints())

    // Find root messages (no parent)
    const rootMessages = messages.filter((m) => !m.parentId && !m.parentMessageId)

    const buildNode = (message: ChatMessage): TreeNode => {
      const children = messages
        .filter((m) => m.parentId === message.id || m.parentMessageId === message.id)
        .map((child) => buildNode(child))

      return {
        message,
        children,
        isActivePath: activePathIds.has(message.id),
      }
    }

    return rootMessages.map(buildNode)
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const startEditingNode = (nodeId: string, currentName?: string) => {
    setEditingNode(nodeId)
    setEditValue(nodeNames.get(nodeId) || currentName || "")
  }

  const saveNodeName = (nodeId: string) => {
    if (editValue.trim()) {
      const newNames = new Map(nodeNames)
      newNames.set(nodeId, editValue.trim())
      setNodeNames(newNames)
    }
    setEditingNode(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingNode(null)
    setEditValue("")
  }

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactElement => {
    const { message, children, isActivePath } = node
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(message.id)
    const isEditing = editingNode === message.id
    const nodeName = nodeNames.get(message.id)
    const branchingPoints = getBranchingPoints()
    const isBranchingPoint = branchingPoints.includes(message.id)

    return (
      <div key={message.id} className="w-full">
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${isActivePath ? "border-l-2 border-mauve-accent bg-mauve-accent/20" : "hover:bg-mauve-dark/30"} ${message.id === currentMessageId ? "ring-1 ring-mauve-accent" : ""} `}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => onMessageSelect(message.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(message.id)
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
            <User className="h-4 w-4 flex-shrink-0 text-blue-400" />
          ) : (
            <Bot className="h-4 w-4 flex-shrink-0 text-mauve-accent" />
          )}

          {isBranchingPoint && <GitBranch className="h-3 w-3 text-purple-400" />}

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNodeName(message.id)
                    if (e.key === "Escape") cancelEdit()
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    saveNodeName(message.id)
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    cancelEdit()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="truncate text-xs">
                  {nodeName ||
                    `${message.content.substring(0, 30)}${message.content.length > 30 ? "..." : ""}`}
                </span>
                {message.type === "user" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditingNode(message.id, message.content.substring(0, 30))
                    }}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {children.length > 1 && (
            <span className="text-xs text-mauve-subtle/70">{children.length} branches</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">{children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const tree = buildTree()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
          <GitBranch className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 border-mauve-dark bg-mauve-surface">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <GitBranch className="h-5 w-5 text-mauve-accent" />
            Conversation Tree
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-1 text-xs text-mauve-subtle/70">
          <p>• Click any message to jump to it</p>
          <p>• Rename prompts for better organization</p>
          <p>• Active path is highlighted</p>
        </div>

        <ScrollArea className="mt-4 h-[calc(100vh-180px)]">
          <div className="space-y-1 pr-4">{tree.map((node) => renderNode(node))}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
