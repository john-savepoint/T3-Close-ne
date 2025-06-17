"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useConvexAuth, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function useAuth() {
  const { signIn, signOut } = useAuthActions()
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser)

  return {
    user,
    isAuthenticated: isAuthenticated && user !== null,
    signIn,
    signOut,
    isLoading: authLoading || (isAuthenticated && user === undefined),
  }
}
