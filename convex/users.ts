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

// User storage and plan management
export const updateUserStorage = mutation({
  args: {
    storageUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    await ctx.db.patch(userId, {
      storageUsed: args.storageUsed,
      lastActiveAt: Date.now(),
    })
  },
})

export const initializeUserDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Initialize defaults if not set
    const updates: any = {}
    if (user.storageUsed === undefined) updates.storageUsed = 0
    if (user.storageLimit === undefined) updates.storageLimit = 1024 * 1024 * 100 // 100MB
    if (user.plan === undefined) updates.plan = "free"
    if (user.lastActiveAt === undefined) updates.lastActiveAt = Date.now()

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates)
    }
  },
})
