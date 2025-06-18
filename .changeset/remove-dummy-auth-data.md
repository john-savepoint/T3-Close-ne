---
"z6chat": patch
---

Remove dummy auth data and clean up V0-generated placeholders

- Remove fake gift activity and statistics from settings page  
- Replace example.com email placeholders with generic placeholders
- Clean up dummy user data while preserving real authentication functionality
- Keep pictureUrl field consistent with current schema (OAuth profile photos working)