"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/hooks/use-auth"
import type { Project, CreateProjectData } from "@/types/project"
import type { Id } from "@/convex/_generated/dataModel"

export function useProjects() {
  const { user } = useAuth()
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  // Query projects from Convex
  const projectsData = useQuery(api.projects.list, user?._id ? { userId: user._id } : "skip")
  const projects = projectsData || []

  const activeProject = projects.find((p) => p.id === activeProjectId)

  // Mutations
  const createProjectMutation = useMutation(api.projects.create)
  const updateProjectMutation = useMutation(api.projects.update)
  const deleteProjectMutation = useMutation(api.projects.deleteProject)
  const addAttachmentMutation = useMutation(api.projects.addAttachment)
  const removeAttachmentMutation = useMutation(api.projects.removeAttachment)

  const createProject = async (data: CreateProjectData): Promise<string> => {
    if (!user?._id) throw new Error("User not authenticated")

    const projectId = await createProjectMutation({
      name: data.name,
      systemPrompt: data.systemPrompt,
      parentProjectId: data.parentProjectId as Id<"projects"> | undefined,
      userId: user._id,
    })

    return projectId
  }

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    await updateProjectMutation({
      projectId: id as Id<"projects">,
      name: updates.name,
      systemPrompt: updates.systemPrompt,
    })
  }

  const deleteProject = async (id: string): Promise<void> => {
    await deleteProjectMutation({
      projectId: id as Id<"projects">,
    })

    if (activeProjectId === id) {
      setActiveProjectId(null)
    }
  }

  const addAttachmentToProject = async (projectId: string, attachmentId: string): Promise<void> => {
    await addAttachmentMutation({
      projectId: projectId as Id<"projects">,
      attachmentId: attachmentId as Id<"attachments">,
    })
  }

  const removeAttachmentFromProject = async (
    projectId: string,
    projectAttachmentId: string
  ): Promise<void> => {
    await removeAttachmentMutation({
      projectId: projectId as Id<"projects">,
      projectAttachmentId: projectAttachmentId as Id<"projectAttachments">,
    })
  }

  // Loading state based on whether data is available
  const loading = projectsData === undefined

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
  }
}
