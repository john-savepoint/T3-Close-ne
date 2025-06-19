import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define protected routes - be conservative to avoid deployment issues
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
  // Only protect routes if user is trying to access them
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
