import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // File attachments table
  attachments: defineTable({
    // Core file information
    storageId: v.id("_storage"),
    filename: v.string(),
    originalFilename: v.string(),
    contentType: v.string(),
    size: v.number(),
    category: v.string(), // images, documents, code, etc.

    // Ownership and timestamps
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    lastAccessedAt: v.optional(v.number()),

    // Relationships
    chatId: v.optional(v.id("chats")),
    messageId: v.optional(v.id("messages")),

    // Metadata
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    extractedText: v.optional(v.string()),

    // Access control
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    processingError: v.optional(v.string()),
  })
    .index("by_user", ["uploadedBy"])
    .index("by_chat", ["chatId"])
    .index("by_message", ["messageId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_share_token", ["shareToken"])
    .searchIndex("search_files", {
      searchField: "filename",
      filterFields: ["uploadedBy", "isPublic", "status", "category"],
    }),

  // Messages table with file attachment support
  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.optional(v.id("users")),
    timestamp: v.number(),
    attachments: v.optional(v.array(v.id("attachments"))),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        cost: v.optional(v.number()),
      })
    ),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"]),

  // Chats table
  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isArchived: v.boolean(),
    isPublic: v.boolean(),
    model: v.string(),
    systemPrompt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "isArchived"]),

  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    storageUsed: v.number(), // bytes
    storageLimit: v.number(), // bytes
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
})
