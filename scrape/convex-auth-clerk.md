# Convex Auth with Clerk Integration

[Clerk](https://clerk.com/) is an authentication platform providing login via passwords, social identity providers, one-time email or SMS access codes, and multi-factor authentication and basic user management.

## Get Started

Convex offers a provider that is specifically for integrating with Clerk called `<ConvexProviderWithClerk>`. It works with any of Clerk's React-based SDKs, such as the Next.js and Expo SDKs.

## React Integration

**Example:** [React with Convex and Clerk](https://github.com/get-convex/template-react-vite-clerk)

### Setup Steps

1. **Sign up for Clerk**

   - Sign up for a free Clerk account at [clerk.com/sign-up](https://dashboard.clerk.com/sign-up)

2. **Create an application in Clerk**

   - Choose how you want your users to sign in

3. **Create a JWT Template**

   - In the Clerk Dashboard, navigate to the [JWT templates](https://dashboard.clerk.com/last-active?path=jwt-templates) page
   - Select _New template_ and then from the list of templates, select _Convex_
   - **Do NOT rename the JWT token. It must be called `convex`**
   - Copy and save the _Issuer_ URL somewhere secure

4. **Set the Issuer URL in your env vars**

   ```bash
   # .env
   VITE_CLERK_FRONTEND_API_URL=https://verb-noun-00.clerk.accounts.dev
   ```

5. **Configure Convex with the Clerk issuer domain**

   ```typescript
   // convex/auth.config.ts
   export default {
     providers: [
       {
         domain: process.env.VITE_CLERK_FRONTEND_API_URL,
         applicationID: "convex",
       },
     ],
   }
   ```

6. **Deploy your changes**

   ```bash
   npx convex dev
   ```

7. **Install clerk**

   ```bash
   npm install @clerk/clerk-react
   ```

8. **Set your Clerk API keys**

   ```bash
   # .env
   VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

9. **Configure ConvexProviderWithClerk**

   ```typescript
   // src/main.tsx
   import React from "react";
   import ReactDOM from "react-dom/client";
   import App from "./App";
   import "./index.css";
   import { ClerkProvider, useAuth } from "@clerk/clerk-react";
   import { ConvexProviderWithClerk } from "convex/react-clerk";
   import { ConvexReactClient } from "convex/react";

   const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

   ReactDOM.createRoot(document.getElementById("root")!).render(
     <React.StrictMode>
       <ClerkProvider publishableKey="pk_test_...">
         <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
           <App />
         </ConvexProviderWithClerk>
       </ClerkProvider>
     </React.StrictMode>,
   );
   ```

10. **Show UI based on authentication state**

    ```typescript
    // src/App.tsx
    import { SignInButton, UserButton } from "@clerk/clerk-react";
    import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
    import { api } from "../convex/_generated/api";

    function App() {
      return (
        <main>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
          <Authenticated>
            <UserButton />
            <Content />
          </Authenticated>
          <AuthLoading>
            <p>Still loading</p>
          </AuthLoading>
        </main>
      );
    }

    function Content() {
      const messages = useQuery(api.messages.getForCurrentUser);
      return <div>Authenticated content: {messages?.length}</div>;
    }

    export default App;
    ```

11. **Use authentication state in your Convex functions**

    ```typescript
    // convex/messages.ts
    import { query } from "./_generated/server"

    export const getForCurrentUser = query({
      args: {},
      handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (identity === null) {
          throw new Error("Not authenticated")
        }
        return await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("author"), identity.email))
          .collect()
      },
    })
    ```

## Next.js Integration

**Example:** [Next.js with Convex and Clerk](https://github.com/get-convex/template-nextjs-clerk)

### Next.js Setup Steps

1-8. **Follow steps 1-8 from React integration above**

9. **Add Clerk middleware**

   ```typescript
   // middleware.ts
   import { clerkMiddleware } from "@clerk/nextjs/server"

   export default clerkMiddleware()

   export const config = {
     matcher: [
       // Skip Next.js internals and all static files, unless found in search params
       "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
       // Always run for API routes
       "/(api|trpc)(.*)",
     ],
   }
   ```

   **Note:** By default, `clerkMiddleware()` will not protect any routes. All routes are public and you must opt-in to protection for routes.

10. **Configure ConvexProviderWithClerk**

    ```typescript
    // components/ConvexClientProvider.tsx
    'use client'

    import { ReactNode } from 'react'
    import { ConvexReactClient } from 'convex/react'
    import { ConvexProviderWithClerk } from 'convex/react-clerk'
    import { useAuth } from '@clerk/nextjs'

    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
    }

    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

    export default function ConvexClientProvider({ children }: { children: ReactNode }) {
      return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      )
    }
    ```

11. **Wrap your app in Clerk and Convex**

    ```typescript
    // app/layout.tsx
    import type { Metadata } from 'next'
    import { Geist, Geist_Mono } from 'next/font/google'
    import './globals.css'
    import { ClerkProvider } from '@clerk/nextjs'
    import ConvexClientProvider from '@/components/ConvexClientProvider'

    const geistSans = Geist({
      variable: '--font-geist-sans',
      subsets: ['latin'],
    })

    const geistMono = Geist_Mono({
      variable: '--font-geist-mono',
      subsets: ['latin'],
    })

    export const metadata: Metadata = {
      title: 'Clerk Next.js Quickstart',
      description: 'Generated by create next app',
    }

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode
    }>) {
      return (
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ClerkProvider>
              <ConvexClientProvider>{children}</ConvexClientProvider>
            </ClerkProvider>
          </body>
        </html>
      )
    }
    ```

12. **Show UI based on authentication state**

    ```typescript
    // app/page.tsx
    "use client";

    import { Authenticated, Unauthenticated } from "convex/react";
    import { SignInButton, UserButton } from "@clerk/nextjs";
    import { useQuery } from "convex/react";
    import { api } from "../convex/_generated/api";

    export default function Home() {
      return (
        <>
          <Authenticated>
            <UserButton />
            <Content />
          </Authenticated>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
        </>
      );
    }

    function Content() {
      const messages = useQuery(api.messages.getForCurrentUser);
      return <div>Authenticated content: {messages?.length}</div>;
    }
    ```

## Important Notes

### Use Convex Auth Components

Use Convex's `<Authenticated>`, `<Unauthenticated>` and `<AuthLoading>` helper components instead of Clerk's `<SignedIn>`, `<SignedOut>` and `<ClerkLoading>` components.

### Use useConvexAuth Hook

Use the [`useConvexAuth()`](https://docs.convex.dev/api/modules/react#useconvexauth) hook instead of Clerk's `useAuth()` hook when you need to check whether the user is logged in. The `useConvexAuth()` hook ensures that:

- The browser has fetched the auth token needed to make authenticated requests to your Convex backend
- The Convex backend has validated it

### JWT Template Requirements

- **Do NOT rename the JWT token. It must be called `convex`**
- Copy and save the _Issuer_ URL (Frontend API URL) for configuration

## Environment Variables

### Development vs Production

**Development:**

```bash
CLERK_FRONTEND_API_URL=https://verb-noun-00.clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

