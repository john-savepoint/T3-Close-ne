"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, Palette, Globe } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { ModelSwitcher } from "@/components/model-switcher"
import { EnhancedFileUpload } from "@/components/enhanced-file-upload"
import { Badge } from "@/components/ui/badge"
import type { Attachment } from "@/types/attachment"

export function ChatInput() {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro")
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

  return (
    <div className="w-full max-w-3xl mx-auto p-2 bg-mauve-surface/40 backdrop-blur-xl border border-t-white/10 border-l-white/10 border-r-black/20 border-b-black/20 rounded-2xl shadow-2xl shadow-black/30">
      <div className="flex flex-col">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message here..."
          className="bg-transparent border-none focus-visible:ring-0 text-base resize-none p-2 text-foreground placeholder:text-mauve-subtle/70 min-h-[40px] max-h-[200px] overflow-y-auto"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-mauve-dark/20 rounded-lg">
            {attachedFiles.map((file) => (
              <Badge key={file.id} variant="outline" className="text-xs bg-mauve-accent/20 border-mauve-accent/50 pr-1">
                <span className="truncate max-w-32" title={file.filename}>
                  {file.filename}
                </span>
                <span className="text-mauve-subtle/70 ml-1">({formatFileSize(file.sizeBytes)})</span>
                <button onClick={() => removeAttachment(file.id)} className="ml-1 hover:text-red-400 transition-colors">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <ModelSwitcher selectedModel={selectedModel} onModelChange={setSelectedModel} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-mauve-subtle text-xs">
                  <Palette className="mr-1 md:mr-2 h-4 w-4" /> High <span className="sr-only">Creativity</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Low</DropdownMenuItem>
                <DropdownMenuItem>Medium</DropdownMenuItem>
                <DropdownMenuItem>High</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!isMobile && (
              <Button variant="ghost" size="sm" className="text-mauve-subtle text-xs">
                <Globe className="mr-2 h-4 w-4" /> Search
              </Button>
            )}
            <EnhancedFileUpload onFilesAttached={handleFilesAttached} maxFiles={10} />
          </div>
          <Button size="icon" className="h-9 w-9 bg-mauve-accent/20 hover:bg-mauve-accent/30 text-mauve-bright">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
