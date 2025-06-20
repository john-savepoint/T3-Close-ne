---
"z6chat": minor
---

feat: implement full markdown rendering for AI responses

- Add react-markdown with GitHub-flavored markdown support
- Implement comprehensive markdown formatting including:
  - Bold, italic, strikethrough text
  - Headers (h1-h6) with proper styling
  - Ordered and unordered lists with nesting
  - Blockquotes with distinctive styling
  - Tables with theme-matching design
  - Inline code with background highlighting
  - Links that open in new tabs
  - Horizontal rules
- Integrate with existing code block extraction system
- Preserve special handling for Mermaid diagrams and SVG
- Add test page at /test-markdown to demonstrate all features
- Maintain backward compatibility with existing messages