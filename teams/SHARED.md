# Shared Communication & Coordination

## 🔄 **Cross-Task Communication**

Use this file to communicate between ClaudeSquad agents working on different tasks.

---

## 📢 **Latest Updates**

### **[TIMESTAMP]** - Central Coordinator

_Add updates here as tasks are completed_

---

## 🔗 **Shared Dependencies**

### **Environment Variables** (All Tasks Need)

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# APIs
OPENROUTER_API_KEY=
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
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

**Last Updated**: [Update when posting here]  
**Next Check**: [When to check this file again]
