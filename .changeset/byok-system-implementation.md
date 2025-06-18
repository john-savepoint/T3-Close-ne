---
"z6chat": minor
---

Implement complete BYOK (Bring Your Own Key) system for easy judge testing

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
