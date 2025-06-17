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

  if (isLoading) {
    // Loading state with skeleton
    return <AuthLoading />
  }

  if (!isAuthenticated) {
    // Not authenticated
    return (
      <div className="flex min-h-screen items-center justify-center">{fallback || <SignIn />}</div>
    )
  }

  // Authenticated
  return <>{children}</>
}
