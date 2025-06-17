import { getAuthUserId } from "@convex-dev/auth/server"
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Auth-based queries using @convex-dev/auth
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return null
    }

    return await ctx.db.get(userId)
  },
})

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const updateData: { name?: string; image?: string } = {}
    if (args.name !== undefined) updateData.name = args.name
    if (args.image !== undefined) updateData.image = args.image

    if (Object.keys(updateData).length === 0) {
      return
    }

    await ctx.db.patch(userId, updateData)
  },
})

// Legacy user functions for backwards compatibility
export const create = mutation({
  args: {
    tokenIdentifier: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique()

    if (existingUser) {
      return existingUser._id
    }

    return await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      plan: "free",
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 100, // 100MB default
    })
  },
})

export const get = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique()
  },
})
