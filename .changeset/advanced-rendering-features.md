---
"z6chat": minor
---

feat: Add advanced generation controls and rich content rendering

- **Temperature Controls**: Added temperature slider (0-2 range) to model switcher for fine-tuning AI output creativity vs determinism
- **Mermaid Diagrams**: Automatic rendering of mermaid code blocks into visual diagrams with dark theme support
- **SVG Rendering**: Safe rendering of SVG code blocks with DOMPurify sanitization to prevent XSS attacks
- **Code Canvas**: Interactive code preview component supporting HTML, CSS, and JavaScript with sandboxed execution
- **Security Enhancements**: Added comprehensive CSP headers, strict iframe sandboxing, and content sanitization
- **Test Page**: Created `/test-rendering` route to demonstrate all advanced rendering capabilities

This feature set transforms T3Chat into a dynamic canvas for creation, enabling users to see diagrams, SVGs, and interactive code previews directly in the chat interface.