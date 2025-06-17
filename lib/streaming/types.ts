/**
 * Type definitions for streaming functionality
 */

export interface StreamingMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  isStreaming?: boolean
}

export interface StreamChunk {
  content: string
  timestamp: number
  isComplete: boolean
}

export interface StreamMetrics {
  totalTime: number
  timeToFirstChunk: number
  chunkCount: number
  totalTokens: number
  averageChunkTime: number
  tokensPerSecond: number
}

export interface RetryStrategy {
  shouldRetry: boolean
  delay: number
  maxAttempts: number
}
