"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Copy,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Code,
  Share2,
} from "lucide-react"
import { CodeBlockEnhanced } from "@/components/code-block-enhanced"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { Textarea } from "@/components/ui/textarea"

interface ChatMessageProps {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  isEditing?: boolean
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onRegenerate?: (id: string) => void
  onCopy?: (content: string) => void
}

export function ChatMessage({
  id,
  type,
  content,
  timestamp,
  model,
  isEditing = false,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
}: ChatMessageProps) {
  const [editContent, setEditContent] = useState(content)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditMode && textareaRef.current) {
      textareaRef.current.focus()
      // Auto-resize textarea
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditMode])

  const handleStartEdit = () => {
    setIsEditMode(true)
    setEditContent(content)
  }

  const handleSaveEdit = () => {
    if (editContent.trim() !== content) {
      onEdit?.(id, editContent.trim())
    }
    setIsEditMode(false)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditContent(content)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDelete?.(id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const extractCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks = []
    let match
    let lastIndex = 0

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        blocks.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        })
      }

      // Add code block
      blocks.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trim(),
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      blocks.push({
        type: "text",
        content: text.slice(lastIndex),
      })
    }

    return blocks.length > 0 ? blocks : [{ type: "text", content: text }]
  }


  const blocks = extractCodeBlocks(content)

  return (
    <div
      className={`group flex gap-4 rounded-lg p-4 transition-colors ${
        type === "user" ? "ml-12 bg-mauve-surface/30" : "bg-mauve-dark/20"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {type === "user" ? (
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mauve-accent/20">
            <span className="text-xs font-bold text-mauve-bright">AI</span>
          </div>
        )}
        <AvatarFallback>{type === "user" ? "U" : "AI"}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold">{type === "user" ? "You" : "Assistant"}</span>
          {model && type === "assistant" && (
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
          )}
          <span className="text-xs text-mauve-subtle/70">{timestamp.toLocaleTimeString()}</span>
          {/* Add edited indicator */}
          {/* You would track this in your message data */}
        </div>

        {isEditMode ? (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value)
                // Auto-resize
                e.target.style.height = "auto"
                e.target.style.height = `${e.target.scrollHeight}px`
              }}
              className="min-h-[100px] w-full resize-none border-mauve-dark bg-mauve-dark/50 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSaveEdit()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  handleCancelEdit()
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
            <div className="text-xs text-mauve-subtle/50">
              Press Cmd+Enter to save, Esc to cancel
            </div>
          </div>
        ) : showDeleteConfirm ? (
          <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-foreground">
              Are you sure you want to delete this message? This action cannot be undone and will
              remove the message from the conversation history.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={confirmDelete}>
                Delete Message
              </Button>
              <Button size="sm" variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {blocks.map((block, index) => (
              <div key={index}>
                {block.type === "text" ? (
                  <div className="whitespace-pre-wrap text-sm text-foreground">{block.content}</div>
                ) : (
                  <CodeBlockEnhanced
                    code={block.content}
                    language={block.language}
                    showLineNumbers={true}
                    showActions={true}
                    maxHeight="500px"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        {(isHovered || isEditMode) && !isEditMode && !showDeleteConfirm && (
          <div className="mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onCopy?.(content)}
            >
              <Copy className="h-3 w-3" />
            </Button>

            {type === "assistant" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onRegenerate?.(id)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Volume2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEdit}>
              <Edit className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            <ExportChatModal
              messages={[{ id, type, content, timestamp, model }]}
              chatTitle={`Single Message - ${type === "user" ? "User" : "Assistant"}`}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Download className="h-3 w-3" />
                </Button>
              }
            />

            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ShareChatModal
                chatId="current-chat-id"
                chatTitle="Current Chat Title"
                messageCount={5}
                trigger={<Share2 className="h-3 w-3" />}
              />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
