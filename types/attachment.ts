export interface Attachment {
  id: string
  userId: string
  filename: string
  fileType: string // MIME type
  sizeBytes: number
  storagePath: string
  extractedTextPath?: string
  extractedText?: string
  createdAt: Date
  updatedAt: Date
  processingStatus: "pending" | "completed" | "failed"
  usageCount: number
  lastUsedAt?: Date
}

export interface AttachmentUsage {
  id: string
  attachmentId: string
  chatId?: string
  projectId?: string
  usageType: "chat" | "project"
  usedAt: Date
  contextName: string
}

export interface FileUploadProgress {
  id: string
  filename: string
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
}

export interface AttachmentLibraryFilters {
  search: string
  fileType: "all" | "documents" | "code" | "data" | "images" | "other"
  sortBy: "name" | "date" | "size" | "usage"
  sortOrder: "asc" | "desc"
}

export interface DirectoryUpload {
  path: string
  files: File[]
  totalSize: number
  fileCount: number
}
