# CLAUDE.md - Z6Chat AI Development Guide

This file provides comprehensive guidance to AI agents working on Z6Chat, a production-ready AI chat interface application.

## 🎯 **PROJECT OVERVIEW**

**Z6Chat** is a sophisticated AI chat interface that provides multi-model LLM support, real-time persistence, and advanced features for enhanced user experience.

### **Current Status** (December 2024)

- **Version**: 0.3.1
- **Stage**: Production-ready with ongoing feature development
- **Focus**: Professional standards, production environments, CI/CD enforcement

### **Project History & Milestones**

- **Origin**: T3Chat Cloneathon competition entry (June 2025)
- **Foundation**: Complete Git, CI/CD, Documentation, ClaudeSquad setup
- **Major Achievements**:
  - Multi-model chat with 50+ LLMs via OpenRouter
  - Real-time persistence with Convex database
  - Professional UI with complete dark theme
  - Comprehensive file attachment system
  - Production-ready error handling
  - Type-safe architecture with strict TypeScript

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

## 🏗️ **ARCHITECTURE & DIRECTORY STRUCTURE**

### **Complete Directory Structure**

```
T3-Close-ne/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── chat/route.ts         # OpenRouter streaming chat
│   │   ├── upload/route.ts       # File upload handling
│   │   ├── tools/                # Tool-specific endpoints
│   │   └── streams/              # Resumable stream management
│   ├── (pages)/                  # Application pages
│   │   ├── page.tsx              # Main chat interface
│   │   ├── new/page.tsx          # New chat/tool selection
│   │   ├── archive/page.tsx      # Archived chats
│   │   ├── trash/page.tsx        # Deleted chats
│   │   ├── settings/             # User preferences
│   │   └── tools/                # Tool-specific pages
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/page.tsx        # Sign in
│   │   └── signup/page.tsx       # Registration
│   └── s/[token]/page.tsx        # Public chat sharing
├── components/                   # React components
│   ├── ui/                       # Base UI primitives (DO NOT MODIFY)
│   │   ├── button.tsx           # Button variants
│   │   ├── dialog.tsx           # Modal dialogs
│   │   ├── dropdown-menu.tsx   # Dropdown menus
│   │   └── [30+ components]     # Complete UI kit
│   ├── tools/                    # Tool components
│   │   ├── email-responder.tsx
│   │   ├── social-media-generator.tsx
│   │   ├── summarizer.tsx
│   │   └── diagrammer.tsx
│   ├── auth/                     # Authentication components
│   ├── chat/                     # Chat components
│   ├── file-upload/             # File handling
│   └── [feature]/               # Feature-specific components
├── hooks/                        # Custom React hooks (40+)
│   ├── use-chat.ts              # Chat management
│   ├── use-files.ts             # File operations
│   ├── use-streaming.ts         # Stream handling
│   └── [feature hooks]          # Specialized hooks
├── lib/                          # Utilities and configurations
│   ├── openrouter.ts            # AI integration
│   ├── convex.ts                # Database client
│   ├── utils.ts                 # Helper functions
│   └── streaming/               # Stream utilities
├── types/                        # TypeScript definitions
│   ├── database.types.ts        # DB schema types
│   ├── api.types.ts             # API interfaces
│   └── ui.types.ts              # Component types
├── convex/                       # Backend functions & schema
│   ├── schema.ts                 # Complete database schema
│   ├── auth.ts                   # Authentication config
│   ├── chats.ts                  # Chat operations
│   ├── files.ts                  # File management
│   └── [functions]/              # Queries, mutations, actions
├── docs/                         # Documentation
│   ├── AUTHENTICATION.md         # Auth setup guide
│   ├── COMPLETED_FEATURES.md     # Feature documentation
│   └── CLAUDE_ARCHIVE.md         # Historical reference
├── teams/                        # ClaudeSquad management
│   ├── task-prompts.md          # Task templates
│   ├── README.md                # Team guide
│   └── [task-folders]/          # Individual tasks
├── public/                       # Static assets
├── styles/                       # Global styles
└── [config files]               # Build, lint, deploy configs
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
- Use `forwardRef` for ref forwarding
- Compose from UI primitives, don't modify `/components/ui/`
- Follow existing mauve/purple design system

### **TypeScript Guidelines**

- Strict mode enabled - no `any` types
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

# Code Quality (MANDATORY BEFORE COMMIT)
pnpm type-check       # TypeScript validation
pnpm lint             # ESLint checking
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Prettier formatting
pnpm quality:check    # Run all quality checks
pnpm check-all        # Full build validation (catches Vercel errors)
pnpm pre-deploy       # Complete pre-deployment validation

# Build & Deploy
pnpm build           # Production build
pnpm start           # Start production server
```

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

### **Pull Request Guidelines (CRITICAL)**

**🚨 IMPORTANT: Preventing Partial Merges**

To avoid partial merge issues like the projects feature incident:

1. **Before Merging Any PR:**

   - Run `gh pr diff <PR-NUMBER> --name-only` to see ALL files
   - Verify the file list matches expectations
   - Check CI status: `gh pr checks <PR-NUMBER>`

2. **Merge Process:**

   ```bash
   # Always use GitHub CLI for merging
   gh pr merge <PR-NUMBER> --merge  # Creates merge commit
   # OR
   gh pr merge <PR-NUMBER> --squash  # Squashes commits

   # NEVER use partial cherry-picks or manual merges
   ```

