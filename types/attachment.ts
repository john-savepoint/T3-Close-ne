import { Doc } from "@/convex/_generated/dataModel"

// Use the generated Convex type as the base
export type Attachment = Doc<"attachments"> & {
  // Generated URL from storage (computed field)
  url?: string | null

  // Legacy compatibility fields for existing hooks
  id?: string // For backward compatibility, maps to _id
  fileType?: string // For backward compatibility, maps to contentType
  sizeBytes?: number // For backward compatibility, maps to size
  storagePath?: string // For backward compatibility, maps to storageId
  uploadedBy?: string // For backward compatibility, maps to userId
  createdAt?: Date // For backward compatibility
  updatedAt?: Date // For backward compatibility
  processingStatus?: "pending" | "completed" | "failed" // For backward compatibility
  usageCount?: number // For backward compatibility
  lastUsedAt?: Date // For backward compatibility
  
  // Legacy fields - no longer needed with real implementation
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
