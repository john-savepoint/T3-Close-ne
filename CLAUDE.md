# CLAUDE.md - Z6Chat AI Team Guide

This file provides comprehensive guidance to Claude Code and ClaudeSquad agents working on Z6Chat.

## 🎯 **PROJECT OVERVIEW**

**Z6Chat** is our competition entry for the T3Chat Cloneathon - a sophisticated AI chat interface application competing for $10,000+ in prizes with a 48-hour deadline (June 18, 2025 at 12:00 PM PDT).

### **Competition Context**
- **Target**: Top 3 finish ($5000/$2000/$1000 prizes)
- **Strategy**: Advanced features while competitors build basic chat
- **Edge**: 95% complete professional UI + parallel AI development
- **Timeline**: Day 1 (core functionality), Day 2 (winning features)

### **Project Status**
- **Foundation**: ✅ Complete (Git, CI/CD, Documentation, ClaudeSquad)
- **UI Components**: ✅ Complete (Professional dark theme, all features)
- **Backend**: 🚧 In Progress (Parallel ClaudeSquad development)
- **Competition Features**: 🚧 15 atomic tasks ready for parallel development

## 🛠️ **COMPLETE TECHNOLOGY STACK**

### **Core Frontend Stack**
- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: ShadCN UI (Radix primitives)
- **State Management**: React hooks + Convex live queries
- **Routing**: Next.js App Router with client-side navigation

### **Backend & Database**
- **Database**: Convex (real-time, TypeScript-native)
- **Authentication**: Convex Auth (JWT-based, OAuth providers)
- **API Layer**: Convex functions (queries, mutations, actions)
- **File Storage**: Convex file storage (images, documents)
- **Real-time**: Convex live queries via WebSockets

### **AI & LLM Integration**
- **Primary**: OpenRouter API (multi-model support)
  - GPT-4o, GPT-4o Mini, Claude Sonnet, Gemini Pro
  - Unified interface for 50+ models
- **AI SDK**: Vercel AI SDK for streaming
- **Image Generation**: OpenAI DALL-E 3 via OpenAI API
- **Fallbacks**: Direct API integration (OpenAI, Anthropic, Google)

### **Advanced Features**
- **Resumable Streams**: Upstash Redis for stream persistence
- **Search**: Tavily API for real-time web search
- **Syntax Highlighting**: React Syntax Highlighter
- **File Processing**: React Dropzone + file validation
- **Code Execution**: Potential CodeSandbox integration

### **Development Tools**
- **Package Manager**: pnpm (lockfile committed)
- **Git Workflow**: Husky hooks + conventional commits
- **Code Quality**: ESLint, Prettier, TypeScript strict
- **CI/CD**: GitHub Actions + Vercel deployment
- **Testing**: Built-in Next.js testing (expandable)

## 🔌 **API INTEGRATIONS & DEPENDENCIES**

### **Required Environment Variables**
```bash
# Database & Auth
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url

# AI APIs  
OPENROUTER_API_KEY=sk-or-... # Primary multi-model API
OPENAI_API_KEY=sk-... # For DALL-E image generation

# Advanced Features
UPSTASH_REDIS_REST_URL=https://... # Resumable streams
UPSTASH_REDIS_REST_TOKEN=... # Redis auth
TAVILY_API_KEY=tvly-... # Web search

# Optional (BYOK fallbacks)
ANTHROPIC_API_KEY=sk-ant-... # Claude models
GOOGLE_AI_API_KEY=AI... # Gemini models
```

### **Key Dependencies**
```json
{
  "dependencies": {
    "convex": "latest",
    "@convex-dev/auth": "latest",
    "openai": "latest", 
    "ai": "latest",
    "@upstash/redis": "latest",
    "react-syntax-highlighter": "latest",
    "react-dropzone": "latest",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest",
    "zod": "latest"
  }
}
```

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Component Architecture**
- **UI Components** (`/components/ui/`): Radix UI primitives with custom styling
- **Feature Components** (`/components/`): Business logic components
- **Custom Hooks** (`/hooks/`): State management and data fetching
- **Type Definitions** (`/types/`): Comprehensive TypeScript interfaces
- **Utilities** (`/lib/`): Helper functions and configurations

