"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Loader2, AlertTriangle } from "lucide-react"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { useProjects } from "@/hooks/use-projects"

interface SaveTemporaryChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveTemporaryChatModal({ open, onOpenChange }: SaveTemporaryChatModalProps) {
  const { temporaryChat, saveTemporaryChatToHistory, loading } = useTemporaryChat()
  const { projects } = useProjects()
  const [formData, setFormData] = useState({
    title: "",
    projectId: "standalone", // Updated default value to be a non-empty string
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !temporaryChat) return

    try {
      await saveTemporaryChatToHistory({
        title: formData.title.trim(),
        projectId: formData.projectId === "standalone" ? undefined : formData.projectId, // Handle standalone case
      })

      // Reset form and close modal
      setFormData({ title: "", projectId: "standalone" }) // Reset to default non-empty string
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save temporary chat:", error)
    }
  }

  const handleCancel = () => {
    setFormData({ title: "", projectId: "standalone" }) // Reset to default non-empty string
    onOpenChange(false)
  }

  if (!temporaryChat) return null

  const messageCount = temporaryChat.messages.length
  const userMessages = temporaryChat.messages.filter((m) => m.type === "user").length
  const assistantMessages = temporaryChat.messages.filter((m) => m.type === "assistant").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-mauve-surface border-mauve-dark">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Temporary Chat
          </DialogTitle>
        </DialogHeader>

        <Alert className="bg-blue-500/10 border-blue-500/20">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            This will convert your temporary chat into a permanent chat that will be saved to your history.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Chat Summary */}
          <div className="p-3 bg-mauve-dark/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Chat Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-mauve-subtle/70">Total Messages:</span>
                <div className="font-medium">{messageCount}</div>
              </div>
              <div>
                <span className="text-mauve-subtle/70">Your Messages:</span>
                <div className="font-medium">{userMessages}</div>
              </div>
              <div>
                <span className="text-mauve-subtle/70">AI Responses:</span>
                <div className="font-medium">{assistantMessages}</div>
              </div>
            </div>
            {temporaryChat.messages.length > 0 && (
              <div className="mt-2 p-2 bg-mauve-dark/50 rounded text-xs">
                <span className="text-mauve-subtle/70">First message:</span>
                <div className="truncate">
                  {temporaryChat.messages[0].content.substring(0, 100)}
                  {temporaryChat.messages[0].content.length > 100 && "..."}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-title" className="text-sm font-medium">
                Chat Title *
              </Label>
              <Input
                id="chat-title"
                placeholder="e.g., Git Commands Help, Email Draft Assistance"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-mauve-dark/50 border-mauve-dark focus-visible:ring-mauve-accent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-select" className="text-sm font-medium">
                Project (Optional)
              </Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger className="bg-mauve-dark/50 border-mauve-dark">
                  <SelectValue placeholder="Select a project or leave as standalone chat" />
                </SelectTrigger>
                <SelectContent className="bg-mauve-surface border-mauve-dark">
                  <SelectItem value="standalone">Standalone Chat</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
                disabled={loading || !formData.title.trim()}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Chat
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
