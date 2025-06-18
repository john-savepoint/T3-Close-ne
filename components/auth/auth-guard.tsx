"use client"

import { useConvexAuth } from "convex/react"
import { SignIn } from "./sign-in"
import { AuthLoading } from "./auth-loading"
import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useConvexAuth()

  console.log("🛡️ AUTHGUARD - isLoading:", isLoading, "isAuthenticated:", isAuthenticated)

  if (isLoading) {
    console.log("⏳ AUTHGUARD - Still loading auth state")
    // Loading state with skeleton
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    console.log("🚫 AUTHGUARD - Not authenticated, middleware should redirect")
    // Not authenticated - middleware will handle redirect to /login
    return <AuthLoading />
  }

  console.log("✅ AUTHGUARD - User is authenticated, showing children")
  // Authenticated
  return <>{children}</>
}
