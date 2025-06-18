---
"z6chat": patch
---

Fix account creation error by configuring Password provider profile function

Configure the Password provider with a basic profile function to bypass email verification requirement and allow account creation to proceed. This resolves the "Server Error Called by client" error when users try to create accounts with email/password.

Changes:

- Added profile function to Password provider in convex/auth.ts
- Extracts email and name from signup parameters
- Allows password-based account creation without email verification setup
- Maintains compatibility with existing OAuth providers (GitHub, Google)

This is a temporary fix to unblock account creation during the competition. Full email verification with Resend should be implemented later for production use.
