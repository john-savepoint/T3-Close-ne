# Task 01: Convex Setup & Schema

## 🎯 **Objective**
Set up Convex database with schema definitions matching our existing TypeScript types.

## 📋 **Task Details**

### **Priority**: 🔴 Critical (Day 1)
### **Estimated Time**: 2-3 hours
### **Dependencies**: None (foundational task)
### **Agent Assignment**: Available

## 🛠️ **Technical Requirements**

### **Dependencies to Install**
```bash
pnpm add convex
pnpm add -D @types/convex
```

### **Files to Create**
- `convex/schema.ts` - Database schema definitions
- `convex/_generated/` - Auto-generated Convex files  
- `convex.config.ts` - Convex configuration
- `.env.local.example` - Environment variable template

### **Files to Modify**
- `package.json` - Add Convex scripts
- `CLAUDE.md` - Update setup instructions

## 📊 **Schema Requirements**

Must match existing TypeScript interfaces:

### **Chat Schema** (from `types/chat.ts`)
```typescript
// ChatMessage interface
{
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  parentMessageId?: string | null
  isEdited?: boolean
  editedAt?: Date
}

// Chat interface
{
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
  activeLeafMessageId?: string | null
  status: "active" | "archived" | "trashed"
  statusChangedAt: Date
}
```

### **Project Schema** (from `types/project.ts`)
```typescript
{
  id: string
  name: string
  description?: string
  color: string
  createdAt: Date
  updatedAt: Date
  chatCount: number
  lastActivity: Date
}
```

### **Memory Schema** (from `types/memory.ts`)
```typescript
{
  id: string
  type: "user_preference" | "fact" | "context"
  content: string
  source: string
  createdAt: Date
  lastAccessed: Date
  strength: number
  tags: string[]
}
```

## ✅ **Acceptance Criteria**

- [ ] Convex development server runs successfully (`pnpm dev:convex`)
- [ ] Schema definitions match existing TypeScript interfaces exactly
- [ ] Can create and query basic documents in all tables
- [ ] Environment variables properly configured
- [ ] Documentation updated with setup instructions
- [ ] All existing types remain compatible

## 🚀 **Getting Started**

1. Install Convex CLI and dependencies
2. Initialize Convex project
3. Create schema definitions
4. Test basic CRUD operations
5. Update environment configuration
6. Update documentation

## 📝 **Documentation Requirements**

Update the following when complete:
- `CLAUDE.md` - Add Convex setup steps
- `teams/01-convex-setup/STATUS.md` - Progress tracking
- `docs/convex-setup.md` - Detailed technical guide

## 🔗 **Useful Links**

- [Convex Documentation](https://docs.convex.dev/)
- [Convex TypeScript Guide](https://docs.convex.dev/typescript)
- [Schema Definition Guide](https://docs.convex.dev/database/schemas)