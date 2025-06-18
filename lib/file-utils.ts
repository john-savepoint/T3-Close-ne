/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Get appropriate icon for file type
 */
export function getFileTypeIcon(contentType: string, category?: string) {
  if (contentType.startsWith("image/")) return "image"
  if (category === "documents" || contentType.includes("text") || contentType.includes("pdf"))
    return "document"
  if (
    category === "code" ||
    contentType.includes("javascript") ||
    contentType.includes("typescript")
  )
    return "code"
  if (category === "data" || contentType.includes("csv") || contentType.includes("json"))
    return "data"
  return "file"
}

/**
 * Check if file is previewable as image
 */
export function isImageFile(contentType: string): boolean {
  return contentType.startsWith("image/")
}

/**
 * Check if file is previewable as text
 */
export function isTextFile(contentType: string): boolean {
  return contentType.startsWith("text/") || contentType.includes("json")
}
