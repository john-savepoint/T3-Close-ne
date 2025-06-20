import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("trashed"))),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let chatsQuery = ctx.db.query("chats").withIndex("by_user", (q) => q.eq("userId", args.userId))

    if (args.status) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    if (args.projectId) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("projectId"), args.projectId))
    }

    let chats = await chatsQuery.order("desc").collect()

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      chats = chats.filter((chat) => chat.title.toLowerCase().includes(searchLower))
    }

    // Apply limit if provided
    if (args.limit) {
      chats = chats.slice(0, args.limit)
    }

    // Get message counts for each chat
    const chatsWithCounts = await Promise.all(
      chats.map(async (chat) => {
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .collect()
          .then((messages) => messages.length)

        return { ...chat, messageCount }
      })
    )

    return chatsWithCounts
  },
})

// Query to get chats with real-time message counts and latest message preview
export const listWithPreview = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("trashed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let chatsQuery = ctx.db.query("chats").withIndex("by_user", (q) => q.eq("userId", args.userId))

    if (args.status) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    let chats = await chatsQuery.order("desc").collect()

    if (args.limit) {
      chats = chats.slice(0, args.limit)
    }

    // Get message counts and latest message for each chat
    const chatsWithData = await Promise.all(
      chats.map(async (chat) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .collect()

        const latestMessage = messages[0] || null
        const messageCount = messages.length

        return {
          ...chat,
          messageCount,
          latestMessage: latestMessage
            ? {
                content:
                  latestMessage.content.substring(0, 100) +
                  (latestMessage.content.length > 100 ? "..." : ""),
                timestamp: latestMessage.timestamp,
                type: latestMessage.type,
              }
            : null,
        }
      })
    )

    return chatsWithData
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      projectId: args.projectId,
      activeLeafMessageId: undefined,
      status: "active",
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId)
  },
})

export const updateStatus = mutation({
  args: {
    chatId: v.id("chats"),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("trashed")),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    return await ctx.db.patch(args.chatId, {
      status: args.status,
      statusChangedAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Enhanced chat update mutation
export const update = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    model: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    const updates: any = { updatedAt: Date.now() }

    if (args.title !== undefined) updates.title = args.title
    if (args.systemPrompt !== undefined) updates.systemPrompt = args.systemPrompt
    if (args.model !== undefined) updates.model = args.model
    if (args.isPublic !== undefined) updates.isPublic = args.isPublic
    if (args.projectId !== undefined) updates.projectId = args.projectId

    return await ctx.db.patch(args.chatId, updates)
  },
})

// Mutation to duplicate/fork a chat
export const duplicate = mutation({
  args: {
    chatId: v.id("chats"),
    newTitle: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalChat = await ctx.db.get(args.chatId)
    if (!originalChat) {
      throw new Error("Original chat not found")
    }

    const now = Date.now()

    // Create new chat
    const newChatId = await ctx.db.insert("chats", {
      title: args.newTitle || `${originalChat.title} (Copy)`,
      userId: args.userId,
      projectId: originalChat.projectId,
      activeLeafMessageId: undefined,
      status: "active",
      statusChangedAt: now,
      isPublic: false, // Copies are private by default
      model: originalChat.model,
      systemPrompt: originalChat.systemPrompt,
      createdAt: now,
      updatedAt: now,
    })

    // Copy all messages
    const originalMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect()

    const messageIdMap = new Map<string, string>()

    for (const message of originalMessages) {
      const newMessageId = await ctx.db.insert("messages", {
        chatId: newChatId,
        content: message.content,
        type: message.type,
        userId: message.userId,
        model: message.model,
        parentMessageId: message.parentMessageId
          ? messageIdMap.get(message.parentMessageId)
          : undefined,
        timestamp: message.timestamp,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        metadata: message.metadata,
        // Note: attachments are not copied to avoid file duplication
      })

      messageIdMap.set(message._id, newMessageId)
    }

    return newChatId
  },
})

// Mutation to permanently delete a chat and all its messages
export const deletePermanently = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
      throw new Error("Chat not found")
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect()

    await Promise.all(messages.map((message) => ctx.db.delete(message._id)))

    // Delete chat shares
    const chatShares = await ctx.db
      .query("chatShares")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect()

    await Promise.all(chatShares.map((share) => ctx.db.delete(share._id)))

    // Delete the chat itself
    await ctx.db.delete(args.chatId)

    return args.chatId
  },
})

