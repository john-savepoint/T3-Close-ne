---
"z6chat": minor
---

feat(chat): implement real-time chat interface with OpenRouter API integration

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
