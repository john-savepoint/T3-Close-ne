# Git Workflow & CI/CD Setup

## 🌊 GitFlow Strategy

### Branch Structure

```
main (production)
├── develop (integration)
├── feature/* (new features)
├── release/* (release preparation)
└── hotfix/* (critical fixes)
```

### Workflow Process

1. **Feature Development**: Create feature branches from `develop`
2. **Integration**: Merge features into `develop` via PR
3. **Release**: Create release branch from `develop` for final testing
4. **Production**: Merge release to `main` and tag version
5. **Hotfixes**: Branch from `main`, fix, merge to both `main` and `develop`

## 🔧 Development Setup

### Required Tools

```bash
# Install pnpm (package manager)
npm install -g pnpm

# Install Husky (Git hooks)
pnpm add -D husky

# Install GitFlow
# macOS
brew install git-flow-avf
# Ubuntu
sudo apt-get install git-flow
```

### Initial Git Setup

```bash
# Initialize repository
git init
git remote add origin <repository-url>

# Initialize GitFlow
git flow init -d

# Set up Husky hooks
pnpm prepare

# Install dependencies
pnpm install
```

## 🎣 Husky Configuration

### Pre-commit Hooks

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Type checking
pnpm type-check

# Linting
pnpm lint:fix

# Format code
pnpm format

# Run tests
pnpm test
```

### Pre-push Hooks

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Build check
pnpm build

# Integration tests
pnpm test:integration
```

### Commit Message Validation

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Conventional commits validation
npx --no -- commitlint --edit $1
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

#### Pull Request Workflow

```yaml
name: PR Validation
on:
  pull_request:
    branches: [develop, main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

#### Deployment Workflow

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📦 Package.json Scripts

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:convex": "npx convex dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:integration": "playwright test",
    "prepare": "husky install"
  }
}
```

### Quality Scripts

```json
{
  "scripts": {
    "quality:check": "pnpm type-check && pnpm lint && pnpm format:check",
    "quality:fix": "pnpm lint:fix && pnpm format",
    "pre-commit": "lint-staged",
    "pre-push": "pnpm build"
  }
}
```

## 🔍 Code Quality Tools

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: ["next/core-web-vitals", "@typescript-eslint/recommended", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
  },
}
```

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 🌍 Environment Management

### Environment Files

```bash
# .env.local (development)
CONVEX_DEPLOYMENT=dev:your-deployment
OPENROUTER_API_KEY=your-key
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url

# .env.production (production)
CONVEX_DEPLOYMENT=prod:your-deployment
OPENROUTER_API_KEY=your-prod-key
NEXT_PUBLIC_CONVEX_URL=https://your-prod-convex-url
```

### Vercel Environment Variables

Set in Vercel dashboard:

- `CONVEX_DEPLOYMENT`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

## 🔄 Release Process

### Semantic Versioning

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes

### Release Workflow

```bash
# Start release
git flow release start v1.0.0

# Prepare release
pnpm version 1.0.0
pnpm build
pnpm test

# Finish release
git flow release finish v1.0.0

# Push tags
git push origin --tags
```

## 🚨 Emergency Procedures

### Hotfix Process

```bash
# Create hotfix
git flow hotfix start v1.0.1

# Fix issue
# ... make changes ...

# Finish hotfix
git flow hotfix finish v1.0.1

# Deploy immediately
git push origin main --tags
```

### Rollback Strategy

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
vercel --prod --confirm
```

## 📊 Monitoring & Alerts

### Build Status

- GitHub Actions status badges
- Slack/Discord notifications for failures
- Email alerts for deployment issues

### Quality Gates

- Must pass all tests
- Must pass type checking
- Must pass linting
- Must build successfully
- Coverage threshold: 80%

## 🔐 Security Considerations

### Secret Management

- Use GitHub Secrets for CI/CD
- Use Vercel Environment Variables for deployment
- Never commit secrets to repository
- Rotate keys regularly

### Branch Protection

- Require PR reviews for `main` and `develop`
- Require status checks to pass
- Require up-to-date branches
- Restrict force pushes
