"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Folder, FileText, Zap, X } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

export function ProjectContextIndicator() {
  const { activeProject, setActiveProjectId } = useProjects()

  if (!activeProject) return null

  const contextSize =
    (activeProject.systemPrompt?.length || 0) +
    activeProject.attachments.reduce((acc, att) => acc + (att.content?.length || 0), 0)

  const formatContextSize = (size: number) => {
    if (size < 1000) return `${size} chars`
    if (size < 1000000) return `${(size / 1000).toFixed(1)}K chars`
    return `${(size / 1000000).toFixed(1)}M chars`
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-mauve-accent/10 border-b border-mauve-dark">
      <Folder className="w-4 h-4 text-mauve-accent" />
      <span className="text-sm font-medium">You are in project:</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 font-semibold text-mauve-bright hover:bg-mauve-accent/20"
          >
            {activeProject.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-mauve-surface border-mauve-dark" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Project Context</h3>
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {formatContextSize(contextSize)}
              </Badge>
            </div>

            {activeProject.systemPrompt && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-mauve-accent">System Prompt</h4>
                <div className="p-2 bg-mauve-dark/30 rounded text-xs">
                  {activeProject.systemPrompt.length > 100
                    ? `${activeProject.systemPrompt.substring(0, 100)}...`
                    : activeProject.systemPrompt}
                </div>
              </div>
            )}

            {activeProject.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-mauve-accent">
                  Attached Files ({activeProject.attachments.length})
                </h4>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {activeProject.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 text-xs">
                        <FileText className="w-3 h-3 text-mauve-subtle" />
                        <span className="truncate">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="text-xs text-mauve-subtle/70">
              This context is automatically included in all chats within this project.
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setActiveProjectId(null)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
