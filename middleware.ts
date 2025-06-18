import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isSignInPage = createRouteMatcher(["/login"])
const isProtectedRoute = createRouteMatcher([
  "/new",
  "/archive",
  "/trash",
  "/settings(.*)",
  "/tools(.*)",
  "/s(.*)",
  "/redeem",
])

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // If user is authenticated and trying to access sign-in page, redirect to home
    if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/")
    }

    // If user is not authenticated and trying to access protected route, redirect to login
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login")
    }
  },
  {
    verbose: true,
  }
)

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
