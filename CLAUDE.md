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
- **Backend Core**: ✅ Major Progress (Convex setup, OpenRouter API, File uploads)
- **Competition Features**: 🚧 3/15 tasks complete, high-value features implemented

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

- **Database**: ✅ Convex (real-time, TypeScript-native) - DEPLOYED
- **Authentication**: Convex Auth (JWT-based, OAuth providers) - Schema ready
- **API Layer**: ✅ Convex functions (queries, mutations, actions) - Core functions implemented
- **File Storage**: ✅ Convex file storage (images, documents) - Complete infrastructure
- **Real-time**: Convex live queries via WebSockets - Ready for implementation

### **AI & LLM Integration**

- **Primary**: ✅ OpenRouter API (multi-model support) - FULLY IMPLEMENTED
  - GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Gemini 2.0 Flash
  - Unified interface for 50+ models with streaming support
  - Cost calculation and model comparison
- **AI SDK**: ✅ Vercel AI SDK for streaming - Production ready
- **Image Generation**: OpenAI DALL-E 3 via OpenAI API - Ready for integration
- **Fallbacks**: Direct API integration (OpenAI, Anthropic, Google) - Architecture supports

### **Advanced Features**

- **File Processing**: ✅ React Dropzone + comprehensive validation - PRODUCTION READY
- **Resumable Streams**: Upstash Redis for stream persistence - High priority
- **Search**: Tavily API for real-time web search - Ready for integration
- **Syntax Highlighting**: ✅ React Syntax Highlighter - Dependencies installed
- **Code Execution**: Potential CodeSandbox integration - Future enhancement

### **Development Tools**

- **Package Manager**: pnpm (lockfile committed)
- **Git Workflow**: Husky hooks + conventional commits
- **Code Quality**: ESLint, Prettier, TypeScript strict
- **CI/CD**: GitHub Actions + Vercel deployment
- **Testing**: Built-in Next.js testing (expandable)

## 🔌 **API INTEGRATIONS & DEPENDENCIES**

### **Required Environment Variables** (Updated)

```bash
# ✅ Database & Auth (CONFIGURED)
CONVEX_DEPLOYMENT=dev:your-deployment-name-123
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-123.convex.cloud

# ✅ AI APIs (WORKING)
OPENROUTER_API_KEY=sk-or-... # Primary multi-model API (50+ models)
OPENAI_API_KEY=sk-... # For DALL-E image generation (ready to integrate)

# 🚧 Advanced Features (READY TO CONFIGURE)
UPSTASH_REDIS_REST_URL=https://... # Resumable streams (high priority)
UPSTASH_REDIS_REST_TOKEN=... # Redis auth
TAVILY_API_KEY=tvly-... # Web search integration

# 🔑 Optional BYOK Support (ARCHITECTURE READY)
ANTHROPIC_API_KEY=sk-ant-... # Claude models direct access
GOOGLE_AI_API_KEY=AI... # Gemini models direct access
```

### **🔧 Environment Setup Status**

- **Development**: Convex dev environment running
- **Database**: Schema deployed and tested
- **API Keys**: OpenRouter integration verified
- **File Storage**: Convex file storage configured
- **Build Process**: All environments building successfully

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
/app/                 # Next.js App Router pages & API routes
  /api/              # ✅ API endpoints (chat, upload)
/components/          # React components
  /ui/               # Base UI primitives (DO NOT MODIFY)
  /[feature]/        # Feature-specific components
/hooks/              # ✅ Custom React hooks (40+ hooks implemented)
/lib/                # ✅ Utility functions (OpenRouter, file validation)
/types/              # ✅ TypeScript type definitions (comprehensive)
/convex/             # ✅ Convex backend functions & schema
  /schema.ts         # ✅ Complete database schema
/teams/              # ClaudeSquad task management
/docs/               # Comprehensive documentation
/utils/              # ✅ Export utilities and file processing
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

### **Changesets Workflow** (Version Management)

**🚨 CRITICAL FOR AI AGENTS: You MUST run `pnpm changeset` before committing ANY changes**

**Development Process:**

```bash
# 1. Make your changes (code, features, fixes)
# 2. Before committing, create a changeset:
pnpm changeset

# 3. Interactive prompts (select exactly as shown):
# ✓ Which packages would you like to include? › z6chat (press space to select)
# ✓ What type of change? › minor (for features) / patch (for fixes) / major (breaking)
# ✓ Summary: Write a clear description of what you built

# 4. Commit BOTH your changes AND the generated changeset file:
git add .
git commit -m "feat(scope): your conventional commit message"
git push
```

