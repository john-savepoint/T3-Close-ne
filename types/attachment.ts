export interface Attachment {
  _id: string
  storageId: string
  filename: string
  originalFilename: string
  contentType: string // MIME type
  size: number
  category: string
  uploadedBy: string
  uploadedAt: number
  lastAccessedAt?: number
  chatId?: string
  messageId?: string
  description?: string
  tags?: string[]
  extractedText?: string
  isPublic: boolean
  shareToken?: string
  status: "uploading" | "processing" | "ready" | "error"
  processingError?: string
  url?: string // Generated URL from storage
  _creationTime: number

  // Legacy compatibility fields
  id?: string // For backward compatibility, maps to _id
  userId?: string // For backward compatibility, maps to uploadedBy
  fileType?: string // For backward compatibility, maps to contentType
  sizeBytes?: number // For backward compatibility, maps to size
  storagePath?: string // For backward compatibility, maps to storageId
  createdAt?: Date // For backward compatibility
  updatedAt?: Date // For backward compatibility
  processingStatus?: "pending" | "completed" | "failed" // For backward compatibility
  usageCount?: number // For backward compatibility
  lastUsedAt?: Date // For backward compatibility
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

export interface ConvexFileUpload {
  storageId: string
  filename: string
  originalFilename: string
  contentType: string
  size: number
  category: string
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
