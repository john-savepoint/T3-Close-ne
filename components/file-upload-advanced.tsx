"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Paperclip,
  Upload,
  File,
  ImageIcon,
  FileText,
  Code,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useFileUpload, type UploadedFile } from "@/hooks/use-file-upload"
import { getFileIcon, ALLOWED_FILE_TYPES, formatFileSize } from "@/lib/file-validation"
import { cn } from "@/lib/utils"

interface FileUploadAdvancedProps {
  onFilesUploaded?: (files: UploadedFile[]) => void
  maxFiles?: number
  disabled?: boolean
  trigger?: React.ReactNode
}

export function FileUploadAdvanced({
  onFilesUploaded,
  maxFiles = 10,
  disabled = false,
  trigger,
}: FileUploadAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    uploadFiles,
    uploadProgress,
    isUploading,
    getUploadSummary,
    clearProgress,
    formatFileSize: formatSize,
  } = useFileUpload({
    maxFiles,
    onUploadComplete: (files) => {
      onFilesUploaded?.(files)
    },
    onUploadError: (error) => {
      console.error("Upload error:", error)
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadFiles,
    maxFiles,
    disabled,
    accept: {
      ...Object.fromEntries(
        Object.entries(ALLOWED_FILE_TYPES.images).map(([mime, config]) => [mime, config.ext])
      ),
      ...Object.fromEntries(
        Object.entries(ALLOWED_FILE_TYPES.documents).map(([mime, config]) => [mime, config.ext])
      ),
      ...Object.fromEntries(
        Object.entries(ALLOWED_FILE_TYPES.code).map(([mime, config]) => [mime, config.ext])
      ),
    },
  })

  const getFileIconComponent = (type: string) => {
    const iconName = getFileIcon(type)
    switch (iconName) {
      case "ImageIcon":
        return ImageIcon
      case "FileText":
        return FileText
      case "Code":
        return Code
      default:
        return File
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2
      case "error":
        return AlertCircle
      default:
        return Upload
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 border-green-500/50"
      case "error":
        return "text-red-400 border-red-500/50"
      case "uploading":
        return "text-yellow-400 border-yellow-500/50"
      default:
        return "text-mauve-subtle border-mauve-dark"
    }
  }

  const summary = getUploadSummary()

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle" disabled={disabled}>
      <Paperclip className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-h-[80vh] max-w-3xl border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Upload className="h-5 w-5" />
            Upload Files
            {summary.total > 0 && (
              <Badge variant="outline" className="ml-2">
                {summary.completed}/{summary.total}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={cn(
                  "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200",
                  isDragActive
                    ? "border-mauve-accent bg-mauve-accent/10"
                    : "border-mauve-dark hover:border-mauve-accent/50",
                  disabled && "cursor-not-allowed opacity-50",
                  isUploading && "pointer-events-none"
                )}
              >
                <input {...getInputProps()} />

                <Upload className="mx-auto mb-4 h-12 w-12 text-mauve-subtle" />

                {isDragActive ? (
                  <div>
                    <p className="font-medium text-mauve-bright">Drop files here</p>
                    <p className="text-sm text-mauve-subtle">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 font-medium text-foreground">
                      Drag & drop files here, or click to browse
                    </p>
                    <p className="mb-4 text-sm text-mauve-subtle">
                      Maximum {maxFiles} files • Up to 10MB each
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Images
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        PDFs
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Documents
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Code
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Upload Progress</h3>
                  <div className="flex items-center gap-2">
                    {summary.hasErrors && (
                      <Badge variant="destructive" className="text-xs">
                        {summary.failed} failed
                      </Badge>
                    )}
                    {summary.completed > 0 && (
                      <Badge
                        variant="outline"
                        className="border-green-500/50 text-xs text-green-400"
                      >
                        {summary.completed} completed
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {uploadProgress.map((file) => {
                      const Icon = getFileIconComponent(file.filename)
                      const StatusIcon = getStatusIcon(file.status)

                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 rounded-lg bg-mauve-dark/30 p-3"
                        >
                          <Icon className="h-5 w-5 flex-shrink-0 text-mauve-subtle" />

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{file.filename}</span>
                              <StatusIcon className={cn("h-4 w-4", getStatusColor(file.status))} />
                            </div>

                            {file.status === "uploading" && (
                              <Progress value={file.progress} className="h-2" />
                            )}

                            {file.error && (
                              <p className="mt-1 text-xs text-red-400">{file.error}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-mauve-subtle">
              {summary.total > 0 && (
                <span>
                  {summary.completed} of {summary.total} files uploaded
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {summary.total > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearProgress()
                    setIsOpen(false)
                  }}
                  className="text-mauve-subtle"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}

              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                {summary.isComplete ? "Done" : "Cancel"}
              </Button>

              {summary.completed > 0 && (
                <Button
                  className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                >
                  Use Files ({summary.completed})
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
