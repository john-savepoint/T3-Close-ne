/**
 * Sanitizes user input to prevent XSS attacks
 * Escapes HTML entities and removes potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  // Map of HTML entities to escape
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }

  // Escape HTML entities
  const escaped = input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char)

  // Remove any script tags or event handlers (extra safety)
  const cleaned = escaped
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")

  return cleaned.trim()
}

/**
 * Sanitizes search queries while preserving useful characters
 * More lenient than general input sanitization
 */
export function sanitizeSearchQuery(query: string): string {
  // Allow alphanumeric, spaces, hyphens, underscores, dots
  // Remove potentially dangerous characters but keep search-friendly ones
  return query
    .replace(/[<>'"]/g, "") // Remove HTML-dangerous characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim()
}

/**
 * Validates and sanitizes model IDs
 * Model IDs should only contain alphanumeric, slashes, hyphens, and underscores
 */
export function sanitizeModelId(modelId: string): string {
  // Only allow alphanumeric, forward slashes, hyphens, underscores, and dots
  return modelId.replace(/[^a-zA-Z0-9\/_\-.]/g, "")
}

/**
 * Validates if a string is safe to use as a CSS class
 */
export function sanitizeCssClass(className: string): string {
  // CSS class names: start with letter, then alphanumeric, hyphens, underscores
  return className.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/^[^a-zA-Z]+/, "")
}
