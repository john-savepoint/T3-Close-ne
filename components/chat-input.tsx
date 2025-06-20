"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Palette, Globe, StopCircle, EyeOff } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { EnhancedModelSwitcher } from "@/components/enhanced-model-switcher"
import { useModels } from "@/hooks/use-models"
import { EnhancedFileUpload } from "@/components/enhanced-file-upload"
import { Badge } from "@/components/ui/badge"
import type { Attachment } from "@/types/attachment"
import { DEFAULT_MODEL_ID } from "@/lib/default-models"
import { estimateTokens } from "@/lib/token-utils"
import { useWebSearch } from "@/hooks/use-web-search"

interface ChatInputProps {
  onSendMessage?: (content: string, attachments?: Attachment[]) => void
  isLoading?: boolean
  onStopGeneration?: () => void
  selectedModel?: string
  onModelChange?: (model: string) => void
  disabled?: boolean
  temperature?: number
  onTemperatureChange?: (temperature: number) => void
  onMessageSent?: (message: string, model: string, attachments: Attachment[]) => void
  isTemporaryMode?: boolean
  onToggleTemporaryMode?: () => void
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  onStopGeneration,
  selectedModel,
  onModelChange,
  disabled = false,
  temperature = 0.7,
  onTemperatureChange,
  onMessageSent,
  isTemporaryMode = false,
  onToggleTemporaryMode,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const { selectedModel: modelsSelectedModel, setSelectedModel, getModelById } = useModels()
  const { search, isLoading: isSearching, error: searchError } = useWebSearch()

  // Use prop selectedModel if provided, otherwise fall back to models hook
  const currentSelectedModel = selectedModel || modelsSelectedModel?.id || "openai/gpt-4o-mini"

  const handleModelChange = (model: string | import("@/types/models").ChatModel) => {
    if (typeof model === "string") {
      // Handle legacy string format - find the model by ID
      const foundModel = getModelById(model)
      if (foundModel) {
        setSelectedModel(foundModel)
        onModelChange?.(model)
      }
    } else {
      setSelectedModel(model)
      onModelChange?.(model.id)
    }
  }
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
    setAttachedFiles((prev) => prev.filter((att) => att.id !== attachmentId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleSendMessage = async () => {
    if ((!message.trim() && attachedFiles.length === 0) || isLoading || disabled) return

    const messageContent = message.trim()
    const attachments = attachedFiles.length > 0 ? attachedFiles : undefined

    // Clear input and attachments
    setMessage("")
    setAttachedFiles([])

    // Send message using either callback
    if (onSendMessage) {
      onSendMessage(messageContent, attachments)
    } else if (onMessageSent) {
      onMessageSent(messageContent, currentSelectedModel, attachedFiles)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleWebSearch = async () => {
    if (!message.trim() || isSearching || isLoading) return

    const query = message.trim()
    const searchResult = await search(query)
    
    if (searchResult) {
      // Format search results into a message
      let searchMessage = `🔍 **Web Search Results for:** "${query}"\n\n`
      
      if (searchResult.answer) {
        searchMessage += `**Quick Answer:** ${searchResult.answer}\n\n`
      }
      
      searchMessage += `**Sources:**\n`
      searchResult.results.slice(0, 5).forEach((result, index) => {
        searchMessage += `${index + 1}. **[${result.title}](${result.url})**\n`
        searchMessage += `   ${result.content.substring(0, 200)}...\n\n`
      })
      
      if (searchResult.follow_up_questions && searchResult.follow_up_questions.length > 0) {
        searchMessage += `**Related Questions:**\n`
        searchResult.follow_up_questions.slice(0, 3).forEach((question, index) => {
          searchMessage += `• ${question}\n`
        })
      }
      
      // Send the search results as a message
      if (onSendMessage) {
        onSendMessage(searchMessage)
      } else if (onMessageSent) {
        onMessageSent(searchMessage, currentSelectedModel, [])
      }
      
      // Clear the input
      setMessage("")
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-b-black/20 border-l-white/10 border-r-black/20 border-t-white/10 bg-mauve-surface/40 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex flex-col">
        <Textarea
          ref={textareaRef}
          placeholder={isLoading ? "AI is thinking..." : "Type your message here..."}
          className="max-h-[200px] min-h-[40px] resize-none overflow-y-auto border-none bg-transparent p-2 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0"
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
                key={file.id}
                variant="outline"
                className="border-mauve-accent/50 bg-mauve-accent/20 pr-1 text-xs"
              >
                <span className="max-w-32 truncate" title={file.filename}>
                  {file.filename}
                </span>
                <span className="ml-1 text-muted-foreground/70">
                  ({formatFileSize(file.sizeBytes || file.size)})
                </span>
                <button
                  onClick={() => removeAttachment(file.id || file._id)}
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
            {/* Temporary Chat Toggle */}
            {onToggleTemporaryMode && (
              <Button
                variant={isTemporaryMode ? "default" : "outline"}
                size="sm"
                onClick={onToggleTemporaryMode}
                className={`text-xs ${
                  isTemporaryMode
                    ? "border-orange-500/50 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                }`}
              >
                <EyeOff className="mr-1 h-3 w-3 md:mr-2" />
                <span className="hidden sm:inline">Temporary</span>
                <span className="sm:hidden">Temp</span>
              </Button>
            )}
            <EnhancedModelSwitcher
              selectedModel={modelsSelectedModel}
              onModelChange={handleModelChange}
              showCost={true}
              estimatedTokens={
                message.length > 0 ? estimateTokens(message, currentSelectedModel) : undefined
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
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
                className={`text-xs ${isSearching ? "opacity-50" : ""}`}
                onClick={handleWebSearch}
                disabled={!message.trim() || isSearching || isLoading}
                title={
                  !message.trim() 
                    ? "Enter a search query first" 
                    : isSearching 
                    ? "Searching..." 
                    : "Search the web"
                }
              >
                <Globe className="mr-2 h-4 w-4" /> 
                {isSearching ? "Searching..." : "Search"}
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
