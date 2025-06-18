"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatMessage } from "@/types/chat"

interface ConversationBreadcrumbProps {
  messages: ChatMessage[]
  currentMessageId?: string | null
  onMessageSelect: (messageId: string) => void
}

export function ConversationBreadcrumb({
  messages,
  currentMessageId,
  onMessageSelect,
}: ConversationBreadcrumbProps) {
  // Get the path from root to current message
  const getMessagePath = (): ChatMessage[] => {
    if (!currentMessageId) return []

    const path: ChatMessage[] = []
    let currentId = currentMessageId

    while (currentId) {
      const message = messages.find((m) => m.id === currentId)
      if (message) {
        path.unshift(message)
        currentId = message.parentId || message.parentMessageId || ""
      } else {
        break
      }
    }

    return path
  }

  const messagePath = getMessagePath()

  if (messagePath.length === 0) return null

  return (
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-4 py-2 text-xs">
      <span className="text-mauve-subtle/70">Path:</span>
      {messagePath.map((message, index) => (
        <div key={message.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-3 w-3 text-mauve-subtle/50" />}
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-xs ${
              message.id === currentMessageId
                ? "font-medium text-mauve-bright"
                : "text-mauve-subtle hover:text-mauve-bright"
            }`}
            onClick={() => onMessageSelect(message.id)}
          >
            {message.type === "user" ? "You" : "AI"}
            {": "}
            <span className="max-w-[100px] truncate">
              {message.content.substring(0, 30)}
              {message.content.length > 30 && "..."}
            </span>
          </Button>
        </div>
      ))}
    </div>
  )
}
