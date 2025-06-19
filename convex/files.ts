import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { requireAuth, getCurrentUser } from "./clerk"
import { Id } from "./_generated/dataModel"

// Generate upload URL with validation
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Require authentication for file uploads
    await requireAuth(ctx)
    
    return await ctx.storage.generateUploadUrl()
  },
})

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    originalFilename: v.string(),
    contentType: v.string(),
    size: v.number(),
    category: v.string(),
    chatId: v.optional(v.id("chats")),
    messageId: v.optional(v.id("messages")),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Require authentication and get current user
    const user = await requireAuth(ctx)

    // Create attachment record
    const attachmentId = await ctx.db.insert("attachments", {
      storageId: args.storageId,
      filename: args.filename,
      originalFilename: args.originalFilename,
      contentType: args.contentType,
      size: args.size,
      category: args.category,
      userId: user._id,
      uploadedAt: Date.now(),
      createdAt: Date.now(),
      chatId: args.chatId,
      messageId: args.messageId,
      description: args.description,
      tags: args.tags,
      isPublic: false,
      status: "ready",
    })

    return attachmentId
  },
})

// Get file with URL
export const getFile = query({
  args: { id: v.id("attachments") },
  handler: async (ctx, args) => {
    const attachment = await ctx.db.get(args.id)
    if (!attachment) {
      throw new Error("File not found")
    }

    // Check if file is public or user owns it
    const user = await getCurrentUser(ctx)
    if (!attachment.isPublic && (!user || attachment.userId !== user._id)) {
      throw new Error("Access denied")
    }

    const url = await ctx.storage.getUrl(attachment.storageId)

    return {
      ...attachment,
      url,
    }
  },
})

// Get file URL only
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Find attachment by storageId to check permissions
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .first()
    
    if (!attachment) {
      throw new Error("File not found")
    }

    // Check if file is public or user owns it
    const user = await getCurrentUser(ctx)
    if (!attachment.isPublic && (!user || attachment.userId !== user._id)) {
      throw new Error("Access denied")
    }

    return await ctx.storage.getUrl(args.storageId)
  },
})

// List files for a user
export const getUserFiles = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current authenticated user
    const user = await requireAuth(ctx)

    let query = ctx.db.query("attachments").withIndex("by_user", (q) => q.eq("userId", user._id))

    if (args.category) {
      query = ctx.db
        .query("attachments")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .filter((q) => q.eq(q.field("userId"), user._id))
    }

    const attachments = await query.order("desc").take(args.limit || 50)

    // Generate URLs for all files
    return Promise.all(
      attachments.map(async (attachment) => ({
        ...attachment,
        url: await ctx.storage.getUrl(attachment.storageId),
      }))
    )
  },
})

// Get files for a chat
export const getChatFiles = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Verify user has access to this chat
    const user = await requireAuth(ctx)
    const chat = await ctx.db.get(args.chatId)
    
    if (!chat || chat.userId !== user._id) {
      throw new Error("Access denied")
    }

    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect()

    // Generate URLs for all attachments
    return Promise.all(
      attachments.map(async (attachment) => ({
        ...attachment,
        url: await ctx.storage.getUrl(attachment.storageId),
      }))
    )
  },
})

// Delete file
export const deleteFile = mutation({
  args: { id: v.id("attachments") },
  handler: async (ctx, args) => {
    const attachment = await ctx.db.get(args.id)
    if (!attachment) {
      throw new Error("File not found")
    }

    // Verify user owns this file
    const user = await requireAuth(ctx)
    if (attachment.userId !== user._id) {
      throw new Error("Access denied")
    }

    // Delete from storage
    await ctx.storage.delete(attachment.storageId)

    // Delete from database
    await ctx.db.delete(args.id)

    return { success: true }
  },
})

// Search files
export const searchFiles = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Filter by current user
    const user = await requireAuth(ctx)
    
    let searchQuery = ctx.db
      .query("attachments")
      .withSearchIndex("search_files", (q) => q.search("filename", args.query))
      .filter((q) => q.eq(q.field("userId"), user._id))

    if (args.category) {
      searchQuery = searchQuery.filter((q) => q.eq(q.field("category"), args.category))
    }

    const results = await searchQuery.take(args.limit || 20)

    // Generate URLs for search results
    return Promise.all(
      results.map(async (attachment) => ({
        ...attachment,
        url: await ctx.storage.getUrl(attachment.storageId),
      }))
    )
  },
})

// Update file metadata
export const updateFile = mutation({
  args: {
    id: v.id("attachments"),
    filename: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const attachment = await ctx.db.get(id)
    if (!attachment) {
      throw new Error("File not found")
    }

    // Verify user owns this file
    const user = await requireAuth(ctx)
    if (attachment.userId !== user._id) {
      throw new Error("Access denied")
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )

    await ctx.db.patch(id, filteredUpdates)

    return { success: true }
  },
})
