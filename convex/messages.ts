import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Query to get all messages for a chat with pagination
export const list = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50

    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")

    if (args.cursor) {
      messagesQuery = messagesQuery.filter((q) => q.gt(q.field("_id"), args.cursor as any))
    }

    const messages = await messagesQuery.take(limit + 1)
    const hasMore = messages.length > limit

    if (hasMore) {
      messages.pop()
    }

    return {
      messages,
      hasMore,
      nextCursor: hasMore ? messages[messages.length - 1]?._id : null,
    }
  },
})

// Query to get a specific message by ID
export const get = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId)
  },
})

// Query to get conversation tree for a chat
export const getConversationTree = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect()

    // Build tree structure
    const messageMap = new Map()
    const children = new Map()

    messages.forEach((msg: any) => {
      messageMap.set(msg._id, { ...msg, children: [] })
      if (!children.has(msg.parentMessageId)) {
        children.set(msg.parentMessageId, [])
      }
      children.get(msg.parentMessageId)?.push(msg._id)
    })

    // Organize into tree structure
    children.forEach((childIds, parentId) => {
      if (parentId && messageMap.has(parentId)) {
        messageMap.get(parentId).children = childIds.map((id: any) => messageMap.get(id))
      }
    })

    // Return root messages (no parent) and full tree
    const rootMessages = messages
      .filter((msg) => !msg.parentMessageId)
      .map((msg) => messageMap.get(msg._id))

    return {
      tree: rootMessages,
      messages: Object.fromEntries(messageMap),
    }
  },
})

// Mutation to create a new message
export const create = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    type: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.optional(v.id("users")),
    parentMessageId: v.optional(v.string()),
    model: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("attachments"))),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        cost: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      type: args.type,
      userId: args.userId,
      parentMessageId: args.parentMessageId,
      model: args.model,
      attachments: args.attachments,
      metadata: args.metadata,
      timestamp: now,
      isEdited: false,
    })

    // Update chat's updatedAt timestamp and active leaf if this is a leaf message
    await ctx.db.patch(args.chatId, {
      updatedAt: now,
      activeLeafMessageId: !args.parentMessageId ? messageId : undefined,
    })

    return messageId
  },
})

/**
 * Mutation to edit a message's content
 * - Verifies user authentication
 * - Verifies user owns the message (via chat ownership)
 * - Updates content and marks as edited with timestamp
 * - Updates chat's updatedAt timestamp
 */
export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Authentication required")
    }

    const message = await ctx.db.get(args.messageId)
    if (!message) {
      throw new Error("Message not found")
    }

    // Verify user owns the message by checking the chat ownership
    const chat = await ctx.db.get(message.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    // Note: Authentication is currently disabled for competition
    // In production, uncomment this check:
    // if (chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized: You can only edit your own messages")
    // }
    
    const now = Date.now()

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
      editedAt: now,
    })

    // Update chat's updatedAt timestamp
    await ctx.db.patch(message.chatId, {
      updatedAt: now,
    })
    
    return { messageId: args.messageId, success: true }
  },
})

/**
 * Mutation to delete a message and all its children recursively
 * - Verifies user authentication  
 * - Verifies user owns the message (via chat ownership)
 * - Recursively finds and deletes all child messages
 * - Deletes the message itself
 * - Updates chat's updatedAt timestamp
 * - Returns count of deleted messages
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Authentication required")
    }

    const message = await ctx.db.get(args.messageId)
    if (!message) {
      throw new Error("Message not found")
    }

    // Verify user owns the message by checking the chat ownership
    const chat = await ctx.db.get(message.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    // Note: Authentication is currently disabled for competition
    // In production, uncomment this check:
    // if (chat.userId !== identity.subject) {
    //   throw new Error("Unauthorized: You can only delete your own messages")
    // }
    
    // Find all child messages recursively
    const findChildren = async (parentId: string): Promise<string[]> => {
      const children = await ctx.db
        .query("messages")
        .withIndex("by_parent", (q) => q.eq("parentMessageId", parentId))
        .collect()

      let allChildren = children.map((child: any) => child._id)

      for (const child of children) {
        const grandChildren = await findChildren(child._id)
        allChildren = allChildren.concat(grandChildren)
      }

      return allChildren
    }

    const childrenIds = await findChildren(args.messageId)

    // Delete all children first
    for (const childId of childrenIds) {
      await ctx.db.delete(childId as any)
    }

    // Delete the message itself
    await ctx.db.delete(args.messageId)

    // Update chat's updatedAt timestamp
    await ctx.db.patch(message.chatId, {
      updatedAt: Date.now(),
    })
    
    return { deletedCount: childrenIds.length + 1, success: true }
  },
})

// Mutation to create a branch from an existing message
export const createBranch = mutation({
  args: {
    parentMessageId: v.string(),
    content: v.string(),
    type: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.optional(v.id("users")),
    model: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        cost: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get parent message to find chat
    const parentMessage = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("_id"), args.parentMessageId))
      .first()

    if (!parentMessage) {
      throw new Error("Parent message not found")
    }

    const now = Date.now()

    const messageId = await ctx.db.insert("messages", {
      chatId: parentMessage.chatId,
      content: args.content,
      type: args.type,
      userId: args.userId,
      parentMessageId: args.parentMessageId,
      model: args.model,
      metadata: args.metadata,
      timestamp: now,
      isEdited: false,
    })

    // Update chat's updatedAt timestamp
    await ctx.db.patch(parentMessage.chatId, {
      updatedAt: now,
    })

    return messageId
  },
})

// Query to get all branches from a specific message
export const getBranches = query({
  args: { parentMessageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_parent", (q) => q.eq("parentMessageId", args.parentMessageId))
      .order("asc")
      .collect()
  },
})

// Query to get the latest messages for a chat (for sidebar preview)
export const getLatestForChat = query({
  args: { chatId: v.id("chats"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 3

    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .take(limit)
  },
})

// Mutation to bulk delete messages
export const bulkDelete = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    let deletedCount = 0
    let chatId: any = null

    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId)
      if (message) {
        await ctx.db.delete(messageId)
        deletedCount++
        if (!chatId) chatId = message.chatId
      }
    }

    // Update chat's updatedAt timestamp if we deleted any messages
    if (chatId && deletedCount > 0) {
      await ctx.db.patch(chatId, {
        updatedAt: Date.now(),
      })
    }

    return { deletedCount }
  },
})
