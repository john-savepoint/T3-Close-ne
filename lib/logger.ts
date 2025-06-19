import fs from "fs"
import path from "path"
import { format } from "date-fns"

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Create a unique log file for this session
const sessionId = format(new Date(), "yyyy-MM-dd-HHmmss")
const logFile = path.join(logsDir, `dev-${sessionId}.log`)

// Write initial session info
fs.writeFileSync(logFile, `=== Development Session Started at ${new Date().toISOString()} ===\n\n`)

// Log levels
export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

// Main logging function
export function log(level: LogLevel, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    data,
    stack: level === LogLevel.ERROR ? new Error().stack : undefined,
  }

  // Format for file
  const fileEntry = `[${timestamp}] ${level}: ${message}\n${
    data ? JSON.stringify(data, null, 2) + "\n" : ""
  }${logEntry.stack ? logEntry.stack + "\n" : ""}\n`

  // Write to file
  fs.appendFileSync(logFile, fileEntry)

  // Also log to console with color
  const colors = {
    ERROR: "\x1b[31m", // Red
    WARN: "\x1b[33m", // Yellow
    INFO: "\x1b[36m", // Cyan
    DEBUG: "\x1b[90m", // Gray
  }
  const reset = "\x1b[0m"

  console.log(`${colors[level]}[${level}]${reset} ${message}`, data || "")
}

// Convenience methods
export const logger = {
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),

  // Get current log file path
  getCurrentLogFile: () => logFile,

  // Log React/Next.js errors
  logError: (error: Error, errorInfo?: any) => {
    log(LogLevel.ERROR, "React Error Boundary Caught Error", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      digest: errorInfo?.digest,
    })
  },
}

// Export session info
export const sessionInfo = {
  id: sessionId,
  logFile,
  startTime: new Date().toISOString(),
}

// Log uncaught errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    logger.error("Uncaught Error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled Promise Rejection", {
      reason: event.reason,
      promise: event.promise,
    })
  })
}

// Log console errors
if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args) => {
    logger.error("Console Error", { args })
    originalError.apply(console, args)
  }
}
