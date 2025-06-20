import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    systemPrompt: v.optional(v.string()),
    parentProjectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
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

// List all projects for a user
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()

    // Fetch attachments and chats for each project
    const projectsWithDetails = await Promise.all(
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

        const chatDetails = await Promise.all(
          chats.map(async (chat) => {
            const messages = await ctx.db
              .query("messages")
              .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
              .order("desc")
              .take(1)

            const messageCount = await ctx.db
              .query("messages")
              .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
              .collect()
              .then((msgs) => msgs.length)

            return {
              id: chat._id,
              projectId: project._id,
              title: chat.title,
              lastMessage: messages[0]?.content || "",
              updatedAt: new Date(chat.updatedAt),
              messageCount,
            }
          })
        )

        return {
          id: project._id,
          name: project.name,
          systemPrompt: project.systemPrompt || "",
          parentProjectId: project.parentProjectId,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          attachments: attachments.map((att) => ({
            id: att._id,
            projectId: project._id,
            attachmentId: att.attachmentId,
            name: att.name,
            type: att.type,
            size: att.size,
            content: att.content || "",
          })),
          chats: chatDetails,
        }
      })
    )

    return projectsWithDetails
  },
})

// Get a single project with details
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect()

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    return {
      ...project,
      attachments,
      chats,
    }
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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user || project.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    const updates: Partial<Doc<"projects">> = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.systemPrompt !== undefined) {
      updates.systemPrompt = args.systemPrompt
    }

    await ctx.db.patch(args.projectId, updates)
  },
})

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user || project.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    // Delete all project attachments
    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    for (const attachment of attachments) {
      await ctx.db.delete(attachment._id)
    }

    // Archive all project chats
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    for (const chat of chats) {
      await ctx.db.patch(chat._id, {
        status: "archived" as const,
        statusChangedAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Delete child projects
    const childProjects = await ctx.db
      .query("projects")
      .withIndex("by_parent", (q) => q.eq("parentProjectId", args.projectId))
      .collect()

    for (const childProject of childProjects) {
      await ctx.db.patch(childProject._id, {
        parentProjectId: undefined,
        updatedAt: Date.now(),
      })
    }

    // Delete the project
    await ctx.db.delete(args.projectId)
  },
})

// Add attachment to project
export const addAttachment = mutation({
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
      throw new Error("Not authenticated")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user || project.userId !== user._id) {
      throw new Error("Unauthorized")
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
export const removeAttachment = mutation({
  args: {
    projectId: v.id("projects"),
    attachmentId: v.id("projectAttachments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const project = await ctx.db.get(args.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user || project.userId !== user._id) {
      throw new Error("Unauthorized")
    }

    await ctx.db.delete(args.attachmentId)

    // Update project timestamp
    await ctx.db.patch(args.projectId, {
      updatedAt: Date.now(),
    })
  },
})

// Fork a project
export const fork = mutation({
  args: {
    projectId: v.id("projects"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const sourceProject = await ctx.db.get(args.projectId)
    if (!sourceProject) {
      throw new Error("Source project not found")
    }

    // Create the forked project
    const newProjectId = await ctx.db.insert("projects", {
      name: args.newName,
      systemPrompt: sourceProject.systemPrompt,
      parentProjectId: args.projectId,
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Copy attachments
    const attachments = await ctx.db
      .query("projectAttachments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    for (const attachment of attachments) {
      await ctx.db.insert("projectAttachments", {
        projectId: newProjectId,
        attachmentId: attachment.attachmentId,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        content: attachment.content,
      })
    }

    return newProjectId
  },
})
