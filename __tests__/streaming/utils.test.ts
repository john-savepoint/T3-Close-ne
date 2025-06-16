/**
 * Unit tests for streaming utilities
 */

import { MessageStreamUtils, SSEUtils } from '../../lib/streaming/utils'

describe('MessageStreamUtils', () => {
  describe('createStreamingMessage', () => {
    it('should create a user message', () => {
      const message = MessageStreamUtils.createStreamingMessage('user', 'Hello')
      
      expect(message.role).toBe('user')
      expect(message.content).toBe('Hello')
      expect(message.isStreaming).toBe(false)
      expect(message.id).toBeDefined()
      expect(message.timestamp).toBeInstanceOf(Date)
    })

    it('should create a streaming assistant message', () => {
      const message = MessageStreamUtils.createStreamingMessage('assistant', '', 'gpt-4')
      
      expect(message.role).toBe('assistant')
      expect(message.content).toBe('')
      expect(message.isStreaming).toBe(true)
      expect(message.model).toBe('gpt-4')
    })
  })

  describe('updateStreamingContent', () => {
    it('should update message content and streaming status', () => {
      const original = MessageStreamUtils.createStreamingMessage('assistant', 'Hello')
      const updated = MessageStreamUtils.updateStreamingContent(original, 'Hello World', true)
      
      expect(updated.content).toBe('Hello World')
      expect(updated.isStreaming).toBe(false)
      expect(updated.id).toBe(original.id)
    })
  })

  describe('appendStreamingContent', () => {
    it('should append content to existing message', () => {
      const original = MessageStreamUtils.createStreamingMessage('assistant', 'Hello')
      const updated = MessageStreamUtils.appendStreamingContent(original, ' World')
      
      expect(updated.content).toBe('Hello World')
      expect(updated.id).toBe(original.id)
    })
  })
})

describe('SSEUtils', () => {
  describe('parseSSEChunk', () => {
    it('should parse valid SSE data chunk', () => {
      const chunk = 'data: {"content": "Hello"}'
      const parsed = SSEUtils.parseSSEChunk(chunk)
      
      expect(parsed).toEqual({
        content: 'Hello',
        timestamp: expect.any(Number),
        isComplete: false
      })
    })

    it('should parse completion marker', () => {
      const chunk = 'data: [DONE]'
      const parsed = SSEUtils.parseSSEChunk(chunk)
      
      expect(parsed).toEqual({
        content: '',
        timestamp: expect.any(Number),
        isComplete: true
      })
    })

    it('should return null for invalid chunk', () => {
      const chunk = 'invalid chunk'
      const parsed = SSEUtils.parseSSEChunk(chunk)
      
      expect(parsed).toBeNull()
    })

    it('should handle malformed JSON gracefully', () => {
      const chunk = 'data: {invalid json}'
      const parsed = SSEUtils.parseSSEChunk(chunk)
      
      expect(parsed).toBeNull()
    })
  })

  describe('createSSEData', () => {
    it('should create properly formatted SSE data', () => {
      const result = SSEUtils.createSSEData('Hello')
      expect(result).toBe('data: {"content":"Hello"}\n\n')
    })
  })

  describe('createSSEComplete', () => {
    it('should create completion marker', () => {
      const result = SSEUtils.createSSEComplete()
      expect(result).toBe('data: [DONE]\n\n')
    })
  })
})