**❌ Common Mistakes to Avoid:**

- Forgetting to run `pnpm changeset` before committing
- Not committing the generated `.changeset/*.md` file
- Skipping the changeset for "small" changes

**✅ What Happens Automatically:**

- GitHub Action detects changeset files
- Creates "Release PR" with version bump + changelog
- Merge Release PR → automatic version update + GitHub release
- Your description appears in the changelog

**Manual Commands (for reference):**

```bash
# Check what would be released
pnpm changeset:status

# Generate version bump and changelog (automation does this)
pnpm changeset:version

# Emergency manual release
pnpm release
```

**Current State:**

- Version: `0.2.0` (automatically bumped from changesets)
- Changelog: Auto-generated with all recent features
- Next release: Will include all new changesets from AI agents

## 🏆 **COMPETITION REQUIREMENTS**

### **Core Requirements** (Must Have)

- ✅ **Chat with Various LLMs**: OpenRouter integration COMPLETE
- 🚧 **Authentication & Sync**: Convex Auth system (schema ready, implementation needed)
- ✅ **Browser Friendly**: Next.js web application COMPLETE
- 🚧 **Easy to Try**: BYOK system for judge testing (architecture ready)

### **Bonus Features** (Competitive Edge)

- ✅ **Attachment Support**: File uploads COMPLETE (images, PDFs, comprehensive validation)
- 🚧 **Image Generation**: DALL-E integration (dependencies ready)
- 🚧 **Syntax Highlighting**: Code block enhancement (dependencies installed)
- 🚧 **Resumable Streams**: Our killer differentiator (high priority next)
- ✅ **Chat Branching**: Conversation trees (UI complete, backend schema ready)
- ✅ **Chat Sharing**: Public/private links (UI complete, backend schema ready)
- 🚧 **Web Search**: Tavily integration (architecture planned)
- 🚧 **Bring Your Own Key**: API key management (OpenRouter supports BYOK)

## 🚀 **MAJOR IMPLEMENTATIONS COMPLETED**

### **✅ Task 01: Convex Database Setup (MERGED)**

**Status**: Production Ready  
**Branch**: Merged to main  
**Impact**: Foundation for all backend functionality

**Key Achievements**:

- Complete database schema covering all features (users, chats, messages, attachments, projects, memories)
- Convex configuration optimized for competition needs
- TypeScript integration with full type safety
- All environment variables documented
- Sample functions for users and chats
- Ready for authentication and real-time features

### **✅ Task 02: Convex Authentication System (PRODUCTION READY)**

**Status**: Production Ready  
**Environment**: Both dev and production configured  
**Impact**: Complete user authentication with JWT tokens

**Key Achievements**:

- ✅ Convex Auth with Password, GitHub, and Google providers
- ✅ ResendOTP email verification system with custom domain
- ✅ JWT_PRIVATE_KEY and JWKS properly configured in production
- ✅ Schema updated with all required auth fields
- ✅ Production deployment successful with auth working
- ✅ Dedicated signup page with proper routing
- ✅ Authentication middleware and error handling

**Provider Configuration**:

- **Password Auth**: Email verification via Resend (chat@z6chat.savepoint.com.au)
- **GitHub OAuth**: Production ready with correct redirect URLs
- **Google OAuth**: Configured for multi-environment support
- **JWT Tokens**: PKCS#8 format keys generated and deployed

**Environment Status**:

- **Development**: perfect-fly-8.convex.cloud (working)
- **Production**: necessary-duck-420.convex.cloud (working)
- **Auth Testing**: Production auth system verified and operational

**Critical Lesson Learned**:

The email verification initially failed due to implementation assumptions instead of following official documentation. Context7 MCP usage revealed:

- Wrong flow parameter: `"signIn"` → `"email-verification"`
- Wrong field usage: emailVerified should be timestamp, not email
- Missing maxAge configuration for proper expiration
- Missing redirect logic after successful verification

This reinforces the MANDATORY requirement to use Context7 for all third-party integrations.

**Final Resolution**:

- ✅ Email verification flow working correctly with proper flow parameters
- ✅ Database fields using correct data types (timestamp strings)
- ✅ Redirect handling implemented for all authentication methods
- ✅ User experience complete: signup → verify → redirect to main app
- ✅ Cleanup functions to fix corrupted data and expired verification codes

### **✅ Task 03: OpenRouter API Integration (MERGED)**

