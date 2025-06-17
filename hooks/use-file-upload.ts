"use client"

import { useState, useCallback } from "react"
// TODO: Add convex dependency and uncomment
// import { useMutation } from "convex/react";
// TODO: Uncomment when Convex is properly set up
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
import {
  validateFiles,
  validateFile,
  sanitizeFilename,
  formatFileSize,
} from "@/lib/file-validation"
import type { FileUploadProgress } from "@/types/attachment"

export interface UploadedFile {
  id: string
  storageId: string
  filename: string
  originalFilename: string
  contentType: string
  size: number
  category: string
  url?: string
}

export interface UseFileUploadOptions {
  maxFiles?: number
  onUploadComplete?: (files: UploadedFile[]) => void
  onUploadError?: (error: string) => void
  onProgress?: (progress: FileUploadProgress[]) => void
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxFiles = 10, onUploadComplete, onUploadError, onProgress } = options

  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  // TODO: Uncomment when Convex is properly set up
  // const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  // const saveFile = useMutation(api.files.saveFile);

  // Mock functions for development
  const generateUploadUrl = async () => {
    // Simulate upload URL generation
    return "https://mock-upload-url.com"
  }

  const saveFile = async (args: any) => {
    // Simulate file saving
    return `file-${Date.now()}`
  }

  const updateProgress = useCallback(
    (id: string, updates: Partial<FileUploadProgress>) => {
      setUploadProgress((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        onProgress?.(updated)
        return updated
      })
    },
    [onProgress]
  )

  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadedFile[]> => {
      if (files.length === 0) {
        onUploadError?.("No files selected")
        return []
      }

      if (files.length > maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`)
        return []
      }

      // Validate files
      const validation = validateFiles(files)
      if (!validation.valid) {
        onUploadError?.(validation.error || "File validation failed")
        return []
      }

      setIsUploading(true)
      const results: UploadedFile[] = []

      // Initialize progress tracking
      const progressItems: FileUploadProgress[] = files.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        filename: file.name,
        progress: 0,
        status: "uploading",
      }))

      setUploadProgress(progressItems)
      onProgress?.(progressItems)

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const progressId = progressItems[i].id

          try {
            // Validate individual file
            const fileValidation = validateFile(file)
            if (!fileValidation.valid) {
              updateProgress(progressId, {
                status: "error",
                error: fileValidation.error,
              })
              continue
            }

            // Step 1: Generate upload URL
            updateProgress(progressId, { progress: 10 })
            const uploadUrl = await generateUploadUrl()

            // Step 2: Mock upload for development (replace with real Convex upload)
            updateProgress(progressId, { progress: 30 })

            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Mock storage ID for development
            const storageId = `storage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            updateProgress(progressId, { progress: 70 })

            // Step 3: Save file metadata
            const sanitizedFilename = sanitizeFilename(file.name)
            const fileRecord = await saveFile({
              storageId,
              filename: sanitizedFilename,
              originalFilename: file.name,
              contentType: file.type,
              size: file.size,
              category: fileValidation.category || "unknown",
            })

            updateProgress(progressId, { progress: 90 })

            // Create result object
            const uploadedFile: UploadedFile = {
              id: fileRecord,
              storageId,
              filename: sanitizedFilename,
              originalFilename: file.name,
              contentType: file.type,
              size: file.size,
              category: fileValidation.category || "unknown",
            }

            results.push(uploadedFile)
            updateProgress(progressId, {
              progress: 100,
              status: "completed",
            })
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error)
            updateProgress(progressId, {
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            })
          }
        }

        setUploadedFiles((prev) => [...prev, ...results])

        if (results.length > 0) {
          onUploadComplete?.(results)
        }

        // Clear progress after delay
        setTimeout(() => {
          setUploadProgress([])
        }, 3000)

        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        onUploadError?.(errorMessage)

        // Mark all remaining as error
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.status === "uploading" ? { ...item, status: "error", error: errorMessage } : item
          )
        )

        return []
      } finally {
        setIsUploading(false)
      }
    },
    [maxFiles, generateUploadUrl, saveFile, onUploadComplete, onUploadError, updateProgress]
  )

  const uploadSingleFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const results = await uploadFiles([file])
      return results[0] || null
    },
    [uploadFiles]
  )

  const clearProgress = useCallback(() => {
    setUploadProgress([])
  }, [])

  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const getUploadSummary = useCallback(() => {
    const completed = uploadProgress.filter((p) => p.status === "completed").length
    const failed = uploadProgress.filter((p) => p.status === "error").length
    const uploading = uploadProgress.filter((p) => p.status === "uploading").length
    const total = uploadProgress.length

    return {
      completed,
      failed,
      uploading,
      total,
      isComplete: total > 0 && completed + failed === total,
      hasErrors: failed > 0,
    }
  }, [uploadProgress])

  return {
    uploadFiles,
    uploadSingleFile,
    uploadProgress,
    isUploading,
    uploadedFiles,
    clearProgress,
    removeUploadedFile,
    getUploadSummary,
    formatFileSize,
  }
}
