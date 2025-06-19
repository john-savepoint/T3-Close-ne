import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.optional(v.string()),
    parentProjectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      systemPrompt: args.systemPrompt,
      parentProjectId: args.parentProjectId,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return projectId
  },
})

// Get all projects for a user
export const getUserProjects = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      return []
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect()

    // Get chats for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const chats = await ctx.db
          .query("chats")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .order("desc")
          .collect()

        // Get attachments for this project
        const projectAttachments = await ctx.db
          .query("projectAttachments")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()

        const attachments = await Promise.all(
          projectAttachments.map(async (pa) => {
            const attachment = await ctx.db.get(pa.attachmentId)
            return {
              id: pa._id,
              projectId: pa.projectId,
              attachmentId: pa.attachmentId,
              name: pa.name,
              type: pa.type,
              size: pa.size,
              content: pa.content,
            }
          })
        )

        return {
          id: project._id,
          name: project.name,
          systemPrompt: project.systemPrompt,
          parentProjectId: project.parentProjectId,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          attachments: attachments.filter(Boolean),
          chats: chats.map((chat) => ({
            id: chat._id,
            projectId: project._id,
            title: chat.title,
            lastMessage: "", // We'd need to fetch the last message
            updatedAt: new Date(chat.updatedAt),
            messageCount: 0, // We'd need to count messages
          })),
        }
      })
    )

    return projectsWithDetails
  },
})

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized")
    }

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.systemPrompt !== undefined && { systemPrompt: args.systemPrompt }),
      updatedAt: Date.now(),
    })
  },
})

// Delete a project
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized")
    }

    // Remove project ID from associated chats (they become standalone)
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect()

    for (const chat of chats) {
      await ctx.db.patch(chat._id, {
        projectId: undefined,
        updatedAt: Date.now(),
      })
    }

    // Delete project attachments
    const projectAttachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect()

    for (const pa of projectAttachments) {
      await ctx.db.delete(pa._id)
    }

    // Delete the project
    await ctx.db.delete(args.id)
  },
})

// Add attachment to project
export const addAttachmentToProject = mutation({
  args: {
    projectId: v.id("projects"),
    attachmentId: v.id("attachments"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized")
    }

    await ctx.db.insert("projectAttachments", {
      projectId: args.projectId,
      attachmentId: args.attachmentId,
      name: args.name,
      type: args.type,
      size: args.size,
      content: args.content,
    })

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    })
  },
})

// Remove attachment from project
export const removeAttachmentFromProject = mutation({
  args: {
    projectId: v.id("projects"),
    attachmentId: v.id("projectAttachments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized")
    }

    await ctx.db.delete(args.attachmentId)

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    })
  },
})
