import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

<<<<<<< HEAD
export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next()

  // Add security headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://api.openrouter.ai https://*.convex.cloud wss://*.convex.cloud https://api.openai.com;
    frame-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim()

  response.headers.set("Content-Security-Policy", cspHeader)
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return response
}
=======
// Define protected routes - be conservative to avoid deployment issues
const isProtectedRoute = createRouteMatcher([
  "/",
  "/new",
  "/archive", 
  "/trash",
  "/settings(.*)",
  "/tools(.*)",
  "/redeem"
])

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes if user is trying to access them
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
>>>>>>> 528abe5 (feat(auth): complete Convex Auth to Clerk migration with production-ready implementation)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
