"use client"

import { Button } from "@/components/ui/button"
import { Plus, EyeOff } from "lucide-react"
import { useState } from "react"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"
import { useTemporaryChat } from "@/hooks/use-temporary-chat"

interface HoverableNewChatButtonProps {
  isTemporaryMode: boolean
  onCreateNewChat: () => void
}

export function HoverableNewChatButton({
  isTemporaryMode,
  onCreateNewChat,
}: HoverableNewChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { activeProject } = useProjects()
  const { user } = useAuth()
  const { startTemporaryChat } = useTemporaryChat()

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main New Chat Button */}
      <Button
        variant="secondary"
        className="w-full justify-center bg-mauve-accent/20 font-semibold text-mauve-bright hover:bg-mauve-accent/30 hover:shadow-lg hover:border-mauve-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] transform"
        disabled={isTemporaryMode || !user?._id}
        onClick={onCreateNewChat}
      >
        <Plus className="mr-2 h-4 w-4" />
        {activeProject ? `New Chat in ${activeProject.name}` : "New Chat"}
      </Button>

      {/* Sliding Temporary Chat Button */}
      <div
        className={`absolute top-0 left-full ml-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <Button
          variant="outline"
          size="sm"
          className="border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 whitespace-nowrap"
          onClick={startTemporaryChat}
        >
          <EyeOff className="mr-1 h-3 w-3" />
          Temporary
        </Button>
      </div>
    </div>
  )
}