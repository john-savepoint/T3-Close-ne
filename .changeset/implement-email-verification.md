---
"z6chat": minor
---

Implement proper email verification with Resend OTP for secure account creation

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
