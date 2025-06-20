"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, LogIn } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const [isClerkConfigured, setIsClerkConfigured] = useState(true)
  const [showDemoMode, setShowDemoMode] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if Clerk is configured
    const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    setIsClerkConfigured(hasClerkKey)
    
    // If Clerk is not configured, show demo mode after a delay
    if (!hasClerkKey) {
      const timer = setTimeout(() => setShowDemoMode(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // If Clerk is not configured, show demo mode option
  if (!isClerkConfigured || (isLoaded && authError) || showDemoMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-yellow-500/20 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-4">
              Authentication Not Configured
            </h1>
            <p className="text-slate-400 mb-6">
              {isClerkConfigured 
                ? "There was an issue with the authentication service. You can continue in demo mode."
                : "Clerk authentication is not configured. You can use the app in demo mode or configure authentication."
              }
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  // Continue without authentication (demo mode)
                  setShowDemoMode(false)
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Continue in Demo Mode
              </Button>
              
              {!isClerkConfigured && (
                <div className="text-left bg-slate-950 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-2">To enable authentication:</p>
                  <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Create a Clerk account at clerk.com</li>
                    <li>Add these to your .env.local:</li>
                    <li className="font-mono text-xs bg-slate-900 p-2 rounded mt-2">
                      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
                      <br />
                      CLERK_SECRET_KEY=sk_...
                    </li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Normal loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-400">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // If not signed in and Clerk is configured, redirect to sign in
  if (!isSignedIn && isClerkConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-purple-500/20 rounded-lg p-8 max-w-md mx-auto text-center">
          <LogIn className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-slate-400 mb-6">
            Please sign in to continue using Z6Chat
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // User is authenticated or in demo mode
  return <>{children}</>
}