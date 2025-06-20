"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/clerk-react"
import { ReactNode } from "react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)

interface ConvexClientProviderProps {
  children: ReactNode
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
