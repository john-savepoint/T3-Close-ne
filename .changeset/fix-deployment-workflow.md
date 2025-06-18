---
"z6chat": patch
---

fix(deployment): resolve Vercel routes-manifest.json error and deployment workflow

- Fixed vercel.json configuration by removing custom buildCommand and outputDirectory
- Updated GitHub Actions deploy workflow to include proper build steps
- Added pnpm build:ci step before deployment with --prebuilt flag
- Environment variables properly configured for build process
