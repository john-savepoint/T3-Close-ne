"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  FileText,
  Code,
  Database,
  ImageIcon,
  File,
  MoreHorizontal,
  Trash2,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  BarChart3,
  Check,
} from "lucide-react"
import { useAttachments } from "@/hooks/use-attachments"
import type { Attachment, AttachmentLibraryFilters } from "@/types/attachment"

interface AttachmentLibraryProps {
  mode?: "view" | "select"
  selectedAttachments?: string[]
  onSelectionChange?: (attachmentIds: string[]) => void
  onAttach?: (attachments: Attachment[]) => void
}

const categoryIcons = {
  documents: FileText,
  code: Code,
  data: Database,
  images: ImageIcon,
  other: File,
}

export function AttachmentLibrary({
  mode = "view",
  selectedAttachments = [],
  onSelectionChange,
  onAttach,
}: AttachmentLibraryProps) {
  const {
    attachments,
    deleteAttachment,
    replaceAttachment,
    getAttachmentUsages,
    filterAttachments,
    getFileTypeInfo,
    loading,
    SUPPORTED_FILE_TYPES,
  } = useAttachments()

  const [filters, setFilters] = useState<AttachmentLibraryFilters>({
    search: "",
    fileType: "all",
    sortBy: "date",
    sortOrder: "desc",
  })

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedAttachments)

  const filteredAttachments = filterAttachments(filters)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleSelectionToggle = (attachmentId: string) => {
    const newSelection = selectedIds.includes(attachmentId)
      ? selectedIds.filter((id) => id !== attachmentId)
      : [...selectedIds, attachmentId]

    setSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleAttachSelected = () => {
    const selectedAttachmentObjects = attachments.filter((att) => selectedIds.includes(att.id))
    onAttach?.(selectedAttachmentObjects)
  }

  const handleReplaceFile = async (attachmentId: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = Object.keys(SUPPORTED_FILE_TYPES)
      .flatMap((cat) => Object.keys((SUPPORTED_FILE_TYPES as any)[cat]))
      .join(",")

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          await replaceAttachment(attachmentId, file)
        } catch (error) {
          console.error("Failed to replace file:", error)
        }
      }
    }

    input.click()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attachment Library</h2>
          <p className="text-sm text-mauve-subtle/70">
            {filteredAttachments.length} of {attachments.length} files
          </p>
        </div>

        {mode === "select" && selectedIds.length > 0 && (
          <Button
            onClick={handleAttachSelected}
            className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
          >
            <Check className="mr-2 h-4 w-4" />
            Attach {selectedIds.length} File{selectedIds.length !== 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-subtle" />
            <Input
              placeholder="Search files..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="border-mauve-dark bg-mauve-dark/50 pl-9"
            />
          </div>
        </div>

        <Select
          value={filters.fileType}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, fileType: value as any }))}
        >
          <SelectTrigger className="w-48 border-mauve-dark bg-mauve-dark/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-mauve-dark bg-mauve-surface">
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="images">Images</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-")
            setFilters((prev) => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }))
          }}
        >
          <SelectTrigger className="w-48 border-mauve-dark bg-mauve-dark/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-mauve-dark bg-mauve-surface">
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="size-desc">Largest First</SelectItem>
            <SelectItem value="size-asc">Smallest First</SelectItem>
            <SelectItem value="usage-desc">Most Used</SelectItem>
            <SelectItem value="usage-asc">Least Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File Grid */}
      <ScrollArea className="h-96">
        {filteredAttachments.length === 0 ? (
          <div className="py-12 text-center">
            <File className="mx-auto mb-4 h-12 w-12 text-mauve-subtle/50" />
            <p className="text-mauve-subtle/70">
              {filters.search || filters.fileType !== "all"
                ? "No files match your filters"
                : "No files in your library yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAttachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                isSelected={selectedIds.includes(attachment.id || attachment._id)}
                selectionMode={mode === "select"}
                onSelectionToggle={() => handleSelectionToggle(attachment.id || attachment._id)}
                onPreview={() => setPreviewAttachment(attachment)}
                onReplace={() => handleReplaceFile(attachment.id || attachment._id)}
                onDelete={() => deleteAttachment(attachment.id || attachment._id)}
                getFileTypeInfo={getFileTypeInfo}
                getUsages={getAttachmentUsages}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Preview Modal */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          getUsages={getAttachmentUsages}
        />
      )}
    </div>
  )
}

