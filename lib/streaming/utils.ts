/**
 * Message and SSE streaming utilities
 */

import type { StreamingMessage, StreamChunk } from './types'

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