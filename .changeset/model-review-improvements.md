---
"z6chat": patch
---

Implement code review improvements for model management UI

- Add improved token estimation with word-based algorithm
- Implement cache invalidation with 5-minute TTL for model data  
- Add input sanitization for XSS protection on search queries
- Optimize filter performance with single-pass approach
- Add loading skeleton for better UX during model fetching
- Improve error messages with HTTP status details
- Add cache version management for invalidating stale data