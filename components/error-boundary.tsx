"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Default error fallback component
export function DefaultErrorFallback({
  error,
  resetError,
}: {
  error?: Error
  resetError: () => void
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-400">Something went wrong</h3>
        <p className="mt-2 text-sm text-mauve-subtle">
          {error?.message || "An unexpected error occurred while loading this component."}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={resetError}
        className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}

// Chat-specific error boundary for database operations
export function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400">Chat Error</h3>
            <p className="mt-2 text-sm text-mauve-subtle">
              Failed to load chat data. This could be due to a connection issue or database error.
            </p>
            {error?.message && (
              <p className="mt-1 text-xs text-red-300/60">Error: {error.message}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={resetError}
              className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            >
              Reload Page
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
