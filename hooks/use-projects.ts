"use client"

import { useState } from "react"
import type { Project, CreateProjectData, ProjectAttachment } from "@/types/project"

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "WebApp-Frontend",
    systemPrompt:
      "You are a TypeScript expert specializing in Next.js and Tailwind CSS. All code must be written in TypeScript and follow our linting rules.",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    attachments: [
      {
        id: "att-1",
        projectId: "proj-1",
        attachmentId: "file-1",
        name: "tailwind.config.js",
        type: "application/javascript",
        size: 2048,
        content: "module.exports = { content: ['./src/**/*.{js,ts,jsx,tsx}'], theme: { extend: {} } }",
      },
      {
        id: "att-2",
        projectId: "proj-1",
        attachmentId: "file-2",
        name: "package.json",
        type: "application/json",
        size: 1024,
        content: '{ "name": "webapp-frontend", "dependencies": { "next": "^14.0.0", "react": "^18.0.0" } }',
      },
    ],
    chats: [
      {
        id: "chat-1",
        projectId: "proj-1",
        title: "Component Architecture Discussion",
        lastMessage: "Let's implement the user dashboard component",
        updatedAt: new Date("2024-01-20"),
        messageCount: 15,
      },
      {
        id: "chat-2",
        projectId: "proj-1",
        title: "Styling System Setup",
        lastMessage: "How should we organize our CSS modules?",
        updatedAt: new Date("2024-01-19"),
        messageCount: 8,
      },
    ],
  },
  {
    id: "proj-2",
    name: "API-Backend",
    systemPrompt:
      "You are a Python expert specializing in FastAPI and SQLAlchemy. Provide type-hinted, PEP 8 compliant code.",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    attachments: [
      {
        id: "att-3",
        projectId: "proj-2",
        attachmentId: "file-3",
        name: "requirements.txt",
        type: "text/plain",
        size: 512,
        content: "fastapi==0.104.1\nsqlalchemy==2.0.23\npydantic==2.5.0",
      },
    ],
    chats: [
      {
        id: "chat-3",
        projectId: "proj-2",
        title: "Database Schema Design",
        lastMessage: "Let's define the user authentication models",
        updatedAt: new Date("2024-01-18"),
        messageCount: 12,
      },
    ],
  },
  {
    id: "proj-3",
    name: "Climate Change Research",
    systemPrompt:
      "Summarize, analyze, and cross-reference the attached papers. Adopt a formal, academic tone and provide citations by filename.",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
    attachments: [
      {
        id: "att-4",
        projectId: "proj-3",
        attachmentId: "file-4",
        name: "ipcc-report-2023.pdf",
        type: "application/pdf",
        size: 5242880,
        content: "IPCC Climate Change Report 2023 - Executive Summary...",
      },
      {
        id: "att-5",
        projectId: "proj-3",
        attachmentId: "file-5",
        name: "carbon-emissions-study.pdf",
        type: "application/pdf",
        size: 3145728,
        content: "Carbon Emissions Analysis - Global Trends 2020-2023...",
      },
    ],
    chats: [
      {
        id: "chat-4",
        projectId: "proj-3",
        title: "IPCC Report Analysis",
        lastMessage: "What are the key findings about temperature rise?",
        updatedAt: new Date("2024-01-15"),
        messageCount: 25,
      },
    ],
  },
]

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const activeProject = projects.find((p) => p.id === activeProjectId)

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      systemPrompt: data.systemPrompt,
      parentProjectId: data.parentProjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      chats: [],
    }

    setProjects((prev) => [...prev, newProject])
    setLoading(false)

    return newProject
  }

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)))

    setLoading(false)
  }

  const deleteProject = async (id: string): Promise<void> => {
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    setProjects((prev) => prev.filter((p) => p.id !== id))

    if (activeProjectId === id) {
      setActiveProjectId(null)
    }

    setLoading(false)
  }

  const addAttachmentToProject = async (
    projectId: string,
    attachment: Omit<ProjectAttachment, "id" | "projectId">,
  ): Promise<void> => {
    const newAttachment: ProjectAttachment = {
      id: `att-${Date.now()}`,
      projectId,
      ...attachment,
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, attachments: [...p.attachments, newAttachment], updatedAt: new Date() } : p,
      ),
    )
  }

  const removeAttachmentFromProject = async (projectId: string, attachmentId: string): Promise<void> => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, attachments: p.attachments.filter((a) => a.id !== attachmentId), updatedAt: new Date() }
          : p,
      ),
    )
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
  }
}