**Status**: Production Ready  
**Branch**: Merged to main (commit 8743956)  
**Impact**: Core chat functionality with multi-model support

**Key Achievements**:

- Full OpenRouter API integration with 50+ models
- Streaming chat responses with proper chunking
- Enhanced model switcher with cost calculation
- Test interface for validation (/test-chat)
- Comprehensive error handling and fallbacks
- BYOK (Bring Your Own Key) support built-in
- Real-time model switching during conversations

**Available Models**:

- OpenAI: GPT-4o, GPT-4o Mini, o1-preview, o1-mini
- Anthropic: Claude 3.5 Sonnet, Claude 3.5 Haiku
- Google: Gemini 2.0 Flash, Gemini 1.5 Pro
- Meta: Llama 3.3 70B, Llama 3.1 405B
- And 40+ more models

### **✅ File Upload Infrastructure (MERGED)**

**Status**: Production Ready  
**Branch**: Merged to main (commit d837d6a)  
**Impact**: Comprehensive file attachment system

**Key Achievements**:

- React Dropzone integration with drag & drop
- Comprehensive file validation (size, type, content)
- Convex file storage with metadata tracking
- Support for images, PDFs, documents, code files
- File categorization and tagging system
- Upload progress tracking and error handling
- Search functionality for uploaded files
- File sharing with access control

**Supported File Types**:

- Images: PNG, JPG, WEBP, GIF (up to 10MB)
- Documents: PDF, DOC, DOCX, TXT, MD (up to 25MB)
- Code: JS, TS, PY, JSON, CSV (up to 5MB)
- Archives: ZIP (up to 50MB)

### **🔧 Architecture Enhancements**

**Type System**: Complete TypeScript coverage across all components
**Hooks**: 40+ custom hooks for state management and data fetching
**API Routes**: `/api/chat` and `/api/upload` endpoints production ready
**Error Handling**: Comprehensive error boundaries and user feedback
**Performance**: Optimized for Edge runtime and fast loading

## 🔄 **DEVELOPMENT WORKFLOW (CRITICAL)**

### **🚨 MANDATORY: Start Every Session With Git Status Check**

**BEFORE touching any code, you MUST run:**

```bash
git status
```

**Interpret the results:**

- **If on `main` branch**: Switch to a feature branch first
- **If on `session/feat/task-name` branch**: Follow rebase workflow below
- **If in a worktree**: Follow rebase workflow below

### **🔧 MANDATORY: Feature Branch Workflow**

**EVERY TIME you start work on a feature branch, you MUST run these commands:**

```bash
# 1. Check your current status
git status

# 2. Ensure you're on your feature branch
git checkout session/feat/your-task-name

# 3. Download latest commits from GitHub (safe - doesn't change your files)
git fetch origin main

# 4. Move your work to be based on latest main (prevents conflicts)
git rebase origin/main

# 5. Update your remote branch
git push --force-with-lease origin session/feat/your-task-name
```

### **❗ What Each Command Does**

- **`git status`**: Shows which branch you're on and if you have uncommitted changes
- **`git fetch origin main`**: Downloads latest commits from GitHub without changing your files (puts them in `origin/main` reference)
- **`git rebase origin/main`**: Moves your feature work to sit on top of the latest main branch
- **`git push --force-with-lease`**: Safely updates your remote branch with the rebased commits

### **🔧 If You Have Uncommitted Changes**

```bash
git status
# If this shows modified files, commit them first:
git add .
git commit -m "wip: work in progress before rebase"

# Then proceed with rebase workflow above
```

### **🔧 If Conflicts Occur During Rebase**

```bash
# Git will show: CONFLICT (content): Merge conflict in package.json
git status  # See which files have conflicts

# Open conflicted files and resolve conflicts:
# Look for <<<<<<< HEAD, =======, >>>>>>> markers
# For package.json: Keep BOTH dependency sets
# For code files: Manually merge the changes

# After resolving each file:
git add resolved-file.json
git rebase --continue

# If you get stuck:
git rebase --abort  # Cancels the rebase
# Then ask for help in teams/SHARED.md
```

### **📋 Updated Development Workflow**

1. **Start Session**:

   - Run `git status` to check your environment
   - If on feature branch, run the 4 rebase commands above

2. **Task Assignment**: Copy prompts from `teams/task-prompts.md`

3. **Before Starting Code**:

   - Ensure you're on latest main via rebase
   - Check `teams/SHARED.md` for coordination needs

