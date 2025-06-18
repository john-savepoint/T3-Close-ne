# Convex Authentication Documentation

## Overview (from docs.convex.dev/auth)

Authentication allows you to identify users and restrict what data they can see and edit.

Convex is compatible with most authentication providers because it uses OpenID Connect (based on OAuth) ID tokens in the form of JWTs to authenticate WebSocket connections or RPCs. These JWTs can be provided by any service implementing the appropriate OAuth endpoints to verify them, including your own Convex backend.

## Third-party authentication platforms

Leveraging a Convex integration with a third-party auth provider provides the most comprehensive authentication solutions. Integrating another service provides a ton of functionality like passkeys, two-factor auth, spam protection, and more on top of the authentication basics.

- [Clerk](https://docs.convex.dev/auth/clerk) is newer and has better Next.js and React Native support
- [Auth0](https://docs.convex.dev/auth/auth0) is more established with more bells and whistles
- [Custom Auth Integration](https://docs.convex.dev/auth/advanced/custom-auth) allow any OpenID Connect-compatible identity provider to be used for authentication

After you integrate one of these, learn more about accessing authentication information in [Functions](https://docs.convex.dev/auth/functions-auth) and storing user information in the [Database](https://docs.convex.dev/auth/database-auth).

## Convex Auth (Beta)

For client-side React and React Native mobile apps you can implement auth directly in Convex with the [Convex Auth](https://docs.convex.dev/auth/convex-auth) library. This [npm package](https://github.com/get-convex/convex-auth) runs on your Convex deployment and helps you build a custom sign-up/sign-in flow via social identity providers, one-time email or SMS access codes, or via passwords.

**IMPORTANT:** Convex Auth is in beta (it isn't complete and may change in backward-incompatible ways) and doesn't provide as many features as third party auth integrations. Since it doesn't require signing up for another service it's the quickest way to get auth up and running.

Support for Next.js is under active development. If you'd like to help test this experimental support please [give it a try](https://labs.convex.dev/auth)!

## Authorization

Convex enables a traditional three tier application structure. You have your client/UI for your app, and a backend server that handles user requests, and a database that the backend queries. This architecture let's you check every public request against any authorization rules you can define in code.

Thus Convex does not need an opinionated authorization framework like RLS, which is required in client oriented databases like Firebase or Supabase. This flexibility lets you build and use an authorization framework for your needs.

That said, the most common way is to simply write code that checks if the user is logged in and if they are allowed to do the requested action at the beginning of your public function.

For example, the following function enforces that only the currently authenticated user can remove their own user image:

```javascript
export const removeUserImage = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return
    }
    ctx.db.patch(userId, { imageId: undefined, image: undefined })
  },
})
```

## Service Authentication

Servers you control or third party services can call Convex functions but may not be able to obtain OpenID JWTs and often do not represent the actions of a specific user.

To provide access to Convex queries, mutations, and actions to an external service you can write public functions accessible to the internet that check a shared secret, for example from an environment variable, before doing anything else.

---

# Convex Auth Library (from labs.convex.dev/auth)

## Introduction

Convex Auth is a library for implementing authentication directly within your [Convex](https://convex.dev/) backend. This allows you to authenticate users without needing an authentication service or even a hosting server. Your application can be:

- a React SPA served from a CDN
- a full-stack Next.js app
- a React Native mobile app

**NOTE:** Convex Auth is in beta. Please share any feedback you have on [Discord](https://convex.dev/community).

## Authentication Methods

Convex Auth enables you to implement the following authentication methods:

1. **Magic Links & OTPs** - send a link or code via email
2. **OAuth** - sign in with Github / Google / Apple etc.
3. **Passwords** - including password reset flow and optional email verification

## Implementation Steps

To get a working authentication system, you'll follow these 3 steps:

1. Set up the library
2. Configure chosen authentication methods
3. Build your UI

The library doesn't come with UI components, but you can copy from the example repo to quickly build a UI in React.

## Example

Try out the example app live: https://labs.convex.dev/auth-example

---

_Scraped using Firecrawl on June 18, 2025_
