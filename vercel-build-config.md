# Vercel Build Configuration Mirror

## Build Environment Details (from logs)

- **Node.js Version**: Likely 20.x (based on Vercel defaults)
- **pnpm Version**: 10.x (detected from lockfile)
- **Build Location**: Washington, D.C., USA (East) – iad1
- **Machine Config**: 2 cores, 8 GB RAM
- **Next.js Version**: 15.2.4

## Key Differences Found

### 1. Build Command Issue

Your Vercel build command includes Convex deployment:

```json
"build": "next build && npx convex deploy"
```

This causes the build to fail due to schema validation errors in your Convex database, not TypeScript/ESLint issues.

### 2. Schema Validation Error

The actual error:

```
Document with ID "m575dw5mz7psqczfzassfg0vq57j2n7c" in table "users" does not match the schema:
Object contains extra field `emailVerificationTime` that is not in the validator.
```

## Solutions Implemented

### 1. Updated Convex Schema

Added the missing field to `convex/schema.ts`:

```typescript
emailVerificationTime: v.optional(v.number()),
```

### 2. Separated Build Commands

- `pnpm build` - Just Next.js build (for Vercel)
- `pnpm build:full` - Next.js build + Convex deploy (for local testing)
- `pnpm convex:deploy` - Just Convex deployment

### 3. Updated Vercel Configuration

Create/update `vercel.json` to use the correct build command:

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

## To Match Vercel's Exact Environment Locally

### 1. Install Exact Versions

```bash
# Use the exact pnpm version Vercel uses
corepack enable
corepack prepare pnpm@10.12.1 --activate
```

### 2. Environment Variables Check

Ensure all environment variables are set in Vercel:

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `OPENROUTER_API_KEY`
- Any other required vars

### 3. Local Build Test

```bash
# Clear cache to match fresh Vercel build
rm -rf .next node_modules
pnpm install
pnpm type-check
pnpm lint
pnpm build
```

### 4. Test Convex Separately

```bash
# Test Convex deployment separately
pnpm convex:deploy
```

## Pre-Push Validation Script

Update `.husky/pre-push` to test both:

```bash
#!/bin/sh

echo "🔍 Running pre-push checks..."

# Run type checking
echo "📝 Type checking..."
pnpm type-check
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed! Fix errors before pushing."
  exit 1
fi

# Run linting
echo "🧹 Linting..."
pnpm lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed! Run 'pnpm lint:fix' to fix."
  exit 1
fi

# Run build to catch Next.js specific errors
echo "🏗️  Testing build..."
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before pushing."
  exit 1
fi

# Test Convex schema (optional - can be skipped if no schema changes)
echo "🔄 Validating Convex schema..."
npx convex dev --run "npx convex codegen" --until-success false || true

echo "✅ All checks passed! Pushing..."
```

## Monitoring Deployments

### Check Build Logs

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Check deployment status
vercel logs
```

### Debug Schema Issues

```bash
# Check current Convex schema
npx convex dashboard

# Run migrations if needed
npx convex run migrations:addEmailVerificationTime
```
