---
"z6chat": patch
---

fix: handle unauthenticated queries gracefully to prevent errors on sign out

- Updated file queries to return empty arrays instead of throwing errors when user is not authenticated
- Fixed getUserFiles, getChatFiles, and searchFiles to use getCurrentUser instead of requireAuth
- Improved useAttachments hook to skip queries when user is not authenticated
- This prevents "Unauthorized - please sign in" errors when signing out