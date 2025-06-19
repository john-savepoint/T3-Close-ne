# z6chat

## 0.4.0

### Minor Changes

- 4c83995: feat: Add advanced generation controls and rich content rendering

  - **Temperature Controls**: Added temperature slider (0-2 range) to model switcher for fine-tuning AI output creativity vs determinism
  - **Mermaid Diagrams**: Automatic rendering of mermaid code blocks into visual diagrams with dark theme support
  - **SVG Rendering**: Safe rendering of SVG code blocks with DOMPurify sanitization to prevent XSS attacks
  - **Code Canvas**: Interactive code preview component supporting HTML, CSS, and JavaScript with sandboxed execution
  - **Security Enhancements**: Added comprehensive CSP headers, strict iframe sandboxing, and content sanitization
  - **Test Page**: Created `/test-rendering` route to demonstrate all advanced rendering capabilities

  This feature set transforms T3Chat into a dynamic canvas for creation, enabling users to see diagrams, SVGs, and interactive code previews directly in the chat interface.

- 490e24a: Implement complete BYOK (Bring Your Own Key) system for easy judge testing

  This adds comprehensive API key management functionality allowing users to securely store and validate their own API keys from OpenRouter, OpenAI, and Anthropic. Key features include:

  - Secure localStorage-based key storage with validation caching
  - Real-time API key validation with provider-specific testing
  - Comprehensive API key manager component with show/hide functionality
  - Format validation for each provider's key patterns
  - Clear setup instructions with direct links to provider dashboards
  - Priority provider selection logic (OpenRouter first)
  - Integration with main settings page via new API Keys tab
  - Support for key testing, removal, and bulk operations

  This enables judges to easily test Z6Chat with their own API keys without requiring our credentials, significantly improving the competition demo experience.

- b7a07f4: feat: Implement comprehensive chat persistence with real-time updates

  This major feature implementation replaces all dummy data with real Convex database persistence while maintaining perfect UI consistency. Key improvements include:

  **Core Features:**

  - Real-time chat creation and management with database persistence
  - Message persistence between sessions with live synchronization
  - Enhanced sidebar with dynamic chat lists and time-based grouping
  - Chat lifecycle operations: archive, trash, restore, delete permanently
  - Live badge counts for archive/trash with automatic updates
  - Search integration working with persisted chat data
  - Professional loading and empty states

  **Technical Implementation:**

  - Complete Convex CRUD operations for messages and enhanced chat management
  - New use-chats.ts hook providing comprehensive persistence with optimistic updates
  - Real-time UI synchronization via Convex live queries
  - Full TypeScript integration with Convex schema
  - Comprehensive error handling and performance optimization

  **UI/UX Improvements:**

  - Removed all dummy/mock data from chat interface
  - Maintained perfect consistency with existing mauve design system
  - Added proper loading states and user-friendly empty state messaging
  - Implemented optimistic updates for immediate user feedback

  This establishes the foundation for a production-ready real-time chat system with persistent data storage.

- 28b7df9: feat(navigation): implement comprehensive enhanced chat navigation with backend integration

  - **Edit AI Messages**: Full backend integration with Convex mutations
    - Inline editing with auto-resizing textarea
    - Loading states during save operations
    - Keyboard shortcuts (Cmd+Enter to save, Esc to cancel)
    - Edit timestamps and visual indicators
  - **Delete Messages**: Complete cascading delete functionality
    - Confirmation dialog with loading states
    - Recursive deletion of child messages
    - Backend persistence via Convex mutations
  - **Keyboard Navigation**:
    - `Cmd/Ctrl + K` opens model switcher instantly
    - `j/k` keys navigate between messages with smooth scrolling
    - `Ctrl+N/P` for Vim-style navigation
    - Visual focus indicators with animations
    - Accessibility support with proper focus management
  - **Conversation Tree View**: Performance-optimized hierarchical navigation
    - Memoized components for large conversation handling
    - Click any node to jump to that message
    - Rename prompts for better organization
    - Active path highlighting with visual indicators
    - Branching point indicators and branch counts
    - Full accessibility with ARIA labels and keyboard navigation
  - **Breadcrumb Navigation**: Shows path from root to current message
  - **Branch Indicators**: Visual indicators on messages with multiple response branches
  - **Backend Integration**: Complete Convex mutations for data persistence
    - User authentication and ownership verification
    - Optimistic updates with error handling
    - Real-time updates via Convex live queries

  This implementation provides production-ready enhanced navigation with full backend support, optimized performance, and comprehensive accessibility features for power users.