3. **Post-Merge Verification:**

   ```bash
   # Verify all files were merged
   git pull origin main
   gh pr diff <PR-NUMBER> --name-only | xargs -I {} ls {} 2>/dev/null | wc -l
   # This count should match the PR file count
   ```

4. **If CI Checks Fail:**
   - DO NOT attempt partial merges
   - Fix issues in the PR branch
   - If urgent, implement directly in main with proper testing

### **Changesets (MANDATORY)**

**🚨 CRITICAL FOR AI AGENTS: Manual changeset creation required due to interactive prompts**

Since AI agents cannot answer interactive command-line prompts, you must manually create changeset files:

#### **Manual Changeset Creation Process**

1. **Create changeset file**:

```bash
# Create a new file in .changeset directory
# Use format: .changeset/[adjective]-[noun]-[verb].md
# Example: .changeset/brave-pandas-dance.md
```

2. **Changeset file content**:

```markdown
---
"z6chat": patch
---

feat: your feature description here

- Detailed change point 1
- Detailed change point 2
- Any breaking changes noted
```

3. **Version types**:

- `patch`: Bug fixes, minor updates (0.0.x)
- `minor`: New features, non-breaking (0.x.0)
- `major`: Breaking changes (x.0.0)

4. **Commit both code and changeset**:

```bash
git add .
git add .changeset/*.md
git commit -m "feat: your feature"
```

#### **Example Manual Changeset**

`.changeset/purple-tigers-jump.md`:

```markdown
---
"z6chat": minor
---

feat: add resumable streaming with Redis persistence

- Implement stream state persistence using Upstash Redis
- Add stream recovery on connection loss
- Create new hooks for stream management
- Update chat interface to support resume functionality
```

#### **Common Mistakes to Avoid**

- ❌ Running `pnpm changeset` (requires interactive input)
- ❌ Forgetting to commit the changeset file
- ❌ Using wrong version type
- ✅ Always create changeset manually as shown above

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

## 🚨 **CRITICAL GUIDELINES**

### **MCP Requirements (MANDATORY)**

**🚨 BEFORE implementing ANY third-party service, you MUST use Context7 MCP:**

1. **Resolve Library ID**:

```bash
mcp__context7__resolve-library-id
# Input: service name (e.g., "convex", "openrouter", "resend")
```

2. **Get Documentation**:

```bash
mcp__context7__get-library-docs
# Input: library ID from step 1
# Topic: specific feature (e.g., "streaming", "file upload")
# Tokens: 8000-10000 for comprehensive docs
```

3. **Implementation**:

- Follow Context7 documentation EXACTLY
- No assumptions or memory-based coding
- Update existing code if Context7 shows different patterns

4. **Common Context7 Usage**:

- Convex database operations
- OpenRouter API patterns
- Authentication flows
- File upload handling
- Streaming implementations
- Any third-party SDK usage

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

### **Preventing Vercel Deployment Failures**

**CRITICAL: Always run these checks before pushing to main:**

1. **Run full validation**: `pnpm check-all`
2. **Fix any TypeScript errors**: `pnpm type-check`
3. **Fix ESLint issues**: `pnpm lint:fix`
4. **Test the build locally**: `pnpm build:ci`

**Why deployments fail:**

- Next.js production builds are stricter than dev mode
- TypeScript errors that are warnings in dev become errors in prod
- ESLint rules are enforced during Vercel builds
- Missing environment variables cause runtime failures

**New safeguards in place:**

- Pre-push hooks run full validation
- GitHub Actions run quality checks before deploying
- Next.js config enforces TypeScript and ESLint checks
- Local build commands mirror Vercel's build process

## 🆕 **ADDING NEW CLAUDESQUAD TASKS**

### **Task Creation Workflow**

#### **1. Create Task Directory**

```bash
teams/[XX-task-name]/
├── README.md          # Task specification
├── STATUS.md          # Progress tracking
└── NOTES.md          # Additional context
```

#### **2. Task Prompt Template**

Add to `teams/task-prompts.md`:

```markdown
### **Task XX: [Feature Name]**

You are working on Z6Chat, our production AI chat interface.

TASK: [Clear, specific task description]

DEPENDENCIES: [Required tasks or "None"]

DELIVERABLES:

- [Specific deliverable 1]
- [Specific deliverable 2]

FILES TO CREATE/MODIFY:

- [specific file path 1]
- [specific file path 2]

ACCEPTANCE CRITERIA:

- [Testable criterion 1]
- [Testable criterion 2]

DOCUMENTATION REQUIREMENTS:

- MUST use Context7 MCP server for latest documentation
- Use Brave Search MCP for troubleshooting if needed
- Reference CLAUDE.md for project standards

BRANCH: feat/[task-name]
DOCUMENTATION: Update teams/[XX-task-name]/STATUS.md

IMPORTANT: use context7
```

#### **3. Update Team Documentation**

- Add to `teams/README.md` priority section
- Update `teams/PROGRESS.md` dashboard
- Note dependencies in `teams/SHARED.md`

#### **4. Task Naming Convention**

- Format: `XX-feature-name`
- Sequential numbering
- Kebab-case, descriptive

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

---

**Last Updated**: December 2024  
**Maintained By**: Z6Chat Development Team  
**AI Guidance Version**: 3.0
