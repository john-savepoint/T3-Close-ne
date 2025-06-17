"use client"

import { useState, useCallback } from "react"
import type {
  Attachment,
  AttachmentUsage,
  FileUploadProgress,
  AttachmentLibraryFilters,
  DirectoryUpload,
} from "@/types/attachment"

// Mock data for demonstration - temporarily any[] to avoid type conflicts during merge
const mockAttachments: any[] = [
  {
    id: "att-1",
    userId: "user-1",
    filename: "CONTRIBUTING.md",
    fileType: "text/markdown",
    sizeBytes: 4096,
    storagePath: "/uploads/contributing.md",
    extractedText: "# Contributing Guide\n\nWelcome to our project! Here's how to contribute...",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    processingStatus: "completed",
    usageCount: 5,
    lastUsedAt: new Date("2024-01-18"),
  },
  {
    id: "att-2",
    userId: "user-1",
    filename: "Q4_Financial_Report.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    sizeBytes: 2048000,
    storagePath: "/uploads/q4-report.xlsx",
    extractedText: "Q4 Financial Report\nRevenue: $2.5M\nGrowth: 15% QoQ...",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    processingStatus: "completed",
    usageCount: 3,
    lastUsedAt: new Date("2024-01-16"),
  },
  {
    id: "att-3",
    userId: "user-1",
    filename: "UserProfile.tsx",
    fileType: "text/typescript",
    sizeBytes: 8192,
    storagePath: "/uploads/userprofile.tsx",
    extractedText:
      "import React from 'react';\n\ninterface UserProfileProps {\n  user: User;\n}...",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    processingStatus: "completed",
    usageCount: 8,
    lastUsedAt: new Date("2024-01-20"),
  },
  {
    id: "att-4",
    userId: "user-1",
    filename: "Project_Plan_v2.docx",
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 512000,
    storagePath: "/uploads/project-plan-v2.docx",
    extractedText: "Project Alpha - Phase 2\n\nObjectives:\n1. Implement user authentication...",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
    processingStatus: "completed",
    usageCount: 2,
    lastUsedAt: new Date("2024-01-19"),
  },
  {
    id: "att-5",
    userId: "user-1",
    filename: "API_Documentation.pdf",
    fileType: "application/pdf",
    sizeBytes: 1024000,
    storagePath: "/uploads/api-docs.pdf",
    extractedTextPath: "/uploads/api-docs-extracted.txt",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    processingStatus: "pending",
    usageCount: 0,
  },
]