- 2142319: Implement enhanced model management UI with real OpenRouter integration and advanced filtering

  - Added comprehensive model management hook with real-time OpenRouter API integration (50+ models)
  - Created enhanced model switcher component with advanced filtering by provider, price, context length, and vision capabilities
  - Implemented dynamic cost calculation and real-time pricing display
  - Added mid-conversation model switching capability without losing chat context
  - Enhanced TypeScript coverage with comprehensive OpenRouter API types and model metadata
  - Removed dummy data and ensured visual consistency with ShadCN design system
  - Added professional UX with tabbed interface, search functionality, and model comparison features
  - Integrated cost transparency features helping users make informed model selection decisions

- 7a9e1ce: Add comprehensive OpenAI image generation with DALL-E 3 and GPT-Image-1 support

  - Add `/api/generate-image` endpoint with multi-model support (DALL-E 3, DALL-E 2, GPT-Image-1)
  - Implement DALL-E 3 as default model for immediate high-quality image generation
  - Add comprehensive utility library with TypeScript safety and error handling
  - Include model-specific parameter validation and conditional logic
  - Support all OpenAI image generation parameters (size, quality, style)
  - Context7 verified implementation ensures 100% API compliance
  - Ready for UI component integration and chat interface

- 8ee4523: feat(tools): implement complete mission control tools system

  - **Prompt Engineering Service**: Created comprehensive prompt templates with variable substitution for all tools
  - **Real AI Integration**: Connected all tools to OpenRouter API for actual AI-generated responses
  - **Enhanced Email Responder**: Professional email generation with tone controls and context awareness
  - **Social Media Generator**: Platform-specific content creation with audience targeting and hashtag optimization
  - **Smart Summarizer**: Content condensation with length and format options
  - **Diagrammer Tool**: New Mermaid.js integration for flowcharts, sequence diagrams, class diagrams, and ER diagrams
  - **Seamless Chat Flow**: Tool results integrate smoothly into chat conversations with proper formatting
  - **Enhanced UI/UX**: Improved tool cards with hover animations, better loading states, and error handling
  - **Real-time Feedback**: Toast notifications and error messages for all tool operations
  - **Professional Styling**: Consistent mauve theme integration with gradient animations and micro-interactions

  This transforms the New Chat screen from basic prompt suggestions into a powerful mission control center for specialized AI tasks, significantly improving user productivity and showcasing advanced features that differentiate Z6Chat in the competition.

- 780471d: feat(chat): implement real-time chat interface with OpenRouter API integration

  - Created unified use-chat hook for real API integration with streaming responses
  - Connected ChatInput component to send real messages and handle loading states
  - Updated MainContent to use real chat functionality instead of dummy data
  - Added functional temperature control for AI creativity settings
  - Implemented proper error handling and loading indicators
  - Removed all dummy data from chat interface components
  - Added stop generation functionality during streaming
  - Made quick start prompts functional to send real messages
  - Integrated file attachment support with chat messages
  - Added keyboard shortcuts (Enter to send, Shift+Enter for new line)

- 1b5b449: Add resumable streams feature with Upstash Redis persistence

  This major feature addition provides Z6Chat with a killer differentiator - true resumable streams that survive page refreshes, network interruptions, and allow multi-device access. The implementation includes:

  - Redis-based stream persistence with Upstash
  - Background LLM generation independent of client connections
  - Automatic reconnection with exponential backoff
  - Multi-device stream access via session IDs
  - Comprehensive error handling and progress indicators
  - React hook and UI components for seamless integration

  This gives Z6Chat a significant competitive advantage as no other chat application in the competition offers this level of reliability and user experience.

- 7858f67: feat(syntax): implement enhanced syntax highlighting with dynamic language registration

  This adds comprehensive syntax highlighting capabilities to Z6Chat code blocks:

  - Enhanced CodeBlockEnhanced component with VS Code Dark+ theme
  - Advanced language detection supporting 15+ programming languages
  - Dynamic language registration to prevent SSR issues
  - Copy to clipboard and download functionality with browser fallbacks
  - Line highlighting and numbering support
  - Professional UI consistent with Z6Chat's dark theme
  - Performance optimized with Light build and dynamic imports
  - Comprehensive test suite with multiple language examples

  The implementation significantly improves the developer experience for code sharing and enhances Z6Chat's competitive position in the T3Chat competition.

- 2142319: Implement provider-specific token estimation with research-based ratios

  - Add comprehensive token counting documentation for all major LLM providers
  - Implement provider-specific character-to-token ratios based on extensive research:
    - OpenAI: 4.0 chars/token (tiktoken)
    - Anthropic: 2.5 chars/token (proprietary)
    - Google: 4.0 chars/token (sentencepiece)
    - DeepSeek: 4.0 chars/token (1.67 for Chinese text)
    - xAI: 3.75 chars/token (sentencepiece)
    - Meta/Llama: 4.0 chars/token (tiktoken)
    - Mistral: 4.0 chars/token (tiktoken)
  - Add special CJK text detection for DeepSeek models
  - Display tokenizer information in cost estimation UI
  - Add utility functions to get token estimation metadata
  - Include comprehensive test suite for token estimation

