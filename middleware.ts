import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/",
  "/new",
  "/archive",
  "/trash",
  "/settings(.*)",
  "/tools(.*)",
  "/redeem",
])

export default clerkMiddleware(async (auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      await auth.protect()
    }
  } catch (error) {
    console.error("Authentication middleware error:", error)

    // Redirect to sign-in with error parameter for protected routes
    if (isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url)
      signInUrl.searchParams.set("error", "auth_required")
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}