// Gift system constants
export const GIFT_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// Pricing constants
export const PRICING = {
  PRO_MONTHLY: 20,
  PRO_YEARLY: 200,
} as const

// Team constants
export const MAX_TEAM_MEMBERS = 50
export const DEFAULT_TEAM_SETTINGS = {
  allowFileSharing: true,
  allowPublicChats: false,
  defaultModel: "gpt-4",
} as const

// Error codes
export const ERROR_CODES = {
  AUTH_REQUIRED: "Authentication required",
  USER_NOT_FOUND: "User not found",
  INVALID_EMAIL: "Invalid email format",
  INVALID_GIFT_CODE: "Invalid gift code",
  GIFT_ALREADY_CLAIMED: "Gift has already been claimed",
  GIFT_EXPIRED: "Gift has expired",
  TEAM_ALREADY_EXISTS: "User already owns a team",
  TEAM_NOT_FOUND: "Team not found",
  TEAM_PERMISSION_DENIED: "Permission denied",
  TEAM_ALREADY_MEMBER: "User is already a team member",
  TEAM_AT_CAPACITY: "Team is at maximum capacity",
  TEAM_MEMBER_NOT_FOUND: "Team member not found",
  TEAM_OWNER_CANNOT_LEAVE: "Team owner cannot leave team",
} as const
