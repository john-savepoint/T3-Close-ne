"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Settings,
  Trash2,
  MessageSquare,
  Paperclip,
} from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { CreateProjectModal } from "@/components/create-project-modal"
import { ProjectSettingsModal } from "@/components/project-settings-modal"
import { DroppableProject } from "@/components/droppable-project"

interface ProjectListProps {
  onChatSelect?: (chatId: string, projectId: string) => void
}

export function ProjectList({ onChatSelect }: ProjectListProps) {
  const { projects, activeProjectId, setActiveProjectId, deleteProject } = useProjects()
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [settingsProjectId, setSettingsProjectId] = useState<string | null>(null)
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true)

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId)
    if (!expandedProjects.has(projectId)) {
      toggleProject(projectId)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this project? Associated chats will become standalone."
      )
    ) {
      await deleteProject(projectId)
    }
  }

  return (
    <div className="space-y-2">
      {/* Projects Section Header */}
      <Collapsible open={isProjectsExpanded} onOpenChange={setIsProjectsExpanded}>
        <div className="flex items-center justify-between px-3 py-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs font-semibold uppercase tracking-wider text-mauve-accent"
            >
              {isProjectsExpanded ? (
                <ChevronDown className="mr-1 h-3 w-3" />
              ) : (
                <ChevronRight className="mr-1 h-3 w-3" />
              )}
              Projects
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <CollapsibleContent className="space-y-1">
          {projects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-mauve-subtle/70">
              No projects yet. Create your first project to get started.
            </div>
          ) : (
            projects.map((project: any) => (
              <DroppableProject key={project.id} projectId={project.id} isExpanded={expandedProjects.has(project.id)}>
                <div className="space-y-1">
                  {/* Project Item */}
                  <div
                    className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                      activeProjectId === project.id
                        ? "bg-mauve-accent/20 text-mauve-bright"
                        : "text-mauve-subtle hover:bg-white/5"
                    }`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleProject(project.id)
                    }}
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>

                  {expandedProjects.has(project.id) ? (
                    <FolderOpen className="h-4 w-4 text-mauve-accent" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{project.name}</span>
                      {project.attachments.length > 0 && (
                        <Badge variant="outline" className="h-4 text-xs">
                          <Paperclip className="mr-1 h-2 w-2" />
                          {project.attachments.length}
                        </Badge>
                      )}
                    </div>
                    {project.chats.length > 0 && (
                      <div className="text-xs text-mauve-subtle/70">
                        {project.chats.length} chat{project.chats.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-mauve-dark bg-mauve-surface">
                      <DropdownMenuItem onClick={() => setSettingsProjectId(project.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-400 focus:text-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project Chats */}
                {expandedProjects.has(project.id) && (
                  <div className="ml-6 space-y-1">
                    {project.chats.length === 0 ? (
                      <div className="px-2 py-1 text-xs text-mauve-subtle/50">
                        No chats in this project
                      </div>
                    ) : (
                      project.chats.map((chat: any) => (
                        <div
                          key={chat.id}
                          className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
                          onClick={() => onChatSelect?.(chat.id, project.id)}
                        >
                          <MessageSquare className="h-3 w-3 text-mauve-subtle/70" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm">{chat.title}</div>
                            <div className="text-xs text-mauve-subtle/70">
                              {chat.messageCount} messages • {chat.updatedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              </DroppableProject>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Modals */}
      <CreateProjectModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      {settingsProjectId && (
        <ProjectSettingsModal
          projectId={settingsProjectId}
          open={!!settingsProjectId}
          onOpenChange={(open) => !open && setSettingsProjectId(null)}
        />
      )}
    </div>
  )
}
