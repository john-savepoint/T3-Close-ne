/**
 * Stream management utilities
 */

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

// Global stream manager instance
export const globalStreamManager = new StreamManager()
