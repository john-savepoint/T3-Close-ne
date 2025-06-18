import { mutation } from "./_generated/server"

export const cleanupAllAuthData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 STARTING DATABASE CLEANUP...")

    // Get all tables that might contain auth data
    const users = await ctx.db.query("users").collect()
    const authSessions = await ctx.db.query("authSessions").collect()
    const authAccounts = await ctx.db.query("authAccounts").collect()
    const authVerificationCodes = await ctx.db.query("authVerificationCodes").collect()
    const authVerifiers = await ctx.db.query("authVerifiers").collect()
    const authRefreshTokens = await ctx.db.query("authRefreshTokens").collect()

    console.log(`📊 Found data to delete:`)
    console.log(`  - Users: ${users.length}`)
    console.log(`  - Auth Sessions: ${authSessions.length}`)
    console.log(`  - Auth Accounts: ${authAccounts.length}`)
    console.log(`  - Verification Codes: ${authVerificationCodes.length}`)
    console.log(`  - Auth Verifiers: ${authVerifiers.length}`)
    console.log(`  - Refresh Tokens: ${authRefreshTokens.length}`)

    // Delete all verification codes first
    for (const code of authVerificationCodes) {
      await ctx.db.delete(code._id)
      console.log(`🗑️ Deleted verification code: ${code._id}`)
    }

    // Delete all auth verifiers
    for (const verifier of authVerifiers) {
      await ctx.db.delete(verifier._id)
      console.log(`🗑️ Deleted auth verifier: ${verifier._id}`)
    }

    // Delete all refresh tokens
    for (const token of authRefreshTokens) {
      await ctx.db.delete(token._id)
      console.log(`🗑️ Deleted refresh token: ${token._id}`)
    }

    // Delete all auth sessions
    for (const session of authSessions) {
      await ctx.db.delete(session._id)
      console.log(`🗑️ Deleted auth session: ${session._id}`)
    }

    // Delete all auth accounts
    for (const account of authAccounts) {
      await ctx.db.delete(account._id)
      console.log(`🗑️ Deleted auth account: ${account._id}`)
    }

    // Delete all users last
    for (const user of users) {
      await ctx.db.delete(user._id)
      console.log(`🗑️ Deleted user: ${user._id} (${user.email})`)
    }

    console.log("✅ DATABASE CLEANUP COMPLETE!")

    return {
      deletedUsers: users.length,
      deletedSessions: authSessions.length,
      deletedAccounts: authAccounts.length,
      deletedVerificationCodes: authVerificationCodes.length,
      deletedVerifiers: authVerifiers.length,
      deletedRefreshTokens: authRefreshTokens.length,
      message: "All auth data successfully deleted",
    }
  },
})
