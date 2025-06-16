"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useProjects } from "@/hooks/use-projects"
import { Loader2 } from "lucide-react"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { createProject, loading } = useProjects()
  const [formData, setFormData] = useState({
    name: "",
    systemPrompt: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    try {
      await createProject({
        name: formData.name.trim(),
        systemPrompt: formData.systemPrompt.trim() || undefined,
      })

      // Reset form and close modal
      setFormData({ name: "", systemPrompt: "" })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", systemPrompt: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-mauve-dark bg-mauve-surface">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name *
            </Label>
            <Input
              id="project-name"
              placeholder="e.g., WebApp-Frontend, Climate Research"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="border-mauve-dark bg-mauve-dark/50 focus-visible:ring-mauve-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="text-sm font-medium">
              System Prompt (Optional)
            </Label>
            <Textarea
              id="system-prompt"
              placeholder="Define the AI's role and behavior for this project..."
              value={formData.systemPrompt}
              onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              className="min-h-[100px] border-mauve-dark bg-mauve-dark/50 focus-visible:ring-mauve-accent"
              rows={4}
            />
            <p className="text-xs text-mauve-subtle/70">
              This prompt will be automatically included in all chats within this project.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-mauve-accent/20 hover:bg-mauve-accent/30"
              disabled={loading || !formData.name.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