// Query to get chat statistics
export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allChats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    const activeChats = allChats.filter((chat) => chat.status === "active")
    const archivedChats = allChats.filter((chat) => chat.status === "archived")
    const trashedChats = allChats.filter((chat) => chat.status === "trashed")

    // Get total message count
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    return {
      totalChats: allChats.length,
      activeChats: activeChats.length,
      archivedChats: archivedChats.length,
      trashedChats: trashedChats.length,
      totalMessages: allMessages.length,
      oldestChat: allChats.length > 0 ? Math.min(...allChats.map((c) => c.createdAt)) : null,
      newestChat: allChats.length > 0 ? Math.max(...allChats.map((c) => c.createdAt)) : null,
    }
  },
})

// Mutation for bulk operations
export const bulkUpdateStatus = mutation({
  args: {
    chatIds: v.array(v.id("chats")),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("trashed")),
    userId: v.id("users"), // Verify ownership
  },
  handler: async (ctx, args) => {
    // Verify all chats belong to the user
    const chats = await Promise.all(args.chatIds.map((id) => ctx.db.get(id)))

    const invalidChats = chats.filter((chat) => !chat || chat.userId !== args.userId)
    if (invalidChats.length > 0) {
      throw new Error("Some chats don't belong to the specified user")
    }

    const now = Date.now()

    // Update all chats
    await Promise.all(
      args.chatIds.map((chatId) =>
        ctx.db.patch(chatId, {
          status: args.status,
          statusChangedAt: now,
          updatedAt: now,
        })
      )
    )

    return args.chatIds.length
  },
})

// Mutation to create a chat from temporary chat data
export const createFromTemporary = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    messages: v.array(
      v.object({
        content: v.string(),
        type: v.union(v.literal("user"), v.literal("assistant")),
        model: v.optional(v.string()),
        timestamp: v.string(), // ISO string
      })
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      projectId: args.projectId,
      activeLeafMessageId: undefined,
      status: "active",
      statusChangedAt: now,
      model: args.model,
      createdAt: now,
      updatedAt: now,
    })

    // Insert all messages
    let lastMessageId: string | undefined = undefined

    for (const message of args.messages) {
      const messageId: string = await ctx.db.insert("messages", {
        chatId,
        content: message.content,
        type: message.type,
        userId: message.type === "user" ? args.userId : undefined,
        model: message.model,
        parentMessageId: lastMessageId,
        timestamp: new Date(message.timestamp).getTime(),
        isEdited: false,
      })

      lastMessageId = messageId
    }

    // Update chat with the last message as active leaf
    if (lastMessageId) {
      await ctx.db.patch(chatId, {
        activeLeafMessageId: lastMessageId,
      })
    }

    return chatId
  },
})

// Internal mutation for auto-purging trashed chats older than 30 days
// This is called by the daily cron job
export const autoPurgeTrashedChats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

    // Find all trashed chats older than 30 days
    const trashedChats = await ctx.db
      .query("chats")
      .withIndex("by_status", (q) => q.eq("status", "trashed"))
      .filter((q) => q.lt(q.field("statusChangedAt"), thirtyDaysAgo))
      .collect()

    if (trashedChats.length === 0) {
      console.log("Auto-purge: No trashed chats older than 30 days found")
      return { purgedCount: 0, chatIds: [] }
    }

    console.log(`Auto-purge: Found ${trashedChats.length} chats to purge`)

    // Delete all messages for these chats
    const deletePromises = trashedChats.map(async (chat) => {
      // Delete all messages in the chat
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .collect()

      await Promise.all(messages.map((message) => ctx.db.delete(message._id)))

      // Delete chat shares
      const chatShares = await ctx.db
        .query("chatShares")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .collect()

      await Promise.all(chatShares.map((share) => ctx.db.delete(share._id)))

      // Delete the chat itself
      await ctx.db.delete(chat._id)

      return chat._id
    })

    const purgedChatIds = await Promise.all(deletePromises)

    console.log(`Auto-purge: Successfully purged ${purgedChatIds.length} chats`)

    return {
      purgedCount: purgedChatIds.length,
      chatIds: purgedChatIds,
    }
  },
})

// Pin a chat
export const pinChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)
    const chat = await ctx.db.get(args.chatId)
    
    if (!chat) {
      throw new Error("Chat not found")
    }
    
    if (chat.userId !== user._id) {
      throw new Error("Access denied")
    }
    
    await ctx.db.patch(args.chatId, {
      isPinned: true,
      pinnedAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    return { success: true }
  },
})

// Unpin a chat
export const unpinChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)
    const chat = await ctx.db.get(args.chatId)
    
    if (!chat) {
      throw new Error("Chat not found")
    }
    
    if (chat.userId !== user._id) {
      throw new Error("Access denied")
    }
    
    await ctx.db.patch(args.chatId, {
      isPinned: false,
      pinnedAt: undefined,
      updatedAt: Date.now(),
    })
    
    return { success: true }
  },
})
