---
"z6chat": patch
---

feat(syntax): enhance security, accessibility, and language support based on Context7 review

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