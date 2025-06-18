"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ReactNode } from "react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log("🔧 AUTH PROVIDER - Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL)
  console.log("🔧 AUTH PROVIDER - Convex client:", convex)
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
}
