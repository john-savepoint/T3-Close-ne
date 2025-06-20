---
"z6chat": minor
---

feat: implement real projects backend with Convex integration

- Add complete projects backend implementation with convex/projects.ts
- Update use-projects hook to use real Convex queries instead of mock data
- Add project context support to chat hooks and streaming
- Add getByClerkId query to users.ts for proper user lookup
- Fix type error in clerk.ts by removing patch operation from query context
- Enable project-based chat context injection for AI responses
