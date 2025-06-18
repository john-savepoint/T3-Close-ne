"use client"

import { SignIn } from "@/components/auth/sign-in"
import { SignUp } from "@/components/auth/sign-up"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  const [isSignIn, setIsSignIn] = useState(false) // Default to Sign Up mode

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Z6Chat</h1>
          <p className="text-muted-foreground">Your AI-powered conversation assistant</p>
        </div>

        {isSignIn ? <SignIn /> : <SignUp />}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
