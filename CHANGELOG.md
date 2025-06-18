# z6chat

## 0.3.0

### Minor Changes

- 8073cac: feat(ci): complete CI/CD infrastructure with changesets, security, and automation

  - Implemented @changesets/cli for automated version management and changelog generation
  - Added comprehensive Dependabot configuration for dependency security scanning
  - Enhanced CI pipeline with pnpm audit security checks and build artifact upload
  - Created auto-merge workflow for approved PRs with configurable merge methods
  - Implemented visual regression testing with Playwright for UI validation
  - Generated initial v0.2.0 changelog with all retroactive features documented
  - Added branch protection rules documentation for repository security
  - Created automated release workflow with GitHub releases and version tagging

- 2d114f1: Implement proper email verification with Resend OTP for secure account creation

  Added comprehensive email verification flow using Resend for secure account creation process. This replaces the temporary fix with a production-ready solution that enhances security and user experience.

  Changes:

  - Created ResendOTP provider with Resend API integration
  - Added oslo/crypto for secure OTP token generation
  - Updated Password provider to use ResendOTP for verification
  - Enhanced SignUp component with two-step verification flow:
    1. Initial signup form (email, password, name)
    2. Email verification form (8-digit OTP code)
  - Added proper error handling and loading states
  - Styled verification code input with centered, spaced formatting
  - Added Resend API key to environment variables

  Features:

  - 8-digit numeric OTP codes with 15-minute expiration
  - Professional HTML email templates with Z6Chat branding
  - Seamless two-step signup process with clear user guidance
  - Back navigation from verification to signup form
  - Integration with existing OAuth providers (GitHub, Google)

  Dependencies added:

  - resend: ^4.6.0 (for email delivery)
  - oslo: ^1.2.1 (for secure token generation)
  - @auth/core (for Auth.js provider integration)

  This establishes a secure foundation for user authentication suitable for production use.

### Patch Changes

- ac26a35: Fix Husky deprecation warnings and add automation solutions for interactive commands
- 4f446a1: Admin workflow improvements and AI agent coordination
- f5a89f2: Connect authentication UI to real user data

  - Update MainContent to display authenticated user's name instead of hardcoded "John"
  - UserProfile component already properly connected to Convex Auth
  - Sign out functionality already implemented and working
  - AuthGuard and route protection via middleware already in place
  - All authentication state properly integrated across components

- 33e274d: fix(auth): implement proper route protection in middleware to resolve OAuth redirect loop

  - Added route matchers for sign-in page and protected routes
  - Redirect authenticated users from /login to home page
  - Redirect unauthenticated users from protected routes to /login
  - Fixes GitHub OAuth users being sent back to login page after authentication

- 244946f: fix(deployment): resolve Vercel routes-manifest.json error and deployment workflow

  - Fixed vercel.json configuration by removing custom buildCommand and outputDirectory
  - Updated GitHub Actions deploy workflow to include proper build steps
  - Added pnpm build:ci step before deployment with --prebuilt flag
  - Environment variables properly configured for build process

- 3f66515: Fix account creation error by configuring Password provider profile function

  Configure the Password provider with a basic profile function to bypass email verification requirement and allow account creation to proceed. This resolves the "Server Error Called by client" error when users try to create accounts with email/password.

  Changes:

  - Added profile function to Password provider in convex/auth.ts
  - Extracts email and name from signup parameters
  - Allows password-based account creation without email verification setup
  - Maintains compatibility with existing OAuth providers (GitHub, Google)

  This is a temporary fix to unblock account creation during the competition. Full email verification with Resend should be implemented later for production use.

- 7b02de4: fix(auth): allow homepage access without authentication

  - Removed homepage (/) from protected routes to allow public access
  - Only app functionality now requires authentication
  - Added verbose logging to debug OAuth redirect issues

- f5a89f2: Improve visual consistency of empty states with design system

  - Enhanced gift activity empty state to match established patterns
  - Added icon, proper typography hierarchy, and consistent spacing
  - Follows ShadCN design system conventions with proper color usage

- ac26a35: Implement comprehensive GitHub label system for project organization and automation

  - Created 32 labels across 7 categories (priority, type, component, status, competition, release, automation)
  - Applied appropriate labels to existing PRs (#3, #4, #5)
  - Added PR template with label checkboxes for consistent workflow
  - Created comprehensive label documentation with usage guidelines
  - Integrated labels with auto-merge workflow and release automation
  - Enhanced project organization and competition progress tracking

- f5a89f2: Remove dummy auth data and clean up V0-generated placeholders

  - Remove fake gift activity and statistics from settings page
  - Replace example.com email placeholders with generic placeholders
  - Clean up dummy user data while preserving real authentication functionality
  - Keep pictureUrl field consistent with current schema (OAuth profile photos working)

## 0.2.0

### Minor Changes

- feat(convex): comprehensive database setup with 14-table schema

  - Complete Convex database schema covering all features (users, chats, messages, attachments, projects, memories)
  - TypeScript integration with full type safety
  - Sample functions for users and chats
  - Ready for authentication and real-time features
  - Optimized for competition needs with proper indexing

- feat(files): comprehensive file upload and attachment system

  - React Dropzone integration with drag & drop functionality
  - Comprehensive file validation (size, type, content)
  - Convex file storage with metadata tracking and search
  - Support for images, PDFs, documents, code files, and archives
  - File categorization, tagging, and sharing with access control
  - Upload progress tracking and error handling
  - Production-ready attachment library with file management UI

- feat(api): OpenRouter API integration with 50+ AI models

  - Full OpenRouter API integration with streaming chat responses
  - Support for GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, Llama 3.3, and 40+ more models
  - Enhanced model switcher with cost calculation and real-time switching
  - BYOK (Bring Your Own Key) support for judge testing
  - Comprehensive error handling and fallbacks
  - Test interface at /test-chat for validation
  - Production-ready streaming chat API endpoint
