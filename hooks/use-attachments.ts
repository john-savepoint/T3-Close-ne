"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import type {
  Attachment,
  AttachmentUsage,
  FileUploadProgress,
  AttachmentLibraryFilters,
  DirectoryUpload,
} from "@/types/attachment"

// Get file category from MIME type
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "images"
  if (mimeType.startsWith("text/") || mimeType.includes("javascript") || mimeType.includes("typescript")) return "code"
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("presentation") || mimeType.includes("markdown")) return "documents"
  if (mimeType.includes("spreadsheet") || mimeType.includes("csv") || mimeType.includes("json") || mimeType.includes("xml")) return "data"
  return "other"
}

// Supported file types with their categories
export const SUPPORTED_FILE_TYPES = {
  documents: {
    "application/pdf": { ext: ".pdf", name: "PDF Document" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      ext: ".docx",
      name: "Word Document",
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      ext: ".pptx",
      name: "PowerPoint",
    },
    "text/markdown": { ext: ".md", name: "Markdown" },
    "text/plain": { ext: ".txt", name: "Text File" },
  },
  data: {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      ext: ".xlsx",
      name: "Excel Spreadsheet",
    },
    "text/csv": { ext: ".csv", name: "CSV File" },
    "application/json": { ext: ".json", name: "JSON File" },
    "application/xml": { ext: ".xml", name: "XML File" },
  },
  code: {
    "text/typescript": { ext: ".ts/.tsx", name: "TypeScript" },
    "text/javascript": { ext: ".js/.jsx", name: "JavaScript" },
    "text/x-python": { ext: ".py", name: "Python" },
    "text/x-rust": { ext: ".rs", name: "Rust" },
    "text/x-c++src": { ext: ".cpp", name: "C++" },
    "text/css": { ext: ".css", name: "CSS" },
    "text/html": { ext: ".html", name: "HTML" },
  },
  images: {
    "image/png": { ext: ".png", name: "PNG Image" },
    "image/jpeg": { ext: ".jpg/.jpeg", name: "JPEG Image" },
    "image/gif": { ext: ".gif", name: "GIF Image" },
    "image/svg+xml": { ext: ".svg", name: "SVG Image" },
  },
}

