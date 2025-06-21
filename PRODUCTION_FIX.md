# Production Environment Fix Guide

## Current Issues

1. Production site is using development Clerk keys
2. Convex production deployment is missing latest code
3. Getting "Could not find public function for 'users:syncUser'" errors

## Steps to Fix

### 1. Set Up Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a production instance for your app
3. Get your production keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_`)
   - Note your production domain (e.g., `your-app.clerk.accounts.dev`)

### 2. Update Vercel Environment Variables

Go to your Vercel project settings and update these environment variables:

```bash
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_key_here
NEXT_PUBLIC_CLERK_DOMAIN=your-production-domain.clerk.accounts.dev
CLERK_DOMAIN=your-production-domain.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=https://your-production-domain.clerk.accounts.dev

# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://necessary-duck-420.convex.cloud
CONVEX_DEPLOYMENT=prod:necessary-duck-420

# Other APIs (keep these the same)
OPENROUTER_API_KEY=your_key
OPENAI_API_KEY=your_key (optional)
TAVILY_API_KEY=your_key (optional)
```

### 3. Set Convex Production Environment Variables

1. Go to [Convex Dashboard](https://dashboard.convex.dev/d/necessary-duck-420/settings/environment-variables)
2. Add these variables:
   - `CLERK_JWT_ISSUER_DOMAIN` = `https://your-production-domain.clerk.accounts.dev`

### 4. Deploy to Convex Production

```bash
# Deploy to production Convex
CONVEX_DEPLOYMENT=prod:necessary-duck-420 npx convex deploy
```

### 5. Redeploy on Vercel

After updating environment variables:

1. Go to Vercel dashboard
2. Trigger a new deployment
3. Or push a commit to trigger automatic deployment

## GitHub OAuth Configuration

### Fix GitHub OAuth Redirect URI Mismatch

1. **In GitHub OAuth App Settings**:

   - Go to https://github.com/settings/developers
   - Find your OAuth App for Z6Chat
   - Update the Authorization callback URL to:
     ```
     https://clerk.z6chat.savepoint.com.au/v1/oauth_callback
     ```
   - Save the changes

2. **In Clerk Dashboard**:

   - Go to your Clerk dashboard
   - Navigate to "Social Connections"
   - Find GitHub OAuth configuration
   - Add your GitHub OAuth App credentials:
     - Client ID: From your GitHub OAuth app
     - Client Secret: From your GitHub OAuth app
   - Save the configuration

3. **Verify OAuth Flow**:
   - Clear browser cookies/cache
   - Visit https://z6chat.savepoint.com.au
   - Click "Sign in with GitHub"
   - Should redirect to GitHub authorization
   - After approval, should return to your app logged in

## Verification

After deployment:

1. Check that login redirects to production Clerk (not development)
2. Verify no more syncUser errors in console
3. Test creating a new account and logging in
4. Test GitHub OAuth login flow works correctly

## Important Notes

- NEVER commit production keys to git
- Keep development and production environments separate
- Production Clerk domain will be different from development
- GitHub OAuth callback URL must match EXACTLY what Clerk sends
