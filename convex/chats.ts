import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("trashed"))),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let chatsQuery = ctx.db.query("chats").withIndex("by_user", (q) => q.eq("userId", args.userId))

    if (args.status) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    if (args.projectId) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("projectId"), args.projectId))
    }

    return await chatsQuery.order("desc").collect()
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
    return await ctx.db.patch(args.chatId, {
      status: args.status,
      statusChangedAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Message management functions
export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    type: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.optional(v.id("users")),
    model: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("attachments"))),
    parentMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content,
      type: args.type,
      userId: args.userId,
      model: args.model,
      attachments: args.attachments,
      parentMessageId: args.parentMessageId,
      timestamp: now,
    })

    // Update chat's updated timestamp
    await ctx.db.patch(args.chatId, {
      updatedAt: now,
      activeLeafMessageId: messageId,
    })

    // If attachments are provided, link them to this message
    if (args.attachments) {
      for (const attachmentId of args.attachments) {
        await ctx.db.patch(attachmentId, {
          messageId: messageId,
          chatId: args.chatId,
        })
      }
    }

    return messageId
  },
})

export const getMessages = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect()

    // Fetch attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.map(async (message) => {
        if (message.attachments) {
          const attachments = await Promise.all(
            message.attachments.map(async (attachmentId) => {
              const attachment = await ctx.db.get(attachmentId)
              if (attachment) {
                return {
                  ...attachment,
                  url: await ctx.storage.getUrl(attachment.storageId),
                }
              }
              return null
            })
          )
          return {
            ...message,
            attachments: attachments.filter(Boolean),
          }
        }
        return message
      })
    )

    return messagesWithAttachments
  },
})

export const removeMessageAttachment = mutation({
  args: {
    messageId: v.id("messages"),
    attachmentId: v.id("attachments"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId)
    if (!message || !message.attachments) {
      throw new Error("Message or attachments not found")
    }

    // Remove attachment from message
    const updatedAttachments = message.attachments.filter((id) => id !== args.attachmentId)

    await ctx.db.patch(args.messageId, {
      attachments: updatedAttachments.length > 0 ? updatedAttachments : undefined,
    })

    // Update attachment to remove message association
    await ctx.db.patch(args.attachmentId, {
      messageId: undefined,
      chatId: undefined,
    })

    return { success: true }
  },
})