interface AttachmentCardProps {
  attachment: Attachment
  isSelected: boolean
  selectionMode: boolean
  onSelectionToggle: () => void
  onPreview: () => void
  onReplace: () => void
  onDelete: () => void
  getFileTypeInfo: (mimeType: string) => any
  getUsages: (attachmentId: string) => any[]
}

function AttachmentCard({
  attachment,
  isSelected,
  selectionMode,
  onSelectionToggle,
  onPreview,
  onReplace,
  onDelete,
  getFileTypeInfo,
  getUsages,
}: AttachmentCardProps) {
  const fileInfo = getFileTypeInfo(attachment.fileType || attachment.contentType)
  const Icon = (categoryIcons as any)[fileInfo.category] || File
  const usages = getUsages(attachment.id || attachment._id)

  return (
    <Card
      className={`border-mauve-dark bg-mauve-surface/50 transition-all hover:bg-mauve-surface/70 ${
        isSelected ? "ring-2 ring-mauve-accent" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {selectionMode && (
            <Checkbox checked={isSelected} onCheckedChange={onSelectionToggle} className="mt-1" />
          )}

          <Icon className="h-8 w-8 flex-shrink-0 text-mauve-accent" />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium" title={attachment.filename}>
                  {attachment.filename}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {fileInfo.name}
                  </Badge>
                  <span className="text-xs text-mauve-subtle/70">
                    {formatFileSize(attachment.sizeBytes || attachment.size)}
                  </span>
                </div>
              </div>

              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-mauve-dark bg-mauve-surface">
                    <DropdownMenuItem onClick={onPreview}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReplace}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Replace
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-red-400 focus:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-mauve-subtle/70">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {attachment.createdAt ? attachment.createdAt.toLocaleDateString() : new Date(attachment._creationTime).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {attachment.usageCount || 0} uses
              </div>
            </div>

            {usages.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-mauve-subtle/70">Used in:</p>
                <div className="flex flex-wrap gap-1">
                  {usages.slice(0, 2).map((usage) => (
                    <Badge key={usage.id} variant="outline" className="h-4 text-xs">
                      {usage.contextName}
                    </Badge>
                  ))}
                  {usages.length > 2 && (
                    <Badge variant="outline" className="h-4 text-xs">
                      +{usages.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {attachment.processingStatus === "pending" && (
              <div className="mt-2">
                <Badge variant="outline" className="border-yellow-500/50 text-xs text-yellow-400">
                  Processing...
                </Badge>
              </div>
            )}

            {attachment.processingStatus === "failed" && (
              <div className="mt-2">
                <Badge variant="outline" className="border-red-500/50 text-xs text-red-400">
                  Processing Failed
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AttachmentPreviewModalProps {
  attachment: Attachment
  onClose: () => void
  getUsages: (attachmentId: string) => any[]
}

function AttachmentPreviewModal({ attachment, onClose, getUsages }: AttachmentPreviewModalProps) {
  const usages = getUsages(attachment.id || attachment._id)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[80vh] max-w-4xl border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">{attachment.filename}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-mauve-dark/30 p-4 md:grid-cols-4">
            <div>
              <span className="text-xs text-mauve-subtle/70">File Type:</span>
              <div className="text-sm font-medium">{attachment.fileType}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Size:</span>
              <div className="text-sm font-medium">{formatFileSize(attachment.sizeBytes || attachment.size)}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Created:</span>
              <div className="text-sm font-medium">{attachment.createdAt ? attachment.createdAt.toLocaleDateString() : new Date(attachment._creationTime).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Usage Count:</span>
              <div className="text-sm font-medium">{attachment.usageCount || 0}</div>
            </div>
          </div>

          {/* Content Preview */}
          {attachment.extractedText && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Content Preview:</h4>
              <ScrollArea className="h-64 rounded-lg bg-mauve-dark/30 p-4">
                <pre className="whitespace-pre-wrap text-xs text-mauve-subtle">
                  {attachment.extractedText.length > 2000
                    ? `${attachment.extractedText.substring(0, 2000)}...`
                    : attachment.extractedText}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Usage Information */}
          {usages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Used In:</h4>
              <div className="space-y-2">
                {usages.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between rounded bg-mauve-dark/30 p-2"
                  >
                    <div>
                      <span className="text-sm font-medium">{usage.contextName}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {usage.usageType}
                      </Badge>
                    </div>
                    <span className="text-xs text-mauve-subtle/70">
                      {usage.usedAt.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
