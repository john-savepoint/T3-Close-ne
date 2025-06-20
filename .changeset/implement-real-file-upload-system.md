---
"z6chat": minor
---

feat: implement production-ready file upload system

Major overhaul of the file attachment system replacing all mock functionality with real Convex file storage:

**File Upload System Rewrite:**
- Replace mock attachment hooks with real Convex file operations using `generateUploadUrl` and `saveFile` mutations
- Implement actual file upload to Convex storage with proper persistence
- Update upload API route to use Convex HTTP client for server-side file handling
- Remove all mock data, placeholder functionality, and temporary workarounds

**Real File Storage Features:**
- Files properly stored in Convex with real URLs and database persistence
- Comprehensive file validation, metadata saving, and error handling
- Support for multiple file categories (images, documents, code, data)
- Proper file size limits and security validation
- Real attachment IDs that integrate correctly with chat messages

**Chat Integration:**
- Messages now properly reference real attachment IDs in the database
- Attachments correctly linked to chat messages and users
- Maintain backward compatibility with legacy attachment field names
- Fix attachment upload errors that prevented file sending

**Developer Experience:**
- Add temporary chat debug component for troubleshooting
- Enhanced error handling and logging throughout the upload pipeline
- Production-ready file system ready for deployment

This resolves the attachment upload errors and makes the file system fully production-ready.