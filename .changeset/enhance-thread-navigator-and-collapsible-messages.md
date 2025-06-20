---
"z6chat": minor
---

feat: enhance Thread Navigator and add collapsible message functionality

- Add navigation functionality to Thread Navigator - clicking messages scrolls to them in the main view
- Add expand/collapse icons to Thread Navigator for better content preview
- Implement individual collapse/expand buttons for each chat message
- Add global expand/collapse all button in top-left of content area
- Add smart state management that remembers individual collapse states
- Update user messages to use profile avatar and right-align for better visual distinction
- Add collapsed preview showing first 2-3 lines when messages are collapsed
- Persist collapse states in localStorage per chat session
- Add visual highlight when navigating to messages from Thread Navigator