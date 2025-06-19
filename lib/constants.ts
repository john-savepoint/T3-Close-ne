// Time constants
export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000
export const MILLISECONDS_IN_HOUR = 60 * 60 * 1000
export const MILLISECONDS_IN_MINUTE = 60 * 1000

// Gift system constants
export const GIFT_EXPIRY_DAYS = 365
export const GIFT_EXPIRY_MS = GIFT_EXPIRY_DAYS * MILLISECONDS_IN_DAY

// Rate limiting constants
export const GIFT_PURCHASE_RATE_LIMIT = 5 // Max gifts per hour per user
export const GIFT_PURCHASE_RATE_WINDOW_MS = MILLISECONDS_IN_HOUR

// Team constants
export const MAX_TEAM_MEMBERS = 50
export const DEFAULT_TEAM_SETTINGS = {
  allowFileSharing: true,
  allowPublicChats: false,
  defaultModel: "gpt-4",
}

// Pricing constants
export const PRICING = {
  PRO_MONTHLY: 20,
  PRO_YEARLY: 200,
} as const

// Error codes for internationalization
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: "AUTH_REQUIRED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  
  // Gift errors
  INVALID_GIFT_CODE: "INVALID_GIFT_CODE",
  GIFT_ALREADY_CLAIMED: "GIFT_ALREADY_CLAIMED",
  GIFT_EXPIRED: "GIFT_EXPIRED",
  GIFT_RATE_LIMIT_EXCEEDED: "GIFT_RATE_LIMIT_EXCEEDED",
  INVALID_PLAN: "INVALID_PLAN",
  
  // Team errors
  TEAM_ALREADY_EXISTS: "TEAM_ALREADY_EXISTS",
  TEAM_NOT_FOUND: "TEAM_NOT_FOUND",
  TEAM_MEMBER_NOT_FOUND: "TEAM_MEMBER_NOT_FOUND",
  TEAM_ALREADY_MEMBER: "TEAM_ALREADY_MEMBER",
  TEAM_PERMISSION_DENIED: "TEAM_PERMISSION_DENIED",
  TEAM_OWNER_CANNOT_LEAVE: "TEAM_OWNER_CANNOT_LEAVE",
  TEAM_AT_CAPACITY: "TEAM_AT_CAPACITY",
  
  // General errors
  INVALID_EMAIL: "INVALID_EMAIL",
  OPERATION_FAILED: "OPERATION_FAILED",
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]