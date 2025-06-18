import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// List all projects for a user with their attachments and chat counts
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()

    // Get attachments and chat counts for each project
    const projectsWithData = await Promise.all(
      projects.map(async (project) => {
        const attachments = await ctx.db
          .query("projectAttachments")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()

        const chats = await ctx.db
          .query("chats")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect()

        // Get latest message for each chat
        const chatsWithMessages = await Promise.all(
          chats.map(async (chat) => {
            const messages = await ctx.db
              .query("messages")
              .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
              .order("desc")
              .take(1)

            const latestMessage = messages[0]
            const messageCount = await ctx.db
              .query("messages")
              .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
              .collect()
              .then((msgs) => msgs.length)

            return {
              id: chat._id,
              projectId: chat.projectId,
              title: chat.title,
              lastMessage: latestMessage?.content,
              updatedAt: chat.updatedAt,
              messageCount,
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
          attachments: attachments.map((att) => ({
            id: att._id,
            projectId: att.projectId,
            attachmentId: att.attachmentId,
            name: att.name,
            type: att.type,
            size: att.size,
            content: att.content,
          })),
          chats: chatsWithMessages,
        }
      })
    )

    return projectsWithData
  },
})

// Get a single project by ID
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) return null

    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect()

    return {
      ...project,
      id: project._id,
      attachments,
    }
  },
})

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.optional(v.string()),
    parentProjectId: v.optional(v.id("projects")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      systemPrompt: args.systemPrompt,
      parentProjectId: args.parentProjectId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    })

    return projectId
  },
})

// Update a project
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    const updates: any = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.systemPrompt !== undefined) updates.systemPrompt = args.systemPrompt

    await ctx.db.patch(args.projectId, updates)
    return args.projectId
  },
})

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Update all chats to remove project association
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    await Promise.all(
      chats.map((chat) =>
        ctx.db.patch(chat._id, {
          projectId: undefined,
          updatedAt: Date.now(),
        })
      )
    )

    // Delete all project attachments
    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    await Promise.all(attachments.map((att) => ctx.db.delete(att._id)))

    // Delete any child projects
    const childProjects = await ctx.db
      .query("projects")
      .withIndex("by_parent", (q) => q.eq("parentProjectId", args.projectId))
      .collect()

    await Promise.all(
      childProjects.map((child) =>
        ctx.db.patch(child._id, {
          parentProjectId: undefined,
          updatedAt: Date.now(),
        })
      )
    )

    // Delete the project
    await ctx.db.delete(args.projectId)
    return args.projectId
  },
})

// Add an attachment to a project
export const addAttachment = mutation({
  args: {
    projectId: v.id("projects"),
    attachmentId: v.id("attachments"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    const attachment = await ctx.db.get(args.attachmentId)
    if (!attachment) {
      throw new Error("Attachment not found")
    }

    // Check if already attached
    const existing = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("attachmentId"), args.attachmentId))
      .first()

    if (existing) {
      return existing._id
    }

    // Create project attachment record
    const projectAttachmentId = await ctx.db.insert("projectAttachments", {
      projectId: args.projectId,
      attachmentId: args.attachmentId,
      name: attachment.filename || attachment.name || "Unnamed file",
      type: attachment.contentType || attachment.type || "application/octet-stream",
      size: attachment.size,
      content: attachment.extractedText || attachment.content,
    })

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    })

    return projectAttachmentId
  },
})

// Remove an attachment from a project
export const removeAttachment = mutation({
  args: {
    projectId: v.id("projects"),
    projectAttachmentId: v.id("projectAttachments"),
  },
  handler: async (ctx, args) => {
    const projectAttachment = await ctx.db.get(args.projectAttachmentId)
    if (!projectAttachment || projectAttachment.projectId !== args.projectId) {
      throw new Error("Project attachment not found")
    }

    await ctx.db.delete(args.projectAttachmentId)

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    })

    return args.projectAttachmentId
  },
})

// Get attachments for a project (used for context assembly)
export const getAttachments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    return attachments
  },
})

// Fork/duplicate a project
export const fork = mutation({
  args: {
    projectId: v.id("projects"),
    newName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.projectId)
    if (!original) {
      throw new Error("Original project not found")
    }

    const now = Date.now()

    // Create new project
    const newProjectId = await ctx.db.insert("projects", {
      name: args.newName,
      systemPrompt: original.systemPrompt,
      parentProjectId: args.projectId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    })

    // Copy attachments
    const originalAttachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    await Promise.all(
      originalAttachments.map((att) =>
        ctx.db.insert("projectAttachments", {
          projectId: newProjectId,
          attachmentId: att.attachmentId,
          name: att.name,
          type: att.type,
          size: att.size,
          content: att.content,
        })
      )
    )

    return newProjectId
  },
})
