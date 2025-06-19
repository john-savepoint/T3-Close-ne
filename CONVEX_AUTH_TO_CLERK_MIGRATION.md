# Convex Auth to Clerk Migration Plan

## Overview

This document provides a comprehensive plan for removing Convex Auth from the Z6Chat codebase and replacing it with Clerk authentication. The migration will maintain all existing functionality while leveraging Clerk's superior authentication features.

## Current Convex Auth Implementation

### Dependencies to Remove
```json
"@convex-dev/auth": "^0.0.87"
```

### Environment Variables to Remove
- `JWT_PRIVATE_KEY` 
- `JWKS_ENDPOINT`
- `AUTH_RESEND_KEY`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

### New Environment Variables to Add
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Phase 1: Backend Migration (Convex Functions)

### 1.1 Update convex/schema.ts
**Current:**
```typescript
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // other tables
});
```

**New:**
```typescript
export default defineSchema({
  // Remove authTables spread
  // Keep existing user table but simplify
  users: defineTable({
    // Clerk user ID will be the primary identifier
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    // Remove auth-specific fields like emailVerificationTime, etc.
  }).index("by_clerk_id", ["clerkId"]),
  // Keep all other tables as-is
});
```

### 1.2 Create convex/clerk.ts (New Helper)
```typescript
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  
  // Get or create user record
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
    
  if (!user) {
    // This would only happen on first sign-in
    throw new Error("User not found. Please ensure user sync is working.");
  }
  
  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

### 1.3 Delete Convex Auth Files
- Delete `convex/auth.ts`
- Delete `convex/auth.config.ts`
- Delete `convex/ResendOTP.ts`
- Delete `convex/cleanupAuth.ts`
- Delete `convex/cleanupStaleAuth.ts`

### 1.4 Update convex/users.ts
**Replace all `getAuthUserId` with Clerk identity:**
```typescript
import { getCurrentUser, requireAuth } from "./clerk";

export const current = query({
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
      
    if (existing) {
      return await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        image: args.image,
      });
    } else {
      return await ctx.db.insert("users", args);
    }
  },
});
```

### 1.5 Update All Convex Functions
Replace `getAuthUserId(ctx)` with `await requireAuth(ctx)` in:
- `convex/chats.ts`
- `convex/messages.ts`
- `convex/files.ts`
- `convex/memories.ts`
- Any other files using auth

## Phase 2: Frontend Migration

### 2.1 Remove Convex Auth Provider
**Update app/layout.tsx:**
```typescript
import { ClerkProvider } from '@clerk/nextjs'
// Remove AuthProvider import

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 2.2 Delete components/auth-provider.tsx
This file is no longer needed.

### 2.3 Update middleware.ts
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/',
  '/new(.*)',
  '/archive(.*)',
  '/trash(.*)',
  '/settings(.*)',
  '/tools(.*)',
  '/redeem',
  '/api/chat(.*)',
  '/api/upload(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 2.4 Update hooks/use-auth.ts
```typescript
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const syncUser = useMutation(api.users.syncUser);
  
  // Sync user to Convex on sign in
  useEffect(() => {
    if (isSignedIn && user) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || '',
        image: user.imageUrl,
      });
    }
  }, [isSignedIn, user, syncUser]);
  
  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      name: user.fullName || user.firstName || 'User',
      image: user.imageUrl,
    } : null,
    signOut,
  };
}
```

### 2.5 Delete Convex Auth Components
Delete entire `components/auth/` directory:
- `sign-in.tsx`
- `sign-up.tsx`
- `auth-guard.tsx`
- `auth-loading.tsx`

### 2.6 Update Auth Pages
**app/login/page.tsx:**
```typescript
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SignIn 
        appearance={{
          baseTheme: 'dark',
          variables: {
            colorPrimary: '#8B5CF6',
            colorBackground: '#0F172A',
            colorText: '#F8FAFC',
          },
        }}
      />
    </div>
  );
}
```

**app/signup/page.tsx:**
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SignUp 
        appearance={{
          baseTheme: 'dark',
          variables: {
            colorPrimary: '#8B5CF6',
            colorBackground: '#0F172A',
            colorText: '#F8FAFC',
          },
        }}
      />
    </div>
  );
}
```

### 2.7 Update components/sidebar.tsx
Replace the user profile section with Clerk's UserButton:
```typescript
import { UserButton } from '@clerk/nextjs';

// In the sidebar component, replace the UserProfile section with:
<div className="p-4 border-t border-slate-800">
  <UserButton 
    appearance={{
      elements: {
        avatarBox: 'w-10 h-10',
        userButtonPopoverCard: 'bg-slate-900 border-slate-800',
      }
    }}
    afterSignOutUrl="/login"
  />
</div>
```

### 2.8 Update components/user-profile.tsx
This component can be simplified or removed entirely since Clerk's UserButton handles everything.

## Phase 3: API Route Protection

### 3.1 Update API Routes
For all API routes (`app/api/*/route.ts`), add Clerk authentication:

```typescript
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Rest of your API logic
}
```

## Phase 4: Cleanup

### 4.1 Remove Unused Files
- Delete `generateKeys.mjs`
- Delete `generateKeysConvexOfficial.js`
- Delete `jwt_key.txt`
- Delete `jwt_private_key.txt`
- Delete `private_key.pem`

### 4.2 Update package.json
Remove the `@convex-dev/auth` dependency:
```bash
pnpm remove @convex-dev/auth
```

### 4.3 Update Documentation
- Update README.md to reflect Clerk authentication
- Remove or update CLERK_AUTH_SUMMARY.md
- Update CLAUDE.md auth sections

## Phase 5: Testing Checklist

### 5.1 Authentication Flow
- [ ] User can sign up with email
- [ ] User can sign in with email
- [ ] User can sign out
- [ ] User is redirected to login when accessing protected routes
- [ ] User is redirected to app after login

### 5.2 Data Isolation
- [ ] Users only see their own chats
- [ ] Users only see their own files
- [ ] Users only see their own projects
- [ ] Users only see their own API keys
- [ ] No data leakage between users

### 5.3 UI/UX
- [ ] User profile displays correctly
- [ ] Sign out works from UserButton
- [ ] Loading states work properly
- [ ] Error messages are user-friendly

### 5.4 API Protection
- [ ] Chat API requires authentication
- [ ] Upload API requires authentication
- [ ] All other APIs require authentication

## Migration Script

For existing data migration (if needed):
```typescript
// One-time migration script to update user records
import { internalMutation } from "./_generated/server";

export const migrateUsers = internalMutation({
  handler: async (ctx) => {
    // This would map old Convex auth user IDs to Clerk IDs
    // Only needed if you have existing production users
  },
});
```

## Rollback Plan

If issues arise:
1. Keep a backup of the current codebase
2. Document all Convex Auth environment variables
3. Test thoroughly in development before production
4. Have a feature flag to toggle between auth systems (if gradual rollout needed)

## Success Metrics

- Zero authentication errors in production
- All existing features work with Clerk
- Improved authentication performance
- Simplified codebase maintenance
- Better user experience with Clerk's UI components

This migration plan ensures a complete removal of Convex Auth while maintaining all functionality and improving the authentication system with Clerk's production-ready solution.