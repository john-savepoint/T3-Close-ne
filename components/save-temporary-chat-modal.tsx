"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Loader2, AlertTriangle } from "lucide-react"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"

interface SaveTemporaryChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveTemporaryChatModal({ open, onOpenChange }: SaveTemporaryChatModalProps) {
  const router = useRouter()
  const { temporaryChat, clearTemporaryChat } = useTemporaryChat()
  const { projects } = useProjects()
  const { user } = useAuth()
  const createFromTemporary = useMutation(api.chats.createFromTemporary)
  
  const [formData, setFormData] = useState({
    title: "",
    projectId: "standalone", // Updated default value to be a non-empty string
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !temporaryChat || !user?._id) return

    // Validate title length
    const title = formData.title.trim()
    if (title.length > 100) {
      console.error("Title too long")
      return
    }

    // Validate messages exist and aren't empty
    if (temporaryChat.messages.length === 0) {
      console.error("No messages to save")
      return
    }

    setLoading(true)
    try {
      // Convert temporary chat messages to the format expected by Convex
      // Filter out empty messages and validate content
      const messages = temporaryChat.messages
        .filter(msg => msg.content.trim().length > 0)
        .map(msg => ({
          content: msg.content.trim(),
          type: msg.type,
          model: msg.model,
          timestamp: msg.timestamp.toISOString(),
        }))

      if (messages.length === 0) {
        throw new Error("No valid messages to save")
      }

      // Get the model from the last assistant message
      const lastAssistantMessage = temporaryChat.messages
        .filter(m => m.type === "assistant" && m.model)
        .pop()
      
      // Create the chat in Convex
      const chatId = await createFromTemporary({
        title,
        userId: user._id,
        projectId: formData.projectId === "standalone" ? undefined : formData.projectId as any,
        messages,
        model: lastAssistantMessage?.model,
      })

      // Clear temporary chat
      clearTemporaryChat()

      // Reset form and close modal
      setFormData({ title: "", projectId: "standalone" })
      onOpenChange(false)

      // Navigate to the new chat
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Failed to save temporary chat:", error)
      // Show user-friendly error message without exposing sensitive details
      alert("Failed to save chat. Please try again.")
    } finally {
      setLoading(false)
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
      <DialogContent className="border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Save className="h-5 w-5" />
            Save Temporary Chat
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-blue-500/20 bg-blue-500/10">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            This will convert your temporary chat into a permanent chat that will be saved to your
            history.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Chat Summary */}
          <div className="rounded-lg bg-mauve-dark/30 p-3">
            <h4 className="mb-2 text-sm font-medium">Chat Summary</h4>
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
              <div className="mt-2 rounded bg-mauve-dark/50 p-2 text-xs">
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
                className="border-mauve-dark bg-mauve-dark/50 focus-visible:ring-mauve-accent"
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
                <SelectTrigger className="border-mauve-dark bg-mauve-dark/50">
                  <SelectValue placeholder="Select a project or leave as standalone chat" />
                </SelectTrigger>
                <SelectContent className="border-mauve-dark bg-mauve-surface">
                  <SelectItem value="standalone">Standalone Chat</SelectItem>
                  {projects.map((project: any) => (
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
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Chat
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
