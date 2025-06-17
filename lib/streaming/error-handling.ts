/**
 * Stream error handling and reconnection utilities
 */

import type { RetryStrategy } from './types'

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
  getRetryStrategy(error: Error): RetryStrategy {
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