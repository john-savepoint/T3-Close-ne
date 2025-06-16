import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { 
    userId: v.id("users"),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"), v.literal("trashed"))),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    let chatsQuery = ctx.db.query("chats").withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    if (args.status) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.projectId) {
      chatsQuery = chatsQuery.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }
    
    return await chatsQuery.order("desc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      projectId: args.projectId,
      activeLeafMessageId: undefined,
      status: "active",
      statusChangedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

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
    });
  },
});