4. **Development**:

   - Make your changes as normal
   - Commit regularly with conventional commit format

5. **Before Creating PR**:

   - Run rebase workflow again (ensures latest main)
   - Run quality checks: `pnpm type-check && pnpm lint`
   - Create PR with `gh pr create`

6. **Documentation**: Update task STATUS.md when complete

### **🚨 Why This Is Critical**

**Problem**: ClaudeSquad worktrees may be based on old commits (before CI/CD infrastructure)
**Solution**: Rebase ensures your work includes all latest changes
**Result**: Zero merge conflicts, clean integration

### **Conflict Prevention**

- **File Ownership**: Clear assignment per task
- **Type Safety**: Additive only, no modifications
- **Shared Communication**: Use `teams/SHARED.md`
- **Progress Tracking**: Monitor `teams/PROGRESS.md`
- **⭐ NEW: Always Rebase**: Prevents 99% of merge conflicts

## 📚 **RESEARCH & DOCUMENTATION REQUIREMENTS**

### **Context7 MCP Workflow** (MANDATORY FOR ALL THIRD-PARTY INTEGRATIONS)

**🚨 BEFORE writing ANY code that uses third-party services, you MUST follow this workflow:**

```workflow
1. Identify Third-Party Service
   └─ Any library, API, or service not custom-built for this project

2. Resolve Library ID
   └─ mcp__context7__resolve-library-id with service name
   └─ Example: "convex auth", "resend", "openrouter"

3. Get Documentation
   └─ mcp__context7__get-library-docs with Context7 library ID
   └─ Use specific topic (e.g., "email verification", "authentication flow")
   └─ Use high token count (8000-10000) for comprehensive coverage

4. Analyze Patterns
   └─ Study the exact code examples from Context7
   └─ Note configuration patterns, method signatures, flow parameters
   └─ Identify any differences from existing implementation

5. Implement Exactly
   └─ Follow Context7 documentation precisely
   └─ Use exact parameter names, values, and patterns shown
   └─ Do NOT modify based on assumptions

6. Update Existing Code
   └─ If Context7 shows different patterns than current code, update accordingly
   └─ Document why changes were made (reference Context7 findings)
```

### **MCP Server Usage** (MANDATORY)

**🚨 CRITICAL REQUIREMENT: ALL third-party service implementations MUST use Context7 MCP first**

- **Context7 MCP**: MANDATORY for ALL third-party services (Convex Auth, OpenRouter, Resend, Vercel AI SDK, etc.)
- **Brave Search MCP**: For troubleshooting and current solutions after Context7
- **Fire Crawl MCP**: For scraping official docs when Context7 lacks coverage
- **NO implementation without Context7**: Always check Context7 documentation before any third-party integration

**Context7 Usage Requirements:**

1. **Before ANY third-party implementation**: Use `resolve-library-id` to find the service
2. **Get comprehensive docs**: Use `get-library-docs` with specific topic and high token count
3. **Follow exactly**: Implement according to Context7 documentation, not assumptions
4. **Verify examples**: All code examples must match Context7-provided patterns
5. **Update approach**: If Context7 shows different patterns than existing code, update accordingly

**Examples of MANDATORY Context7 usage:**

- Convex Auth setup, schema, providers, flows
- OpenRouter API integration patterns
- Resend email configuration
- Vercel AI SDK streaming patterns
- Any Auth.js provider configuration
- Database schema definitions
- API endpoint structures

### **Key Documentation Sources**

- **Convex**: https://docs.convex.dev/
- **OpenRouter**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Next.js 15**: https://nextjs.org/docs
- **Upstash Redis**: https://docs.upstash.com/redis

## 🚨 **CRITICAL GUIDELINES FOR AI AGENTS**

### **DO**

- **MANDATORY**: Use Context7 MCP server for ALL third-party service documentation
- **MANDATORY**: Run `resolve-library-id` and `get-library-docs` before any third-party implementation
- Follow existing TypeScript interfaces exactly
- Test all changes in browser before committing
- Update progress documentation regularly
- Reference CLAUDE.md for project context
- Maintain code quality standards
- Follow conventional commit format
- Verify all third-party integrations match Context7 documentation patterns

### **DON'T**

- **NEVER implement third-party services without Context7 MCP documentation first**
- **NEVER assume implementation patterns - always verify with Context7**
- Modify existing UI components in `/components/ui/`
- Change TypeScript interfaces without coordination
- Skip error handling or loading states
- Commit code that doesn't build
- Break existing functionality
- Use outdated documentation or examples
- Implement based on assumptions or memory instead of current documentation

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

