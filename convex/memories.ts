import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"

// Temporary user ID for demo purposes (since auth is disabled)
const DEMO_USER_ID = "demo-user" as Id<"users">

// Create a new memory
export const createMemory = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // Since auth is disabled, use demo user
    const userId = DEMO_USER_ID

    const now = Date.now()
    const memory = await ctx.db.insert("memories", {
      userId,
      title: args.title,
      content: args.content,
      category: args.category,
      tags: args.tags,
      isActive: args.isActive ?? true,
      priority: args.priority ?? 0,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    })

    // If projectId is provided, create a project memory association
    if (args.projectId) {
      await ctx.db.insert("projectMemories", {
        projectId: args.projectId,
        memoryId: memory,
        createdAt: now,
      })
    }

    return memory
  },
})

// Update an existing memory
export const updateMemory = mutation({
  args: {
    id: v.id("memories"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id)
    if (!memory) {
      throw new Error("Memory not found")
    }

    const updates: Partial<Doc<"memories">> = {
      updatedAt: Date.now(),
    }

    if (args.title !== undefined) updates.title = args.title
    if (args.content !== undefined) updates.content = args.content
    if (args.category !== undefined) updates.category = args.category
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.isActive !== undefined) updates.isActive = args.isActive
    if (args.priority !== undefined) updates.priority = args.priority

    await ctx.db.patch(args.id, updates)
    return args.id
  },
})

// Delete a memory
export const deleteMemory = mutation({
  args: {
    id: v.id("memories"),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.id)
    if (!memory) {
      throw new Error("Memory not found")
    }

    // Delete any project associations
    const projectMemories = await ctx.db
      .query("projectMemories")
      .withIndex("by_memory", (q) => q.eq("memoryId", args.id))
      .collect()

    for (const pm of projectMemories) {
      await ctx.db.delete(pm._id)
    }

    await ctx.db.delete(args.id)
    return args.id
  },
})

// Get all memories for the current user
export const getMemoriesForUser = query({
  args: {
    projectId: v.optional(v.id("projects")),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Since auth is disabled, use demo user
    const userId = DEMO_USER_ID

    let memoriesQuery = ctx.db.query("memories").withIndex("by_user", (q) => q.eq("userId", userId))

    const memories = await memoriesQuery.collect()

    // Filter by active status if requested
    let filteredMemories = args.onlyActive ? memories.filter((m) => m.isActive !== false) : memories

    // If projectId is provided, also include project-specific memories
    if (args.projectId) {
      const projectMemoryIds = await ctx.db
        .query("projectMemories")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect()

      const projectMemoryIdSet = new Set(projectMemoryIds.map((pm) => pm.memoryId))

      // Include memories that are either global or belong to this project
      filteredMemories = filteredMemories.filter((memory) => {
        const projectMemories = projectMemoryIds.filter((pm) => pm.memoryId === memory._id)
        return projectMemories.length === 0 || projectMemoryIdSet.has(memory._id)
      })
    }

    return filteredMemories.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  },
})

// Search memories
export const searchMemories = query({
  args: {
    query: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    // Since auth is disabled, use demo user
    const userId = DEMO_USER_ID

    // Use the search index
    const searchResults = await ctx.db
      .query("memories")
      .withSearchIndex("search_memories", (q) =>
        q.search("content", args.query).eq("userId", userId).eq("isActive", true)
      )
      .collect()

    // If projectId is provided, filter to include only global or project-specific memories
    if (args.projectId) {
      const projectMemoryIds = await ctx.db
        .query("projectMemories")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .collect()

      const projectMemoryIdSet = new Set(projectMemoryIds.map((pm) => pm.memoryId))

      return searchResults.filter((memory) => {
        const projectMemories = projectMemoryIds.filter((pm) => pm.memoryId === memory._id)
        return projectMemories.length === 0 || projectMemoryIdSet.has(memory._id)
      })
    }

    return searchResults
  },
})

// Track memory usage
export const trackMemoryUsage = mutation({
  args: {
    memoryId: v.id("memories"),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.memoryId)
    if (!memory) {
      return
    }

    await ctx.db.patch(args.memoryId, {
      lastUsedAt: Date.now(),
      usageCount: (memory.usageCount || 0) + 1,
    })
  },
})

// Create a memory suggestion
export const createMemorySuggestion = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // Since auth is disabled, use demo user
    const userId = DEMO_USER_ID

    // Create a suggestion (stored as an inactive memory)
    const suggestion = await ctx.db.insert("memories", {
      userId,
      title: args.title,
      content: args.content,
      category: args.category || "suggestion",
      isActive: false, // Suggestions start as inactive
      priority: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
    })

    return suggestion
  },
})

// Accept or reject a memory suggestion
export const processSuggestion = mutation({
  args: {
    suggestionId: v.id("memories"),
    accept: v.boolean(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const suggestion = await ctx.db.get(args.suggestionId)
    if (!suggestion) {
      throw new Error("Suggestion not found")
    }

    if (args.accept) {
      // Activate the suggestion
      await ctx.db.patch(args.suggestionId, {
        isActive: true,
        category: suggestion.category === "suggestion" ? undefined : suggestion.category,
        updatedAt: Date.now(),
      })

      // If projectId is provided, create project association
      if (args.projectId) {
        await ctx.db.insert("projectMemories", {
          projectId: args.projectId,
          memoryId: args.suggestionId,
          createdAt: Date.now(),
        })
      }
    } else {
      // Delete rejected suggestions
      await ctx.db.delete(args.suggestionId)
    }

    return args.suggestionId
  },
})

// Get memory analytics for the current user
export const getMemoryAnalytics = query({
  handler: async (ctx) => {
    // Since auth is disabled, use demo user
    const userId = DEMO_USER_ID

    const memories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const activeMemories = memories.filter((m) => m.isActive !== false)

    // Count by category
    const categoryCounts: Record<string, number> = {}
    memories.forEach((memory) => {
      const category = memory.category || "uncategorized"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    // Get recently used memories
    const recentlyUsed = memories
      .filter((m) => m.lastUsedAt)
      .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
      .slice(0, 5)

    // Get most used memories
    const mostUsed = memories
      .filter((m) => m.usageCount && m.usageCount > 0)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)

    return {
      totalMemories: memories.length,
      activeMemories: activeMemories.length,
      categoryCounts,
      recentlyUsed,
      mostUsed,
    }
  },
})
