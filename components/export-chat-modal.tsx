"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  FileText,
  FileCode,
  FileJson,
  FileImage,
  Loader2,
  Check,
  Info,
} from "lucide-react"
import {
  formatAsMarkdown,
  formatAsPlainText,
  formatAsJSON,
  sanitizeFilename,
  type ExportOptions,
} from "@/utils/export-formatter"
import { downloadAsMarkdown, downloadAsPlainText, downloadAsJSON } from "@/utils/file-download"
import type { ChatMessage } from "@/types/chat"

interface ExportChatModalProps {
  messages: ChatMessage[]
  chatTitle?: string
  trigger?: React.ReactNode
}

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  extension: string
  available: boolean
  comingSoon?: boolean
}

export function ExportChatModal({
  messages,
  chatTitle = "Untitled Chat",
  trigger,
}: ExportChatModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportedFormat, setExportedFormat] = useState<string | null>(null)
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamps: false,
    includeModelInfo: false,
    includeUserPrompts: true,
  })

  const formats: ExportFormat[] = [
    {
      id: "markdown",
      name: "Markdown",
      description: "Best for documentation and web publishing",
      icon: <FileCode className="h-5 w-5" />,
      extension: ".md",
      available: true,
    },
    {
      id: "plaintext",
      name: "Plain Text",
      description: "Maximum compatibility, simple format",
      icon: <FileText className="h-5 w-5" />,
      extension: ".txt",
      available: true,
    },
    {
      id: "json",
      name: "JSON",
      description: "For developers and data processing",
      icon: <FileJson className="h-5 w-5" />,
      extension: ".json",
      available: true,
    },
    {
      id: "pdf",
      name: "PDF Document",
      description: "Professional format for printing and sharing",
      icon: <FileImage className="h-5 w-5" />,
      extension: ".pdf",
      available: false,
      comingSoon: true,
    },
  ]

  const handleExport = async (formatId: string) => {
    setIsExporting(true)
    setExportedFormat(null)

    try {
      const filename = sanitizeFilename(chatTitle)

      switch (formatId) {
        case "markdown": {
          const content = formatAsMarkdown(messages, chatTitle, options)
          downloadAsMarkdown(content, filename)
          break
        }
        case "plaintext": {
          const content = formatAsPlainText(messages, chatTitle, options)
          downloadAsPlainText(content, filename)
          break
        }
        case "json": {
          const content = formatAsJSON(messages, chatTitle, options)
          downloadAsJSON(content, filename)
          break
        }
        case "pdf": {
          // Future implementation - would call server endpoint
          throw new Error("PDF export coming soon!")
        }
        default:
          throw new Error("Unknown export format")
      }

      setExportedFormat(formatId)

      // Auto-close modal after successful export
      setTimeout(() => {
        setIsOpen(false)
        setExportedFormat(null)
      }, 2000)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
            <Download className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Download className="h-5 w-5" />
            Export Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chat Info */}
          <Card className="border-mauve-dark bg-mauve-dark/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-mauve-accent/20">
                  <FileText className="h-4 w-4 text-mauve-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="truncate text-sm font-medium">{chatTitle}</h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-mauve-subtle/70">
                    <span>{messages.length} messages</span>
                    <span>Ready to export</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Export Options</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timestamps"
                  checked={options.includeTimestamps}
                  onCheckedChange={(checked) =>
                    updateOption("includeTimestamps", checked as boolean)
                  }
                />
                <Label htmlFor="timestamps" className="text-sm">
                  Include timestamps
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="model-info"
                  checked={options.includeModelInfo}
                  onCheckedChange={(checked) =>
                    updateOption("includeModelInfo", checked as boolean)
                  }
                />
                <Label htmlFor="model-info" className="text-sm">
                  Include model information
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="user-prompts"
                  checked={options.includeUserPrompts}
                  onCheckedChange={(checked) =>
                    updateOption("includeUserPrompts", checked as boolean)
                  }
                />
                <Label htmlFor="user-prompts" className="text-sm">
                  Include user prompts
                </Label>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Choose Format</h4>
            <div className="grid gap-3">
              {formats.map((format) => (
                <Card
                  key={format.id}
                  className={`cursor-pointer border-mauve-dark transition-colors hover:bg-mauve-dark/50 ${
                    !format.available ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-start p-0"
                      onClick={() => format.available && handleExport(format.id)}
                      disabled={!format.available || isExporting}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div className="flex-shrink-0 text-mauve-accent">
                          {isExporting && exportedFormat === format.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : exportedFormat === format.id ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            format.icon
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{format.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {format.extension}
                            </Badge>
                            {format.comingSoon && (
                              <Badge variant="secondary" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-mauve-subtle/70">{format.description}</p>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-500/20 bg-blue-500/10">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm text-blue-300">
              Exported files contain a snapshot of your conversation at this moment. They won't
              update if you continue the chat.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}
