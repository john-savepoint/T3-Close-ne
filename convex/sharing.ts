import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"

// Generate a secure random token
function generateSecureToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create a shared link for a chat
export const createSharedLink = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized - please sign in")

    // Get the chat and verify ownership
    const chat = await ctx.db.get(args.chatId)
    if (!chat) throw new Error("Chat not found")
    
    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    
    if (!user) throw new Error("User not found")
    if (chat.userId !== user._id) throw new Error("Unauthorized - you don't own this chat")

    // Check if there's already an active share for this chat
    const existingShare = await ctx.db
      .query("sharedChats")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique()

    if (existingShare) {
      return existingShare
    }

    // Create new shared link
    const token = generateSecureToken()
    const sharedChat = await ctx.db.insert("sharedChats", {
      chatId: args.chatId,
      ownerUserId: user._id,
      token,
      isActive: true,
      viewCount: 0,
      createdAt: Date.now(),
    })

    // Update the chat to mark it as public
    await ctx.db.patch(args.chatId, { isPublic: true })

    return await ctx.db.get(sharedChat)
  },
})

// Revoke a shared link
export const revokeSharedLink = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized - please sign in")

    // Get the chat and verify ownership
    const chat = await ctx.db.get(args.chatId)
    if (!chat) throw new Error("Chat not found")
    
    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    
    if (!user) throw new Error("User not found")
    if (chat.userId !== user._id) throw new Error("Unauthorized - you don't own this chat")

    // Find the active share
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique()

    if (!sharedChat) {
      throw new Error("No active share found for this chat")
    }

    // Deactivate the share
    await ctx.db.patch(sharedChat._id, { isActive: false })

    // Update the chat to mark it as private
    await ctx.db.patch(args.chatId, { isPublic: false })
  },
})

// Get shared links for the current user
export const getMySharedLinks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    
    if (!user) return []

    // Get all shared links for this user
    const sharedChats = await ctx.db
      .query("sharedChats")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect()

    // Get chat details for each share
    const sharedChatsWithDetails = await Promise.all(
      sharedChats.map(async (share) => {
        const chat = await ctx.db.get(share.chatId)
        return {
          ...share,
          chatTitle: chat?.title || "Untitled Chat",
        }
      })
    )

    return sharedChatsWithDetails
  },
})

// Get a public chat by token (no auth required)
export const getPublicChatByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the shared chat by token
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()

    if (!sharedChat || !sharedChat.isActive) {
      return null
    }

    // Increment view count
    await ctx.db.patch(sharedChat._id, {
      viewCount: sharedChat.viewCount + 1,
    })

    // Get the chat
    const chat = await ctx.db.get(sharedChat.chatId)
    if (!chat) return null

    // Get all messages for this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", sharedChat.chatId))
      .collect()

    // Return public view of the chat
    return {
      token: args.token,
      title: chat.title,
      createdAt: chat.createdAt,
      messageCount: messages.length,
      isActive: true,
      messages: messages.map((msg) => ({
        id: msg._id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.createdAt,
        model: msg.model,
      })),
    }
  },
})

// Fork a shared conversation into user's own chat
export const forkConversation = mutation({
  args: {
    token: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized - please sign in to fork conversations")

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    
    if (!user) throw new Error("User not found")

    // Find the shared chat
    const sharedChat = await ctx.db
      .query("sharedChats")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique()

    if (!sharedChat || !sharedChat.isActive) {
      throw new Error("Shared chat not found or no longer active")
    }

    // Get the original chat
    const originalChat = await ctx.db.get(sharedChat.chatId)
    if (!originalChat) throw new Error("Original chat not found")

    // Get all messages from the original chat
    const originalMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", sharedChat.chatId))
      .collect()

    // Create new chat for the user
    const newChatId = await ctx.db.insert("chats", {
      title: args.title || `Fork of ${originalChat.title}`,
      userId: user._id,
      status: "active",
      statusChangedAt: Date.now(),
      isPublic: false,
      model: originalChat.model,
      systemPrompt: originalChat.systemPrompt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Copy all messages to the new chat
    for (const msg of originalMessages) {
      await ctx.db.insert("messages", {
        chatId: newChatId,
        content: msg.content,
        type: msg.type,
        model: msg.model,
        parentMessageId: msg.parentMessageId,
        isEdited: false,
        userId: msg.type === "user" ? user._id : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return newChatId
  },
})