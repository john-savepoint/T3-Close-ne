"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Palette, Globe, StopCircle } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ModelSwitcher } from "@/components/model-switcher"
import { EnhancedFileUpload } from "@/components/enhanced-file-upload"
import { Badge } from "@/components/ui/badge"
import type { Attachment } from "@/types/attachment"
import { formatFileSize } from "@/lib/file-utils"

interface ChatInputProps {
  onSendMessage?: (content: string, attachments?: Attachment[]) => void
  isLoading?: boolean
  onStopGeneration?: () => void
  selectedModel?: string
  onModelChange?: (model: string) => void
  disabled?: boolean
  temperature?: number
  onTemperatureChange?: (temperature: number) => void
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  onStopGeneration,
  selectedModel = "openai/gpt-4o-mini",
  onModelChange,
  disabled = false,
  temperature = 0.7,
  onTemperatureChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([])

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto"
    // Set the height to the scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [message])

  const handleFilesAttached = (attachments: Attachment[]) => {
    setAttachedFiles((prev) => [...prev, ...attachments])
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachedFiles((prev) => prev.filter((att) => att._id !== attachmentId))
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || disabled) return

    const messageContent = message.trim()
    const attachments = attachedFiles.length > 0 ? attachedFiles : undefined

    // Clear input and attachments
    setMessage("")
    setAttachedFiles([])

    // Send message
    onSendMessage?.(messageContent, attachments)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-b-black/20 border-l-white/10 border-r-black/20 border-t-white/10 bg-mauve-surface/40 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex flex-col">
        <Textarea
          ref={textareaRef}
          placeholder={isLoading ? "AI is thinking..." : "Type your message here..."}
          className="max-h-[200px] min-h-[40px] resize-none overflow-y-auto border-none bg-transparent p-2 text-base text-foreground placeholder:text-mauve-subtle/70 focus-visible:ring-0"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
        />

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 rounded-lg bg-mauve-dark/20 p-2">
            {attachedFiles.map((file) => (
              <Badge
                key={file._id}
                variant="outline"
                className="border-mauve-accent/50 bg-mauve-accent/20 pr-1 text-xs"
              >
                <span className="max-w-32 truncate" title={file.filename}>
                  {file.filename}
                </span>
                <span className="ml-1 text-mauve-subtle/70">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeAttachment(file._id)}
                  className="ml-1 transition-colors hover:text-red-400"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <ModelSwitcher
              selectedModel={selectedModel}
              onModelChange={onModelChange || (() => {})}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-mauve-subtle">
                  <Palette className="mr-1 h-4 w-4 md:mr-2" />
                  {temperature <= 0.3 ? "Low" : temperature <= 0.7 ? "Medium" : "High"}
                  <span className="sr-only">Creativity</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onTemperatureChange?.(0.1)}>
                  Low (0.1)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTemperatureChange?.(0.7)}>
                  Medium (0.7)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTemperatureChange?.(1.0)}>
                  High (1.0)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-not-allowed text-xs text-mauve-subtle opacity-50"
                disabled
                title="Web search not yet implemented"
              >
                <Globe className="mr-2 h-4 w-4" /> Search
              </Button>
            )}
            <EnhancedFileUpload onFilesAttached={handleFilesAttached} maxFiles={10} />
          </div>
          {isLoading ? (
            <Button
              size="icon"
              onClick={onStopGeneration}
              className="h-9 w-9 bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
              className="h-9 w-9 bg-mauve-accent/20 text-mauve-bright hover:bg-mauve-accent/30 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
