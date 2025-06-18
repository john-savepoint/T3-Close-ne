---
"z6chat": patch
---

fix(auth): implement proper route protection in middleware to resolve OAuth redirect loop

- Added route matchers for sign-in page and protected routes
- Redirect authenticated users from /login to home page
- Redirect unauthenticated users from protected routes to /login
- Fixes GitHub OAuth users being sent back to login page after authentication
