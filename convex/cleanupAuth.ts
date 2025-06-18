import { mutation } from "./_generated/server"

export const cleanupExpiredCodes = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting cleanup of expired verification codes")

    const now = Date.now()
    const allCodes = await ctx.db.query("authVerificationCodes").collect()

    console.log("Found verification codes:", allCodes.length)

    let deletedCount = 0
    for (const code of allCodes) {
      // Delete codes older than 15 minutes or with expired expirationTime
      const isOld = now - code._creationTime > 15 * 60 * 1000 // 15 minutes
      const isExpired = code.expirationTime && code.expirationTime < now

      if (isOld || isExpired) {
        console.log(
          "Deleting expired code:",
          code._id,
          "created:",
          new Date(code._creationTime).toISOString()
        )
        await ctx.db.delete(code._id)
        deletedCount++
      }
    }

    console.log("Deleted", deletedCount, "expired verification codes")
    return { deletedCount, totalCodes: allCodes.length }
  },
})

export const fixAuthAccountData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Fixing auth account emailVerified field - should be timestamp not email")

    const authAccounts = await ctx.db.query("authAccounts").collect()

    let fixedCount = 0
    for (const account of authAccounts) {
      // If emailVerified contains an email address instead of a timestamp, fix it
      if (
        account.emailVerified &&
        typeof account.emailVerified === "string" &&
        account.emailVerified.includes("@")
      ) {
        console.log("Fixing account:", account._id, "emailVerified has email instead of timestamp")
        console.log("Current emailVerified:", account.emailVerified)

        // emailVerified should be a timestamp string when verified, not the email address
        await ctx.db.patch(account._id, {
          emailVerified: Date.now().toString(), // Set current timestamp as verification time
        })
        fixedCount++
      }
    }

    console.log("Fixed", fixedCount, "auth accounts")
    return { fixedCount, totalAccounts: authAccounts.length }
  },
})
