---
"z6chat": patch
---

fix(auth): allow homepage access without authentication

- Removed homepage (/) from protected routes to allow public access
- Only app functionality now requires authentication
- Added verbose logging to debug OAuth redirect issues
