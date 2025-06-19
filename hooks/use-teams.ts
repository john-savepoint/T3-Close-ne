"use client"

import { useState, useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useToast } from "@/hooks/use-toast"
import type { Team, TeamMember, TeamInvitation } from "@/types/gifting"

export function useTeams() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Convex queries and mutations
  const userTeams = useQuery(api.teams.getUserTeams) || []
  const createTeamMutation = useMutation(api.teams.createTeam)
  const addTeamMemberMutation = useMutation(api.teams.addTeamMember)
  const removeMemberMutation = useMutation(api.teams.removeMember)

  const createTeam = useCallback(
    async (data: {
      name: string
      planType: "family" | "team"
      maxSeats: number
    }): Promise<Team> => {
      setLoading(true)

      try {
        // Calculate monthly price based on plan type
        const monthlyPrice = data.planType === "family" ? 45 : data.maxSeats * 15

        // Create team in database
        const result = await createTeamMutation({
          name: data.name,
          description: `${data.planType} plan team`,
        })

        toast({
          title: "Team created successfully!",
          description: `Team created with slug: ${result.slug}`,
        })

        // Return a Team object matching the type interface
        return {
          id: result.teamId,
          ownerUserId: "", // Not returned from mutation
          name: data.name,
          planType: data.planType,
          maxSeats: data.maxSeats,
          usedSeats: 1,
          monthlyPrice,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } catch (error) {
        console.error("Failed to create team:", error)
        toast({
          title: "Failed to create team",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [createTeamMutation, toast]
  )

  const inviteMember = useCallback(
    async (teamId: string, email: string): Promise<void> => {
      setLoading(true)

      try {
        await addTeamMemberMutation({
          teamId: teamId as Id<"teams">,
          userEmail: email,
          role: "member",
        })

        toast({
          title: "Member invited successfully!",
          description: `${email} has been added to the team`,
        })
      } catch (error) {
        console.error("Failed to invite member:", error)
        toast({
          title: "Failed to invite member",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [addTeamMemberMutation, toast]
  )

  const removeMember = useCallback(
    async (teamId: string, memberId: string): Promise<void> => {
      setLoading(true)

      try {
        await removeMemberMutation({
          teamId: teamId as Id<"teams">,
          userId: memberId as Id<"users">,
        })

        toast({
          title: "Member removed",
          description: "The member has been removed from the team",
        })
      } catch (error) {
        console.error("Failed to remove member:", error)
        toast({
          title: "Failed to remove member",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        })
        throw error
      } finally {
        setLoading(false)
      }
    },
    [removeMemberMutation, toast]
  )

  // Convert Convex data to type interfaces
  const teams: Team[] = userTeams.map((team: any) => ({
    id: team.id,
    ownerUserId: "", // Not exposed for privacy
    name: team.name,
    planType: team.role === "owner" ? "team" : "family", // Infer from role
    maxSeats: team.memberCount + 2, // Estimate
    usedSeats: team.memberCount,
    monthlyPrice: team.memberCount * 15,
    status: "active",
    createdAt: new Date(team.createdAt),
    updatedAt: new Date(team.createdAt),
  }))

  const currentTeam = teams[0] || null
  const teamMembers: TeamMember[] = []

  // Mock invitations for now (would need a separate Convex table)
  const invitations: TeamInvitation[] = []

  return {
    teams,
    teamMembers,
    invitations,
    loading,
    createTeam,
    inviteMember,
    acceptInvitation: async () => {
      throw new Error("Not implemented")
    },
    removeMember,
    getTeamMembers: () => teamMembers,
    getUserTeam: () => currentTeam,
  }
}
