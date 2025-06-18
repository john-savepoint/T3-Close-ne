"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useProjects } from "@/hooks/use-projects"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useDropzone } from "react-dropzone"
import {
  Loader2,
  Save,
  Trash2,
  File,
  X,
  Plus,
  AlertTriangle,
  Paperclip,
  FileText,
  ImageIcon,
  Code,
  Upload,
} from "lucide-react"

interface ProjectSettingsModalProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectSettingsModal({ projectId, open, onOpenChange }: ProjectSettingsModalProps) {
  const {
    projects,
    updateProject,
    deleteProject,
    addAttachmentToProject,
    removeAttachmentFromProject,
    loading,
  } = useProjects()
  const project = projects.find((p) => p.id === projectId)

  // File upload hook
  const { uploadFiles, isUploading, uploadProgress } = useFileUpload({
    onUploadComplete: async (files) => {
      // Add uploaded files to project
      for (const file of files) {
        await addAttachmentToProject(projectId, file.id)
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error)
    },
  })

  const [formData, setFormData] = useState({
    name: "",
    systemPrompt: "",
  })

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        systemPrompt: project.systemPrompt || "",
      })
    }
  }, [project])

  const handleSave = async () => {
    if (!project || !formData.name.trim()) return

    try {
      await updateProject(project.id, {
        name: formData.name.trim(),
        systemPrompt: formData.systemPrompt.trim() || undefined,
      })
    } catch (error) {
      console.error("Failed to update project:", error)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone. Associated chats will become standalone.`
      )
    ) {
      try {
        await deleteProject(project.id)
        onOpenChange(false)
      } catch (error) {
        console.error("Failed to delete project:", error)
      }
    }
  }

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!project) return

    try {
      await removeAttachmentFromProject(project.id, attachmentId)
    } catch (error) {
      console.error("Failed to remove attachment:", error)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.includes("text") || type.includes("json") || type.includes("xml")) return FileText
    if (type.includes("javascript") || type.includes("typescript")) return Code
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Dropzone configuration
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await uploadFiles(acceptedFiles)
      }
    },
    [uploadFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/*": [".txt", ".md", ".json", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".cpp"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.*": [".docx", ".xlsx"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 10,
  })

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">Project Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1">
          <TabsList className="grid w-full grid-cols-3 bg-mauve-dark/50">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments
              {project.attachments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-4 text-xs">
                  {project.attachments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="danger" className="text-red-400">
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1">
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Project Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="border-mauve-dark bg-mauve-dark/50 focus-visible:ring-mauve-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-prompt" className="text-sm font-medium">
                  System Prompt
                </Label>
                <Textarea
                  id="edit-prompt"
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))
                  }
                  className="min-h-[120px] border-mauve-dark bg-mauve-dark/50 focus-visible:ring-mauve-accent"
                  rows={5}
                  placeholder="Define the AI's role and behavior for this project..."
                />
                <p className="text-xs text-mauve-subtle/70">
                  This prompt will be automatically included in all chats within this project.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={loading || !formData.name.trim()}
                  className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Project Files</h3>
                  <p className="text-xs text-mauve-subtle/70">
                    Files attached to this project are automatically included in all chats.
                  </p>
                </div>

                {/* File upload dropzone */}
                <div
                  {...getRootProps()}
                  className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isDragActive
                      ? "border-mauve-accent bg-mauve-accent/10"
                      : "border-mauve-dark hover:border-mauve-accent/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-8 w-8 text-mauve-subtle/50" />
                  <p className="mt-2 text-sm text-mauve-subtle/70">
                    {isDragActive
                      ? "Drop files here..."
                      : "Drag & drop files here, or click to select"}
                  </p>
                  <p className="mt-1 text-xs text-mauve-subtle/50">
                    Supports text, PDF, images, and code files (max 10 files)
                  </p>
                  {isUploading && (
                    <div className="mt-4">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-mauve-accent" />
                      <p className="mt-2 text-xs text-mauve-subtle/70">Uploading files...</p>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="h-64">
                {project.attachments.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-center">
                    <Paperclip className="mb-2 h-8 w-8 text-mauve-subtle/50" />
                    <p className="text-sm text-mauve-subtle/70">No files attached</p>
                    <p className="text-xs text-mauve-subtle/50">
                      Add files to provide context for all project chats
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {project.attachments.map((attachment) => {
                      const Icon = getFileIcon(attachment.type)
                      return (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-3 rounded-lg bg-mauve-dark/30 p-3"
                        >
                          <Icon className="h-5 w-5 text-mauve-subtle" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">
                                {attachment.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(attachment.size)}
                              </Badge>
                            </div>
                            {attachment.content && (
                              <p className="mt-1 truncate text-xs text-mauve-subtle/70">
                                {attachment.content.substring(0, 60)}...
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-300"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="danger" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-red-400">Delete Project</h3>
                    <p className="text-xs text-mauve-subtle/70">
                      This action cannot be undone. The project and its settings will be permanently
                      deleted. Associated chats will become standalone chats and will not be
                      deleted.
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-mauve-dark" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Project Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-mauve-subtle/70">Created:</span>
                      <div className="font-medium">{project.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-mauve-subtle/70">Last Updated:</span>
                      <div className="font-medium">{project.updatedAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-mauve-subtle/70">Chats:</span>
                      <div className="font-medium">{project.chats.length}</div>
                    </div>
                    <div>
                      <span className="text-mauve-subtle/70">Attachments:</span>
                      <div className="font-medium">{project.attachments.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