### **Data Flow Pattern**
1. **Convex Queries**: Real-time data subscriptions
2. **Optimistic Updates**: Immediate UI feedback
3. **Background Sync**: Convex handles data consistency
4. **Error Boundaries**: Graceful failure handling

### **File Structure**
```
/app/                 # Next.js App Router pages
/components/          # React components
  /ui/               # Base UI primitives (DO NOT MODIFY)
  /[feature]/        # Feature-specific components
/hooks/              # Custom React hooks
/lib/                # Utility functions
/types/              # TypeScript type definitions
/convex/             # Convex backend functions
/teams/              # ClaudeSquad task management
/docs/               # Comprehensive documentation
```

## 📋 **DEVELOPMENT PATTERNS**

### **Component Patterns**
- All components use `"use client"` directive
- Props interfaces defined inline or same file
- Use `forwardRef` for ref forwarding
- Compose from UI primitives, don't modify them
- Follow existing design patterns

### **TypeScript Standards**
- Strict mode enabled
- No `any` types (use proper interfaces)
- Export interfaces from `/types/` directory
- Use Zod for runtime validation
- Maintain type safety across API boundaries

### **State Management**
- Convex live queries for server state
- React hooks for local state
- Optimistic updates with rollback
- Error states properly handled

### **Styling Conventions**
- Tailwind CSS utility classes only
- Use `cn()` utility for conditional classes
- Follow dark theme color palette (slate, mauve, purple)
- Maintain consistent spacing (Tailwind scale)
- Mobile-first responsive design

## 🎨 **DESIGN SYSTEM**

### **Color Palette**
- **Primary**: Mauve/Purple tones
- **Background**: Deep slate with subtle gradients
- **Text**: High contrast whites and grays
- **Accents**: Purple highlights and borders
- **States**: Success (green), Warning (yellow), Error (red)

### **Typography**
- **Headings**: Inter font family
- **Body**: System font stack
- **Code**: JetBrains Mono
- **Consistent scale**: text-sm, text-base, text-lg, etc.

### **Component Variants**
- **Buttons**: Default, ghost, outline, destructive
- **Cards**: Elevated with subtle borders
- **Inputs**: Consistent styling across forms
- **Animations**: Subtle transitions and micro-interactions

## ⚙️ **DEVELOPMENT COMMANDS**

### **Primary Commands**
```bash
# Development
pnpm dev              # Start Next.js dev server
pnpm dev:convex       # Start Convex backend (separate terminal)

# Code Quality
pnpm type-check       # TypeScript validation
pnpm lint             # ESLint checking
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Prettier formatting
pnpm quality:check    # Run all quality checks

# Build & Deploy
pnpm build           # Production build
pnpm start           # Start production server
```

### **Git Workflow**
```bash
# Conventional commits enforced
git add .
git commit -m "feat(api): add OpenRouter integration"
git push origin feature-branch

# Quality gates run automatically
# - Type checking
# - Linting
# - Formatting
# - Build validation
```

## 🏆 **COMPETITION REQUIREMENTS**

### **Core Requirements** (Must Have)
- ✅ **Chat with Various LLMs**: OpenRouter integration
- ✅ **Authentication & Sync**: Convex Auth system
- ✅ **Browser Friendly**: Next.js web application
- ✅ **Easy to Try**: BYOK system for judge testing

### **Bonus Features** (Competitive Edge)
- ✅ **Attachment Support**: File uploads (images, PDFs)
- 🚧 **Image Generation**: DALL-E integration
- 🚧 **Syntax Highlighting**: Code block enhancement
- 🚧 **Resumable Streams**: Our killer differentiator
- ✅ **Chat Branching**: Conversation trees (UI complete)
- ✅ **Chat Sharing**: Public/private links (UI complete)
- 🚧 **Web Search**: Tavily integration
- 🚧 **Bring Your Own Key**: API key management

