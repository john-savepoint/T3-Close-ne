import { mutation } from "./_generated/server"
import { v } from "convex/values"

/**
 * Migration to handle users without clerkId (legacy auth system)
 * This assigns a temporary clerkId based on tokenIdentifier for demo users
 */
export const migrateLegacyUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    let migrated = 0

    for (const user of users) {
      // Skip if user already has clerkId
      if (user.clerkId) continue

      // For demo/test users with tokenIdentifier, create a clerkId
      if (user.tokenIdentifier) {
        await ctx.db.patch(user._id, {
          clerkId: `demo_${user.tokenIdentifier}`,
          updatedAt: Date.now(),
        })
        migrated++
      }
    }

    return { migrated, total: users.length }
  },
})

/**
 * Clean up orphaned data from old auth system
 */
export const cleanupOrphanedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Find all users without clerkId and without tokenIdentifier
    const orphanedUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(q.eq(q.field("clerkId"), undefined), q.eq(q.field("tokenIdentifier"), undefined))
      )
      .collect()

    // These users can't be accessed by either auth system
    // Log them for manual review
    console.log(`Found ${orphanedUsers.length} orphaned users:`, orphanedUsers)

    return { orphanedCount: orphanedUsers.length }
  },
})
