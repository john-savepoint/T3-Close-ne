"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { useEffect, useCallback, useState, useRef } from "react"
import { api } from "@/convex/_generated/api"

export function useAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()
  const [hasStabilized, setHasStabilized] = useState(false)
  const [syncAttempts, setSyncAttempts] = useState(0)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Check if Clerk is configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Define mutations and queries with proper types
  const syncUser = useMutation(api.users.syncUser)
  const initializeDemoUser = useMutation(api.users.initializeDemoUser)
  const convexUser = useQuery(api.users.current)
  
  // Check for demo mode and stabilize loading state
  useEffect(() => {
    if (!isClerkConfigured) {
      setIsDemoMode(true)
      setHasStabilized(true)
    } else if (isLoaded) {
      const timer = setTimeout(() => {
        setHasStabilized(true)
      }, 300) // Reduced wait time for better UX
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, isClerkConfigured])
  
  // Initialize demo user if in demo mode
  useEffect(() => {
    if (isDemoMode && initializeDemoUser && !convexUser) {
      initializeDemoUser()
    }
  }, [isDemoMode, initializeDemoUser, convexUser])
  
  // Sync user to Convex when Clerk user is available
  const syncUserCallback = useCallback(async () => {
    // Only sync if we have all required data and haven't exceeded retry limit
    if (!isSignedIn || !clerkUser || !syncUser || syncAttempts >= 3) {
      return
    }

    try {
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }

      await syncUser({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        image: clerkUser.imageUrl || undefined,
      })
      
      // Reset sync attempts on success
      setSyncAttempts(0)
    } catch (error: any) {
      console.error('Failed to sync user:', error)
      
      // Increment sync attempts
      setSyncAttempts(prev => prev + 1)
      
      // Retry with exponential backoff if not at limit
      if (syncAttempts < 2) {
        const delay = Math.min(1000 * Math.pow(2, syncAttempts), 5000)
        syncTimeoutRef.current = setTimeout(() => {
          syncUserCallback()
        }, delay)
      }
    }
  }, [isSignedIn, clerkUser, syncUser, syncAttempts])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])
  
  useEffect(() => {
    if (hasStabilized && isSignedIn && clerkUser) {
      syncUserCallback()
    }
  }, [hasStabilized, isSignedIn, clerkUser?.id]) // Only re-run if user ID changes

  // Improved loading logic with demo mode support
  const isLoading = (!isLoaded || !hasStabilized) && !isDemoMode
  const isAuthenticated = isDemoMode ? !!convexUser : (isSignedIn && !!clerkUser && !!convexUser && hasStabilized)
  const isAuthenticating = !isDemoMode && isSignedIn && !!clerkUser && !convexUser && hasStabilized

  return {
    user: convexUser,
    clerkUser,
    isAuthenticated,
    isAuthenticating,
    signOut: isDemoMode ? () => {} : signOut,
    isLoading,
    syncError: !isDemoMode && syncAttempts >= 3,
    isDemoMode,
    isClerkConfigured,
    debug: {
      isLoaded,
      isSignedIn,
      hasConvexUser: !!convexUser,
      hasClerkUser: !!clerkUser,
      hasStabilized,
      syncAttempts,
      isDemoMode,
    }
  }
}
