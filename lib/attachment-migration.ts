// Temporary migration helper for attachment types
// This will be removed once all components are updated to use the new Convex schema

import type { Attachment } from "@/types/attachment"

// Legacy attachment interface for compatibility
export interface LegacyAttachment {
  id: string
  userId: string
  filename: string
  fileType: string
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

// Convert new Attachment to legacy format for compatibility
export function toLegacyAttachment(attachment: Attachment): LegacyAttachment {
  return {
    id: attachment._id,
    userId: attachment.uploadedBy,
    filename: attachment.filename,
    fileType: attachment.contentType,
    sizeBytes: attachment.size,
    storagePath: attachment.storageId,
    extractedText: attachment.extractedText,
    createdAt: new Date(attachment.uploadedAt),
    updatedAt: new Date(attachment._creationTime),
    processingStatus:
      attachment.status === "ready"
        ? "completed"
        : attachment.status === "error"
          ? "failed"
          : "pending",
    usageCount: 0, // Not tracked in new schema yet
    lastUsedAt: attachment.lastAccessedAt ? new Date(attachment.lastAccessedAt) : undefined,
  }
}

// Convert legacy attachment to new format
export function fromLegacyAttachment(legacy: LegacyAttachment): Attachment {
  return {
    _id: legacy.id,
    storageId: legacy.storagePath,
    filename: legacy.filename,
    originalFilename: legacy.filename,
    contentType: legacy.fileType,
    size: legacy.sizeBytes,
    category: getCategoryFromMimeType(legacy.fileType),
    uploadedBy: legacy.userId,
    uploadedAt: legacy.createdAt.getTime(),
    lastAccessedAt: legacy.lastUsedAt?.getTime(),
    extractedText: legacy.extractedText,
    isPublic: false,
    status:
      legacy.processingStatus === "completed"
        ? "ready"
        : legacy.processingStatus === "failed"
          ? "error"
          : "uploading",
    _creationTime: legacy.createdAt.getTime(),
  }
}

function getCategoryFromMimeType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "images"
  if (
    mimeType.includes("text") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript")
  )
    return "code"
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word"))
    return "documents"
  if (mimeType.includes("json") || mimeType.includes("csv") || mimeType.includes("xml"))
    return "data"
  return "other"
}
