# Shared Communication & Coordination

## 🔄 **Cross-Task Communication**

Use this file to communicate between ClaudeSquad agents working on different tasks.

---

## 🚨 **CRITICAL WORKFLOW UPDATE - JUNE 17, 2025**

### **ALL AI AGENTS MUST READ**: `teams/AI-AGENT-WORKFLOW-UPDATE.md`

**ISSUE**: Merge conflicts occurred because ClaudeSquad worktrees are based on outdated commits (before CI/CD infrastructure).

**MANDATORY REBASE BEFORE ANY WORK**:

```bash
git checkout session/feat/your-task
git fetch origin main
git rebase origin/main
git push --force-with-lease
```

**STATUS**: All agents must acknowledge reading the workflow update in their STATUS.md files.

---

## 📢 **Latest Updates**

### **June 16, 2025 - 6:00 PM** - Major Progress Update

🚀 **MASSIVE PROGRESS**: Core infrastructure 90% complete!

- ✅ **3 Tasks MERGED**: Convex setup, OpenRouter API, Database schema
- 🔍 **3 PRs Under Review**: Authentication, Chat Streaming, File Uploads
- ✅ **CI/CD Complete**: Changesets, security scanning, auto-merge ready
- 📋 **20+ Future Improvements**: Documented from comprehensive PR reviews

**Next Phase**: Ready for advanced features (Tasks 06-10)
**Competition Status**: 40% complete, significantly ahead of schedule

---

## 🔗 **Shared Dependencies**

### **Environment Variables** (All Tasks Need)

```bash
# ✅ CONFIGURED (Core working)
CONVEX_DEPLOYMENT=dev:your-deployment-name-123
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-123.convex.cloud
OPENROUTER_API_KEY=sk-or-...

# 🚧 READY TO CONFIGURE (For auth and advanced features)
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-secret

# 🔮 FUTURE FEATURES
OPENAI_API_KEY=sk-... # For DALL-E image generation
UPSTASH_REDIS_REST_URL=https://... # For resumable streams
UPSTASH_REDIS_REST_TOKEN=... # Redis auth
TAVILY_API_KEY=tvly-... # Web search
```

### **⚠️ NEW: Changesets Workflow Required**

**CRITICAL**: All future tasks MUST run `pnpm changeset` before committing:

```bash
# 1. Make your changes
# 2. Create changeset (REQUIRED)
pnpm changeset
# 3. Select z6chat, choose type, write description
# 4. Commit both changes AND changeset file
git add .
git commit -m "feat(scope): your feature"
```

### **Shared Type Definitions**

⚠️ **IMPORTANT**: Do NOT modify existing types in `/types` directory. Only ADD new types.

**Current shared interfaces:**

- `types/chat.ts` - Chat and message types
- `types/project.ts` - Project organization
- `types/memory.ts` - Memory system
- `types/attachment.ts` - File attachments

### **Shared Components** (Avoid Conflicts)

- `components/ui/*` - UI primitives (DO NOT MODIFY)
- `lib/utils.ts` - Utility functions (ADD ONLY)
- `hooks/use-mobile.tsx` - Mobile detection (DO NOT MODIFY)

---

## 🚨 **Merge Conflict Prevention**

### **File Ownership Rules**

| Task            | Owned Files                           | Shared Files (Coordinate First) |
| --------------- | ------------------------------------- | ------------------------------- |
| 01-convex-setup | `convex/*`                            | `package.json`, `.env.example`  |
| 02-convex-auth  | `components/auth-*`, `app/login/*`    | `app/layout.tsx`                |
| 03-openrouter   | `app/api/chat/*`, `lib/openrouter.ts` | `types/models.ts`               |
| 04-streaming    | `hooks/use-chat-streaming.ts`         | `components/chat-message.tsx`   |
| 06-resumable    | `lib/resumable-streams.ts`            | `app/api/chat/*`                |

### **Integration Points**

- **API Routes**: Coordinate in `app/api/` directory
- **Chat Components**: Central component updates
- **Type Definitions**: Additive only

---

## 📋 **Coordination Requests**

### **Active Requests**

_Agents post requests here for cross-task coordination_

**Example:**

> **Task 03 → Task 04**: Need to coordinate API route structure for streaming integration

---

## 🔧 **Shared Utilities**

### **Database Helpers** (From Task 01)

```typescript
// Will be available after Convex setup
import { api } from "@/convex/_generated/api"
```

### **API Patterns** (From Task 03)

```typescript
// Standard API response format
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

---

## ⚡ **Performance Guidelines**

### **Bundle Size Targets**

- Keep individual features under 50KB
- Use dynamic imports for large dependencies
- Optimize images and assets

### **React Patterns**

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders

---

## 🎯 **Competition Priorities**

### **Must-Have (Judging Blockers)**

1. Basic chat functionality working
2. Multiple LLM support
3. User authentication
4. Professional UI experience

### **Nice-to-Have (Winning Features)**

1. Resumable streams
2. Image generation
3. Syntax highlighting
4. BYOK support

### **Judge Testing Requirements**

- BYOK setup instructions
- Clear demo flow
- Error handling for missing keys
- Professional error messages

---

## 📱 **Testing Checklist**

Before creating PR, verify:

- [ ] Component renders without errors
- [ ] TypeScript builds successfully
- [ ] No console errors in development
- [ ] Mobile responsive (if UI changes)
- [ ] Follows existing design patterns

---

**Last Updated**: June 17, 2025 - Critical workflow update posted  
**Next Check**: All agents must acknowledge before resuming work
