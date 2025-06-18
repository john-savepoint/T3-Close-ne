// Authentication disabled for competition demo
// All routes are now publicly accessible

export default function middleware() {
  // No authentication checks - all routes open
  return
}

export const config = {
  matcher: [],
}