**Production:**

```bash
CLERK_FRONTEND_API_URL=https://clerk.<your-domain>.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

## Accessing User Information

### Client-side

Use Clerk's `useUser()` hook to access the authenticated user's information:

```typescript
// components/Badge.tsx
export default function Badge() {
  const { user } = useUser();
  return <span>Logged in as {user.fullName}</span>;
}
```

### Server-side (Convex Functions)

Access user information via `ctx.auth.getUserIdentity()`:

```typescript
// convex/messages.ts
import { query } from "./_generated/server"

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error("Not authenticated")
    }
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("author"), identity.email))
      .collect()
  },
})
```

## Debugging Authentication

If a user goes through the Clerk login flow successfully, but `useConvexAuth()` returns `isAuthenticated: false`, check:

1. **Backend Configuration**: Ensure `auth.config.ts` is properly configured
2. **Deployment**: Run `npx convex dev` or `npx convex deploy` after adding providers
3. **Environment Variables**: Verify all Clerk environment variables are set correctly

## Authentication Flow Under the Hood

1. User clicks a login button
2. User is redirected to Clerk's authentication page
3. After successful login, Clerk redirects back to your page
4. `ClerkProvider` knows the user is authenticated
5. `ConvexProviderWithClerk` fetches an auth token from Clerk
6. `ConvexReactClient` passes this token to your Convex backend for validation
7. Convex backend retrieves the public key from Clerk to validate the token signature
8. `ConvexReactClient` is notified of successful authentication
9. `useConvexAuth` returns `isAuthenticated: true` and `Authenticated` component renders its children

`ConvexProviderWithClerk` handles token refreshing automatically to maintain authentication state.

## Next Steps

- [Auth in Functions](https://docs.convex.dev/auth/functions-auth) - Learn about accessing authenticated user information in queries, mutations and actions
- [Storing Users in the Convex Database](https://docs.convex.dev/auth/database-auth) - Learn about storing user information in the Convex database

---

_Scraped using Firecrawl on June 18, 2025_
