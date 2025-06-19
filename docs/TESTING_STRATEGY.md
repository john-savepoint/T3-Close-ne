# Z6Chat Testing Strategy

## Overview

This document outlines a comprehensive testing strategy for Z6Chat to ensure all UI components are properly connected to their implementations and working as expected.

## Testing Layers

### 1. Unit Tests (Component Level)

**Tools**: Vitest + React Testing Library

#### Priority Components to Test:

- [ ] **Authentication Components**

  - SignIn/SignUp forms
  - AuthGuard wrapper
  - User profile display

- [ ] **Chat Components**

  - ChatInput (message sending)
  - ChatMessage (display, edit, delete)
  - Temporary chat functionality
  - Chat lifecycle (archive/trash)

- [ ] **Project Management**

  - ProjectList display
  - CreateProjectModal
  - Project selection
  - Project attachments

- [ ] **Tools System**
  - ToolsGrid selection
  - Individual tool components
  - Tool result integration

### 2. Integration Tests (Feature Level)

**Tools**: Playwright

#### Critical User Flows:

1. **Authentication Flow**

   ```
   - Sign up with email
   - Verify email (if enabled)
   - Sign in
   - Sign out
   ```

2. **Chat Flow**

   ```
   - Create new chat
   - Send messages
   - Receive AI responses
   - Edit messages
   - Delete messages
   - Archive/restore chat
   ```

3. **Project Flow**

   ```
   - Create project
   - Add attachments
   - Create chat within project
   - Delete project
   ```

4. **Temporary Chat Flow**
   ```
   - Start temporary chat
   - Send messages
   - Save to history
   - Exit temporary mode
   ```

### 3. E2E Tests (Full Application)

**Tools**: Playwright

#### Complete Scenarios:

1. **New User Journey**

   - Sign up → Create project → Start chat → Use tools

2. **Power User Workflow**

   - Multiple projects → Context switching → File attachments

3. **Data Persistence**
   - Create content → Refresh → Verify persistence

## Implementation Checklist

### Phase 1: Component Verification (Immediate)

```typescript
// Example test structure
describe("ProjectList", () => {
  it("should display projects from Convex", async () => {
    // Mock Convex query
    // Render component
    // Assert projects displayed
  })

  it("should create new project on button click", async () => {
    // Click Add Project
    // Fill form
    // Assert Convex mutation called
    // Assert UI updates
  })
})
```

### Phase 2: Integration Testing (Week 1)

- Set up Playwright
- Create test database/environment
- Write critical path tests
- Add to CI pipeline

### Phase 3: Monitoring (Week 2)

- Error tracking (Sentry)
- Analytics (user flows)
- Performance monitoring

## Known Issues to Test

Based on current findings:

1. **Projects System**

   - ✅ Fixed: Add Project button visibility
   - ⚠️ Test: Project creation with Convex
   - ⚠️ Test: Chat loading within projects

2. **Temporary Chat**

   - ✅ Fixed: Visual feedback
   - ⚠️ Test: Message persistence
   - ⚠️ Test: Save to history

3. **UI/Implementation Gaps**
   - ⚠️ Test: All tool implementations
   - ⚠️ Test: File upload functionality
   - ⚠️ Test: Model switching
   - ⚠️ Test: Memory system

## Test Data Strategy

### Mock Data

```typescript
export const mockUser = {
  id: "user_test",
  email: "test@z6chat.com",
  name: "Test User",
}

export const mockProject = {
  id: "proj_test",
  name: "Test Project",
  systemPrompt: "Test prompt",
}

export const mockChat = {
  id: "chat_test",
  title: "Test Chat",
  messages: [],
}
```

### Test Environment

- Use Convex preview deployments for testing
- Separate test database
- Mock external APIs (OpenRouter, Resend)

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run unit tests
        run: pnpm test:unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Playwright tests
        run: pnpm test:e2e
```

## Manual Testing Checklist

For each release, manually verify:

- [ ] Can create account and sign in
- [ ] Can create and send messages
- [ ] AI responses work correctly
- [ ] Projects create and display
- [ ] Temporary chat mode works
- [ ] File uploads work
- [ ] Tools generate content
- [ ] Archive/trash functionality
- [ ] Mobile responsive design
- [ ] Dark theme consistency

## Performance Benchmarks

Target metrics:

- Initial load: < 2s
- Message send: < 100ms
- AI response start: < 1s
- File upload: < 3s for 10MB

## Security Testing

- [ ] Authentication bypass attempts
- [ ] XSS in chat messages
- [ ] File upload restrictions
- [ ] API rate limiting
- [ ] Temporary chat isolation

## Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] ARIA labels

## Next Steps

1. **Immediate** (This Week):

   - Set up Vitest
   - Write tests for critical components
   - Fix any discovered issues

2. **Short Term** (Next 2 Weeks):

   - Set up Playwright
   - Implement E2E tests
   - Add to CI pipeline

3. **Long Term** (Month):
   - Full test coverage
   - Performance monitoring
   - Automated regression testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Convex Testing Guide](https://docs.convex.dev/testing)
