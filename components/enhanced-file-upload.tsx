"use client"

import React from "react"


import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Paperclip,
  Upload,
  FolderOpen,
  File,
  ImageIcon,
  FileText,
  Code,
  Database,
  X,
  Check,
  Library,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useAttachments } from "@/hooks/use-attachments"
import { AttachmentLibrary } from "@/components/attachment-library"
import type { Attachment, DirectoryUpload, FileUploadProgress } from "@/types/attachment"

interface EnhancedFileUploadProps {
  onFilesAttached: (attachments: Attachment[]) => void
  maxFiles?: number
  targetId?: string
  targetType?: "chat" | "project"
}

export function EnhancedFileUpload({ onFilesAttached, maxFiles = 20, targetId, targetType }: EnhancedFileUploadProps) {
  const { uploadFiles, uploadDirectory, uploadProgress, addAttachmentToContext, SUPPORTED_FILE_TYPES, loading } =
    useAttachments()

  const [isOpen, setIsOpen] = useState(false)
  const [directoryUpload, setDirectoryUpload] = useState<DirectoryUpload | null>(null)
  const [showDirectoryConfirm, setShowDirectoryConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const directoryInputRef = useRef<HTMLInputElement>(null)

  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES)
    .flatMap((category) => Object.keys(category))
    .join(",")

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        console.warn("Some files were rejected:", rejectedFiles)
      }

      if (acceptedFiles.length === 0) return

      try {
        const uploadedAttachments = await uploadFiles(acceptedFiles, targetId, targetType)

        // Add to context if target is specified
        if (targetId && targetType) {
          for (const attachment of uploadedAttachments) {
            await addAttachmentToContext(
              attachment.id,
              targetId,
              targetType,
              targetType === "project" ? "Project Context" : "Chat Context",
            )
          }
        }

        onFilesAttached(uploadedAttachments)
        setIsOpen(false)
      } catch (error) {
        console.error("Upload failed:", error)
      }
    },
    [uploadFiles, onFilesAttached, targetId, targetType, addAttachmentToContext],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: supportedTypes.split(",").reduce(
      (acc, type) => {
        acc[type.trim()] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
  })

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleDirectorySelect = () => {
    directoryInputRef.current?.click()
  }

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Group files by directory structure
    const directoryMap = new Map<string, File[]>()
    let totalSize = 0

    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/")
      const directory = pathParts.slice(0, -1).join("/")

      if (!directoryMap.has(directory)) {
        directoryMap.set(directory, [])
      }
      directoryMap.get(directory)!.push(file)
      totalSize += file.size
    })

    const directoryUpload: DirectoryUpload = {
      path: files[0].webkitRelativePath.split("/")[0],
      files,
      totalSize,
      fileCount: files.length,
    }

    setDirectoryUpload(directoryUpload)
    setShowDirectoryConfirm(true)
  }

  const handleDirectoryUpload = async () => {
    if (!directoryUpload) return

    try {
      const uploadedAttachments = await uploadDirectory(directoryUpload)
      onFilesAttached(uploadedAttachments)
      setShowDirectoryConfirm(false)
      setDirectoryUpload(null)
      setIsOpen(false)
    } catch (error) {
      console.error("Directory upload failed:", error)
    }
  }

  const handleLibrarySelection = (attachments: Attachment[]) => {
    onFilesAttached(attachments)
    setIsOpen(false)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.includes("text") || type.includes("json") || type.includes("xml")) return FileText
    if (type.includes("javascript") || type.includes("typescript")) return Code
    if (type.includes("spreadsheet") || type.includes("csv")) return Database
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
            <Paperclip className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-mauve-surface border-mauve-dark max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Attach Files</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 bg-mauve-dark/50">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="library">
                <Library className="w-4 h-4 mr-2" />
                Choose from Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              {/* Upload Progress */}
              {uploadProgress.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Upload Progress</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {uploadProgress.map((progress) => (
                        <UploadProgressItem key={progress.id} progress={progress} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-mauve-accent bg-mauve-accent/10"
                      : "border-mauve-dark hover:border-mauve-accent/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-3 text-mauve-subtle" />
                  {isDragActive ? (
                    <p className="text-mauve-bright">Drop files here...</p>
                  ) : (
                    <div>
                      <p className="text-foreground mb-2">Drag & drop files</p>
                      <Button variant="outline" size="sm" onClick={handleFileSelect}>
                        Or browse files
                      </Button>
                    </div>
                  )}
                </div>

                {/* Directory Upload */}
                <div className="border-2 border-dashed border-mauve-dark rounded-lg p-6 text-center">
                  <FolderOpen className="w-8 h-8 mx-auto mb-3 text-mauve-subtle" />
                  <p className="text-foreground mb-2">Upload entire folder</p>
                  <Button variant="outline" size="sm" onClick={handleDirectorySelect}>
                    Select Folder
                  </Button>
                </div>
              </div>

              {/* Supported File Types */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Supported File Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(SUPPORTED_FILE_TYPES).map(([category, types]) => (
                    <div key={category} className="space-y-1">
                      <div className="font-medium capitalize text-mauve-accent">{category}</div>
                      {Object.values(types).map((type: any) => (
                        <div key={type.ext} className="text-mauve-subtle/70">
                          {type.ext} - {type.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="library" className="mt-4">
              <AttachmentLibrary mode="select" onAttach={handleLibrarySelection} />
            </TabsContent>
          </Tabs>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={supportedTypes}
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0) {
                onDrop(files, [])
              }
            }}
            className="hidden"
          />
          <input
            ref={directoryInputRef}
            type="file"
            webkitdirectory=""
            multiple
            onChange={handleDirectoryChange}
            className="hidden"
          />
        </DialogContent>
      </Dialog>

      {/* Directory Upload Confirmation */}
      {showDirectoryConfirm && directoryUpload && (
        <Dialog open={showDirectoryConfirm} onOpenChange={setShowDirectoryConfirm}>
          <DialogContent className="bg-mauve-surface border-mauve-dark">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirm Directory Upload</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <FolderOpen className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  You're about to upload <strong>{directoryUpload.fileCount} files</strong> from the{" "}
                  <strong>{directoryUpload.path}</strong> directory.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-mauve-subtle/70">Total Files:</span>
                  <div className="font-medium">{directoryUpload.fileCount}</div>
                </div>
                <div>
                  <span className="text-mauve-subtle/70">Total Size:</span>
                  <div className="font-medium">{formatFileSize(directoryUpload.totalSize)}</div>
                </div>
              </div>

              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {directoryUpload.files.slice(0, 10).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {React.createElement(getFileIcon(file.type), { className: "w-3 h-3 text-mauve-subtle" })}
                      <span className="truncate">{file.webkitRelativePath}</span>
                      <span className="text-mauve-subtle/70">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                  {directoryUpload.files.length > 10 && (
                    <div className="text-xs text-mauve-subtle/70 text-center">
                      ... and {directoryUpload.files.length - 10} more files
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDirectoryConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDirectoryUpload} disabled={loading}>
                  {loading ? "Uploading..." : "Upload Directory"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

interface UploadProgressItemProps {
  progress: FileUploadProgress
}

function UploadProgressItem({ progress }: UploadProgressItemProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case "uploading":
        return <Upload className="w-4 h-4 text-blue-400" />
      case "processing":
        return <Code className="w-4 h-4 text-yellow-400" />
      case "completed":
        return <Check className="w-4 h-4 text-green-400" />
      case "error":
        return <X className="w-4 h-4 text-red-400" />
      default:
        return <File className="w-4 h-4 text-mauve-subtle" />
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case "uploading":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-mauve-subtle"
    }
  }

  return (
    <div className="flex items-center gap-3 p-2 bg-mauve-dark/30 rounded">
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm truncate">{progress.filename}</span>
          <span className="text-xs text-mauve-subtle/70">
            {progress.status === "uploading" ? `${progress.progress}%` : progress.status}
          </span>
        </div>
        {progress.status === "uploading" && <Progress value={progress.progress} className="mt-1 h-1" />}
        {progress.error && <p className="text-xs text-red-400 mt-1">{progress.error}</p>}
      </div>
    </div>
  )
}
