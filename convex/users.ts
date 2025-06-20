import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getCurrentUser as getClerkUser, requireAuth, getClerkUserId } from "./clerk"

// Get current user from Clerk
export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getClerkUser(ctx)
  },
})

// Alias for backward compatibility
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getClerkUser(ctx)
  },
})

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
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
    // Use a transaction-like approach to avoid concurrent modifications
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    const now = Date.now()

    if (existing) {
      // Check if the user data actually needs updating to avoid unnecessary writes
      const needsUpdate = 
        existing.email !== args.email ||
        existing.name !== args.name ||
        existing.image !== args.image ||
        // Only update lastActiveAt if it's been more than 5 minutes
        (existing.lastActiveAt && now - existing.lastActiveAt > 5 * 60 * 1000)

      if (!needsUpdate) {
        return existing._id
      }

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
      updatedAt: Date.now(),
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

// Initialize demo user for testing
export const initializeDemoUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo user already exists
    const existingDemo = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), "demo-user"))
      .first()
    
    if (existingDemo) {
      return existingDemo._id
    }

    // Create demo user
    const now = Date.now()
    return await ctx.db.insert("users", {
      clerkId: "demo-user",
      email: "demo@z6chat.com",
      name: "Demo User",
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 10, // 10MB for demo
      plan: "demo",
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    })
  },
})