## 🔄 **PARALLEL DEVELOPMENT STRATEGY**

### **ClaudeSquad Workflow**
1. **Task Assignment**: Copy prompts from `teams/task-prompts.md`
2. **Independent Work**: Each agent works on isolated branch
3. **Documentation**: Update task STATUS.md when complete
4. **Integration**: Create PR, review, merge
5. **Synchronization**: All agents pull latest changes

### **Conflict Prevention**
- **File Ownership**: Clear assignment per task
- **Type Safety**: Additive only, no modifications
- **Shared Communication**: Use `teams/SHARED.md`
- **Progress Tracking**: Monitor `teams/PROGRESS.md`

## 📚 **RESEARCH & DOCUMENTATION REQUIREMENTS**

### **MCP Server Usage** (REQUIRED)
- **MUST use Context7** for latest documentation
- **Brave Search MCP** for troubleshooting and current solutions
- **Fire Crawl MCP** for scraping official docs when needed
- Always reference latest documentation, not outdated examples

### **Key Documentation Sources**
- **Convex**: https://docs.convex.dev/
- **OpenRouter**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Next.js 15**: https://nextjs.org/docs
- **Upstash Redis**: https://docs.upstash.com/redis

## 🚨 **CRITICAL GUIDELINES FOR AI AGENTS**

### **DO**
- Use Context7 MCP server for latest documentation
- Follow existing TypeScript interfaces exactly
- Test all changes in browser before committing
- Update progress documentation regularly
- Reference CLAUDE.md for project context
- Maintain code quality standards
- Follow conventional commit format

### **DON'T**
- Modify existing UI components in `/components/ui/`
- Change TypeScript interfaces without coordination
- Skip error handling or loading states
- Commit code that doesn't build
- Break existing functionality
- Use outdated documentation or examples

### **ERROR HANDLING**
- Graceful failure for all API calls
- Loading states for async operations
- User-friendly error messages
- Retry mechanisms for network failures
- Fallback options when available

## 📊 **SUCCESS METRICS**

### **Technical Quality**
- TypeScript builds without errors
- All ESLint rules pass
- No console errors in browser
- Mobile responsive design
- Fast performance (< 2s initial load)

### **Competition Readiness**
- BYOK setup works flawlessly
- Demo flow is smooth and impressive
- Advanced features clearly differentiate
- Professional appearance throughout
- Robust error handling for judges

## 🎯 **CURRENT PRIORITIES**

### **Day 1 (Next 24 Hours)**
1. **Convex Setup** (Task 01) - Foundation for all backend
2. **OpenRouter API** (Task 03) - Core chat functionality  
3. **Convex Auth** (Task 02) - User authentication
4. **Chat Streaming** (Task 04) - Real-time messaging
5. **File Uploads** (Task 05) - Attachment support

### **Day 2 (Final 24 Hours)**
1. **Resumable Streams** (Task 06) - Killer differentiator
2. **Image Generation** (Task 07) - Visual impact
3. **BYOK System** (Task 09) - Judge accessibility
4. **Syntax Highlighting** (Task 08) - Developer experience
5. **Performance Optimization** (Task 11) - Polish

## 📝 **NOTES FOR AI AGENTS**

- This is a **competition environment** with tight deadlines
- **Quality is critical** - judges will notice broken features
- **Performance matters** - first impressions count
- **Documentation is required** - update your task STATUS.md
- **Communication is key** - use teams/SHARED.md for coordination
- **Context7 is mandatory** - always use latest documentation

---

**Last Updated**: [Update when modifying this file]  
**Competition Deadline**: June 18, 2025 at 12:00 PM PDT  
**Repository**: https://github.com/john-savepoint/T3-Close-ne