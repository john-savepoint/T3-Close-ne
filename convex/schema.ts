import { defineSchema, defineTable } from "convex/server"
import { authTables } from "@convex-dev/auth/server"
import { v } from "convex/values"

const schema = defineSchema({
  // Include auth tables from @convex-dev/auth
  ...authTables,

  // Extend the users table from auth with additional fields
  users: defineTable({
    // Required auth fields from authTables
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Storage tracking from PR #3
    storageUsed: v.optional(v.number()), // bytes
    storageLimit: v.optional(v.number()), // bytes
    // Additional fields
    lastActiveAt: v.optional(v.number()),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // Projects table from PR #1
  projects: defineTable({
    name: v.string(),
    systemPrompt: v.optional(v.string()),
    parentProjectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentProjectId"]),

  // Chats table - merged from both PRs
  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
    // From PR #1
    projectId: v.optional(v.id("projects")),
    activeLeafMessageId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("trashed")),
    statusChangedAt: v.number(),
    // From PR #3
    isPublic: v.optional(v.boolean()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    // Common fields
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // Messages table - merged from both PRs
  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    // From PR #1
    type: v.union(v.literal("user"), v.literal("assistant")),
    model: v.optional(v.string()),
    parentMessageId: v.optional(v.string()),
    isEdited: v.optional(v.boolean()),
    editedAt: v.optional(v.number()),
    // From PR #3
    userId: v.optional(v.id("users")),
    attachments: v.optional(v.array(v.id("attachments"))),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        cost: v.optional(v.number()),
      })
    ),
    // Common fields
    timestamp: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_parent", ["parentMessageId"])
    .index("by_chat_parent", ["chatId", "parentMessageId"])
    .index("by_user", ["userId"]),

  // Attachments table - enhanced version from PR #3
  attachments: defineTable({
    // Core file information
    storageId: v.id("_storage"),
    filename: v.string(),
    originalFilename: v.optional(v.string()),
    contentType: v.string(),
    size: v.number(),
    category: v.optional(v.string()), // images, documents, code, etc.

    // Legacy fields from PR #1 for compatibility
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    content: v.optional(v.string()),

    // Ownership and timestamps
    userId: v.id("users"), // uploadedBy from PR #3, but keeping userId for consistency
    uploadedAt: v.optional(v.number()),
    createdAt: v.number(),
    lastAccessedAt: v.optional(v.number()),

    // Relationships
    chatId: v.optional(v.id("chats")),
    messageId: v.optional(v.id("messages")),

    // Metadata
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    extractedText: v.optional(v.string()),

    // Access control
    isPublic: v.optional(v.boolean()),
    shareToken: v.optional(v.string()),

    // Status
    status: v.optional(
      v.union(
        v.literal("uploading"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("error")
      )
    ),
    processingError: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_chat", ["chatId"])
    .index("by_message", ["messageId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_share_token", ["shareToken"])
    .searchIndex("search_files", {
      searchField: "filename",
      filterFields: ["userId", "isPublic", "status", "category"],
    }),

  // Project attachments table from PR #1
  projectAttachments: defineTable({
    projectId: v.id("projects"),
    attachmentId: v.id("attachments"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    content: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_attachment", ["attachmentId"]),

  // Memory system tables
  memories: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    usageCount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_user_active", ["userId", "isActive"])
    .searchIndex("search_memories", {
      searchField: "content",
      filterFields: ["userId", "isActive", "category"],
    }),

  // Project-specific memories linking table
  projectMemories: defineTable({
    projectId: v.id("projects"),
    memoryId: v.id("memories"),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_memory", ["memoryId"])
    .index("by_project_memory", ["projectId", "memoryId"]),

  // Chat sharing system
  chatShares: defineTable({
    chatId: v.id("chats"),
    token: v.string(),
    expiresAt: v.optional(v.number()),
    allowComments: v.optional(v.boolean()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    views: v.optional(v.number()),
    lastViewedAt: v.optional(v.number()),
  })
    .index("by_token", ["token"])
    .index("by_chat", ["chatId"])
    .index("by_creator", ["createdBy"]),

  // Team collaboration system
  teams: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    settings: v.optional(
      v.object({
        allowFileSharing: v.optional(v.boolean()),
        allowPublicChats: v.optional(v.boolean()),
        defaultModel: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    permissions: v.optional(
      v.object({
        canManageMembers: v.optional(v.boolean()),
        canManageSettings: v.optional(v.boolean()),
        canDeleteChats: v.optional(v.boolean()),
      })
    ),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_user", ["teamId", "userId"]),

  // Gifting system
  gifts: defineTable({
    fromUserId: v.id("users"),
    toEmail: v.string(),
    toUserId: v.optional(v.id("users")),
    giftType: v.union(v.literal("pro_month"), v.literal("pro_year")),
    amount: v.number(),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("claimed"), v.literal("expired")),
    claimToken: v.string(),
    purchasedAt: v.number(),
    claimedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index("by_from_user", ["fromUserId"])
    .index("by_to_user", ["toUserId"])
    .index("by_to_email", ["toEmail"])
    .index("by_claim_token", ["claimToken"])
    .index("by_status", ["status"]),
})

export default schema
