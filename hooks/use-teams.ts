"use client"

import { useState, useCallback } from "react"
import type { Team, TeamMember, TeamInvitation } from "@/types/gifting"

// Mock data for demonstration
const mockTeams: Team[] = [
  {
    id: "team-1",
    ownerUserId: "user-1",
    name: "Zealand Family",
    planType: "family",
    maxSeats: 5,
    usedSeats: 3,
    monthlyPrice: 45,
    status: "active",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
  },
]

const mockTeamMembers: TeamMember[] = [
  {
    teamId: "team-1",
    userId: "user-1",
    userEmail: "john@example.com",
    userName: "John Zealand-Doyle",
    role: "owner",
    joinedAt: new Date("2024-01-10"),
    status: "active",
  },
  {
    teamId: "team-1",
    userId: "user-2",
    userEmail: "sarah@example.com",
    userName: "Sarah Zealand",
    role: "member",
    joinedAt: new Date("2024-01-12"),
    status: "active",
  },
  {
    teamId: "team-1",
    userId: "user-3",
    userEmail: "alex@example.com",
    userName: "Alex Zealand",
    role: "member",
    joinedAt: new Date("2024-01-15"),
    status: "active",
  },
]

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(false)

  const generateInvitationCode = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const createTeam = useCallback(
    async (data: {
      name: string
      planType: "family" | "team"
      maxSeats: number
    }): Promise<Team> => {
      setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newTeam: Team = {
          id: `team-${Date.now()}`,
          ownerUserId: "user-1", // Would come from auth context
          name: data.name,
          planType: data.planType,
          maxSeats: data.maxSeats,
          usedSeats: 1, // Owner counts as first member
          monthlyPrice: data.planType === "family" ? 45 : data.maxSeats * 15,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        setTeams((prev) => [...prev, newTeam])

        // Add owner as first member
        const ownerMember: TeamMember = {
          teamId: newTeam.id,
          userId: "user-1",
          userEmail: "john@example.com",
          userName: "John Zealand-Doyle",
          role: "owner",
          joinedAt: new Date(),
          status: "active",
        }

        setTeamMembers((prev) => [...prev, ownerMember])

        return newTeam
      } catch (error) {
        console.error("Failed to create team:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const inviteMember = useCallback(
    async (teamId: string, email: string): Promise<TeamInvitation> => {
      setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const team = teams.find((t) => t.id === teamId)
        if (!team) throw new Error("Team not found")

        if (team.usedSeats >= team.maxSeats) {
          throw new Error("Team is at maximum capacity")
        }

        const newInvitation: TeamInvitation = {
          id: `inv-${Date.now()}`,
          teamId,
          inviterUserId: "user-1", // Would come from auth context
          inviteeEmail: email,
          invitationCode: generateInvitationCode(),
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          createdAt: new Date(),
        }

        setInvitations((prev) => [...prev, newInvitation])

        return newInvitation
      } catch (error) {
        console.error("Failed to invite member:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [teams]
  )

  const acceptInvitation = useCallback(
    async (invitationCode: string, userId: string): Promise<void> => {
      setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const invitation = invitations.find(
          (inv) => inv.invitationCode === invitationCode && inv.status === "pending"
        )

        if (!invitation) {
          throw new Error("Invalid or expired invitation")
        }

        if (new Date() > invitation.expiresAt) {
          throw new Error("Invitation has expired")
        }

        // Update invitation status
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitation.id ? { ...inv, status: "accepted" as const } : inv
          )
        )

        // Add member to team
        const newMember: TeamMember = {
          teamId: invitation.teamId,
          userId,
          userEmail: invitation.inviteeEmail,
          userName: "New Member", // Would be fetched from user data
          role: "member",
          joinedAt: new Date(),
          status: "active",
        }

        setTeamMembers((prev) => [...prev, newMember])

        // Update team used seats
        setTeams((prev) =>
          prev.map((team) =>
            team.id === invitation.teamId
              ? { ...team, usedSeats: team.usedSeats + 1, updatedAt: new Date() }
              : team
          )
        )
      } catch (error) {
        console.error("Failed to accept invitation:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [invitations]
  )

  const removeMember = useCallback(async (teamId: string, userId: string): Promise<void> => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update member status
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.teamId === teamId && member.userId === userId
            ? { ...member, status: "removed" as const }
            : member
        )
      )

      // Update team used seats
      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? { ...team, usedSeats: Math.max(1, team.usedSeats - 1), updatedAt: new Date() }
            : team
        )
      )
    } catch (error) {
      console.error("Failed to remove member:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getTeamMembers = useCallback(
    (teamId: string): TeamMember[] => {
      return teamMembers.filter((member) => member.teamId === teamId && member.status === "active")
    },
    [teamMembers]
  )

  const getUserTeam = useCallback(
    (userId: string): Team | null => {
      const memberRecord = teamMembers.find(
        (member) => member.userId === userId && member.status === "active"
      )
      if (!memberRecord) return null

      return teams.find((team) => team.id === memberRecord.teamId) || null
    },
    [teams, teamMembers]
  )

  return {
    teams,
    teamMembers,
    invitations,
    loading,
    createTeam,
    inviteMember,
    acceptInvitation,
    removeMember,
    getTeamMembers,
    getUserTeam,
  }
}
