"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  File,
  FileText,
  ImageIcon,
  Code,
  Database,
  Download,
  ExternalLink,
  Eye,
  X,
} from "lucide-react"
import type { Attachment } from "@/types/attachment"
import { formatFileSize, getFileTypeIcon, isImageFile, isTextFile } from "@/lib/file-utils"
import { useToast } from "@/hooks/use-toast"

interface MessageAttachmentsProps {
  attachments: Attachment[]
  onRemoveAttachment?: (attachmentId: string) => void
  isOwnMessage?: boolean
  compact?: boolean
}

export function MessageAttachments({
  attachments,
  onRemoveAttachment,
  isOwnMessage = false,
  compact = false,
}: MessageAttachmentsProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const { success, error: showError } = useToast()

  if (!attachments || attachments.length === 0) {
    return null
  }

  const getFileIcon = (contentType: string, category?: string) => {
    const iconType = getFileTypeIcon(contentType, category)
    switch (iconType) {
      case "image": return ImageIcon
      case "document": return FileText
      case "code": return Code
      case "data": return Database
      default: return File
    }
  }

  const handleDownload = async (attachment: Attachment) => {
    if (attachment.url) {
      try {
        const response = await fetch(attachment.url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = attachment.originalFilename || attachment.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        success(`Downloaded ${attachment.originalFilename || attachment.filename}`)
      } catch (error) {
        console.error("Download failed:", error)
        showError(`Failed to download ${attachment.originalFilename || attachment.filename}`)
      }
    } else {
      showError("File URL not available for download")
    }
  }

  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap gap-1">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.contentType, attachment.category)
          return (
            <Badge
              key={attachment._id}
              variant="outline"
              className="cursor-pointer border-mauve-accent/50 bg-mauve-accent/20 text-xs hover:bg-mauve-accent/30"
              onClick={() => setPreviewAttachment(attachment)}
            >
              <Icon className="mr-1 h-3 w-3" />
              <span
                className="max-w-20 truncate"
                title={attachment.originalFilename || attachment.filename}
              >
                {attachment.originalFilename || attachment.filename}
              </span>
              <span className="ml-1 text-mauve-subtle/70">({formatFileSize(attachment.size)})</span>
            </Badge>
          )
        })}
        {previewAttachment && (
          <AttachmentPreviewDialog
            attachment={previewAttachment}
            isOpen={!!previewAttachment}
            onClose={() => setPreviewAttachment(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.contentType, attachment.category)
        const isImageFileType = isImageFile(attachment.contentType)

        return (
          <Card key={attachment._id} className="border-mauve-dark/50 bg-mauve-dark/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {isImageFileType && attachment.url ? (
                  <div className="relative">
                    <img
                      src={attachment.url}
                      alt={`Attachment: ${attachment.originalFilename || attachment.filename}`}
                      className="h-12 w-12 rounded border border-mauve-dark/50 object-cover"
                    />
                    <button
                      onClick={() => setPreviewAttachment(attachment)}
                      className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-mauve-accent/20">
                    <Icon className="h-6 w-6 text-mauve-accent" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer truncate font-medium text-foreground hover:text-mauve-accent"
                      title={attachment.originalFilename || attachment.filename}
                      onClick={() => setPreviewAttachment(attachment)}
                    >
                      {attachment.originalFilename || attachment.filename}
                    </span>
                    {attachment.category && (
                      <Badge variant="outline" className="text-xs">
                        {attachment.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mauve-subtle/70">
                    <span>{formatFileSize(attachment.size)}</span>
                    {attachment.contentType && (
                      <>
                        <span>•</span>
                        <span>{attachment.contentType}</span>
                      </>
                    )}
                  </div>
                  {attachment.description && (
                    <p className="mt-1 truncate text-xs text-mauve-subtle/80">
                      {attachment.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setPreviewAttachment(attachment)}
                    aria-label={`Preview ${attachment.originalFilename || attachment.filename}`}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDownload(attachment)}
                    aria-label={`Download ${attachment.originalFilename || attachment.filename}`}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  {attachment.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => window.open(attachment.url, "_blank")}
                      aria-label={`Open ${attachment.originalFilename || attachment.filename} in new tab`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  {isOwnMessage && onRemoveAttachment && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                      onClick={() => onRemoveAttachment(attachment._id)}
                      aria-label={`Remove ${attachment.originalFilename || attachment.filename} attachment`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {previewAttachment && (
        <AttachmentPreviewDialog
          attachment={previewAttachment}
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  )
}

interface AttachmentPreviewDialogProps {
  attachment: Attachment
  isOpen: boolean
  onClose: () => void
}

function AttachmentPreviewDialog({ attachment, isOpen, onClose }: AttachmentPreviewDialogProps) {
  const isImageFileType = isImageFile(attachment.contentType)
  const isTextFileType = isTextFile(attachment.contentType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {attachment.originalFilename || attachment.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImageFileType && attachment.url ? (
            <div className="flex justify-center">
              <img
                src={attachment.url}
                alt={`Attachment preview: ${attachment.originalFilename || attachment.filename}`}
                className="max-h-96 max-w-full rounded border border-mauve-dark/50 object-contain"
              />
            </div>
          ) : isTextFileType && attachment.url ? (
            <div className="rounded bg-mauve-dark/30 p-4 font-mono text-sm">
              <iframe
                src={attachment.url}
                className="h-96 w-full border-none bg-transparent"
                title={attachment.originalFilename || attachment.filename}
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <File className="mx-auto mb-4 h-16 w-16 text-mauve-subtle" />
              <p className="text-mauve-subtle">Preview not available for this file type</p>
              <p className="mt-2 text-sm text-mauve-subtle/70">
                Download the file to view its contents
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-mauve-dark/50 pt-4">
          <div className="text-sm text-mauve-subtle/70">
            <span>{formatFileSize(attachment.size)}</span>
            {attachment.contentType && (
              <>
                <span className="mx-2">•</span>
                <span>{attachment.contentType}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (attachment.url) {
                  window.open(attachment.url, "_blank")
                }
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>
            <Button
              onClick={() => {
                if (attachment.url) {
                  const a = document.createElement("a")
                  a.href = attachment.url
                  a.download = attachment.originalFilename || attachment.filename
                  a.click()
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
