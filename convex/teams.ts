import { v } from "convex/values"
import { mutation, query, action } from "./_generated/server"
import { Id } from "./_generated/dataModel"
import { DEFAULT_TEAM_SETTINGS, ERROR_CODES, MAX_TEAM_MEMBERS } from "../lib/constants"

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
      throw new Error(ERROR_CODES.AUTH_REQUIRED)
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND)
    }

    // Check if user already owns a team
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first()

    if (existingTeam) {
      throw new Error(ERROR_CODES.TEAM_ALREADY_EXISTS)
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
      settings: args.settings || DEFAULT_TEAM_SETTINGS,
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
      throw new Error(ERROR_CODES.AUTH_REQUIRED)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(args.userEmail)) {
      throw new Error(ERROR_CODES.INVALID_EMAIL)
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!currentUser) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND)
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
      throw new Error(ERROR_CODES.TEAM_PERMISSION_DENIED)
    }

    // Find user to add
    const userToAdd = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first()

    if (!userToAdd) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND)
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", userToAdd._id))
      .first()

    if (existingMembership) {
      throw new Error(ERROR_CODES.TEAM_ALREADY_MEMBER)
    }

    // Check team capacity
    const currentMemberCount = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect()
      .then((members) => members.length)

    if (currentMemberCount >= MAX_TEAM_MEMBERS) {
      throw new Error(ERROR_CODES.TEAM_AT_CAPACITY)
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
      throw new Error(ERROR_CODES.AUTH_REQUIRED)
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!currentUser) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND)
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
      throw new Error(ERROR_CODES.TEAM_PERMISSION_DENIED)
    }

    // Cannot remove yourself if you're the owner
    const team = await ctx.db.get(args.teamId)
    if (team && team.ownerId === args.userId && currentUser._id === args.userId) {
      throw new Error(ERROR_CODES.TEAM_OWNER_CANNOT_LEAVE)
    }

    // Find membership
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first()

    if (!membership) {
      throw new Error(ERROR_CODES.TEAM_MEMBER_NOT_FOUND)
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
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
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
      throw new Error(ERROR_CODES.AUTH_REQUIRED)
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND)
    }

    // Check if user is a member
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", user._id))
      .first()

    if (!membership) {
      throw new Error(ERROR_CODES.TEAM_PERMISSION_DENIED)
    }

    const team = await ctx.db.get(args.teamId)
    if (!team) {
      throw new Error(ERROR_CODES.TEAM_NOT_FOUND)
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
