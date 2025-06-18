"use client"

import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/nextjs"

export function ClerkHeader() {
  const { isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-slate-700 h-8 w-16"></div>
          <div className="rounded bg-slate-700 h-8 w-16"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
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