# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Z6Chat** is our competition entry for the T3Chat Cloneathon - a sophisticated AI chat interface application built with Next.js 15, TypeScript, and Tailwind CSS. We're competing for the $10,000+ prize pool with a 48-hour deadline (June 18, 2025 at 12:00 PM PDT).

### Competition Strategy
- **Target**: Top 3 finish ($5000/$2000/$1000 prizes)
- **Edge**: 95% complete UI with advanced features while competitors build basic chat
- **Differentiators**: Resumable streams, chat branching, project organization, professional design
- **Timeline**: 48 hours - Day 1 (core functionality), Day 2 (winning features)

### Project Name
**Z6Chat** - Our T3Chat clone submission

## Tech Stack & Dependencies

### Core Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Convex (real-time, TypeScript-native)
- **Authentication**: Convex Auth (JWT-based)
- **AI/LLM**: OpenRouter API (multi-model support)
- **Styling**: Tailwind CSS + ShadCN UI components
- **File Storage**: Convex file storage
- **Deployment**: Vercel

### Competition Features (Required)
- ✅ Chat with Various LLMs (OpenRouter)
- ✅ Authentication & Sync (Convex Auth)
- ✅ Browser Friendly (Next.js web app)
- ✅ Easy to Try (BYOK + live deployment)

### Competition Features (Bonus - Our Advantages)
- ✅ Attachment Support (images, PDFs)
- 🚧 Image Generation Support (DALL-E via OpenAI)
- 🚧 Syntax Highlighting (react-syntax-highlighter)
- 🚧 Resumable Streams (Upstash pattern)
- ✅ Chat Branching (conversation trees)
- ✅ Chat Sharing (public/private links)
- 🚧 Web Search (integration pending)
- 🚧 Bring Your Own Key (OpenRouter + direct APIs)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Start dev server
pnpm dev:convex       # Start Convex backend

# Production
pnpm build           # Build for production
pnpm start           # Start production server

# Quality
pnpm lint            # ESLint
pnpm type-check      # TypeScript checking
pnpm format          # Prettier formatting

# Git workflow
pnpm prepare         # Install Husky hooks
git flow init        # Initialize GitFlow
```

## Architecture & Key Patterns

### Component Architecture
- **UI Components** (`/components/ui/`): Radix UI primitives wrapped with custom styling using class-variance-authority
- **Feature Components** (`/components/`): Business logic components that compose UI primitives
- **Custom Hooks** (`/hooks/`): Encapsulate state management and business logic, currently using mock data
- **Type Definitions** (`/types/`): Comprehensive TypeScript types for all data models

### State Management Pattern
The application uses React hooks for state management rather than external libraries. Each major feature has a dedicated hook:
- `use-chat-lifecycle.ts`: Core chat functionality and message handling
- `use-projects.ts`: Project management and hierarchy
- `use-memory.ts`: Memory and context management
- `use-temporary-chat.ts`: Ephemeral chat sessions
- `use-attachments.ts`: File attachment handling

### Routing Structure
Uses Next.js App Router with the following key routes:
- `/app/page.tsx`: Main chat interface
- `/app/[feature]/page.tsx`: Feature-specific pages (archive, trash, tools, etc.)
- `/app/s/[token]/page.tsx`: Public chat sharing

### Key Architectural Decisions
1. **Mock Data First**: Hooks return mock data, designed for easy API integration
2. **Type Safety**: Strict TypeScript throughout with comprehensive type definitions
3. **Component Composition**: UI built from small, reusable components
4. **Dark Theme Only**: Sophisticated mauve/purple color palette
5. **Client-Side Heavy**: Most logic runs client-side, ready for API integration

## Important Implementation Notes

### When Adding New Features
1. Create types in `/types/` directory first
2. Implement mock data hook in `/hooks/`
3. Build UI components using existing primitives from `/components/ui/`
4. Follow existing patterns for state management and data flow

### Styling Guidelines
- Use Tailwind CSS classes exclusively
- Follow the existing dark theme color palette (slate, mauve, purple)
- Maintain consistent spacing using Tailwind's spacing scale
- Use `cn()` utility from `/lib/utils.ts` for conditional classes

### Component Patterns
- All components should be client components (`"use client"`)
- Props interfaces should be defined inline or in the same file
- Use forwardRef for components that need ref forwarding
- Compose complex components from simpler UI primitives

### Backend Integration Points
Current hooks are designed for easy Convex integration:
- Replace mock data with Convex queries/mutations
- Maintain existing TypeScript interfaces
- Add real-time subscriptions via Convex live queries
- Implement optimistic updates for responsiveness

### Competition Priority Features
1. **Core Chat** (Day 1): Multi-model LLM integration via OpenRouter
2. **Real-time Sync** (Day 1): Convex live queries + WebSocket streams  
3. **Resumable Streams** (Day 2): Upstash Redis + background generation
4. **Image Generation** (Day 2): OpenAI DALL-E API integration
5. **Syntax Highlighting** (Day 2): Enhanced code block rendering
6. **BYOK Support** (Day 2): User API key management

### Key Competition Advantages
- **Professional UI**: Dark theme, animations, responsive design
- **Advanced Features**: Projects, memory, teams, branching - features others won't have
- **Type Safety**: Comprehensive TypeScript prevents runtime errors
- **Performance**: Optimistic updates, efficient re-rendering patterns
- **Deployment Ready**: Vercel integration, environment management