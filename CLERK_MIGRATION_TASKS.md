# Clerk Migration Task Breakdown for ClaudeSquad Teams

## Overview
This document breaks down the Convex Auth to Clerk migration into discrete tasks that can be handled by multiple team members working in parallel. Each task is self-contained with clear dependencies.

## Task Structure

### Task 01: Clerk Environment Setup & Middleware
**Priority**: 🔴 Critical (Must complete first)
**Estimated Time**: 2-3 hours
**Dependencies**: None
**Files to Modify**:
- `.env.local` (create/update)
- `middleware.ts`
- `package.json` (remove @convex-dev/auth)

**Responsibilities**:
- Set up Clerk account and obtain API keys
- Configure Clerk dashboard settings
- Implement new middleware with route protection
- Remove Convex Auth dependency
- Test basic route protection

---

### Task 02: Frontend Provider Migration
**Priority**: 🔴 Critical
**Estimated Time**: 3-4 hours
**Dependencies**: Task 01
**Files to Modify**:
- `app/layout.tsx`
- `components/auth-provider.tsx` (delete)
- `app/login/page.tsx`
- `app/signup/page.tsx`
- Delete entire `components/auth/` directory

**Responsibilities**:
- Replace ConvexAuthProvider with ClerkProvider
- Update auth pages with Clerk components
- Apply dark theme styling to Clerk components
- Remove all Convex Auth UI components
- Test sign up/sign in flow

---

### Task 03: Convex Backend Migration
**Priority**: 🔴 Critical
**Estimated Time**: 4-5 hours
**Dependencies**: None (can run parallel with Task 01 & 02)
**Files to Modify**:
- `convex/schema.ts`
- `convex/clerk.ts` (create new)
- `convex/users.ts`
- Delete: `convex/auth.ts`, `convex/auth.config.ts`, `convex/ResendOTP.ts`

**Responsibilities**:
- Update schema to remove authTables
- Create Clerk helper functions
- Implement user sync mutation
- Update user queries to use Clerk identity
- Remove all Convex Auth backend files

---

### Task 04: Hook Migration
**Priority**: 🟠 High
**Estimated Time**: 2-3 hours
**Dependencies**: Task 02, Task 03
**Files to Modify**:
- `hooks/use-auth.ts`
- All hooks that import `use-auth.ts`

**Responsibilities**:
- Rewrite useAuth hook to use Clerk
- Implement user sync on sign in
- Update return interface to match existing usage
- Test all dependent hooks

---

### Task 05: Component Updates - Sidebar & User Profile
**Priority**: 🟠 High
**Estimated Time**: 2-3 hours
**Dependencies**: Task 04
**Files to Modify**:
- `components/sidebar.tsx`
- `components/user-profile.tsx`
- `components/main-content.tsx`

**Responsibilities**:
- Replace mock user profile with Clerk UserButton
- Update sidebar user section
- Remove sign in/up buttons from sidebar
- Update any components using auth state

---

### Task 06: API Route Protection
**Priority**: 🟠 High
**Estimated Time**: 3-4 hours
**Dependencies**: Task 01
**Files to Modify**:
- `app/api/chat/route.ts`
- `app/api/upload/route.ts`
- `app/api/generate-image/route.ts`
- All other API routes

**Responsibilities**:
- Add Clerk auth checks to all API routes
- Update to use Clerk user ID
- Handle unauthorized responses
- Test API authentication

---

### Task 07: Convex Function Updates - Chats & Messages
**Priority**: 🟡 Medium
**Estimated Time**: 3-4 hours
**Dependencies**: Task 03
**Files to Modify**:
- `convex/chats.ts`
- `convex/messages.ts`

**Responsibilities**:
- Replace getAuthUserId with requireAuth
- Update all queries and mutations
- Ensure proper user filtering
- Test chat creation and message sending

---

### Task 08: Convex Function Updates - Files & Attachments
**Priority**: 🟡 Medium
**Estimated Time**: 2-3 hours
**Dependencies**: Task 03
**Files to Modify**:
- `convex/files.ts`
- Related attachment handling code

**Responsibilities**:
- Update file upload authentication
- Ensure user-specific file filtering
- Test file upload and retrieval
- Verify attachment isolation

---

### Task 09: Convex Function Updates - Projects & Memories
**Priority**: 🟡 Medium
**Estimated Time**: 2-3 hours
**Dependencies**: Task 03
**Files to Modify**:
- `convex/memories.ts`
- Project-related Convex functions

**Responsibilities**:
- Update authentication for memories
- Ensure user-specific filtering
- Test memory creation and retrieval
- Verify project isolation

---

### Task 10: Testing & Cleanup
**Priority**: 🟢 Final
**Estimated Time**: 3-4 hours
**Dependencies**: All tasks above
**Files to Modify**:
- Various documentation files
- Remove unused auth files
- Update test configurations

**Responsibilities**:
- Comprehensive end-to-end testing
- Remove all unused auth files
- Update documentation
- Performance testing
- Security audit

---

## Parallel Execution Plan

### Team A (Frontend Focus)
- **Day 1**: Task 01 → Task 02 → Task 05
- **Day 2**: Task 06 → Testing

### Team B (Backend Focus)
- **Day 1**: Task 03 → Task 07
- **Day 2**: Task 08 → Task 09

### Team C (Integration)
- **Day 1**: Task 04 (after A & B start)
- **Day 2**: Task 10 → Final integration

## Critical Path
1. Task 01 (Environment Setup) - Blocks most other tasks
2. Task 03 (Backend Migration) - Blocks all Convex function updates
3. Task 02 (Provider Migration) - Blocks UI updates
4. Task 04 (Hook Migration) - Blocks component updates

## Testing Checkpoints

### After Task 01-02
- [ ] Users can access login/signup pages
- [ ] Protected routes redirect to login
- [ ] Clerk UI components render correctly

### After Task 03-04
- [ ] User sync to Convex works
- [ ] useAuth hook returns correct data
- [ ] User queries work with Clerk identity

### After Task 05-09
- [ ] User profile displays correctly
- [ ] All features work with authentication
- [ ] Data isolation is enforced
- [ ] No Convex Auth references remain

### Final Testing (Task 10)
- [ ] Complete user journey works
- [ ] All API endpoints are protected
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Security audit passes

## Risk Mitigation

### High Risk Areas
1. **User Data Migration**: If existing users, need migration strategy
2. **Session Management**: Ensure Clerk sessions work with Convex
3. **Real-time Subscriptions**: Verify Convex queries work with Clerk auth

### Rollback Strategy
1. Keep current branch intact
2. Create feature branch for migration
3. Test thoroughly in development
4. Deploy to staging first
5. Have quick rollback plan

## Success Criteria
- Zero authentication errors
- All features work as before
- Improved developer experience
- Cleaner codebase
- Better security posture

## Notes for ClaudeSquad Agents

1. **Always use Context7 MCP** for Clerk documentation
2. **Test incrementally** - don't wait until the end
3. **Communicate blockers** immediately in SHARED.md
4. **Follow existing code patterns** for consistency
5. **Update your task STATUS.md** regularly

This migration will transform Z6Chat from a disabled auth system to a production-ready Clerk implementation with proper user isolation and security.