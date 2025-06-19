import { v } from "convex/values"
import { mutation, query, action } from "./_generated/server"
import { Id } from "./_generated/dataModel"

// Generate a unique slug for teams
function generateTeamSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${baseSlug}-${Math.random().toString(36).substr(2, 6)}`
}

// Create a new team
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        allowFileSharing: v.optional(v.boolean()),
        allowPublicChats: v.optional(v.boolean()),
        defaultModel: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in to create a team")
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if user already owns a team
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first()

    if (existingTeam) {
      throw new Error("You already own a team")
    }

    // Generate unique slug
    let slug: string
    let slugExists = true

    while (slugExists) {
      slug = generateTeamSlug(args.name)
      const existingTeam = await ctx.db
        .query("teams")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
      slugExists = !!existingTeam
    }

    // Create the team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      slug: slug!,
      description: args.description,
      ownerId: user._id,
      settings: args.settings || {
        allowFileSharing: true,
        allowPublicChats: false,
        defaultModel: "gpt-4",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Add owner as first member
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: user._id,
      role: "owner",
      permissions: {
        canManageMembers: true,
        canManageSettings: true,
        canDeleteChats: true,
      },
      joinedAt: Date.now(),
    })

    // Update user's plan to reflect team membership
    await ctx.db.patch(user._id, {
      plan: "pro",
    })

    return { teamId, slug: slug! }
  },
})

// Add a member to team
export const addTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userEmail: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in")
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!currentUser) {
      throw new Error("User not found")
    }

    // Check if current user is owner or admin
    const currentMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", currentUser._id))
      .first()

    if (
      !currentMembership ||
      (currentMembership.role !== "owner" && currentMembership.role !== "admin")
    ) {
      throw new Error("You don't have permission to add members")
    }

    // Find user to add
    const userToAdd = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .first()

    if (!userToAdd) {
      throw new Error("User not found")
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userToAdd._id))
      .first()

    if (existingMembership) {
      throw new Error("User is already a team member")
    }

    // Add member
    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: userToAdd._id,
      role: args.role,
      permissions: {
        canManageMembers: args.role === "admin",
        canManageSettings: args.role === "admin",
        canDeleteChats: args.role === "admin",
      },
      joinedAt: Date.now(),
    })

    // Update team
    await ctx.db.patch(args.teamId, {
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Remove a member from team
export const removeMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in")
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!currentUser) {
      throw new Error("User not found")
    }

    // Check permissions
    const currentMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", currentUser._id))
      .first()

    if (
      !currentMembership ||
      (currentMembership.role !== "owner" && !currentMembership.permissions?.canManageMembers)
    ) {
      throw new Error("You don't have permission to remove members")
    }

    // Cannot remove yourself if you're the owner
    const team = await ctx.db.get(args.teamId)
    if (team && team.ownerId === args.userId && currentUser._id === args.userId) {
      throw new Error("Owner cannot remove themselves")
    }

    // Find membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first()

    if (!membership) {
      throw new Error("Member not found")
    }

    // Delete membership
    await ctx.db.delete(membership._id)

    // Update team
    await ctx.db.patch(args.teamId, {
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Get user's teams
export const getUserTeams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      return []
    }

    // Get all team memberships
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get team details
    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId)
        if (!team) return null

        // Get member count
        const memberCount = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect()
          .then((members) => members.length)

        return {
          id: team._id,
          name: team.name,
          slug: team.slug,
          description: team.description,
          role: membership.role,
          memberCount,
          isOwner: team.ownerId === user._id,
          createdAt: new Date(team.createdAt).toISOString(),
        }
      })
    )

    return teams.filter(Boolean)
  },
})

// Get team details with members
export const getTeamDetails = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Must be logged in")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", user._id))
      .first()

    if (!membership) {
      throw new Error("You are not a member of this team")
    }

    const team = await ctx.db.get(args.teamId)
    if (!team) {
      throw new Error("Team not found")
    }

    // Get all members
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()

    const members = await Promise.all(
      memberships.map(async (m) => {
        const member = await ctx.db.get(m.userId)
        if (!member) return null

        return {
          id: member._id,
          email: member.email || "",
          name: member.name || member.email?.split("@")[0] || "Unknown",
          role: m.role,
          permissions: m.permissions,
          joinedAt: new Date(m.joinedAt).toISOString(),
        }
      })
    )

    return {
      id: team._id,
      name: team.name,
      slug: team.slug,
      description: team.description,
      settings: team.settings,
      isOwner: team.ownerId === user._id,
      members: members.filter(Boolean),
      createdAt: new Date(team.createdAt).toISOString(),
      updatedAt: new Date(team.updatedAt).toISOString(),
    }
  },
})
