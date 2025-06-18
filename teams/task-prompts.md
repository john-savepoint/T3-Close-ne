# ClaudeSquad Task Prompts

Copy and paste these prompts into ClaudeSquad instances. Each prompt is designed to be **atomic and independent**.

---

## 🏗️ **CORE INFRASTRUCTURE (Day 1)**

### **Task 01: Convex Setup & Schema**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Set up Convex database with schema matching our existing TypeScript types.

DELIVERABLES:
- Install convex dependencies
- Create convex/ directory with schema definitions
- Set up convex.config.ts
- Create database schema matching types/chat.ts, types/project.ts, types/memory.ts
- Add environment variables for Convex
- Update CLAUDE.md with Convex setup instructions

FILES TO CREATE/MODIFY:
- convex/schema.ts
- convex/_generated/ (auto-generated)
- convex.config.ts
- .env.local.example
- Update package.json with convex scripts

ACCEPTANCE CRITERIA:
- Convex dev server runs successfully
- Schema matches existing TypeScript interfaces
- Can create/read basic documents
- Environment setup documented

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official Convex docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/convex-setup
DOCUMENTATION: Update teams/01-convex-setup/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 02: Convex Auth Integration**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement user authentication using Convex Auth.

DEPENDENCIES: Requires Convex setup (Task 01) to be merged first.

DELIVERABLES:
- Install and configure Convex Auth
- Create auth provider component
- Add login/logout functionality
- Protect authenticated routes
- Update user types and schema

FILES TO CREATE/MODIFY:
- convex/auth.config.ts
- components/auth-provider.tsx
- app/login/page.tsx
- lib/auth.ts
- Update existing components to use auth

ACCEPTANCE CRITERIA:
- Users can sign up/login
- Authentication persists across sessions
- Protected routes work correctly
- Auth state available in components

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex Auth documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official Convex Auth docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/convex-auth
DOCUMENTATION: Update teams/02-convex-auth/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 03: OpenRouter API Integration**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Integrate OpenRouter API for multi-model LLM support.

DELIVERABLES:
- Install AI SDK and OpenRouter dependencies
- Create OpenRouter API route handler
- Add model selection component
- Implement basic chat functionality
- Add error handling for API failures

FILES TO CREATE/MODIFY:
- app/api/chat/route.ts
- lib/openrouter.ts
- components/model-selector.tsx
- Update hooks/use-chat-lifecycle.ts
- types/models.ts

ACCEPTANCE CRITERIA:
- Can send messages to multiple LLM models
- Model switching works in UI
- Proper error handling for API failures
- Streaming responses work

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest OpenRouter and AI SDK documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official OpenRouter docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/openrouter-integration
DOCUMENTATION: Update teams/03-openrouter-api/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 04: Real-time Chat Streaming**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement real-time message streaming with Server-Sent Events.

DEPENDENCIES: Requires OpenRouter integration (Task 03).

DELIVERABLES:
- Server-Sent Events streaming implementation
- Real-time message updates in UI
- Optimistic message rendering
- Message persistence to Convex
- Handle connection interruptions

FILES TO CREATE/MODIFY:
- app/api/chat/stream/route.ts
- hooks/use-chat-streaming.ts
- components/chat-message-stream.tsx
- lib/streaming.ts

ACCEPTANCE CRITERIA:
- Messages stream in real-time
- UI updates optimistically
- Messages persist to database
- Handles network interruptions gracefully

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest AI SDK and streaming documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official Vercel AI SDK docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/chat-streaming
DOCUMENTATION: Update teams/04-chat-streaming/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 05: File Upload Infrastructure**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement file upload system using Convex storage.

DELIVERABLES:
- File upload API routes
- Drag & drop file upload component
- File type validation (images, PDFs)
- File preview functionality
- Attachment management

FILES TO CREATE/MODIFY:
- app/api/upload/route.ts
- components/file-upload-advanced.tsx
- hooks/use-file-upload.ts
- lib/file-validation.ts
- Update attachment types

