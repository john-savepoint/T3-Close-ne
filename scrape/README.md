# Scraped Documentation Archive

This folder contains documentation scraped from the internet using Firecrawl API. All documentation is preserved as markdown files for offline reference and development.

## Contents

### Convex Authentication Documentation

1. **[convex-auth-overview.md](./convex-auth-overview.md)** - Complete overview of Convex authentication system

   - Main authentication docs from docs.convex.dev/auth
   - Convex Auth library introduction from labs.convex.dev/auth
   - Third-party vs self-hosted authentication options
   - Authorization patterns and service authentication

2. **[convex-auth-setup.md](./convex-auth-setup.md)** - Step-by-step setup guide

   - NPM installation and initialization
   - Schema configuration with authTables
   - React provider setup for different frameworks
   - Environment configuration

3. **[convex-auth-config.md](./convex-auth-config.md)** - Authentication method configuration

   - OAuth, Magic Links/OTPs, and Password authentication
   - Detailed tradeoffs between methods
   - DX, UX, and security considerations
   - Method selection recommendations

4. **[convex-auth-oauth.md](./convex-auth-oauth.md)** - OAuth implementation guide

   - Supported providers (GitHub, Google, Apple)
   - Callback URL configuration
   - Environment variables setup
   - Production deployment considerations
   - Profile customization

5. **[convex-auth-passwords.md](./convex-auth-passwords.md)** - Password authentication implementation
   - Email + password setup
   - Password reset flow with email OTP
   - Email verification during signup
   - Form validation and customization
   - User information customization

## Usage Instructions

1. **Development Reference**: Use these files when implementing authentication features in the Z6Chat project
2. **Offline Access**: All documentation is available without internet connection
3. **Search**: Use your editor's search functionality to find specific implementation details
4. **Version Control**: These files are ignored by git (.gitignore entry) to prevent repository bloat

## Scraping Details

- **Tool Used**: Firecrawl API with API key fc-b459eb96287a4e3d8310053644ba7a50
- **Source URLs**:
  - https://docs.convex.dev/auth/*
  - https://labs.convex.dev/auth/*
- **Date Scraped**: June 18, 2025
- **Format**: Markdown with original structure preserved
- **Coverage**: Complete Convex Auth documentation for current project needs

## Project Context

This documentation was scraped specifically for the Z6Chat project, a T3Chat clone being developed for a competition. The authentication system is a critical component that requires careful implementation following Convex best practices.

**Current Authentication Status**:

- ✅ Convex Auth setup complete
- ✅ OAuth (GitHub/Google) configured
- ✅ Password authentication with email verification working
- ✅ JWT tokens and production deployment operational

## Related Files

- `/convex/auth.ts` - Main authentication configuration
- `/convex/auth.config.ts` - Authentication providers setup
- `/convex/ResendOTP.ts` - Email verification implementation
- `/components/auth/` - Frontend authentication components
- `/hooks/use-auth.ts` - Authentication hooks

## Updates

This documentation should be refreshed periodically as Convex Auth is in beta and may receive updates. Use the same Firecrawl commands to re-scrape when needed.

---

_Generated automatically on June 18, 2025_
