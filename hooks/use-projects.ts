"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useUser } from "@clerk/nextjs"
import type { Project, CreateProjectData, ProjectAttachment } from "@/types/project"

export function useProjects() {
  const { user } = useUser()
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  // Get user's Convex ID
  const convexUser = useQuery(api.users.getByClerkId, user?.id ? { clerkId: user.id } : "skip")

  // Fetch projects from Convex
  const projectsData = useQuery(
    api.projects.list,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  )
  const projects = projectsData || []

  // Convex mutations
  const createProjectMutation = useMutation(api.projects.create)
  const updateProjectMutation = useMutation(api.projects.update)
  const deleteProjectMutation = useMutation(api.projects.deleteProject)
  const addAttachmentMutation = useMutation(api.projects.addAttachment)
  const removeAttachmentMutation = useMutation(api.projects.removeAttachment)
  const forkProjectMutation = useMutation(api.projects.fork)

  const activeProject = projects.find((p) => p.id === activeProjectId)
  const loading = projectsData === undefined

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    if (!convexUser) throw new Error("User not found")

    try {
      const projectId = await createProjectMutation({
        name: data.name,
        systemPrompt: data.systemPrompt,
        parentProjectId: data.parentProjectId as Id<"projects"> | undefined,
      })

      // Return a placeholder project object
      // The real project will be updated via live queries
      return {
        id: projectId,
        name: data.name,
        systemPrompt: data.systemPrompt || "",
        parentProjectId: data.parentProjectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
        chats: [],
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      throw error
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    try {
      await updateProjectMutation({
        projectId: id as Id<"projects">,
        name: updates.name,
        systemPrompt: updates.systemPrompt,
      })
    } catch (error) {
      console.error("Failed to update project:", error)
      throw error
    }
  }

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await deleteProjectMutation({
        projectId: id as Id<"projects">,
      })

      if (activeProjectId === id) {
        setActiveProjectId(null)
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      throw error
    }
  }

  const addAttachmentToProject = async (
    projectId: string,
    attachment: Omit<ProjectAttachment, "id" | "projectId">
  ): Promise<void> => {
    try {
      await addAttachmentMutation({
        projectId: projectId as Id<"projects">,
        attachmentId: attachment.attachmentId as Id<"attachments">,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        content: attachment.content,
      })
    } catch (error) {
      console.error("Failed to add attachment:", error)
      throw error
    }
  }

  const removeAttachmentFromProject = async (
    projectId: string,
    attachmentId: string
  ): Promise<void> => {
    try {
      await removeAttachmentMutation({
        projectId: projectId as Id<"projects">,
        attachmentId: attachmentId as Id<"projectAttachments">,
      })
    } catch (error) {
      console.error("Failed to remove attachment:", error)
      throw error
    }
  }

  const forkProject = async (projectId: string, newName: string): Promise<string> => {
    try {
      const newProjectId = await forkProjectMutation({
        projectId: projectId as Id<"projects">,
        newName,
      })
      return newProjectId
    } catch (error) {
      console.error("Failed to fork project:", error)
      throw error
    }
  }

  return {
    projects,
    activeProject,
    activeProjectId,
    loading,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    addAttachmentToProject,
    removeAttachmentFromProject,
    forkProject,
  }
}
