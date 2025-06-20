---
"z6chat": patch
---

fix: improve Thread Navigator layout and document branching structure

- Move view mode toggle button away from close button with proper spacing
- Add visual separator (border) between header and controls
- Make toggle button full width for better clickability
- Add help text explaining branch structure in tree view
- Document intended branching design in code comments:
  - Branches labeled by user prompts
  - Content shows conversation exchanges
  - Future: Multiple AI response variations per branch
- Improve overall layout with flex container for better spacing