## 🎯 **CURRENT PRIORITIES** (Updated June 16, 2025)

### **✅ COMPLETED MAJOR MILESTONES**

1. ✅ **Convex Setup** (Task 01) - Foundation COMPLETE
2. ✅ **Convex Authentication** (Task 02) - User auth & JWT COMPLETE _(with full email verification)_
3. ✅ **OpenRouter API** (Task 03) - Multi-model chat COMPLETE
4. ✅ **File Uploads** (Task 05) - Attachment system COMPLETE

**Progress**: 4/15 tasks complete (27%) - **SIGNIFICANTLY AHEAD OF SCHEDULE**

**Latest Achievement**: Email verification system fully operational with proper redirect handling

### **🚀 IMMEDIATE PRIORITIES** (Next 12 Hours)

1. **Chat Streaming** (Task 04) - Real-time messaging integration with Convex Auth
2. **Main Chat Interface** - Connect OpenRouter to primary UI with authentication
3. **BYOK System** (Task 09) - Judge testing capability
4. **Authentication Integration** - Connect auth system to main chat interface

### **🏆 COMPETITION WINNERS** (Following 24 Hours)

1. **Resumable Streams** (Task 06) - Our killer differentiator
2. **Image Generation** (Task 07) - DALL-E integration
3. **Syntax Highlighting** (Task 08) - Code block enhancement
4. **Web Search** (Task 10) - Tavily integration
5. **Performance Optimization** (Task 11) - Final polish

## 🔥 **CURRENT CAPABILITIES & DEMO READY FEATURES**

### **✅ Production Ready Now**

1. **Multi-Model Chat**: 50+ AI models via OpenRouter with streaming
2. **Complete Authentication**: Email verification, GitHub/Google OAuth with redirect handling
3. **File Attachments**: Comprehensive upload system with validation
4. **Professional UI**: Complete dark theme interface with all components
5. **Type Safety**: Full TypeScript coverage across the application
6. **Error Handling**: Comprehensive error boundaries and user feedback

### **🧪 Test Endpoints Available**

- **Authentication**: `/signup` - Complete email verification flow with redirect
- **Chat Testing**: `/test-chat` - Full OpenRouter integration demo
- **File Upload**: `/api/upload` - Production file upload endpoint
- **Chat API**: `/api/chat` - Streaming chat responses
- **Model Switching**: Real-time model comparison in test interface

### **📊 Technical Metrics**

- **TypeScript Coverage**: 100% (strict mode)
- **Build Status**: ✅ Successful (no errors)
- **Dependencies**: 107 packages, all security audited
- **Performance**: Edge runtime optimized
- **Database Schema**: Complete (14 tables, 25+ indexes)

### **🎯 Competition Advantage**

**Current State vs Competitors**:

- Most competitors: Building basic chat UI ⭐
- **Z6Chat**: Multi-model streaming + file uploads + professional UI ⭐⭐⭐⭐⭐

**Unique Differentiators Ready**:

1. **Multi-model comparison** in single interface
2. **Professional file attachment** system with metadata
3. **Complete TypeScript** architecture for reliability
4. **BYOK support** for judge testing without our API keys
5. **Advanced UI patterns** (branching, sharing) already in place

## 📝 **NOTES FOR AI AGENTS**

- This is a **competition environment** with tight deadlines
- **Quality is critical** - judges will notice broken features
- **Performance matters** - first impressions count
- **Documentation is required** - update your task STATUS.md
- **Communication is key** - use teams/SHARED.md for coordination
- **Context7 is mandatory** - always use latest documentation

## 🆕 **ADDING NEW CLAUDESQUAD TASKS**

### **Task Creation Workflow**

When adding new ClaudeSquad tasks, follow this exact process:

#### **1. Create Task Directory Structure**

```bash
teams/[XX-task-name]/
├── README.md          # Detailed task specification
├── STATUS.md          # Progress tracking template
└── NOTES.md          # Additional context (optional)
```

#### **2. Task Prompt Template**

Add to `teams/task-prompts.md` using this exact format:

```markdown
### **Task XX: [Feature Name]**
```

You are working on Z6Chat, our T3Chat competition clone.

TASK: [Clear, specific task description]

DEPENDENCIES: [List any required tasks to be completed first, or "None" if independent]

DELIVERABLES:

- [Specific deliverable 1]
- [Specific deliverable 2]
- [etc.]

