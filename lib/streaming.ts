/**
 * Streaming utilities for real-time chat functionality
 */

export interface StreamingMessage {
  id: string
  role: 'user' | 'assistant'
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

/**
 * Stream state management utilities
 */
export class StreamManager {
  private activeStreams = new Map<string, AbortController>()

  /**
   * Start a new stream and track it
   */
  startStream(id: string): AbortController {
    // Cancel existing stream if any
    this.cancelStream(id)
    
    const controller = new AbortController()
    this.activeStreams.set(id, controller)
    
    return controller
  }

  /**
   * Cancel a specific stream
   */
  cancelStream(id: string): boolean {
    const controller = this.activeStreams.get(id)
    if (controller) {
      controller.abort()
      this.activeStreams.delete(id)
      return true
    }
    return false
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams(): void {
    for (const [id, controller] of this.activeStreams) {
      controller.abort()
    }
    this.activeStreams.clear()
  }

  /**
   * Check if a stream is active
   */
  isStreamActive(id: string): boolean {
    return this.activeStreams.has(id)
  }

  /**
   * Get all active stream IDs
   */
  getActiveStreamIds(): string[] {
    return Array.from(this.activeStreams.keys())
  }
}

/**
 * Message streaming utilities
 */
export const MessageStreamUtils = {
  /**
   * Create a new streaming message
   */
  createStreamingMessage(
    role: 'user' | 'assistant',
    content: string = '',
    model?: string
  ): StreamingMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      model,
      isStreaming: role === 'assistant' && content === '',
    }
  },

  /**
   * Update streaming message content
   */
  updateStreamingContent(
    message: StreamingMessage,
    newContent: string,
    isComplete: boolean = false
  ): StreamingMessage {
    return {
      ...message,
      content: newContent,
      isStreaming: !isComplete,
    }
  },

  /**
   * Append content to streaming message
   */
  appendStreamingContent(
    message: StreamingMessage,
    chunk: string
  ): StreamingMessage {
    return {
      ...message,
      content: message.content + chunk,
    }
  },

  /**
   * Complete a streaming message
   */
  completeStreamingMessage(message: StreamingMessage): StreamingMessage {
    return {
      ...message,
      isStreaming: false,
    }
  },
}

/**
 * Server-Sent Events utilities
 */
export const SSEUtils = {
  /**
   * Parse SSE data chunk
   */
  parseSSEChunk(chunk: string): StreamChunk | null {
    try {
      if (chunk.startsWith('data: ')) {
        const data = chunk.slice(6).trim()
        
        if (data === '[DONE]') {
          return {
            content: '',
            timestamp: Date.now(),
            isComplete: true,
          }
        }

        const parsed = JSON.parse(data)
        return {
          content: parsed.content || '',
          timestamp: Date.now(),
          isComplete: false,
        }
      }
    } catch (error) {
      console.warn('Failed to parse SSE chunk:', chunk, error)
    }
    return null
  },

  /**
   * Create SSE data string
   */
  createSSEData(content: string): string {
    return `data: ${JSON.stringify({ content })}\n\n`
  },

  /**
   * Create SSE completion marker
   */
  createSSEComplete(): string {
    return 'data: [DONE]\n\n'
  },
}

/**
 * Stream reconnection utilities
 */
export class StreamReconnectionManager {
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 1000
  private exponentialBackoff = true

  constructor(options?: {
    maxAttempts?: number
    initialDelay?: number
    exponentialBackoff?: boolean
  }) {
    if (options?.maxAttempts) this.maxReconnectAttempts = options.maxAttempts
    if (options?.initialDelay) this.reconnectDelay = options.initialDelay
    if (options?.exponentialBackoff !== undefined) {
      this.exponentialBackoff = options.exponentialBackoff
    }
  }

  /**
   * Calculate delay for next reconnection attempt
   */
  getReconnectDelay(): number {
    if (this.exponentialBackoff) {
      return this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    }
    return this.reconnectDelay
  }

  /**
   * Check if should attempt reconnection
   */
  shouldReconnect(): boolean {
    return this.reconnectAttempts < this.maxReconnectAttempts
  }

  /**
   * Increment reconnection attempt counter
   */
  incrementAttempts(): void {
    this.reconnectAttempts++
  }

  /**
   * Reset reconnection state
   */
  reset(): void {
    this.reconnectAttempts = 0
  }

  /**
   * Get current attempt count
   */
  getAttemptCount(): number {
    return this.reconnectAttempts
  }
}

/**
 * Stream error handling utilities
 */
export const StreamErrorUtils = {
  /**
   * Check if error is recoverable
   */
  isRecoverableError(error: Error): boolean {
    const recoverableMessages = [
      'network',
      'timeout',
      'connection',
      'rate limit',
      'temporarily unavailable',
    ]
    
    const message = error.message.toLowerCase()
    return recoverableMessages.some(keyword => message.includes(keyword))
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyErrorMessage(error: Error): string {
    const message = error.message.toLowerCase()
    
    if (message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return 'Network connection error. Please check your internet connection.'
    }
    
    if (message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }
    
    if (message.includes('unauthorized') || message.includes('api key')) {
      return 'Invalid API key. Please check your configuration.'
    }
    
    return 'An unexpected error occurred. Please try again.'
  },

  /**
   * Determine retry strategy based on error
   */
  getRetryStrategy(error: Error): {
    shouldRetry: boolean
    delay: number
    maxAttempts: number
  } {
    const message = error.message.toLowerCase()
    
    if (message.includes('rate limit')) {
      return {
        shouldRetry: true,
        delay: 5000,
        maxAttempts: 3,
      }
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return {
        shouldRetry: true,
        delay: 2000,
        maxAttempts: 3,
      }
    }
    
    if (message.includes('unauthorized') || message.includes('api key')) {
      return {
        shouldRetry: false,
        delay: 0,
        maxAttempts: 0,
      }
    }
    
    return {
      shouldRetry: true,
      delay: 1000,
      maxAttempts: 2,
    }
  },
}

/**
 * Performance monitoring for streams
 */
export class StreamPerformanceMonitor {
  private startTime: number = 0
  private firstChunkTime: number = 0
  private lastChunkTime: number = 0
  private chunkCount: number = 0
  private totalTokens: number = 0

  /**
   * Start monitoring a stream
   */
  start(): void {
    this.startTime = Date.now()
    this.firstChunkTime = 0
    this.lastChunkTime = 0
    this.chunkCount = 0
    this.totalTokens = 0
  }

  /**
   * Record a chunk received
   */
  recordChunk(chunkSize: number): void {
    const now = Date.now()
    
    if (this.chunkCount === 0) {
      this.firstChunkTime = now
    }
    
    this.lastChunkTime = now
    this.chunkCount++
    this.totalTokens += chunkSize
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const totalTime = this.lastChunkTime - this.startTime
    const timeToFirstChunk = this.firstChunkTime - this.startTime
    
    return {
      totalTime,
      timeToFirstChunk,
      chunkCount: this.chunkCount,
      totalTokens: this.totalTokens,
      averageChunkTime: this.chunkCount > 0 ? totalTime / this.chunkCount : 0,
      tokensPerSecond: totalTime > 0 ? (this.totalTokens * 1000) / totalTime : 0,
    }
  }
}

// Global stream manager instance
export const globalStreamManager = new StreamManager()