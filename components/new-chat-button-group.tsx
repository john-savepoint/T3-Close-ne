"use client"

import { Button } from "@/components/ui/button"
import { Plus, Zap } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"

interface NewChatButtonGroupProps {
  isTemporaryMode: boolean
  onCreateNewChat: () => void
}

export function NewChatButtonGroup({
  isTemporaryMode,
  onCreateNewChat,
}: NewChatButtonGroupProps) {
  const { activeProject } = useProjects()
  const { user } = useAuth()
  const { startTemporaryChat } = useTemporaryChat()

  return (
    <div className="flex gap-1">
      {/* Main New Chat Button */}
      <Button
        variant="secondary"
        className="flex-1 justify-center bg-mauve-accent/20 font-semibold text-mauve-bright hover:bg-mauve-accent/30 hover:shadow-lg hover:border-mauve-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
        disabled={isTemporaryMode || !user?._id}
        onClick={onCreateNewChat}
      >
        <Plus className="mr-2 h-4 w-4" />
        {activeProject ? `New Chat in ${activeProject.name}` : "New Chat"}
      </Button>

      {/* Temporary Chat Button - now inline */}
      <Button
        variant="outline"
        size="icon"
        className="border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
        onClick={startTemporaryChat}
        title="Start temporary chat"
      >
        <Zap className="h-4 w-4" />
      </Button>
    </div>
  )
}