FILES TO CREATE/MODIFY:

- [specific file path 1]
- [specific file path 2]
- [etc.]

ACCEPTANCE CRITERIA:

- [Testable criterion 1]
- [Testable criterion 2]
- [etc.]

DOCUMENTATION REQUIREMENTS:

- MUST use Context7 MCP server for latest [relevant technology] documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official [relevant] docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/[task-name]
DOCUMENTATION: Update teams/[XX-task-name]/STATUS.md when complete

IMPORTANT: use context7

````

#### **3. Task README.md Template**
```markdown
# Task XX: [Feature Name]

## 🎯 **Objective**
[Detailed description of what this task accomplishes]

## 📋 **Task Details**

### **Priority**: 🔴/🟠/🟡 [Critical/High/Medium] (Day [1/2])
### **Estimated Time**: [X-Y hours]
### **Dependencies**: [Task numbers or "None"]
### **Agent Assignment**: Available

## 🛠️ **Technical Requirements**

### **Dependencies to Install** (if any)
```bash
pnpm add [dependencies]
````

### **Files to Create**

- `[file-path]` - [description]

### **Files to Modify**

- `[file-path]` - [description]

## ✅ **Acceptance Criteria**

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [etc.]

## 🚀 **Getting Started**

1. [Step 1]
2. [Step 2]
3. [etc.]

## 🔗 **Useful Links**

- [Official Documentation]
- [Related Examples]

````

#### **4. STATUS.md Template**
```markdown
# Task XX: [Feature Name] - Status

## 📊 **Current Status**: 🔴 Not Started

**Agent**: Unassigned
**Branch**: `feat/[task-name]`
**Started**: Not started
**Last Updated**: Not started

## ✅ **Progress Checklist**

### **[Phase 1 Name]**
- [ ] [Checkpoint 1]
- [ ] [Checkpoint 2]

### **[Phase 2 Name]**
- [ ] [Checkpoint 3]
- [ ] [Checkpoint 4]

## 🚧 **Current Work**

**No active work** - Task available for assignment

## ✅ **Completed**

**None** - Task not started

## ❌ **Blockers**

**None currently identified**

## 📝 **Notes**

[Any additional context or considerations]

## 🔗 **Related Tasks**

- **Task XX**: [Relationship description]

---

**Last Updated**: [Agent should update this when working on task]
**Next Update**: [Agent should commit to next update time]
````

#### **5. Update Documentation Files**

**teams/README.md**: Add task to appropriate priority section
**teams/PROGRESS.md**: Add to progress dashboard
**teams/SHARED.md**: Note any shared dependencies

#### **6. MCP Server Requirements**

**Every task MUST include:**

- **Context7 MCP**: For latest official documentation
- **Brave Search MCP**: For current solutions and troubleshooting
- **Fire Crawl MCP**: For scraping official docs when needed
- **Ending requirement**: "IMPORTANT: use context7"

#### **7. Task Naming Convention**

- **Format**: `XX-feature-name` (e.g., `12-voice-input`, `13-mobile-app`)
- **Numbers**: Sequential based on existing tasks
- **Names**: Kebab-case, descriptive, concise

#### **8. Integration Considerations**

- **File conflicts**: Ensure minimal overlap with existing tasks
- **Dependencies**: Clearly identify any blocking relationships
- **Types**: Only additive changes to TypeScript interfaces
- **Testing**: Include acceptance criteria that can be verified

### **Quick Task Addition Checklist**

- [ ] Created task directory with README.md and STATUS.md
- [ ] Added prompt to `teams/task-prompts.md` with Context7 requirements
- [ ] Updated `teams/README.md` with task priority
- [ ] Updated `teams/PROGRESS.md` dashboard
- [ ] Verified no file conflicts with existing tasks
- [ ] Included "IMPORTANT: use context7" requirement
- [ ] Committed and pushed changes

### **Emergency Task Addition**

For urgent competition needs:

1. Create minimal prompt in `teams/task-prompts.md`
2. Ensure Context7 requirement included
3. Create basic STATUS.md for tracking
4. Document in `teams/SHARED.md` for coordination
5. Commit immediately for ClaudeSquad access

---

**Last Updated**: June 16, 2025 - Major progress update with 3 tasks completed  
**Competition Deadline**: June 18, 2025 at 12:00 PM PDT (< 48 hours remaining)  
**Repository**: https://github.com/john-savepoint/T3-Close-ne  
**Status**: 20% complete, ahead of schedule, strong competitive position
