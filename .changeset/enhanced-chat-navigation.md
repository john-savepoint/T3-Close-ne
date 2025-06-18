---
"z6chat": minor
---

feat(navigation): implement comprehensive enhanced chat navigation and interaction features

- **Edit AI Messages**: Users can now directly edit AI responses with inline editing interface
- **Delete Messages**: Delete any message from conversation history with confirmation dialog
- **Keyboard Navigation**:
  - `Cmd/Ctrl + K` opens model switcher instantly
  - `j/k` keys navigate between messages
  - `Ctrl+N/P` for Vim-style navigation in lists
  - Visual focus indicators when navigating
- **Conversation Tree View**: New sidebar shows hierarchical view of all conversation branches
  - Click any node to jump to that message
  - Rename prompts for better organization
  - Active path highlighting
  - Branching point indicators
- **Breadcrumb Navigation**: Shows path from root to current message for context
- **Branch Indicators**: Visual indicators on messages that have multiple AI response branches
- **Edited Message Indicators**: Shows when messages have been edited with timestamp
- **Enhanced Thread Navigator**: Improved UI with tree/standard view modes

This implementation provides power users with precise control over their conversations while maintaining an intuitive interface for all users.
