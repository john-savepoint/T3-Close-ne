"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Globe, Folder, Sparkles } from "lucide-react"
import { useMemory } from "@/hooks/use-memory"
import { useProjects } from "@/hooks/use-projects"

export function MemoryContextIndicator() {
  const { getMemoriesForContext } = useMemory()
  const { activeProject } = useProjects()

  const contextMemories = getMemoriesForContext(activeProject?.id)

  if (contextMemories.length === 0) return null

  const globalMemories = contextMemories.filter((m) => !m.projectId)
  const projectMemories = contextMemories.filter((m) => m.projectId)

  return (
    <div className="flex items-center gap-2 border-b border-blue-500/20 bg-blue-500/10 px-4 py-2">
      <Brain className="h-4 w-4 text-blue-400" />
      <span className="text-sm font-medium">AI Memory Active:</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 font-semibold text-blue-400 hover:bg-blue-500/20"
          >
            {contextMemories.length} memories loaded
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 border-mauve-dark bg-mauve-surface" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Active Memories</h3>
              <Badge variant="outline" className="text-xs">
                <Brain className="mr-1 h-3 w-3" />
                {contextMemories.length} total
              </Badge>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {globalMemories.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-1 text-xs font-medium text-blue-400">
                      <Globe className="h-3 w-3" />
                      Global Memories ({globalMemories.length})
                    </h4>
                    {globalMemories.map((memory) => (
                      <div key={memory.id} className="rounded bg-mauve-dark/30 p-2 text-xs">
                        <div className="mb-1 flex items-center gap-1">
                          <Badge variant="outline" className="h-4 text-xs">
                            {memory.category}
                          </Badge>
                          {memory.isAutoGenerated && (
                            <Badge
                              variant="outline"
                              className="h-4 border-blue-500/50 text-xs text-blue-400"
                            >
                              <Sparkles className="mr-1 h-2 w-2" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-mauve-subtle/80">
                          {memory.content.length > 80
                            ? `${memory.content.substring(0, 80)}...`
                            : memory.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {projectMemories.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-1 text-xs font-medium text-mauve-accent">
                      <Folder className="h-3 w-3" />
                      Project Memories ({projectMemories.length})
                    </h4>
                    {projectMemories.map((memory) => (
                      <div key={memory.id} className="rounded bg-mauve-dark/30 p-2 text-xs">
                        <div className="mb-1 flex items-center gap-1">
                          <Badge variant="outline" className="h-4 text-xs">
                            {memory.category}
                          </Badge>
                          {memory.isAutoGenerated && (
                            <Badge
                              variant="outline"
                              className="h-4 border-blue-500/50 text-xs text-blue-400"
                            >
                              <Sparkles className="mr-1 h-2 w-2" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-mauve-subtle/80">
                          {memory.content.length > 80
                            ? `${memory.content.substring(0, 80)}...`
                            : memory.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="text-xs text-mauve-subtle/70">
              These memories are automatically included in your chat context.
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
