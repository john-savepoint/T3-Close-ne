import { v } from "convex/values"
import { QueryCtx, MutationCtx } from "./_generated/server"

/**
 * Get the current user from Clerk identity
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    // Check for demo mode - look for a user with specific test tokenIdentifier
    const demoUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), "test-user-123"))
      .first()

    if (demoUser) {
      return demoUser
    }

    return null
  }

  // Get user record from our database - try clerkId first
  let user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first()

  // If not found by clerkId, try tokenIdentifier (legacy)
  if (!user && identity.tokenIdentifier) {
    user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first()

    // Note: We can't update the user here if this is called from a query
    // The migration should be handled by a separate mutation
  }

  return user
}

/**
 * Require authentication and return the current user
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx)
  if (!user) {
    throw new Error("Unauthorized - please sign in")
  }
  return user
}

/**
 * Get the Clerk user ID from the identity
 */
export async function getClerkUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Unauthorized - no identity found")
  }
  return identity.subject
}
