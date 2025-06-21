import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { requireAuth } from "./clerk"

// Get user preferences
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx)
    
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first()
    
    // Return default preferences if none exist
    if (!preferences) {
      return {
        dismissedElements: {}
      }
    }
    
    return {
      dismissedElements: preferences.dismissedElements || {}
    }
  },
})

// Update a specific dismissed element
export const dismissElement = mutation({
  args: {
    elementId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)
    
    // Try to create or update in a single operation to avoid race conditions
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first()
    
    const now = Date.now()
    
    if (existing) {
      // Check if element is already dismissed to avoid unnecessary updates
      if (existing.dismissedElements?.[args.elementId] === true) {
        return // Already dismissed, no need to update
      }
      
      // Update existing preferences
      await ctx.db.patch(existing._id, {
        dismissedElements: {
          ...existing.dismissedElements,
          [args.elementId]: true,
        },
        updatedAt: now,
      })
    } else {
      // Create new preferences
      // Use a try-catch in case another request creates it simultaneously
      try {
        await ctx.db.insert("userPreferences", {
          userId: user._id,
          dismissedElements: {
            [args.elementId]: true,
          },
          createdAt: now,
          updatedAt: now,
        })
      } catch (error) {
        // If insert fails due to race condition, try updating instead
        const newExisting = await ctx.db
          .query("userPreferences")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first()
        
        if (newExisting && !newExisting.dismissedElements?.[args.elementId]) {
          await ctx.db.patch(newExisting._id, {
            dismissedElements: {
              ...newExisting.dismissedElements,
              [args.elementId]: true,
            },
            updatedAt: now,
          })
        }
      }
    }
  },
})

// Reset a specific dismissed element or all dismissed elements
export const resetDismissed = mutation({
  args: {
    elementId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)
    
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first()
    
    if (!existing) {
      return // Nothing to reset
    }
    
    const now = Date.now()
    
    if (args.elementId) {
      // Reset specific element
      const updatedDismissedElements = { ...existing.dismissedElements }
      delete updatedDismissedElements[args.elementId as keyof typeof updatedDismissedElements]
      
      await ctx.db.patch(existing._id, {
        dismissedElements: updatedDismissedElements,
        updatedAt: now,
      })
    } else {
      // Reset all dismissed elements
      await ctx.db.patch(existing._id, {
        dismissedElements: {},
        updatedAt: now,
      })
    }
  },
})

// Reset all preferences
export const resetAll = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx)
    
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first()
    
    if (existing) {
      await ctx.db.delete(existing._id)
    }
  },
})