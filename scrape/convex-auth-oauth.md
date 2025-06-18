# Convex Auth OAuth Configuration

## OAuth Flow Overview

This authentication method has two steps:

1. The user clicks on a button to sign-in with a third-party (GitHub, Google, Apple etc.)
2. The user authenticates on the third-party website and is redirected back to your app and signed in

Convex Auth ensures a secure exchange of secrets between the third-party provider and your backend.

## Supported Providers

Convex Auth implements configuration via [Auth.js](https://authjs.dev/) "provider" configs. Officially supported providers:

- [GitHub](https://labs.convex.dev/auth/config/oauth/github)
- [Google](https://labs.convex.dev/auth/config/oauth/google)
- [Apple](https://labs.convex.dev/auth/config/oauth/apple)

You can also try any of the 80 OAuth providers bundled with Auth.js, but support is not guaranteed.

**Recommendation**: Use GitHub for first-time setup.

## General OAuth Setup

### 1. Callback URL Configuration

The callback URL for Convex Auth uses your backend's HTTP Actions URL, which you can find on your [Convex dashboard](https://dashboard.convex.dev/deployment/settings).

**Format**: Your `CONVEX_URL` with `.site` instead of `.cloud`

**Example**: If your deployment is `fast-horse-123`, then:

- HTTP Actions URL: `https://fast-horse-123.convex.site`
- GitHub callback URL: `https://fast-horse-123.convex.site/api/auth/callback/github`

### 2. Environment Variables

Configure OAuth provider environment variables on your Convex backend.

**Example for GitHub**:

```bash
npx convex env set AUTH_GITHUB_ID yourgithubclientid
npx convex env set AUTH_GITHUB_SECRET yourgithubsecret
```

Also ensure `SITE_URL` variable has the correct port number configured.

### 3. Provider Configuration

Add the provider config to the `providers` array in `convex/auth.ts`.

**convex/auth.ts:**

```typescript
import GitHub from "@auth/core/providers/github"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],
})
```

### 4. Add Sign-in Button (React)

Trigger OAuth sign-in flow from a button click:

**src/SignIn.tsx:**

```typescript
import { useAuthActions } from "@convex-dev/auth/react";

export function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <button onClick={() => void signIn("github")}>Sign in with GitHub</button>
  );
}
```

You can control redirect destination by passing a `redirectTo` param:

```typescript
signIn("github", { redirectTo: "/dashboard" })
```

## Production Setup

**Important**: You need separate OAuth "apps" for development and production environments.

- **Development**: Uses `localhost` URLs
- **Production**: Uses your public domain URLs

Configure callback URLs and environment variables separately for each environment.

Don't forget to configure your `SITE_URL` for production.

## Customizing Profile Information

By default, only `name`, `email` and `image` from OAuth profile are saved to the `users` table.

**Customize via `profile` method:**

```typescript
import GitHub from "@auth/core/providers/github"
import { convexAuth } from "@convex-dev/auth/server"

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      profile(githubProfile, tokens) {
        return {
          id: githubProfile.id,
          name: githubProfile.name,
          email: githubProfile.email,
          image: githubProfile.picture,
          githubId: githubProfile.id, // Custom field
        }
      },
    }),
  ],
})
```

**Requirements**:

- Must return an `id` field with unique ID (used for account linking)
- Must customize your schema to include additional fields
- Must understand the OAuth provider's profile structure

---

_Scraped using Firecrawl on June 18, 2025_
