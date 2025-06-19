import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitize SVG content to prevent XSS attacks
 * @param svgContent Raw SVG content from user input
 * @returns Sanitized SVG content safe for rendering
 */
export const sanitizeSVG = (svgContent: string): string => {
  return DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["use"],
    ADD_ATTR: ["xmlns", "xmlns:xlink", "viewBox", "preserveAspectRatio"],
  })
}

/**
 * Sanitize HTML content for safe rendering
 * @param html Raw HTML content
 * @returns Sanitized HTML content
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "div",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Check if content is safe SVG
 * @param content Raw content to check
 * @returns True if content appears to be SVG
 */
export const isSVGContent = (content: string): boolean => {
  const trimmed = content.trim()
  return trimmed.startsWith("<svg") || trimmed.includes('xmlns="http://www.w3.org/2000/svg"')
}
