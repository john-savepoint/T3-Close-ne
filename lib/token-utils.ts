/**
 * Provider-specific character-to-token ratios based on research
 * See docs/token-counting.md for detailed information
 */
const PROVIDER_TOKEN_RATIOS: Record<string, number> = {
  // OpenAI models (GPT-4, GPT-3.5, GPT-4o)
  openai: 4.0,
  
  // Anthropic models (Claude)
  anthropic: 2.5,
  
  // Google models (Gemini)
  google: 4.0,
  
  // DeepSeek models (adjusted dynamically for Chinese text)
  deepseek: 4.0,
  
  // xAI models (Grok)
  "x-ai": 3.75,
  xai: 3.75,
  
  // Meta models (Llama)
  meta: 4.0,
  "meta-llama": 4.0,
  
  // Mistral models
  mistral: 4.0,
  mistralai: 4.0,
  
  // Cohere models (use similar ratio to OpenAI)
  cohere: 4.0,
  
  // Default fallback
  default: 4.0,
}

/**
 * Detects if text contains significant CJK (Chinese, Japanese, Korean) characters
 * @param text The text to analyze
 * @returns Percentage of CJK characters (0-1)
 */
function getCJKRatio(text: string): number {
  if (!text) return 0
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g
  const cjkMatches = text.match(cjkRegex) || []
  return cjkMatches.length / text.length
}

/**
 * Estimates the number of tokens in a given text using provider-specific ratios
 * @param text The text to estimate tokens for
 * @param modelId Optional model ID to determine provider-specific ratio
 * @returns Estimated number of tokens
 */
export function estimateTokens(text: string, modelId?: string): number {
  // Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
  const provider = modelId ? modelId.split("/")[0].toLowerCase() : "default"
  let charsPerToken = PROVIDER_TOKEN_RATIOS[provider] || PROVIDER_TOKEN_RATIOS.default
  
  // Special handling for DeepSeek with CJK text
  if (provider === "deepseek") {
    const cjkRatio = getCJKRatio(text)
    if (cjkRatio > 0.3) {
      // Use weighted average based on CJK content
      // Chinese: 1.67 chars/token, English: 4.0 chars/token
      charsPerToken = (cjkRatio * 1.67) + ((1 - cjkRatio) * 4.0)
    }
  }
  
  // Basic character-based estimation
  const charCount = text.length
  const baseTokens = Math.ceil(charCount / charsPerToken)
  
  // Add overhead for special formatting
  // Punctuation and special characters typically tokenize separately
  const punctuationCount = (text.match(/[.!?,;:\-"'()\[\]{}]/g) || []).length
  const punctuationTokens = Math.ceil(punctuationCount * 0.8) // Not all punctuation is a separate token
  
  // Account for whitespace (multiple spaces might be single tokens)
  const multiSpaceMatches = text.match(/\s{2,}/g) || []
  const whitespaceReduction = multiSpaceMatches.reduce((sum: number, match: string) => sum + match.length - 1, 0)
  
  // Calculate final estimate
  const totalTokens = baseTokens + punctuationTokens - Math.floor(whitespaceReduction / 4)
  
  // Ensure we return at least 1 token for non-empty text
  return text.length > 0 ? Math.max(1, totalTokens) : 0
}

/**
 * Estimates tokens for a conversation (messages array)
 * @param messages Array of messages with role and content
 * @param modelId Optional model ID for provider-specific estimation
 * @returns Estimated total tokens for the conversation
 */
export function estimateConversationTokens(
  messages: Array<{ role: string; content: string }>,
  modelId?: string
): number {
  // Each message has overhead tokens for formatting
  // OpenAI uses 3 tokens per message + 1 per name
  // Other providers may vary, using average of 4
  const MESSAGE_OVERHEAD = 4

  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content, modelId) + MESSAGE_OVERHEAD
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

/**
 * Gets the character-to-token ratio for a specific provider
 * @param provider The provider name (e.g., "openai", "anthropic")
 * @returns Characters per token ratio
 */
export function getProviderTokenRatio(provider: string): number {
  return PROVIDER_TOKEN_RATIOS[provider.toLowerCase()] || PROVIDER_TOKEN_RATIOS.default
}

/**
 * Gets token estimation metadata for a model
 * @param modelId The model ID (e.g., "openai/gpt-4")
 * @returns Object with provider, ratio, and tokenizer info
 */
export function getTokenEstimationInfo(modelId: string): {
  provider: string
  charsPerToken: number
  tokenizer: string
  accuracy: "high" | "medium" | "low"
} {
  const provider = modelId.split("/")[0].toLowerCase()
  const charsPerToken = getProviderTokenRatio(provider)
  
  // Map providers to their tokenizers and accuracy levels
  const tokenizerInfo: Record<string, { tokenizer: string; accuracy: "high" | "medium" | "low" }> = {
    openai: { tokenizer: "tiktoken", accuracy: "high" },
    anthropic: { tokenizer: "proprietary", accuracy: "medium" },
    google: { tokenizer: "sentencepiece", accuracy: "high" },
    deepseek: { tokenizer: "custom", accuracy: "medium" },
    "x-ai": { tokenizer: "sentencepiece", accuracy: "medium" },
    xai: { tokenizer: "sentencepiece", accuracy: "medium" },
    meta: { tokenizer: "tiktoken", accuracy: "high" },
    "meta-llama": { tokenizer: "tiktoken", accuracy: "high" },
    mistral: { tokenizer: "tiktoken", accuracy: "high" },
    mistralai: { tokenizer: "tiktoken", accuracy: "high" },
    cohere: { tokenizer: "custom", accuracy: "medium" },
  }
  
  const info = tokenizerInfo[provider] || { tokenizer: "unknown", accuracy: "low" }
  
  return {
    provider,
    charsPerToken,
    ...info,
  }
}
