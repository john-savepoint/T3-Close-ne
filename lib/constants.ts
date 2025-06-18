// File attachment constants
export const ATTACHMENT_CONFIG = {
  MAX_FILES: 10,
  PREVIEW_IMAGE_SIZE: 48, // 12 * 4 (w-12 h-12)
  PREVIEW_MAX_HEIGHT: 384, // max-h-96
  IFRAME_HEIGHT: 384, // h-96
  TOAST_DURATION: 3000,
  FILENAME_TRUNCATE_LENGTH: 20,
  FILENAME_TITLE_TRUNCATE_LENGTH: 32,
} as const

// UI spacing constants
export const UI_CONFIG = {
  BUTTON_ICON_SIZE: 16, // h-4 w-4
  SMALL_ICON_SIZE: 12, // h-3 w-3
  LARGE_ICON_SIZE: 64, // h-16 w-16
  CARD_PADDING: 12, // p-3
  GAP_SMALL: 4, // gap-1
  GAP_MEDIUM: 12, // gap-3
} as const

// File type categories
export const FILE_CATEGORIES = {
  IMAGE: "image",
  DOCUMENT: "document", 
  CODE: "code",
  DATA: "data",
  OTHER: "other",
} as const