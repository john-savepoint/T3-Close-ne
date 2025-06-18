"use client"

import React from "react"

interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Authentication error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="mx-auto max-w-md rounded-lg border border-red-500/20 bg-slate-900 p-8">
            <div className="text-center">
              <div className="mb-4 text-4xl text-red-400">⚠️</div>
              <h1 className="mb-4 text-xl font-semibold text-white">Authentication Error</h1>
              <p className="mb-6 text-slate-400">
                There was an issue with the authentication system. Please refresh the page or try
                again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
