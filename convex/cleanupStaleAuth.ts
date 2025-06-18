import { mutation } from "./_generated/server"

export const cleanupStaleVerificationCodes = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 CLEANING UP STALE VERIFICATION CODES...")

    // Clean up expired verification codes (older than 15 minutes)
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000

    const allVerificationCodes = await ctx.db.query("authVerificationCodes").collect()
    let deletedCount = 0

    for (const code of allVerificationCodes) {
      // Delete codes older than 15 minutes
      if (code._creationTime < fifteenMinutesAgo) {
        await ctx.db.delete(code._id)
        deletedCount++
        console.log(`🗑️ Deleted expired verification code: ${code._id}`)
      }
    }

    // Also clean up any orphaned auth sessions with invalid tokens
    const invalidSessions = await ctx.db.query("authSessions").collect()
    let sessionDeletedCount = 0

    for (const session of invalidSessions) {
      // Check if session is older than 1 hour
      if (session._creationTime < Date.now() - 60 * 60 * 1000) {
        await ctx.db.delete(session._id)
        sessionDeletedCount++
        console.log(`🗑️ Deleted old auth session: ${session._id}`)
      }
    }

    console.log(
      `✅ CLEANUP COMPLETE - Deleted ${deletedCount} verification codes, ${sessionDeletedCount} sessions`
    )

    return {
      deletedVerificationCodes: deletedCount,
      deletedSessions: sessionDeletedCount,
      message: `Cleaned up ${deletedCount} expired verification codes and ${sessionDeletedCount} old sessions`,
    }
  },
})
