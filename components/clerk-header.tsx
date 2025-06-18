"use client"

import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton,
  UserButton 
} from "@clerk/nextjs"

export function ClerkHeader() {
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