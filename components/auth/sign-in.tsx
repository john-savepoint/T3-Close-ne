"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { Github, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useConvexAuth } from "convex/react"

export function SignIn() {
  const { signIn } = useAuthActions()
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  // Redirect to home when authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/")
    }
  }, [isAuthenticated, authLoading, router])

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signIn("password", { email, password, flow: "signIn" })
      // Redirect will be handled by the useEffect hook once authentication state updates
    } catch (error) {
      console.error("Sign in failed:", error)
      if (error instanceof Error) {
        setError(error.message || "Failed to sign in. Please check your credentials.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(provider)
      // OAuth redirects are handled automatically by the provider
      if (result?.redirect) {
        // If there's a redirect URL, the browser will navigate automatically
        console.log("OAuth redirect initiated")
      }
    } catch (error) {
      console.error(`${provider} sign in failed:`, error)
      if (error instanceof Error) {
        setError(`Failed to sign in with ${provider}. Please try again.`)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your Z6Chat account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (validationErrors.email) {
                  setValidationErrors((prev) => ({ ...prev, email: undefined }))
                }
              }}
              disabled={isLoading}
              className={validationErrors.email ? "border-destructive" : ""}
            />
            {validationErrors.email && (
              <p className="text-xs text-destructive">{validationErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              disabled={isLoading}
              className={validationErrors.password ? "border-destructive" : ""}
            />
            {validationErrors.password && (
              <p className="text-xs text-destructive">{validationErrors.password}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleOAuthSignIn("github")}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            onClick={() => handleOAuthSignIn("google")}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
