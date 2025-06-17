/**
 * Streaming utilities for real-time chat functionality
 *
 * @deprecated This file is kept for backwards compatibility.
 * Use individual modules from ./streaming/ for better maintainability.
 */

// Re-export everything from the modular streaming utilities
export * from "./streaming/index"

// Legacy compatibility - global stream manager
import { globalStreamManager } from "./streaming/manager"
export { globalStreamManager }
