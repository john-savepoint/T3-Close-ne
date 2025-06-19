"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ModelErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ModelErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ModelErrorBoundary extends React.Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ModelErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Model management error:", error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return (
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Model Loading Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              There was an error loading the AI models. This might be due to a network issue or API
              timeout.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={this.retry} variant="default" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
            {this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 rounded bg-muted p-2 text-xs">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function ModelErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-medium text-destructive">Model Selection Error</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message || "Failed to load AI models"}
      </p>
      <Button
        onClick={retry}
        variant="outline"
        size="sm"
        className="mt-3 border-destructive/20 text-destructive hover:bg-destructive/10"
      >
        <RefreshCw className="mr-1 h-3 w-3" />
        Retry
      </Button>
    </div>
  )
}