### Patch Changes

- cabe4a4: Fix authentication and CI/CD issues

  - Simplified Password provider configuration to remove email verification dependency
  - Added proper permissions to Release workflow for automatic changeset processing
  - Fixed GitHub Actions permissions for creating Release PRs
  - Deployed clean auth configuration to Convex production
  - Removed unused ResendOTP import to prevent errors

- 8befcae: fix: resolve merge conflicts and TypeScript errors

  - Fixed merge conflicts in tools-grid.tsx and use-keyboard-navigation.ts
  - Removed duplicate code and unused component imports
  - Fixed authentication-related imports in layout.tsx
  - Resolved TypeScript errors for missing components and duplicate declarations
  - Enhanced chat navigation system with edit/delete message functionality
  - Added missing UI components (tooltip.tsx)
  - Cleaned up project structure for competition readiness

- 2b5ebab: docs: restore comprehensive CLAUDE.md content based on user feedback

  - Restored all development patterns including state management and styling conventions
  - Added comprehensive directory structure with detailed explanations
  - Included special changeset instructions for AI agents (manual creation required)
  - Restored project history and milestones section
  - Brought back complete ClaudeSquad task creation workflow
  - Strengthened Context7 MCP requirements throughout the document
  - Maintained supporting documents structure (AUTHENTICATION.md, COMPLETED_FEATURES.md)
  - Increased from 235 to 477 lines for better comprehensiveness

- 2142319: Implement code review improvements for model management UI

  - Add improved token estimation with word-based algorithm
  - Implement cache invalidation with 5-minute TTL for model data
  - Add input sanitization for XSS protection on search queries
  - Optimize filter performance with single-pass approach
  - Add loading skeleton for better UX during model fetching
  - Improve error messages with HTTP status details
  - Add cache version management for invalidating stale data

- 7858f67: feat(syntax): enhance security, accessibility, and language support based on Context7 review

  This patch implements comprehensive improvements to the syntax highlighting system:

  **Security Enhancements:**

  - Enhanced clipboard operations with secure context validation
  - Added filename sanitization to prevent directory traversal attacks
  - Implemented blob size validation for download security (50MB limit)
  - Added proper security attributes for file downloads
  - Enhanced error handling with secure fallback mechanisms

  **Accessibility Improvements:**

  - Added ARIA labels and role attributes to code blocks
  - Enhanced keyboard navigation support with tabIndex
  - Improved screen reader compatibility
  - Added proper focus management for interactive elements

  **Language Support Expansion:**

  - Added support for Go, Rust, PHP, Ruby, Swift, Kotlin
  - Enhanced language detection patterns for modern programming languages
  - Improved TypeScript and React detection accuracy
  - Extended file extension mappings for better auto-detection

  **Performance & Reliability:**

  - Enhanced language registration with module validation
  - Improved error handling for failed language module loads
  - Better memory management for object URLs with cleanup
  - Optimized import patterns for reduced bundle size

  These improvements ensure Z6Chat's syntax highlighting meets modern security standards, accessibility guidelines, and developer expectations while maintaining excellent performance.

- 7858f67: fix(syntax): resolve TypeScript variable declaration order in use-code-actions

  Fixed function declaration order issue that was causing TypeScript compilation errors. This ensures clean builds and proper type checking for the syntax highlighting system.

- 84eee94: docs: restructure CLAUDE.md for production focus and reduced complexity

  - Reduced CLAUDE.md from 1,168 to 216 lines (81% reduction)
  - Removed outdated competition context and historical implementation details
  - Created separate supporting documents for authentication and features
  - Updated technology stack to reflect current versions
  - Simplified Git workflow to essential commands only
  - Focused on production standards and professional development
  - Added clear links to supporting documentation
  - Maintained critical MCP requirements and quality standards

- 1bb316c: Replace T3 logo with Z6Chat brand image and fix missing noise texture. Updated T3Logo component to use Next.js Image component with the new Z6Chat logo PNG. Replaced missing noise.png references with CSS-generated noise pattern using radial gradients.

## 0.3.1

### Patch Changes

- fix(auth): resolve authentication redirect issues preventing users from accessing main app

  - Added AuthGuard components to all protected pages to ensure proper authentication checks
  - Fixed race condition between authentication state updates and router redirects
  - Updated middleware to include root path "/" as a protected route
  - Modified sign-in/sign-up components to use useEffect for reliable redirect handling
  - Ensured consistent authentication flow across all application routes

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
