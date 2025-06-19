"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { useEffect, useCallback } from "react"

export function useAuth() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()
  
  // Define mutations and queries separately to avoid circular types
  const syncUser = useMutation("users:syncUser" as any)
  const convexUser = useQuery("users:current" as any)
  
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
    syncUserCallback()
  }, [syncUserCallback])
  
  return {
    user: convexUser,
    clerkUser,
    isAuthenticated: isSignedIn && !!convexUser,
    signOut,
    isLoading: !isLoaded || (isSignedIn && convexUser === undefined),
  }
}
