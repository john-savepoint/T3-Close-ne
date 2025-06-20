---
"z6chat": minor
---

feat(projects): complete projects feature implementation with real backend

- Add complete convex/projects.ts backend with all CRUD operations
- Update use-projects.ts hook to use real Convex queries instead of mock data
- Add project context injection to chat API route
- Integrate projects hook in main-content.tsx to pass active project context
- Add getByClerkId query to users.ts for proper user lookup
- Fix type error in clerk.ts by removing patch operation from query context
- Fix type errors in app/api/logs/route.ts with proper Node.js imports
- Fix sessionInfo reference in logs page for lightweight logger
- Add PR merge guidelines to CLAUDE.md to prevent future partial merges

This completes the projects feature implementation, allowing users to:

- Create, update, and delete projects with real persistence
- Attach files to projects
- Associate chats with projects
- Inject project context into AI conversations
- Fork existing projects
