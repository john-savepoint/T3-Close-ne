// Lightweight logger that only logs to console in development
// This avoids file system operations that slow down the app

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

// Main logging function
export function log(level: LogLevel, message: string, data?: any) {
  if (process.env.NODE_ENV === "production") {
    // In production, we could send to a logging service
    return
  }

  // Development logging to console only
  const colors = {
    ERROR: "\x1b[31m", // Red
    WARN: "\x1b[33m", // Yellow
    INFO: "\x1b[36m", // Cyan
    DEBUG: "\x1b[90m", // Gray
  }

  const reset = "\x1b[0m"
  const color = colors[level] || reset

  console.log(`${color}[${level}]${reset} ${message}`)
  if (data) {
    console.log(data)
  }
}

// Convenience functions
export const logger = {
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
}

export default logger
