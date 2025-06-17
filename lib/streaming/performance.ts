/**
 * Performance monitoring for streams
 */

import type { StreamMetrics } from "./types"

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
  getMetrics(): StreamMetrics {
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