ACCEPTANCE CRITERIA:
- Users can upload images and PDFs
- File validation works correctly
- File previews display properly
- Files stored in Convex storage
- Attachment library functional

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex file storage documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official Convex storage docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/file-uploads
DOCUMENTATION: Update teams/05-file-uploads/STATUS.md when complete

IMPORTANT: use context7
```

---

## 🚀 **COMPETITION WINNERS (Day 2)**

### **Task 06: Resumable Streams**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement resumable streams using Upstash Redis pattern for competition differentiation.

DEPENDENCIES: Requires chat streaming (Task 04).

DELIVERABLES:
- Upstash Redis setup for stream persistence
- Background generation continuation
- Stream recovery on reconnection
- Multi-device stream viewing
- Progress indicators

FILES TO CREATE/MODIFY:
- lib/resumable-streams.ts
- app/api/streams/[id]/route.ts
- hooks/use-resumable-stream.ts
- components/stream-recovery.tsx

ACCEPTANCE CRITERIA:
- Streams continue after page refresh
- Can view same stream on multiple devices
- Background generation works
- Stream state persists in Redis
- Robust error recovery

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Upstash Redis documentation
- Use Brave Search MCP to find current Upstash patterns and examples
- Use Fire Crawl MCP to scrape the specific Upstash resumable streams blog post
- Reference CLAUDE.md for project context and standards

BRANCH: feat/resumable-streams
DOCUMENTATION: Update teams/06-resumable-streams/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 07: Image Generation**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Add DALL-E image generation capability.

DELIVERABLES:
- OpenAI DALL-E API integration
- Image generation UI component
- Image prompt optimization
- Generated image display and storage
- Image download functionality

FILES TO CREATE/MODIFY:
- app/api/generate-image/route.ts
- components/image-generator.tsx
- lib/dalle.ts
- components/generated-image.tsx

ACCEPTANCE CRITERIA:
- Users can generate images from prompts
- Images display in chat
- Images can be downloaded
- Error handling for generation failures
- Images stored properly

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest OpenAI DALL-E documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official OpenAI API docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/image-generation
DOCUMENTATION: Update teams/07-image-generation/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 08: Syntax Highlighting Enhancement**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Enhance code block rendering with syntax highlighting and copy functionality.

DELIVERABLES:
- React Syntax Highlighter integration
- Code language detection
- Copy to clipboard functionality
- Download code snippet feature
- Line numbers and highlighting

FILES TO CREATE/MODIFY:
- components/code-block-enhanced.tsx
- lib/syntax-detection.ts
- hooks/use-code-actions.ts
- Update components/chat-message.tsx

ACCEPTANCE CRITERIA:
- Code blocks have proper syntax highlighting
- Copy and download buttons work
- Language detection is accurate
- Professional appearance
- Multiple language support

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest React Syntax Highlighter documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official syntax highlighting docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/syntax-highlighting
DOCUMENTATION: Update teams/08-syntax-highlighting/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 09: BYOK System**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement Bring Your Own Key functionality for easy judge testing.

DELIVERABLES:
- API key management UI
- Support for OpenRouter, OpenAI, Anthropic keys
- Key validation and testing
- Secure key storage
- Settings page integration

FILES TO CREATE/MODIFY:
- components/api-key-manager.tsx
- lib/key-validation.ts
- app/settings/api-keys/page.tsx
- hooks/use-api-keys.ts

ACCEPTANCE CRITERIA:
- Users can enter their own API keys
- Keys are validated before saving
- Secure client-side storage
- Easy key testing functionality
- Clear setup instructions

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest API key management best practices
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official API provider docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/byok-system
DOCUMENTATION: Update teams/09-byok-system/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 10: Web Search Integration**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Add web search capability to chat responses.

DELIVERABLES:
- Web search API integration (Tavily or similar)
- Search results formatting
- Citation and source linking
- Search toggle in UI
- Search result caching

FILES TO CREATE/MODIFY:
- app/api/search/route.ts
- components/search-toggle.tsx
- lib/web-search.ts
- components/search-results.tsx

ACCEPTANCE CRITERIA:
- LLMs can search web for current information
- Search results properly formatted
- Sources cited and linked
- Search can be toggled on/off
- Results cached for performance

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest web search API documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official Tavily or similar API docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/web-search
DOCUMENTATION: Update teams/10-web-search/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 12: Connect Authentication UI**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Connect the authentication state to the UI components - replace dummy auth behavior with real Convex Auth integration

DEPENDENCIES: None (auth backend is complete)

DELIVERABLES:
- Update Sidebar to show real authenticated user info
- Show/hide features based on authentication status
- Replace dummy user avatar/name with real user data
- Add working sign out functionality
- Connect AuthGuard to protected routes properly

FILES TO CREATE/MODIFY:
- components/sidebar.tsx
- components/user-profile.tsx (if exists)
- app/layout.tsx (auth state management)

ACCEPTANCE CRITERIA:
- Authenticated users see their real GitHub/Google profile info
- Unauthenticated users see sign in prompts
- Sign out button actually signs users out
- UI updates reactively when auth state changes

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex Auth documentation
- Use Brave Search MCP for authentication UI patterns
- Reference CLAUDE.md for project standards

BRANCH: feat/connect-auth-ui
DOCUMENTATION: Update teams/12-connect-auth-ui/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 13: Real Chat Interface**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Connect the main chat interface to our OpenRouter API for real message streaming and replace dummy chat data

DEPENDENCIES: Task 12 (authentication)

DELIVERABLES:
- Connect chat input to OpenRouter API
- Replace dummy messages with real streaming responses
- Implement proper loading states during API calls
- Add error handling for failed API requests
- Connect to our existing /api/chat endpoint

FILES TO CREATE/MODIFY:
- components/main-content.tsx
- components/chat/message-input.tsx
- components/chat/message-list.tsx
- hooks/use-chat.ts

ACCEPTANCE CRITERIA:
- Users can send messages and get real AI responses
- Messages stream in real-time (not just appear instantly)
- Error states show helpful messages
- Loading indicators during API calls
- Model switching works with real models

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest OpenRouter API documentation
- Use Context7 for Vercel AI SDK streaming documentation
- Reference our existing OpenRouter integration code

BRANCH: feat/real-chat-interface
DOCUMENTATION: Update teams/13-real-chat-interface/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 14: Chat Persistence**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement real chat creation and message persistence using our Convex database schema

DEPENDENCIES: Task 13 (real chat interface)

DELIVERABLES:
- Save chats and messages to Convex database
- Load chat history from database
- Update sidebar with real chat list from database
- Implement chat creation, editing, deletion
- Connect to existing Convex schema

FILES TO CREATE/MODIFY:
- convex/chats.ts (query/mutation functions)
- convex/messages.ts (query/mutation functions)
- components/sidebar.tsx (real chat list)
- hooks/use-chats.ts

ACCEPTANCE CRITERIA:
- New chats are saved to database with proper metadata
- Messages persist between sessions
- Chat list updates in real-time
- Chat titles are generated or user-editable
- Delete/archive functionality works

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex documentation
- Review our existing database schema in convex/schema.ts
- Use Convex live queries for real-time updates

BRANCH: feat/chat-persistence
DOCUMENTATION: Update teams/14-chat-persistence/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 15: Model Management UI**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Connect the model switcher to real OpenRouter models with cost calculation and real-time switching

DEPENDENCIES: Task 13 (real chat interface)

DELIVERABLES:
- Load real model list from OpenRouter API
- Show actual costs per model
- Enable mid-conversation model switching
- Display model information (context length, pricing)
- Connect to our existing OpenRouter integration

FILES TO CREATE/MODIFY:
- components/model-switcher.tsx
- lib/openrouter.ts (extend existing)
- hooks/use-models.ts
- types/models.ts

ACCEPTANCE CRITERIA:
- Model list loads from real OpenRouter API
- Cost calculation shows real pricing
- Users can switch models mid-conversation
- Model metadata (speed, quality) is displayed
- Model switching updates the active chat context

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest OpenRouter documentation
- Reference our existing OpenRouter integration
- Use Brave Search MCP for model comparison UX patterns

BRANCH: feat/model-management-ui
DOCUMENTATION: Update teams/15-model-management-ui/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 16: File Upload Integration**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Integrate our existing file upload functionality into the chat interface for real file attachments

DEPENDENCIES: Task 14 (chat persistence)

DELIVERABLES:
- Add file upload button to chat input
- Connect to existing Convex file storage
- Display uploaded files in chat messages
- Support image preview and document handling
- Connect to our existing upload infrastructure

FILES TO CREATE/MODIFY:
- components/chat/file-upload.tsx
- components/chat/message-attachments.tsx
- hooks/use-file-upload.ts
- Update message schema for attachments

ACCEPTANCE CRITERIA:
- Users can upload files during chat
- Files are stored in Convex and linked to messages
- File attachments display properly in chat history
- Image files show previews
- File size and type validation works

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest Convex file storage documentation
- Reference our existing file upload implementation
- Use React Dropzone documentation for UX patterns

BRANCH: feat/file-upload-integration
DOCUMENTATION: Update teams/16-file-upload-integration/STATUS.md when complete

IMPORTANT: use context7
```

