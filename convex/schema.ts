import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  
  // Chat conversations
  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    messages: v.array(v.object({
      id: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      timestamp: v.number(),
      attachments: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        type: v.string(),
        size: v.number(),
      }))),
    })),
    model: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    shareToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_share_token", ["shareToken"]),

  // Projects for organization
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    chatIds: v.array(v.id("chats")),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Memory for context preservation
  memories: defineTable({
    userId: v.id("users"),
    chatId: v.optional(v.id("chats")),
    projectId: v.optional(v.id("projects")),
    content: v.string(),
    type: v.union(v.literal("fact"), v.literal("preference"), v.literal("context")),
    relevanceScore: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_chat", ["chatId"])
    .index("by_project", ["projectId"]),

  // File attachments
  attachments: defineTable({
    userId: v.id("users"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    chatId: v.optional(v.id("chats")),
    extractedText: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_chat", ["chatId"]),
});

export default schema;