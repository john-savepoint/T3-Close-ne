"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/clerk-react"
import { ReactNode, useMemo } from "react"
import { ConvexProvider } from "convex/react"

interface ConvexClientProviderProps {
  children: ReactNode
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  // Create Convex client with memoization to prevent recreation
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!url) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not set")
      // Return a dummy client that won't crash the app
      return new ConvexReactClient("https://dummy.convex.cloud")
    }
    return new ConvexReactClient(url)
  }, [])

  // Check if Clerk is configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // If Clerk is not configured, use regular ConvexProvider
  if (!isClerkConfigured) {
    return (
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    )
  }

  // Use ConvexProviderWithClerk when Clerk is configured
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