const mockUsages: AttachmentUsage[] = [
  {
    id: "usage-1",
    attachmentId: "att-1",
    projectId: "proj-1",
    usageType: "project",
    usedAt: new Date("2024-01-18"),
    contextName: "WebApp-Frontend",
  },
  {
    id: "usage-2",
    attachmentId: "att-1",
    chatId: "chat-5",
    usageType: "chat",
    usedAt: new Date("2024-01-17"),
    contextName: "Code Review Discussion",
  },
  {
    id: "usage-3",
    attachmentId: "att-3",
    projectId: "proj-1",
    usageType: "project",
    usedAt: new Date("2024-01-20"),
    contextName: "WebApp-Frontend",
  },
]

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
  const [attachments, setAttachments] = useState<any[]>(mockAttachments)
  const [usages, setUsages] = useState<AttachmentUsage[]>(mockUsages)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [loading, setLoading] = useState(false)

  const uploadFiles = useCallback(
    async (
      files: File[],
      targetId?: string,
      targetType?: "chat" | "project"
    ): Promise<Attachment[]> => {
      setLoading(true)

      const progressItems: FileUploadProgress[] = files.map((file) => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        progress: 0,
        status: "uploading",
      }))

      setUploadProgress(progressItems)

      try {
        const uploadedAttachments: any[] = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const progressItem = progressItems[i]

          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 200))
            setUploadProgress((prev) =>
              prev.map((item) => (item.id === progressItem.id ? { ...item, progress } : item))
            )
          }

          // Simulate processing
          setUploadProgress((prev) =>
            prev.map((item) =>
              item.id === progressItem.id ? { ...item, status: "processing" } : item
            )
          )

          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Create attachment record
          const newAttachment: any = {
            id: `att-${Date.now()}-${i}`,
            userId: "user-1",
            filename: file.name,
            fileType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            storagePath: `/uploads/${file.name.toLowerCase().replace(/\s+/g, "-")}`,
            extractedText: await extractTextFromFile(file),
            createdAt: new Date(),
            updatedAt: new Date(),
            processingStatus: "completed",
            usageCount: 0,
          }

          uploadedAttachments.push(newAttachment)

          setUploadProgress((prev) =>
            prev.map((item) =>
              item.id === progressItem.id ? { ...item, status: "completed", progress: 100 } : item
            )
          )
        }

        setAttachments((prev) => [...prev, ...uploadedAttachments])

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
    []
  )

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulate text extraction based on file type
    if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
      return await file.text()
    }

    // For other file types, return a mock extracted text
    return `Extracted content from ${file.name}\n\nThis is simulated extracted text content...`
  }

  const uploadDirectory = useCallback(
    async (directoryUpload: DirectoryUpload): Promise<Attachment[]> => {
      return uploadFiles(directoryUpload.files)
    },
    [uploadFiles]
  )

  const deleteAttachment = useCallback(async (attachmentId: string): Promise<void> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAttachments((prev) => prev.filter((att) => att.id !== attachmentId))
      setUsages((prev) => prev.filter((usage) => usage.attachmentId !== attachmentId))
    } finally {
      setLoading(false)
    }
  }, [])

  const replaceAttachment = useCallback(
    async (attachmentId: string, newFile: File): Promise<Attachment> => {
      setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const oldAttachment = attachments.find((att) => att.id === attachmentId)
        if (!oldAttachment) throw new Error("Attachment not found")

        const updatedAttachment: Attachment = {
          ...oldAttachment,
          filename: newFile.name,
          fileType: newFile.type,
          sizeBytes: newFile.size,
          extractedText: await extractTextFromFile(newFile),
          updatedAt: new Date(),
          processingStatus: "completed",
        }

        setAttachments((prev) =>
          prev.map((att) => (att.id === attachmentId ? updatedAttachment : att))
        )

        return updatedAttachment
      } finally {
        setLoading(false)
      }
    },
    [attachments]
  )

  const getAttachmentUsages = useCallback(
    (attachmentId: string): AttachmentUsage[] => {
      return usages.filter((usage) => usage.attachmentId === attachmentId)
    },
    [usages]
  )

  const addAttachmentToContext = useCallback(
    async (
      attachmentId: string,
      contextId: string,
      contextType: "chat" | "project",
      contextName: string
    ): Promise<void> => {
      const newUsage: AttachmentUsage = {
        id: `usage-${Date.now()}`,
        attachmentId,
        [contextType === "chat" ? "chatId" : "projectId"]: contextId,
        usageType: contextType,
        usedAt: new Date(),
        contextName,
      }

      setUsages((prev) => [...prev, newUsage])

      // Update usage count and last used date
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? {
                ...att,
                usageCount: att.usageCount + 1,
                lastUsedAt: new Date(),
              }
            : att
        )
      )
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
            att.extractedText?.toLowerCase().includes(searchLower)
        )
      }

      // File type filter
      if (filters.fileType !== "all") {
        const typeMap: Record<string, string[]> = {
          documents: Object.keys(SUPPORTED_FILE_TYPES.documents),
          code: Object.keys(SUPPORTED_FILE_TYPES.code),
          data: Object.keys(SUPPORTED_FILE_TYPES.data),
          images: Object.keys(SUPPORTED_FILE_TYPES.images),
        }

        if (filters.fileType in typeMap) {
          filtered = filtered.filter((att) => typeMap[filters.fileType]!.includes(att.fileType))
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
            aValue = a.createdAt.getTime()
            bValue = b.createdAt.getTime()
            break
          case "size":
            aValue = a.sizeBytes
            bValue = b.sizeBytes
            break
          case "usage":
            aValue = a.usageCount
            bValue = b.usageCount
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
    loading,
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
