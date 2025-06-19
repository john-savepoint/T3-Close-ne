"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorType: 'clerk_auth' | 'clerk_config' | 'network' | 'unknown'
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
    this.state = { hasError: false, errorType: 'unknown' }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    // Categorize the error for better handling
    let errorType: AuthErrorBoundaryState['errorType'] = 'unknown'
    
    if (error.message.includes('Clerk') || error.name.includes('ClerkError')) {
      errorType = 'clerk_auth'
    } else if (error.message.includes('environment') || error.message.includes('CLERK_')) {
      errorType = 'clerk_config'
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      errorType = 'network'
    }

    return { hasError: true, error, errorType }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Authentication error:", error, errorInfo)
    
    // Log specific error details for debugging
    if (this.state.errorType === 'clerk_config') {
      console.error("Clerk configuration issue - check environment variables")
    } else if (this.state.errorType === 'clerk_auth') {
      console.error("Clerk authentication issue - check API keys and network")
    }
  }

  private getErrorContent() {
    const { error, errorType } = this.state

    switch (errorType) {
      case 'clerk_config':
        return {
          icon: "⚙️",
          title: "Configuration Error",
          message: "Authentication is not properly configured. Please check your environment variables.",
          action: "Contact Support",
          actionFn: () => {
            window.open('mailto:support@z6chat.com?subject=Authentication Configuration Error', '_blank')
          }
        }
      
      case 'clerk_auth':
        return {
          icon: "🔐",
          title: "Authentication Service Error",
          message: "Unable to connect to authentication service. This may be a temporary issue.",
          action: "Try Again",
          actionFn: () => window.location.reload()
        }
      
      case 'network':
        return {
          icon: "🌐",
          title: "Connection Error",
          message: "Unable to connect to authentication servers. Please check your internet connection.",
          action: "Retry",
          actionFn: () => window.location.reload()
        }
      
      default:
        return {
          icon: "⚠️",
          title: "Authentication Error",
          message: "An unexpected authentication error occurred. Please try refreshing the page.",
          action: "Refresh Page",
          actionFn: () => window.location.reload()
        }
    }
  }

  render() {
    if (this.state.hasError) {
      const { icon, title, message, action, actionFn } = this.getErrorContent()

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/20 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h1 className="text-xl font-semibold text-white mb-4">
                {title}
              </h1>
              <p className="text-slate-400 mb-6">
                {message}
              </p>
              
              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-400 bg-slate-950 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={actionFn}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {action}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}