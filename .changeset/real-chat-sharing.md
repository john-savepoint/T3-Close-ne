---
"z6chat": minor
---

feat: implement real chat sharing functionality with Convex backend

This replaces the dummy/mock data in the share conversation feature with real database persistence and API integration:

**Backend Implementation:**
- Added `sharedChats` table to Convex schema with proper indexing
- Created comprehensive sharing mutations and queries in `convex/sharing.ts`
- Implemented secure token generation for public links
- Added view count tracking with automatic increments
- Built conversation forking functionality for users to copy shared chats

**Frontend Updates:**
- Updated `use-chat-sharing` hook to use real Convex mutations instead of mock data
- Created `/api/shared/[token]` API route for public access without authentication
- Updated public chat page (`/s/[token]`) to fetch real shared chat data
- Enhanced ShareChatModal to support external open/close control
- Integrated real sharing functionality in sidebar chat items

**Key Features:**
- Secure public link generation with 24-character random tokens
- Real-time view count tracking for shared conversations
- One-click link copying and sharing
- Ability to revoke shared links and make conversations private
- Fork shared conversations into your own account
- SEO-friendly public pages with proper metadata
- Complete ownership verification and security

This transforms the share feature from a demo placeholder into a fully functional, production-ready conversation sharing system.