export function useAttachments() {
  const { user, isAuthenticated } = useAuth()
  
  // Convex mutations
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFile = useMutation(api.files.saveFile)
  const deleteFileMutation = useMutation(api.files.deleteFile)
  const updateFileMutation = useMutation(api.files.updateFile)
  
  // Only query for attachments if user is authenticated
  const attachments = (useQuery(
    api.files.getUserFiles,
    isAuthenticated && user ? {} : "skip"
  ) || []) as Attachment[]
  
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [loading, setLoading] = useState(false)
  const queryLoading = attachments === undefined && isAuthenticated

  const uploadFiles = useCallback(
    async (
      files: File[],
      targetId?: string,
      targetType?: "chat" | "project"
    ): Promise<Attachment[]> => {
      if (!isAuthenticated) {
        throw new Error("Authentication required for file uploads")
      }

      setLoading(true)

      const progressItems: FileUploadProgress[] = files.map((file) => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        progress: 0,
        status: "uploading",
      }))

      setUploadProgress(progressItems)

      try {
        const uploadedAttachments: Attachment[] = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const progressItem = progressItems[i]

          try {
            // Step 1: Generate upload URL
            setUploadProgress((prev) =>
              prev.map((item) => 
                item.id === progressItem.id ? { ...item, progress: 10, status: "uploading" } : item
              )
            )

            const uploadUrl = await generateUploadUrl()

            // Step 2: Upload file to Convex storage
            setUploadProgress((prev) =>
              prev.map((item) => 
                item.id === progressItem.id ? { ...item, progress: 30 } : item
              )
            )

            const result = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            })

            if (!result.ok) {
              throw new Error(`Upload failed: ${result.statusText}`)
            }

            const { storageId } = await result.json()

            setUploadProgress((prev) =>
              prev.map((item) => 
                item.id === progressItem.id ? { ...item, progress: 70, status: "processing" } : item
              )
            )

            // Step 3: Save file metadata to database
            const category = getFileCategory(file.type)
            const attachmentId = await saveFile({
              storageId: storageId as Id<"_storage">,
              filename: file.name,
              originalFilename: file.name,
              contentType: file.type || "application/octet-stream",
              size: file.size,
              category,
              chatId: targetType === "chat" && targetId ? targetId as Id<"chats"> : undefined,
              description: `Uploaded file: ${file.name}`,
            })

            setUploadProgress((prev) =>
              prev.map((item) => 
                item.id === progressItem.id ? { ...item, progress: 100, status: "completed" } : item
              )
            )

            // Create attachment object that matches our type  
            const newAttachment: Attachment = {
              _id: attachmentId,
              _creationTime: Date.now(),
              storageId,
              filename: file.name,
              originalFilename: file.name,
              contentType: file.type || "application/octet-stream",
              size: file.size,
              category,
              userId: user!._id,
              uploadedAt: Date.now(),
              createdAt: new Date(),
              chatId: targetType === "chat" && targetId ? targetId as any : undefined,
              description: `Uploaded file: ${file.name}`,
              isPublic: false,
              status: "ready",
              // Legacy compatibility fields
              id: attachmentId,
              fileType: file.type || "application/octet-stream",
              sizeBytes: file.size,
              url: null, // Will be set when URL is fetched
            }

            uploadedAttachments.push(newAttachment)

          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error)
            setUploadProgress((prev) =>
              prev.map((item) => 
                item.id === progressItem.id 
                  ? { ...item, status: "error", error: `Failed to upload ${file.name}` } 
                  : item
              )
            )
            throw error
          }
        }

        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress([])
        }, 2000)

        return uploadedAttachments
      } catch (error) {
        console.error("Upload failed:", error)
        setUploadProgress((prev) =>
          prev.map((item) => ({
            ...item,
            status: "error",
            error: "Upload failed",
          }))
        )
        throw error
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, user, generateUploadUrl, saveFile]
  )

  // Remove this function as text extraction will be handled server-side

  const uploadDirectory = useCallback(
    async (directoryUpload: DirectoryUpload): Promise<Attachment[]> => {
      return uploadFiles(directoryUpload.files)
    },
    [uploadFiles]
  )

  const deleteAttachment = useCallback(async (attachmentId: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error("Authentication required")
    }

    setLoading(true)

    try {
      await deleteFileMutation({ id: attachmentId as Id<"attachments"> })
    } catch (error) {
      console.error("Failed to delete attachment:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, deleteFileMutation])

  const replaceAttachment = useCallback(
    async (attachmentId: string, newFile: File): Promise<Attachment> => {
      if (!isAuthenticated) {
        throw new Error("Authentication required")
      }

      setLoading(true)

      try {
        const oldAttachment = attachments.find((att) => att._id === attachmentId)
        if (!oldAttachment) throw new Error("Attachment not found")

        // Upload new file first
        const [newAttachment] = await uploadFiles([newFile])
        
        // Delete old attachment
        await deleteAttachment(attachmentId)
        
        return newAttachment
      } catch (error) {
        console.error("Failed to replace attachment:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, attachments, uploadFiles, deleteAttachment]
  )

  const getAttachmentUsages = useCallback(
    (attachmentId: string): AttachmentUsage[] => {
      // TODO: Implement real usage tracking
      return []
    },
    []
  )

  const addAttachmentToContext = useCallback(
    async (
      attachmentId: string,
      contextId: string,
      contextType: "chat" | "project",
      contextName: string
    ): Promise<void> => {
      // TODO: Implement usage tracking in Convex schema and mutations
      console.log(`Added attachment ${attachmentId} to ${contextType} ${contextId}`)
    },
    []
  )

  const filterAttachments = useCallback(
    (filters: AttachmentLibraryFilters): Attachment[] => {
      let filtered = [...attachments]

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (att) =>
            att.filename.toLowerCase().includes(searchLower) ||
            att.description?.toLowerCase().includes(searchLower)
        )
      }

      // File type filter
      if (filters.fileType !== "all") {
        const categoryMap: Record<string, string> = {
          documents: "documents",
          code: "code", 
          data: "data",
          images: "images",
        }

        if (filters.fileType in categoryMap) {
          filtered = filtered.filter((att) => att.category === categoryMap[filters.fileType])
        }
      }

      // Sort
      filtered.sort((a, b) => {
        let aValue: any, bValue: any

        switch (filters.sortBy) {
          case "name":
            aValue = a.filename.toLowerCase()
            bValue = b.filename.toLowerCase()
            break
          case "date":
            aValue = a.createdAt || a._creationTime
            bValue = b.createdAt || b._creationTime
            break
          case "size":
            aValue = a.size
            bValue = b.size
            break
          case "usage":
            // TODO: Implement usage count tracking
            aValue = 0
            bValue = 0
            break
          default:
            return 0
        }

        if (filters.sortOrder === "desc") {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        }
      })

      return filtered
    },
    [attachments]
  )

  const getFileTypeInfo = useCallback((mimeType: string) => {
    for (const [category, types] of Object.entries(SUPPORTED_FILE_TYPES)) {
      const typesRecord = types as Record<string, { ext: string; name: string }>
      if (typesRecord[mimeType]) {
        return { category, ...typesRecord[mimeType] }
      }
    }
    return { category: "other", ext: "", name: "Unknown File" }
  }, [])

  return {
    attachments,
    uploadProgress,
    loading: loading || queryLoading,
    uploadFiles,
    uploadDirectory,
    deleteAttachment,
    replaceAttachment,
    getAttachmentUsages,
    addAttachmentToContext,
    filterAttachments,
    getFileTypeInfo,
    SUPPORTED_FILE_TYPES,
  }
}
