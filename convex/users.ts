import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getCurrentUser, requireAuth, getClerkUserId } from "./clerk"

// Get current user from Clerk
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx)
  },
})

// Sync user from Clerk to Convex database
export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
      
    const now = Date.now()
    
    if (existing) {
      // Update existing user
      return await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        image: args.image,
        updatedAt: now,
        lastActiveAt: now,
      })
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        image: args.image,
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 100, // 100MB
        plan: "free",
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      })
    }
  },
})

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)

    const updateData: { name?: string; image?: string; updatedAt: number } = {
      updatedAt: Date.now()
    }
    if (args.name !== undefined) updateData.name = args.name
    if (args.image !== undefined) updateData.image = args.image

    await ctx.db.patch(user._id, updateData)
  },
})

// User storage and plan management
export const updateUserStorage = mutation({
  args: {
    storageUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)

    await ctx.db.patch(user._id, {
      storageUsed: args.storageUsed,
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const initializeUserDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx)

    // Initialize defaults if not set
    const updates: any = { updatedAt: Date.now() }
    if (user.storageUsed === undefined) updates.storageUsed = 0
    if (user.storageLimit === undefined) updates.storageLimit = 1024 * 1024 * 100 // 100MB
    if (user.plan === undefined) updates.plan = "free"
    if (user.lastActiveAt === undefined) updates.lastActiveAt = Date.now()

    await ctx.db.patch(user._id, updates)
  },
})
