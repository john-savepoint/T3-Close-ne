"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { useEffect, useCallback, useState } from "react"

export function useAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()
  const [hasStabilized, setHasStabilized] = useState(false)
  
  // Define mutations and queries with proper types
  const syncUser = useMutation("users:syncUser" as any)
  const convexUser = useQuery("users:current" as any)
  
  // Stabilize the loading state to prevent flashing
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setHasStabilized(true)
      }, 500) // Wait 500ms after Clerk loads to stabilize
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded])
  
  // Sync user to Convex when Clerk user is available
  const syncUserCallback = useCallback(async () => {
    if (isSignedIn && clerkUser && syncUser) {
      try {
        await syncUser({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          name: clerkUser.fullName || clerkUser.firstName || undefined,
          image: clerkUser.imageUrl || undefined,
        })
      } catch (error) {
        console.error('Failed to sync user:', error)
      }
    }
  }, [isSignedIn, clerkUser, syncUser])
  
  useEffect(() => {
    if (hasStabilized) {
      syncUserCallback()
    }
  }, [syncUserCallback, hasStabilized])

  // Improved loading logic to prevent flashing
  const isLoading = !isLoaded || !hasStabilized || (isSignedIn && convexUser === undefined)
  const isAuthenticated = isSignedIn && !!clerkUser && hasStabilized

  return {
    user: convexUser,
    clerkUser,
    isAuthenticated,
    signOut,
    isLoading,
    debug: {
      isLoaded,
      isSignedIn,
      hasConvexUser: !!convexUser,
      hasClerkUser: !!clerkUser,
      hasStabilized,
    }
  }
}
