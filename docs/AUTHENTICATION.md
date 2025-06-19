# Authentication Documentation

## Current Status

Authentication is currently **DISABLED** for simplified deployment and testing. The infrastructure remains intact and can be re-enabled when needed.

## Authentication Infrastructure

### Technologies Used

- **Primary**: Clerk Authentication (v5.32.0)
- **Previous**: Convex Auth with JWT tokens
- **Email**: Resend for email verification
- **Providers**: Password, GitHub OAuth, Google OAuth

### Key Files

```
/middleware.ts              # Auth middleware (currently bypassed)
/app/login/page.tsx        # Login page
/app/signup/page.tsx       # Signup page
/components/auth/          # Authentication components
/convex/auth.ts           # Auth configuration
```

## Re-enabling Authentication

### 1. Update Middleware

Replace the current middleware.ts with:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/",
  "/new(.*)",
  "/archive(.*)",
  "/trash(.*)",
  "/settings(.*)",
  "/tools(.*)",
  "/s(.*)",
  "/redeem(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
```

### 2. Environment Variables

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Optional: Email with Resend
RESEND_API_KEY=re_...
```

### 3. Update Root Layout

Ensure ClerkProvider wraps the application in app/layout.tsx.

### 4. Protected Pages

Add authentication checks to pages that require login using Clerk's auth() or useAuth() hooks.

## Authentication Flow

### Password Authentication

1. User signs up with email/password
2. Email verification sent via Resend
3. User verifies email with OTP code
4. Account created and user logged in

### OAuth Flow

1. User clicks GitHub/Google button
2. Redirected to provider for authorization
3. Callback creates/updates user account
4. User logged in automatically

## Migration from Convex Auth

The project previously used Convex Auth but migrated to Clerk for better production support. The Convex Auth implementation is preserved in the git history if needed for reference.

### Key Differences

- Clerk handles all JWT management internally
- No need for manual session handling
- Built-in user management dashboard
- Better OAuth provider support

## Troubleshooting

### Common Issues

1. **Redirect loops**: Check middleware configuration
2. **OAuth failures**: Verify callback URLs in provider settings
3. **Email not sending**: Check Resend API key and domain verification

### Debug Mode

Enable Clerk debug mode in development:

```typescript
export default clerkMiddleware(
  async (auth, req) => {
    // auth logic
  },
  { debug: true }
)
```

## Security Considerations

1. Always use HTTPS in production
2. Configure CORS properly for API routes
3. Set secure session cookies
4. Implement rate limiting on auth endpoints
5. Regular security audits of dependencies

---

For detailed implementation history, see `/docs/CLAUDE_ARCHIVE.md`
