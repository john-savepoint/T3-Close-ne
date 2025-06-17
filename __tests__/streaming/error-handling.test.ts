/**
 * Unit tests for error handling utilities
 */

import { StreamErrorUtils, StreamReconnectionManager } from '../../lib/streaming/error-handling'

describe('StreamErrorUtils', () => {
  describe('isRecoverableError', () => {
    it('should identify recoverable errors', () => {
      const recoverableErrors = [
        new Error('Network connection failed'),
        new Error('Request timeout occurred'),
        new Error('Rate limit exceeded'),
        new Error('Service temporarily unavailable')
      ]

      recoverableErrors.forEach(error => {
        expect(StreamErrorUtils.isRecoverableError(error)).toBe(true)
      })
    })

    it('should identify non-recoverable errors', () => {
      const nonRecoverableErrors = [
        new Error('Invalid API key'),
        new Error('Unauthorized access'),
        new Error('Syntax error in request')
      ]

      nonRecoverableErrors.forEach(error => {
        expect(StreamErrorUtils.isRecoverableError(error)).toBe(false)
      })
    })
  })

  describe('getUserFriendlyErrorMessage', () => {
    it('should return user-friendly messages for common errors', () => {
      const testCases = [
        {
          error: new Error('Rate limit exceeded'),
          expected: 'Too many requests. Please wait a moment and try again.'
        },
        {
          error: new Error('Network connection failed'),
          expected: 'Network connection error. Please check your internet connection.'
        },
        {
          error: new Error('Request timeout'),
          expected: 'Request timed out. Please try again.'
        },
        {
          error: new Error('Invalid API key'),
          expected: 'Invalid API key. Please check your configuration.'
        }
      ]

      testCases.forEach(({ error, expected }) => {
        expect(StreamErrorUtils.getUserFriendlyErrorMessage(error)).toBe(expected)
      })
    })

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error type')
      const message = StreamErrorUtils.getUserFriendlyErrorMessage(error)
      expect(message).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('getRetryStrategy', () => {
    it('should return appropriate strategy for rate limit errors', () => {
      const error = new Error('Rate limit exceeded')
      const strategy = StreamErrorUtils.getRetryStrategy(error)
      
      expect(strategy).toEqual({
        shouldRetry: true,
        delay: 5000,
        maxAttempts: 3
      })
    })

    it('should return no retry for auth errors', () => {
      const error = new Error('Unauthorized')
      const strategy = StreamErrorUtils.getRetryStrategy(error)
      
      expect(strategy).toEqual({
        shouldRetry: false,
        delay: 0,
        maxAttempts: 0
      })
    })
  })
})

describe('StreamReconnectionManager', () => {
  let manager: StreamReconnectionManager

  beforeEach(() => {
    manager = new StreamReconnectionManager()
  })

  describe('getReconnectDelay', () => {
    it('should calculate exponential backoff delay', () => {
      manager = new StreamReconnectionManager({ 
        initialDelay: 1000, 
        exponentialBackoff: true 
      })
      
      expect(manager.getReconnectDelay()).toBe(1000) // 2^0 * 1000
      
      manager.incrementAttempts()
      expect(manager.getReconnectDelay()).toBe(2000) // 2^1 * 1000
      
      manager.incrementAttempts()
      expect(manager.getReconnectDelay()).toBe(4000) // 2^2 * 1000
    })

    it('should use fixed delay when exponential backoff is disabled', () => {
      manager = new StreamReconnectionManager({ 
        initialDelay: 1000, 
        exponentialBackoff: false 
      })
      
      expect(manager.getReconnectDelay()).toBe(1000)
      
      manager.incrementAttempts()
      expect(manager.getReconnectDelay()).toBe(1000)
    })
  })

  describe('shouldReconnect', () => {
    it('should allow reconnection within attempt limit', () => {
      manager = new StreamReconnectionManager({ maxAttempts: 3 })
      
      expect(manager.shouldReconnect()).toBe(true)
      
      manager.incrementAttempts()
      expect(manager.shouldReconnect()).toBe(true)
      
      manager.incrementAttempts()
      expect(manager.shouldReconnect()).toBe(true)
      
      manager.incrementAttempts()
      expect(manager.shouldReconnect()).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset attempt counter', () => {
      manager.incrementAttempts()
      manager.incrementAttempts()
      expect(manager.getAttemptCount()).toBe(2)
      
      manager.reset()
      expect(manager.getAttemptCount()).toBe(0)
      expect(manager.shouldReconnect()).toBe(true)
    })
  })
})