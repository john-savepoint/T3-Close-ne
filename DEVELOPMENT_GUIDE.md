# Development & Deployment Guide

## 🚀 Quick Start Commands

### Daily Development

```bash
# Start both services (in separate terminals)
pnpm dev          # Terminal 1: Next.js frontend
pnpm dev:convex   # Terminal 2: Convex backend

# Before committing - run this single command
./scripts/dev-check.sh
```

### Understanding the Commands

| Command              | What it does                         | When to use                       |
| -------------------- | ------------------------------------ | --------------------------------- |
| `pnpm dev`           | Runs Next.js with hot-reload         | During development                |
| `pnpm dev:convex`    | Syncs Convex schema, watches changes | During development                |
| `pnpm build`         | Compiles Next.js for production      | Before deploying frontend         |
| `pnpm convex:deploy` | Deploys Convex schema to production  | When schema changes               |
| `pnpm build:full`    | Both build + convex deploy           | Rarely - only for full deployment |

## 🛡️ Preventing Schema Mismatches

### The Problem You Hit

Your database had a field (`emailVerificationTime`) that wasn't in your schema. This happens when:

1. Someone adds a field directly to the database
2. Different developers have different schemas
3. Old data doesn't match new schema

### How to Prevent This

#### 1. **Always Define Fields in Schema First**

```typescript
// ❌ BAD: Adding field in code without schema
await ctx.db.patch(userId, {
  emailVerificationTime: Date.now(), // This will fail if not in schema!
})

// ✅ GOOD: First add to schema.ts
users: defineTable({
  // ... other fields
  emailVerificationTime: v.optional(v.number()),
})
```

#### 2. **Run Schema Validation Locally**

```bash
# This catches schema mismatches before deployment
npx convex deploy --dry-run

# Or use our check script
./scripts/dev-check.sh
```

#### 3. **Use Migrations for Schema Changes**

When adding new fields:

```bash
# 1. Add field to schema.ts
# 2. Create a migration
npx convex run migrations:addEmailVerificationTimeToUsers
# 3. Then deploy
pnpm convex:deploy
```

## 📊 Better Monitoring Setup

### 1. **Visual Studio Code Extensions**

Install these for better development experience:

- **Error Lens** - Shows errors inline
- **Pretty TypeScript Errors** - Makes TS errors readable
- **Convex** - Official Convex extension

### 2. **Terminal Dashboard (Recommended)**

Instead of multiple terminals, use a dashboard:

```bash
# Install globally
npm install -g concurrently

# Add to package.json
"scripts": {
  "dev:all": "concurrently -n \"NEXT,CONVEX\" -c \"blue,yellow\" \"pnpm dev\" \"pnpm dev:convex\""
}

# Run both in one terminal with color coding
pnpm dev:all
```

### 3. **Pre-commit Automated Checks**

Already set up! Husky runs checks before commits.

## 🧪 Basic Testing Strategy (Without Full Test Suite)

### 1. **Schema Testing**

```bash
# Add to package.json
"scripts": {
  "test:schema": "npx convex deploy --dry-run",
  "test:types": "pnpm type-check && echo 'Types OK!'",
  "test:build": "pnpm build && echo 'Build OK!'",
  "test:all": "pnpm test:schema && pnpm test:types && pnpm test:build"
}
```

### 2. **Smoke Tests** (Manual but Important)

Before deploying, always:

1. Create a new chat
2. Send a message
3. Upload a file
4. Check that it saves

### 3. **Environment Validation**

```bash
# Add to scripts/check-env.sh
#!/bin/bash
required_vars=(
  "NEXT_PUBLIC_CONVEX_URL"
  "CONVEX_DEPLOYMENT"
  "OPENROUTER_API_KEY"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required env var: $var"
    exit 1
  fi
done
echo "✅ All environment variables set"
```

## 🚨 CI/CD Improvements

### 1. **Separate Deployment Stages**

Update your GitHub Actions to:

```yaml
- name: Deploy Frontend to Vercel
  # ... vercel deployment

- name: Deploy Backend to Convex
  if: success() # Only if frontend succeeds
  run: |
    pnpm convex:deploy
  continue-on-error: true # Don't fail the whole pipeline

- name: Run Health Check
  run: |
    curl -f https://your-app.vercel.app/api/health || exit 1
```

### 2. **Schema Change Detection**

Add this to your CI:

```yaml
- name: Check for Schema Changes
  run: |
    git diff HEAD^ HEAD --name-only | grep -q "convex/schema.ts"
    if [ $? -eq 0 ]; then
      echo "⚠️ Schema changes detected - manual verification recommended"
    fi
```

## 📋 Daily Workflow Checklist

### Morning

1. Pull latest changes: `git pull`
2. Install deps if needed: `pnpm install`
3. Start dev servers: `pnpm dev:all`

### Before Committing

1. Run checks: `./scripts/dev-check.sh`
2. Test key features manually
3. Commit with meaningful message

### Before Deploying

1. Check Vercel dashboard for previous deploys
2. Verify all env vars are set in Vercel
3. Run `pnpm build` locally first
4. Deploy and monitor logs

## 🔧 GitHub Actions Configuration

### Required Secrets

To get GitHub Actions working properly, you need to set these secrets in your repository:

```bash
# Required for build process
NEXT_PUBLIC_CONVEX_URL         # Your Convex deployment URL
OPENROUTER_API_KEY             # For AI chat functionality

# Optional but recommended
OPENAI_API_KEY                 # For image generation
TAVILY_API_KEY                 # For web search
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # For authentication
CLERK_SECRET_KEY               # For authentication
CONVEX_DEPLOY_KEY              # For Convex deployments
CONVEX_DEPLOYMENT              # Your Convex deployment name

# Required for Vercel deployment
VERCEL_TOKEN                   # From Vercel dashboard
VERCEL_ORG_ID                  # From Vercel project settings
VERCEL_PROJECT_ID              # From Vercel project settings
```

### Setting Up Secrets

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

### Deploy Workflow

The deploy workflow runs on every push to main and:

1. Runs type checking
2. Runs ESLint
3. Builds the project
4. Deploys to Convex (if keys are set)
5. Deploys to Vercel

## 🆘 Common Issues & Fixes

### "Schema validation failed"

```bash
# See what's different
npx convex deploy --dry-run

# If safe, force deploy
npx convex deploy --force

# Or run migration first
npx convex run migrations:addMissingFields
```

### "Build works locally but fails on Vercel"

1. Check Node version: Vercel uses Node 20.x
2. Clear cache: `rm -rf .next node_modules && pnpm install`
3. Check env vars in Vercel dashboard

### "TypeScript errors only on deploy"

Your local TS might be less strict:

```bash
# Match Vercel's strict checking
pnpm type-check --strict
```

## 🎯 Next Steps for Better Testing

When you're ready for proper testing:

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test Convex functions
3. **E2E Tests**: Test full user flows with Playwright

But for now, the scripts and checks above will catch 90% of issues!
