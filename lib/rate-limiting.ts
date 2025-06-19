import { Id } from "@/convex/_generated/dataModel"

// Rate limiting configuration
const RATE_LIMITS = {
  gift_purchase: {
    requests: 3,
    window: 60 * 60 * 1000, // 1 hour
  },
  team_creation: {
    requests: 1,
    window: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const

type RateLimitAction = keyof typeof RATE_LIMITS

interface RateLimitResult {
  allowed: boolean
  resetTime?: number
}

// In-memory rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(userId: Id<"users">, action: RateLimitAction): RateLimitResult {
  const config = RATE_LIMITS[action]
  const key = `${userId}:${action}`
  const now = Date.now()

  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, { count: 1, resetTime: now + config.window })
    return { allowed: true }
  }

  if (current.count >= config.requests) {
    return { allowed: false, resetTime: current.resetTime }
  }

  // Increment count
  current.count++
  return { allowed: true }
}

export function formatRateLimitError(resetTime: number): string {
  const minutes = Math.ceil((resetTime - Date.now()) / (60 * 1000))
  return `Rate limit exceeded. Try again in ${minutes} minutes.`
}
