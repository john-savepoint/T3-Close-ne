import { GIFT_PURCHASE_RATE_LIMIT, GIFT_PURCHASE_RATE_WINDOW_MS } from "./constants"

// Simple in-memory rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

export function checkRateLimit(userId: string, action: string): { allowed: boolean; resetTime?: number } {
  const key = `${userId}:${action}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.windowStart > GIFT_PURCHASE_RATE_WINDOW_MS) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!entry || now - entry.windowStart > GIFT_PURCHASE_RATE_WINDOW_MS) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count >= GIFT_PURCHASE_RATE_LIMIT) {
    // Rate limit exceeded
    const resetTime = entry.windowStart + GIFT_PURCHASE_RATE_WINDOW_MS
    return { allowed: false, resetTime }
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)
  return { allowed: true }
}

export function formatRateLimitError(resetTime: number): string {
  const minutesLeft = Math.ceil((resetTime - Date.now()) / (1000 * 60))
  return `Rate limit exceeded. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
}