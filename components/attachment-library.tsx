"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
      .flatMap((cat) => Object.keys(SUPPORTED_FILE_TYPES[cat]))
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
          <Button onClick={handleAttachSelected} className="bg-mauve-accent/20 hover:bg-mauve-accent/30">
            <Check className="w-4 h-4 mr-2" />
            Attach {selectedIds.length} File{selectedIds.length !== 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-subtle" />
            <Input
              placeholder="Search files..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-9 bg-mauve-dark/50 border-mauve-dark"
            />
          </div>
        </div>

        <Select
          value={filters.fileType}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, fileType: value as any }))}
        >
          <SelectTrigger className="w-48 bg-mauve-dark/50 border-mauve-dark">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-mauve-surface border-mauve-dark">
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
          <SelectTrigger className="w-48 bg-mauve-dark/50 border-mauve-dark">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-mauve-surface border-mauve-dark">
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
          <div className="text-center py-12">
            <File className="w-12 h-12 mx-auto text-mauve-subtle/50 mb-4" />
            <p className="text-mauve-subtle/70">
              {filters.search || filters.fileType !== "all"
                ? "No files match your filters"
                : "No files in your library yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                isSelected={selectedIds.includes(attachment.id)}
                selectionMode={mode === "select"}
                onSelectionToggle={() => handleSelectionToggle(attachment.id)}
                onPreview={() => setPreviewAttachment(attachment)}
                onReplace={() => handleReplaceFile(attachment.id)}
                onDelete={() => deleteAttachment(attachment.id)}
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
  const fileInfo = getFileTypeInfo(attachment.fileType)
  const Icon = categoryIcons[fileInfo.category] || File
  const usages = getUsages(attachment.id)

  return (
    <Card
      className={`bg-mauve-surface/50 border-mauve-dark transition-all hover:bg-mauve-surface/70 ${
        isSelected ? "ring-2 ring-mauve-accent" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {selectionMode && <Checkbox checked={isSelected} onCheckedChange={onSelectionToggle} className="mt-1" />}

          <Icon className="w-8 h-8 text-mauve-accent flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm truncate" title={attachment.filename}>
                  {attachment.filename}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {fileInfo.name}
                  </Badge>
                  <span className="text-xs text-mauve-subtle/70">{formatFileSize(attachment.sizeBytes)}</span>
                </div>
              </div>

              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-mauve-surface border-mauve-dark">
                    <DropdownMenuItem onClick={onPreview}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReplace}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Replace
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-mauve-subtle/70">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {attachment.createdAt.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {attachment.usageCount} uses
              </div>
            </div>

            {usages.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-mauve-subtle/70 mb-1">Used in:</p>
                <div className="flex flex-wrap gap-1">
                  {usages.slice(0, 2).map((usage) => (
                    <Badge key={usage.id} variant="outline" className="text-xs h-4">
                      {usage.contextName}
                    </Badge>
                  ))}
                  {usages.length > 2 && (
                    <Badge variant="outline" className="text-xs h-4">
                      +{usages.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {attachment.processingStatus === "pending" && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/50">
                  Processing...
                </Badge>
              </div>
            )}

            {attachment.processingStatus === "failed" && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-red-400 border-red-500/50">
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
  const usages = getUsages(attachment.id)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="bg-mauve-surface border-mauve-dark max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground">{attachment.filename}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-mauve-dark/30 rounded-lg">
            <div>
              <span className="text-xs text-mauve-subtle/70">File Type:</span>
              <div className="font-medium text-sm">{attachment.fileType}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Size:</span>
              <div className="font-medium text-sm">{formatFileSize(attachment.sizeBytes)}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Created:</span>
              <div className="font-medium text-sm">{attachment.createdAt.toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-xs text-mauve-subtle/70">Usage Count:</span>
              <div className="font-medium text-sm">{attachment.usageCount}</div>
            </div>
          </div>

          {/* Content Preview */}
          {attachment.extractedText && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Content Preview:</h4>
              <ScrollArea className="h-64 p-4 bg-mauve-dark/30 rounded-lg">
                <pre className="text-xs text-mauve-subtle whitespace-pre-wrap">
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
              <h4 className="font-medium text-sm">Used In:</h4>
              <div className="space-y-2">
                {usages.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between p-2 bg-mauve-dark/30 rounded">
                    <div>
                      <span className="text-sm font-medium">{usage.contextName}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {usage.usageType}
                      </Badge>
                    </div>
                    <span className="text-xs text-mauve-subtle/70">{usage.usedAt.toLocaleDateString()}</span>
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
