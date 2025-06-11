"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
    if (confirm("Are you sure you want to delete this project? Associated chats will become standalone.")) {
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
              className="p-0 h-auto font-semibold text-mauve-accent uppercase tracking-wider text-xs"
            >
              {isProjectsExpanded ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Projects
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <CollapsibleContent className="space-y-1">
          {projects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-mauve-subtle/70">
              No projects yet. Create your first project to get started.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="space-y-1">
                {/* Project Item */}
                <div
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    activeProjectId === project.id
                      ? "bg-mauve-accent/20 text-mauve-bright"
                      : "hover:bg-white/5 text-mauve-subtle"
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{project.name}</span>
                      {project.attachments.length > 0 && (
                        <Badge variant="outline" className="text-xs h-4">
                          <Paperclip className="w-2 h-2 mr-1" />
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
                    <DropdownMenuContent align="end" className="bg-mauve-surface border-mauve-dark">
                      <DropdownMenuItem onClick={() => setSettingsProjectId(project.id)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-400 focus:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project Chats */}
                {expandedProjects.has(project.id) && (
                  <div className="ml-6 space-y-1">
                    {project.chats.length === 0 ? (
                      <div className="px-2 py-1 text-xs text-mauve-subtle/50">No chats in this project</div>
                    ) : (
                      project.chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group"
                          onClick={() => onChatSelect?.(chat.id, project.id)}
                        >
                          <MessageSquare className="h-3 w-3 text-mauve-subtle/70" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{chat.title}</div>
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
