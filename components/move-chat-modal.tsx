"use client"

import type React from "react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FolderOpen, Loader2, AlertCircle } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import type { Chat } from "@/types/chat"

interface MoveChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chat: Chat | null
  onSuccess?: () => void
}

export function MoveChatModal({ open, onOpenChange, chat, onSuccess }: MoveChatModalProps) {
  const { projects } = useProjects()
  const moveChat = useMutation(api.chats.moveToProject)
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!chat || !selectedProjectId) return
    
    setLoading(true)
    setError(null)
    
    try {
      await moveChat({
        chatId: chat.id as any,
        projectId: selectedProjectId === "standalone" ? null : selectedProjectId as any,
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to move chat:", error)
      setError("Failed to move chat. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedProjectId("")
    setError(null)
    onOpenChange(false)
  }

  if (!chat) return null

  // Get current project name
  const currentProject = projects?.find((p: any) => p._id === chat.projectId)
  const currentProjectName = currentProject?.name || "No Project"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderOpen className="h-5 w-5" />
            Move Chat to Project
          </DialogTitle>
          <DialogDescription className="text-mauve-subtle/80">
            Move "{chat.title}" to a different project
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-mauve-subtle/60">
              Currently in: <span className="font-medium text-mauve-subtle">{currentProjectName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              Move to:
            </label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={loading}
            >
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standalone">No Project</SelectItem>
                {projects?.map((project: any) => (
                  <SelectItem 
                    key={project._id} 
                    value={project._id}
                    disabled={project._id === chat.projectId}
                  >
                    {project.name}
                    {project._id === chat.projectId && " (current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedProjectId || loading || selectedProjectId === chat.projectId}
              className="bg-mauve-accent hover:bg-mauve-accent/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Move Chat
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}