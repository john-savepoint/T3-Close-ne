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
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { CodeBlockEnhanced } from "@/components/code-block-enhanced"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { Textarea } from "@/components/ui/textarea"
import type { Attachment } from "@/types/attachment"
import { sanitizeSVG } from "@/lib/content-sanitizer"
import { CodeCanvas } from "@/components/code-canvas"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Mermaid component with safe loading
function MermaidWrapper({ code, className }: { code: string; className?: string }) {
  const [MermaidComponent, setMermaidComponent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const loadMermaid = async () => {
      try {
        const { default: Mermaid } = await import("@/components/ui/mermaid")
        if (mounted) {
          setMermaidComponent(() => Mermaid)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load Mermaid component:", error)
        if (mounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    loadMermaid()
    
    return () => {
      mounted = false
    }
  }, [])

  if (isLoading) {
    return <div className="flex justify-center p-4 text-sm text-muted-foreground">Loading diagram...</div>
  }

  if (hasError || !MermaidComponent) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-400">
        <p className="font-medium">Mermaid Diagram</p>
        <pre className="mt-2 text-xs opacity-70">{code}</pre>
        <p className="mt-2 text-xs">Diagram rendering unavailable</p>
      </div>
    )
  }

  return <MermaidComponent code={code} className={className} />
}

interface ChatMessageProps {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  attachments?: Attachment[]
  isEditingProp?: boolean
  isEdited?: boolean
  editedAt?: Date
  user?: {
    name?: string
    image?: string
  }
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onRegenerate?: (id: string) => void
  onCopy?: (content: string) => void
  onRemoveAttachment?: (attachmentId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: (id: string) => void
}

export function ChatMessage({
  id,
  type,
  content,
  timestamp,
  model,
  attachments,
  isEditingProp = false,
  isEdited = false,
  editedAt,
  user,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
  onRemoveAttachment,
  isCollapsed = false,
  onToggleCollapse,
}: ChatMessageProps) {
  const [editContent, setEditContent] = useState(content)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { clerkUser } = useAuth()

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

  const handleSaveEdit = async () => {
    if (editContent.trim() !== content) {
      setIsEditing(true)
      try {
        await onEdit?.(id, editContent.trim())
      } catch (error) {
        console.error("Failed to save edit:", error)
      } finally {
        setIsEditing(false)
      }
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

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete?.(id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Failed to delete message:", error)
    } finally {
      setIsDeleting(false)
    }
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

      // Check if it's a mermaid diagram or SVG
      const language = match[1] || "text"
      const content = match[2].trim()

      if (language.toLowerCase() === "mermaid") {
        blocks.push({
          type: "mermaid",
          content: content,
        })
      } else if (language.toLowerCase() === "svg") {
        blocks.push({
          type: "svg",
          content: sanitizeSVG(content),
        })
      } else {
        blocks.push({
          type: "code",
          language: language,
          content: content,
        })
      }

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

  // Get collapsed preview - first 2-3 lines or 150 characters
  const getCollapsedPreview = () => {
    const lines = content.split('\n')
    const previewLines = lines.slice(0, 3).join('\n')
    if (previewLines.length > 150) {
      return previewLines.substring(0, 150) + '...'
    }
    return previewLines + (lines.length > 3 ? '...' : '')
  }

  const blocks = extractCodeBlocks(isCollapsed ? getCollapsedPreview() : content)

  // Get user avatar and name
  const userName = type === "user" 
    ? (user?.name || clerkUser?.fullName || clerkUser?.firstName || "You")
    : "Assistant"
  
  const userImage = type === "user"
    ? (user?.image || clerkUser?.imageUrl)
    : null

  const userInitials = type === "user"
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AI"

  return (
    <div
      id={`message-${id}`}
      className={cn(
        "group flex gap-4 rounded-lg p-4 transition-all",
        type === "user" 
          ? "ml-[25%] bg-mauve-surface/50 flex-row-reverse" 
          : "bg-mauve-dark/20",
        isCollapsed && "opacity-90"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {type === "user" ? (
          <>
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-blue-500 text-white">
              {userInitials}
            </AvatarFallback>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mauve-accent/20">
            <span className="text-xs font-bold text-mauve-bright">AI</span>
          </div>
        )}
      </Avatar>

      <div className={cn("min-w-0 flex-1", type === "user" && "text-right")}>
        <div className={cn(
          "mb-2 flex items-center gap-2",
          type === "user" && "justify-end"
        )}>
          {/* Collapse/Expand Button */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => onToggleCollapse(id)}
              title={isCollapsed ? "Expand message" : "Collapse message"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
          
          <span className="text-sm font-semibold">{userName}</span>
          {model && type === "assistant" && (
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
          )}
          <span className="text-xs text-mauve-subtle/70">{timestamp.toLocaleTimeString()}</span>
          {isEdited && (
            <span className="text-xs text-mauve-subtle/50">
              (edited{editedAt ? ` ${editedAt.toLocaleTimeString()}` : ""})
            </span>
          )}
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
              <Button size="sm" onClick={handleSaveEdit} disabled={isEditing}>
                {isEditing ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isEditing}>
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
              <Button size="sm" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Message"
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "prose prose-invert max-w-none",
            type === "user" && "text-left",
            isCollapsed && "line-clamp-3"
          )}>
            {blocks.map((block, index) => (
              <div key={index}>
                {block.type === "text" ? (
                  <MarkdownRenderer content={block.content} />
                ) : block.type === "mermaid" ? (
                  <div className="my-4 overflow-x-auto rounded-lg border border-mauve-dark/50 bg-mauve-dark/20 p-4">
                    <MermaidWrapper code={block.content} className="min-w-0" />
                  </div>
                ) : block.type === "svg" ? (
                  <div className="my-4 overflow-x-auto rounded-lg border border-mauve-dark/50 bg-mauve-dark/20 p-4">
                    <div
                      className="flex justify-center"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  </div>
                ) : (
                  !isCollapsed && (
                    <CodeCanvas
                      code={block.content}
                      language={block.language || "text"}
                      title={block.language || "text"}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        {(isHovered || isEditMode) && !isEditMode && !showDeleteConfirm && (
          <div className={cn(
            "mt-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            type === "user" && "justify-end"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                // Always copy the raw content, not the formatted HTML
                if (onCopy) {
                  onCopy(content)
                  toast.success('Message copied to clipboard')
                } else {
                  // Fallback to direct clipboard write
                  navigator.clipboard.writeText(content).then(() => {
                    toast.success('Message copied to clipboard')
                  }).catch(err => {
                    console.error('Failed to copy:', err)
                    toast.error('Failed to copy message')
                  })
                }
              }}
              title="Copy message"
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
              messages={[{ 
                id, 
                type, 
                content, 
                timestamp, 
                model: model || 'Unknown',
                user: user
              }]}
              chatTitle={`Single Message - ${type === "user" ? "User" : "Assistant"}`}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Download message">
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