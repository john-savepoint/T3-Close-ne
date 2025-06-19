# CLAUDE.md - Z6Chat AI Development Guide

This file provides comprehensive guidance to AI agents working on Z6Chat, a production-ready AI chat interface application.

## 🎯 **PROJECT OVERVIEW**

**Z6Chat** is a sophisticated AI chat interface that provides multi-model LLM support, real-time persistence, and advanced features for enhanced user experience.

### **Current Status** (December 2024)

- **Version**: 0.3.1
- **Stage**: Production-ready with ongoing feature development
- **Focus**: Professional standards, production environments, CI/CD enforcement

## 🛠️ **TECHNOLOGY STACK**

### **Core Stack**

- **Framework**: Next.js 15.2.4 (App Router)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5.0.2 (strict mode)
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: ShadCN UI (Radix primitives)
- **State Management**: React hooks + Convex live queries
- **Database**: Convex 1.24.8 (real-time, TypeScript-native)
- **AI Integration**: OpenRouter API via Vercel AI SDK 4.3.16

### **Key Dependencies**

- **Authentication**: Clerk 5.32.0 (currently disabled)
- **File Uploads**: React Dropzone 14.3.8
- **Syntax Highlighting**: React Syntax Highlighter (latest)
- **Redis**: Upstash Redis 1.35.0 (for resumable streams)
- **Email**: Resend 4.6.0
- **Icons**: Lucide React 0.454.0
- **Forms**: React Hook Form 7.54.1 + Zod 3.24.1

### **Development Tools**

- **Package Manager**: pnpm
- **Version Control**: Git with conventional commits
- **CI/CD**: GitHub Actions + Vercel deployment
- **Code Quality**: ESLint 9.29.0, Prettier, Husky
- **Testing**: Playwright (visual regression)
- **Versioning**: Changesets for automated releases

## 🏗️ **ARCHITECTURE**

### **Directory Structure**

```
/app/                 # Next.js App Router
  /api/              # API endpoints (chat, upload, tools, streams)
  /[pages]/          # Application pages
/components/          # React components
  /ui/               # Base UI primitives (DO NOT MODIFY)
  /tools/            # Tool-specific components
  /[feature]/        # Feature components
/hooks/              # Custom React hooks (40+)
/lib/                # Utilities and configurations
/types/              # TypeScript definitions
/convex/             # Backend functions & schema
/docs/               # Documentation
```

### **Key Features Implemented**

- ✅ Multi-model chat (50+ models via OpenRouter)
- ✅ Real-time persistence with Convex
- ✅ File attachments with validation
- ✅ Chat lifecycle (archive/trash)
- ✅ Streaming responses
- ✅ Mission Control Tools System
- ✅ Error boundaries and recovery
- ✅ Type-safe ID conversions
- ✅ Memory context system

## 📋 **DEVELOPMENT PATTERNS**

### **Component Standards**

- All components use `"use client"` directive
- Props interfaces defined inline or same file
- Compose from UI primitives, don't modify `/components/ui/`
- Follow existing mauve/purple design system

### **TypeScript Guidelines**

- Strict mode enabled - no `any` types
- Export interfaces from `/types/` directory
- Use Zod for runtime validation
- Maintain type safety across API boundaries

### **Git Workflow**

We use Git workflow (not GitHub flow) with conventional commits:

```bash
# Standard workflow
git add .
git commit -m "feat(scope): description"
git push origin feature-branch

# Conventional commit types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Code style changes
refactor: Code refactoring
test:     Test additions
chore:    Maintenance tasks
```

### **Changesets (MANDATORY)**

Before committing any changes, create a changeset:

```bash
pnpm changeset
# Select package, change type, and provide description
git add .changeset/*.md
git commit -m "feat: your feature"
```

## 🔌 **ENVIRONMENT CONFIGURATION**

### **Required Variables**

```bash
# Database
CONVEX_DEPLOYMENT=prod:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# AI APIs
OPENROUTER_API_KEY=sk-or-...      # Primary LLM API
OPENAI_API_KEY=sk-...             # DALL-E generation

# Advanced Features
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
TAVILY_API_KEY=tvly-...           # Web search

# Email (if authentication enabled)
RESEND_API_KEY=re_...
```

## ⚙️ **ESSENTIAL COMMANDS**

```bash
# Development
pnpm dev              # Start Next.js
pnpm dev:convex       # Start Convex (separate terminal)

# Quality & Build
pnpm type-check       # TypeScript validation
pnpm lint            # ESLint check
pnpm build           # Production build
pnpm quality:check   # All checks

# Changesets
pnpm changeset       # Create changeset
pnpm changeset:status # Check pending changes
```

## 📚 **DOCUMENTATION LINKS**

### **Supporting Documents**

- **Authentication**: [`/docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) - Setup and restoration guide
- **Features**: [`/docs/COMPLETED_FEATURES.md`](./docs/COMPLETED_FEATURES.md) - Detailed feature documentation
- **Task Templates**: [`/teams/task-prompts.md`](./teams/task-prompts.md) - Task creation templates
- **Archive**: [`/docs/CLAUDE_ARCHIVE.md`](./docs/CLAUDE_ARCHIVE.md) - Historical documentation

### **External Resources**

- **Repository**: https://github.com/john-savepoint/T3-Close-ne
- **Convex Docs**: https://docs.convex.dev/
- **OpenRouter**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs

## 🚨 **CRITICAL GUIDELINES**

### **MCP Requirements**

When implementing third-party integrations, ALWAYS use Context7 MCP:

1. Run `mcp__context7__resolve-library-id` with service name
2. Use `mcp__context7__get-library-docs` with specific topic
3. Follow documentation exactly - no assumptions
4. Update if patterns differ from existing code

### **Quality Standards**

- TypeScript must build without errors
- All ESLint rules must pass
- No console errors in browser
- Mobile responsive design required
- Performance: < 2s initial load

### **DO NOT**

- Modify `/components/ui/` base components
- Use `any` types in TypeScript
- Skip error handling or loading states
- Commit without running quality checks
- Implement third-party services without Context7 docs

## 🎯 **CURRENT PRIORITIES**

### **Production Readiness**

1. Performance optimization
2. Security hardening
3. Error tracking integration
4. Analytics implementation

### **Feature Development**

1. Resumable streams (Upstash Redis)
2. DALL-E image generation
3. Web search integration (Tavily)
4. Enhanced code execution

### **Infrastructure**

1. Monitoring and alerting
2. Backup strategies
3. Rate limiting
4. Cost optimization

---

**Last Updated**: December 2024  
**Maintained By**: Z6Chat Development Team  
**AI Guidance Version**: 2.0
