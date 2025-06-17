/**
 * Streaming utilities for real-time chat functionality
 * Modular architecture for better maintainability
 */

// Type definitions
export type * from './types'

// Stream management
export { StreamManager, globalStreamManager } from './manager'

// Message and SSE utilities
export { MessageStreamUtils, SSEUtils } from './utils'

// Error handling and reconnection
export { StreamReconnectionManager, StreamErrorUtils } from './error-handling'

// Performance monitoring
export { StreamPerformanceMonitor } from './performance'

// Convenience re-exports for backwards compatibility
export { MessageStreamUtils as StreamingMessage } from './utils'
export { SSEUtils as StreamChunk } from './utils'