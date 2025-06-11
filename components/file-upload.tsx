"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paperclip, Upload, File, ImageIcon, FileText, Code, X, FolderOpen } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string
  uploadProgress: number
  status: "uploading" | "completed" | "error"
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
}

export function FileUpload({ onFilesUploaded, maxFiles = 10 }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: "uploading" as const,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Simulate file upload with progress
      for (const file of newFiles) {
        const originalFile = acceptedFiles.find((f) => f.name === file.name)
        if (!originalFile) continue

        try {
          // Read file content
          const content = await readFileContent(originalFile)

          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, uploadProgress: progress } : f)))
          }

          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, content, status: "completed" as const } : f)))
        } catch (error) {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "error" as const } : f)))
        }
      }

      onFilesUploaded(files.filter((f) => f.status === "completed"))
    },
    [files, onFilesUploaded],
  )

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: {
      "text/*": [".txt", ".md", ".json", ".xml", ".csv"],
      "application/json": [".json"],
      "application/xml": [".xml"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    },
  })

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.includes("text") || type.includes("json") || type.includes("xml")) return FileText
    if (type.includes("code")) return Code
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-mauve-subtle">
          <Paperclip className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-mauve-surface border-mauve-dark max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-mauve-accent bg-mauve-accent/10" : "border-mauve-dark hover:border-mauve-accent/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-mauve-subtle" />
            {isDragActive ? (
              <p className="text-mauve-bright">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-foreground mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-mauve-subtle">
                  Supports: TXT, JSON, XML, CSV, Excel, Word, PowerPoint, Images
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {files.map((file) => {
                  const Icon = getFileIcon(file.type)
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-mauve-dark/30 rounded-lg">
                      <Icon className="w-5 h-5 text-mauve-subtle" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(file.size)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              file.status === "completed"
                                ? "border-green-500/50 text-green-400"
                                : file.status === "error"
                                  ? "border-red-500/50 text-red-400"
                                  : "border-yellow-500/50 text-yellow-400"
                            }`}
                          >
                            {file.status}
                          </Badge>
                        </div>
                        {file.status === "uploading" && <Progress value={file.uploadProgress} className="mt-2 h-1" />}
                        {file.content && (
                          <p className="text-xs text-mauve-subtle/70 mt-1 truncate">
                            {file.content.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" className="bg-mauve-dark/50">
              <FolderOpen className="w-4 h-4 mr-2" />
              Upload Directory
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                onClick={() => setIsOpen(false)}
                disabled={files.filter((f) => f.status === "completed").length === 0}
              >
                Add to Chat ({files.filter((f) => f.status === "completed").length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