### **Task 17: GitHub Label Organization & Automation**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Implement comprehensive GitHub label system for project organization, automation, and release management to improve workflow efficiency and competition tracking.

DEPENDENCIES: None (completely independent task)

DELIVERABLES:
- Complete label system with priority, type, component, status, competition, release, and automation labels
- Apply appropriate labels to all existing PRs (#3, #4, #5)
- Create PR template with label checkboxes for consistent labeling
- Document label usage guidelines and automation rules
- Integrate labels with auto-merge workflow and release automation

FILES TO CREATE/MODIFY:
- GitHub label creation (via gh CLI commands)
- `.github/pull_request_template.md` - PR template with label checkboxes
- `docs/labels.md` - Label reference guide and usage documentation
- Update existing PRs with appropriate labels
- Update team documentation with label workflow

ACCEPTANCE CRITERIA:
- All label categories created with appropriate colors and descriptions
- Existing PRs properly labeled with type, component, priority, and competition impact
- PR template includes comprehensive label checklist
- Auto-merge workflow integrated with label system
- Clear documentation for team label usage
- Competition progress easily trackable through label filtering

DOCUMENTATION REQUIREMENTS:
- MUST use GitHub CLI documentation for label creation commands
- Reference existing auto-merge workflow configuration
- Document label color scheme and naming conventions
- Create usage guidelines for consistent team adoption

BRANCH: feat/label-organization
DOCUMENTATION: Update teams/17-label-organization/STATUS.md when complete

IMPORTANT: use context7
```

---

## ✨ **POLISH & PERFORMANCE (Final Hours)**

### **Task 11: Performance Optimization**

```
You are working on Z6Chat, our T3Chat competition clone.

TASK: Optimize React performance for smooth competition demo.

DELIVERABLES:
- React.memo implementation for expensive components
- Virtualization for long chat lists
- Image lazy loading
- Bundle size optimization
- Memory leak prevention

FILES TO MODIFY:
- components/chat-message.tsx
- components/sidebar.tsx
- hooks optimization
- next.config.mjs

ACCEPTANCE CRITERIA:
- Smooth scrolling in long chats
- Reduced re-renders
- Optimized bundle size
- No memory leaks
- Fast initial load

DOCUMENTATION REQUIREMENTS:
- MUST use Context7 MCP server for latest React performance optimization documentation
- If encountering issues, use Brave Search MCP to find current solutions
- Use Fire Crawl MCP to scrape official React and Next.js performance docs if needed
- Reference CLAUDE.md for project context and standards

BRANCH: feat/performance-optimization
DOCUMENTATION: Update teams/11-performance-optimization/STATUS.md when complete

IMPORTANT: use context7
```

---

## 📋 **USAGE INSTRUCTIONS**

1. Start ClaudeSquad: `cs`
2. Create new instance: `n`
3. Paste appropriate task prompt
4. Agent works on isolated branch
5. Agent creates PR when complete
6. Review and merge
7. Other agents pull latest changes

## 🚨 **IMPORTANT NOTES**

- Each task is designed to be **completely independent**
- Work on different files to minimize conflicts
- Update your task's STATUS.md when complete
- Use conventional commits for PR titles
- Test your changes before creating PR
