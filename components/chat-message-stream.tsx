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
  StopCircle,
} from "lucide-react"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import oneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark"
import { ShareChatModal } from "@/components/share-chat-modal"
import { ExportChatModal } from "@/components/export-chat-modal"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ChatMessageStreamProps {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  isStreaming?: boolean
  isEditing?: boolean
  user?: {
    name?: string
    image?: string
  }
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onRegenerate?: (id: string) => void
  onCopy?: (content: string) => void
  onStop?: () => void
}

export function ChatMessageStream({
  id,
  type,
  content,
  timestamp,
  model,
  isStreaming = false,
  isEditing = false,
  user,
  onEdit,
  onDelete,
  onRegenerate,
  onCopy,
  onStop,
}: ChatMessageStreamProps) {
  const [editContent, setEditContent] = useState(content)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // Update streaming content when content changes
  useEffect(() => {
    if (isStreaming && type === "assistant") {
      setStreamingContent(content)
    }
  }, [content, isStreaming, type])

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [streamingContent, isStreaming])

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

  const downloadCode = (code: string, language: string) => {
    const extensions: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
      xml: "xml",
      sql: "sql",
      bash: "sh",
      shell: "sh",
    }

    const extension = extensions[language.toLowerCase()] || "txt"
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const displayContent = isStreaming && type === "assistant" ? streamingContent : content
  const blocks = extractCodeBlocks(displayContent)

  return (
    <div
      className={`group flex gap-4 rounded-lg p-4 transition-colors ${
        type === "user" ? "ml-12 bg-mauve-surface/30" : "bg-mauve-dark/20"
      } ${isStreaming ? "animate-pulse" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {type === "user" ? (
          <>
            <AvatarImage src={user?.image} alt={user?.name || "User"} />
            <AvatarFallback>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-mauve-accent/20">
            <span className="text-xs font-bold text-mauve-bright">AI</span>
          </div>
        )}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold">{type === "user" ? "You" : "Assistant"}</span>
          {model && type === "assistant" && (
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
          )}
          {isStreaming && type === "assistant" && (
            <Badge
              variant="outline"
              className="border-green-500/30 bg-green-500/20 text-xs text-green-400"
            >
              Streaming...
            </Badge>
          )}
          <span className="text-xs text-mauve-subtle/70">{timestamp.toLocaleTimeString()}</span>
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
                  <div>
                    <MarkdownRenderer content={block.content} />
                    {isStreaming && type === "assistant" && index === blocks.length - 1 && (
                      <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-mauve-bright" />
                    )}
                  </div>
                ) : (
                  <div className="group/code relative">
                    <div className="flex items-center justify-between rounded-t-lg border-b border-mauve-dark bg-mauve-dark/50 px-4 py-2">
                      <Badge variant="outline" className="text-xs">
                        <Code className="mr-1 h-3 w-3" />
                        {block.language}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onCopy?.(block.content || "")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => downloadCode(block.content, block.language || "txt")}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      language={block.language}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        backgroundColor: "hsl(288, 15%, 12%)",
                      }}
                    >
                      {block.content}
                    </SyntaxHighlighter>
                  </div>
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
              onClick={() => onCopy?.(displayContent)}
            >
              <Copy className="h-3 w-3" />
            </Button>

            {type === "assistant" && (
              <>
                {isStreaming ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300"
                    onClick={onStop}
                  >
                    <StopCircle className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRegenerate?.(id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
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

            {!isStreaming && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEdit}>
                <Edit className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            <ExportChatModal
              messages={[{ id, type, content: displayContent, timestamp, model }]}
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

        {/* Invisible element for auto-scroll targeting */}
        <div ref={messageEndRef} />
      </div>
    </div>
  )
}
