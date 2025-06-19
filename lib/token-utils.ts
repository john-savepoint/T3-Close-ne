/**
 * Estimates the number of tokens in a given text using character-based approximation
 * This is a simplified implementation that works well for English text
 * For more accurate results, consider using a proper tokenizer library
 */
export function estimateTokens(text: string): number {
  // Simple word-based estimation
  // Most tokenizers split on whitespace and punctuation
  const words = text.split(/\s+/).filter((word) => word.length > 0)

  // Account for punctuation and special tokens
  // Average is about 1.3 tokens per word for English text
  const baseTokens = Math.ceil(words.length * 1.3)

  // Add tokens for special characters and formatting
  const specialChars = text.match(/[^\w\s]/g) || []
  const specialTokens = Math.ceil(specialChars.length * 0.5)

  return baseTokens + specialTokens
}

/**
 * Estimates tokens for a conversation (messages array)
 */
export function estimateConversationTokens(
  messages: Array<{ role: string; content: string }>
): number {
  // Each message has overhead tokens for formatting
  const MESSAGE_OVERHEAD = 4 // Approximate tokens for role and message structure

  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content) + MESSAGE_OVERHEAD
  }, 0)
}

/**
 * Estimates remaining tokens based on model's max context
 */
export function estimateRemainingTokens(
  usedTokens: number,
  maxTokens: number
): {
  remaining: number
  percentage: number
  isNearLimit: boolean
} {
  const remaining = Math.max(0, maxTokens - usedTokens)
  const percentage = (usedTokens / maxTokens) * 100
  const isNearLimit = percentage > 80

  return {
    remaining,
    percentage,
    isNearLimit,
  }
}
