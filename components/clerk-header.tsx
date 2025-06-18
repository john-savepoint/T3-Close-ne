"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function ClerkHeader() {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <div className="flex animate-pulse space-x-4">
          <div className="h-8 w-16 rounded bg-slate-700"></div>
          <div className="h-8 w-16 rounded bg-slate-700"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 p-4">
      {/* @ts-expect-error Server Component */}
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      {/* @ts-expect-error Server Component */}
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}
