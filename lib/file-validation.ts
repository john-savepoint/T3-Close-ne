export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB total per upload

export const ALLOWED_FILE_TYPES = {
  images: {
    "image/jpeg": { ext: [".jpg", ".jpeg"], maxSize: 5 * 1024 * 1024 },
    "image/png": { ext: [".png"], maxSize: 5 * 1024 * 1024 },
    "image/gif": { ext: [".gif"], maxSize: 5 * 1024 * 1024 },
    "image/svg+xml": { ext: [".svg"], maxSize: 2 * 1024 * 1024 },
    "image/webp": { ext: [".webp"], maxSize: 5 * 1024 * 1024 },
  },
  documents: {
    "application/pdf": { ext: [".pdf"], maxSize: 10 * 1024 * 1024 },
    "text/plain": { ext: [".txt"], maxSize: 1 * 1024 * 1024 },
    "text/markdown": { ext: [".md"], maxSize: 1 * 1024 * 1024 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      ext: [".docx"],
      maxSize: 10 * 1024 * 1024,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      ext: [".pptx"],
      maxSize: 10 * 1024 * 1024,
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      ext: [".xlsx"],
      maxSize: 10 * 1024 * 1024,
    },
    "application/msword": { ext: [".doc"], maxSize: 10 * 1024 * 1024 },
    "application/vnd.ms-excel": { ext: [".xls"], maxSize: 10 * 1024 * 1024 },
    "application/vnd.ms-powerpoint": { ext: [".ppt"], maxSize: 10 * 1024 * 1024 },
  },
  code: {
    "text/javascript": { ext: [".js"], maxSize: 1 * 1024 * 1024 },
    "text/typescript": { ext: [".ts"], maxSize: 1 * 1024 * 1024 },
    "text/jsx": { ext: [".jsx"], maxSize: 1 * 1024 * 1024 },
    "text/tsx": { ext: [".tsx"], maxSize: 1 * 1024 * 1024 },
    "text/css": { ext: [".css"], maxSize: 1 * 1024 * 1024 },
    "text/html": { ext: [".html"], maxSize: 1 * 1024 * 1024 },
    "application/json": { ext: [".json"], maxSize: 1 * 1024 * 1024 },
    "application/xml": { ext: [".xml"], maxSize: 1 * 1024 * 1024 },
    "text/csv": { ext: [".csv"], maxSize: 5 * 1024 * 1024 },
  },
} as const

export type FileValidationResult = {
  valid: boolean
  error?: string
  category?: keyof typeof ALLOWED_FILE_TYPES
}

export function validateFile(file: File): FileValidationResult {
  // Check if file type is allowed
  let allowedType: { ext: string[]; maxSize: number } | undefined
  let category: keyof typeof ALLOWED_FILE_TYPES | undefined

  for (const [cat, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types[file.type as keyof typeof types]) {
      allowedType = types[file.type as keyof typeof types]
      category = cat as keyof typeof ALLOWED_FILE_TYPES
      break
    }
  }

  if (!allowedType) {
    return {
      valid: false,
      error: `File type '${file.type}' is not supported. Please upload images, documents, or code files.`,
    }
  }

  // Check file size against type-specific limit
  if (file.size > allowedType.maxSize) {
    const maxSizeMB = Math.round(allowedType.maxSize / (1024 * 1024))
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${file.type} files.`,
    }
  }

  // Check global file size limit
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB global limit.`,
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty.",
    }
  }

  return {
    valid: true,
    category,
  }
}

export function validateFiles(files: File[]): FileValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      error: "No files selected.",
    }
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit.`,
    }
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file)
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
}

export function getFileCategory(mimeType: string): keyof typeof ALLOWED_FILE_TYPES | "unknown" {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types[mimeType as keyof typeof types]) {
      return category as keyof typeof ALLOWED_FILE_TYPES
    }
  }
  return "unknown"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  const category = getFileCategory(mimeType)

  switch (category) {
    case "images":
      return "ImageIcon"
    case "documents":
      return "FileText"
    case "code":
      return "Code"
    default:
      return "File"
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
