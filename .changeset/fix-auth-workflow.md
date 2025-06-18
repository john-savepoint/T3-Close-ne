---
"z6chat": patch
---

Fix authentication and CI/CD issues

- Simplified Password provider configuration to remove email verification dependency
- Added proper permissions to Release workflow for automatic changeset processing
- Fixed GitHub Actions permissions for creating Release PRs
- Deployed clean auth configuration to Convex production
- Removed unused ResendOTP import to prevent errors
