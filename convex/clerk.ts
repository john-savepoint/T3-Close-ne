import { v } from "convex/values"
import { QueryCtx, MutationCtx } from "./_generated/server"

/**
 * Get the current user from Clerk identity
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }
  
  // Get user record from our database
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first()
    
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