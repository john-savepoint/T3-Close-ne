---
"z6chat": patch
---

fix: improve authentication resilience and add demo mode support

- Enhanced auth sync error handling with exponential backoff and retry limits
- Added demo mode support when Clerk is not configured
- Improved auth state management to prevent UI fragmentation
- Added visual indicators for auth sync issues
- Updated Convex schema to support demo plan type
- Made ConvexClientProvider work without Clerk configuration
- Added auth wrapper component for graceful degradation